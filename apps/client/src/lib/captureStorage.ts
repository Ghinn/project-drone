/** Server-side storage for original MAPIR files. No database writes or inference. */
import { createWriteStream } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export type CaptureFiles = {
  originalJpgPath: string;
  rawFilePath: string;
  jpgSizeBytes: number;
  rawSizeBytes: number;
};
export class CaptureStorageError extends Error {
  constructor(publicCode: 'RAW_PENDING' | 'DOWNLOAD_FAILED' | 'INVALID_FILE' | 'STORAGE_FAILED', message: string) {
    super(message);
    this.code = publicCode;
  }
  readonly code: 'RAW_PENDING' | 'DOWNLOAD_FAILED' | 'INVALID_FILE' | 'STORAGE_FAILED';
}
export function assertCaptureId(id: string): void {
  if (typeof id !== 'string' || id.length === 0 || id.length > 128 || /[^A-Za-z0-9_-]/.test(id)) throw new Error('Capture ID tidak valid.');
}
export function storageRoot(): string {
  const root = process.env.DREAMPALM_STORAGE_ROOT;
  if (!root) throw new Error('DREAMPALM_STORAGE_ROOT belum dikonfigurasi.');
  return path.resolve(root);
}
function contained(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
}
async function safeDirectory(parent: string, name: string): Promise<string> {
  const dir = path.join(parent, name);
  try { await mkdir(dir, { mode: 0o750 }); } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
  }
  const stat = await lstat(dir);
  if (!stat.isDirectory() || stat.isSymbolicLink() || !contained(parent, await realpath(dir))) {
    throw new CaptureStorageError('STORAGE_FAILED', 'Direktori penyimpanan tidak valid.');
  }
  return dir;
}
async function captureDirectory(id: string): Promise<string> {
  assertCaptureId(id);
  const configured = storageRoot();
  await mkdir(configured, { recursive: true, mode: 0o750 });
  const root = await realpath(configured);
  return safeDirectory(await safeDirectory(root, 'captures'), id);
}
const LIMITS = { jpg: { max: 20 * 1024 * 1024, timeout: 30_000 }, raw: { max: 50 * 1024 * 1024, timeout: 120_000 } } as const;
type Kind = keyof typeof LIMITS;
function relativePath(id: string, kind: Kind): string { return `captures/${id}/original.${kind}`; }

/** Only the exact, configured Capture API file endpoint is allowed. No redirects. */
export function validateDownloadUrl(value: string, id: string, kind: Kind, base: string): URL {
  assertCaptureId(id);
  const origin = new URL(base);
  const url = new URL(value, `${origin.href.replace(/\/+$/, '')}/`);
  const expected = `${origin.pathname.replace(/\/+$/, '')}/captures/${encodeURIComponent(id)}/${kind}`;
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash ||
      url.origin !== origin.origin || url.username || url.password || url.pathname !== expected || url.search || url.hash) {
    throw new CaptureStorageError('DOWNLOAD_FAILED', 'URL file Capture API tidak diizinkan.');
  }
  return url;
}
async function inspectFile(file: string, kind: Kind): Promise<number | null> {
  let stat;
  try { stat = await lstat(file); } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size <= 0 || stat.size > LIMITS[kind].max) {
    throw new CaptureStorageError('INVALID_FILE', 'File asli tidak valid.');
  }
  if (kind === 'jpg') {
    const handle = await open(file, 'r');
    try {
      const bytes = Buffer.alloc(3);
      const { bytesRead } = await handle.read(bytes, 0, 3, 0);
      if (bytesRead !== 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        throw new CaptureStorageError('INVALID_FILE', 'File bukan JPEG yang valid.');
      }
    } finally { await handle.close(); }
  }
  return stat.size;
}
async function downloadOne(dir: string, url: URL, kind: Kind, key: string): Promise<number> {
  const dest = path.join(dir, `original.${kind}`);
  // Only reuse complete files already committed by this helper under the capture lock.
  const existing = await inspectFile(dest, kind);
  if (existing !== null) return existing;
  const temp = path.join(dir, `.${kind}-${randomUUID()}.tmp`);
  const { max, timeout } = LIMITS[kind];
  const signal = AbortSignal.timeout(timeout);
  let response: Response | undefined;
  try {
    response = await fetch(url, { headers: { 'X-DreamPalm-Key': key }, redirect: 'error', cache: 'no-store', signal });
    if (!response.ok || !response.body || response.status !== 200) throw new CaptureStorageError('DOWNLOAD_FAILED', 'Pengunduhan file asli gagal.');
    const type = (response.headers.get('content-type') || '').toLowerCase();
    if (type.startsWith('text/') || type.includes('json') || type.includes('xml')) throw new CaptureStorageError('INVALID_FILE', 'Respons bukan file gambar/biner.');
    const length = response.headers.get('content-length');
    const declared = length === null ? null : Number(length);
    if (declared !== null && (!Number.isSafeInteger(declared) || declared <= 0 || declared > max)) throw new CaptureStorageError('INVALID_FILE', 'Ukuran file melebihi batas atau kosong.');
    let bytes = 0;
    const limiter = new Transform({ transform(chunk: Buffer, _encoding, done) {
      bytes += chunk.length;
      if (bytes > max) done(new CaptureStorageError('INVALID_FILE', 'Ukuran file melebihi batas.'));
      else done(null, chunk);
    } });
    const body = response.body;
    async function* chunks() {
      const reader = body.getReader();
      try { while (true) { const item = await reader.read(); if (item.done) break; yield item.value; } }
      finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    }
    await pipeline(Readable.from(chunks(), { objectMode: false }), limiter, createWriteStream(temp, { flags: 'wx', mode: 0o640 }), { signal });
    if (bytes === 0 || (declared !== null && !response.headers.get('content-encoding') && declared !== bytes)) throw new CaptureStorageError('INVALID_FILE', 'Unduhan kosong atau tidak lengkap.');
    if (await inspectFile(temp, kind) !== bytes) throw new CaptureStorageError('INVALID_FILE', 'Ukuran file tidak konsisten.');
    // Caller must hold the per-capture lock; never overwrite an existing original.
    if (await inspectFile(dest, kind) !== null) throw new CaptureStorageError('STORAGE_FAILED', 'File asli sudah tersedia.');
    await rename(temp, dest);
    return bytes;
  } catch (e) {
    if (e instanceof CaptureStorageError) throw e;
    throw new CaptureStorageError('DOWNLOAD_FAILED', 'Unduhan atau penyimpanan file gagal.');
  } finally {
    if (response?.body && !response.body.locked) await response.body.cancel().catch(() => {});
    await rm(temp, { force: true }).catch(() => {});
  }
}
/** Call with dedicated per-capture advisory lock held. Missing RAW is not success. */
export async function downloadAndSave(opts: { captureId: string; jpgUrl: string; rawUrl?: string | null; apiKey: string; apiBaseUrl: string }): Promise<CaptureFiles> {
  const { captureId: id, jpgUrl, rawUrl, apiKey, apiBaseUrl } = opts;
  assertCaptureId(id);
  if (!apiKey) throw new Error('Capture API key belum dikonfigurasi.');
  const jpg = validateDownloadUrl(jpgUrl, id, 'jpg', apiBaseUrl);
  const raw = rawUrl ? validateDownloadUrl(rawUrl, id, 'raw', apiBaseUrl) : null;
  const dir = await captureDirectory(id);
  const jpgSizeBytes = await downloadOne(dir, jpg, 'jpg', apiKey);
  if (!raw) throw new CaptureStorageError('RAW_PENDING', 'File RAW belum tersedia.');
  const rawSizeBytes = await downloadOne(dir, raw, 'raw', apiKey);
  return { originalJpgPath: relativePath(id, 'jpg'), rawFilePath: relativePath(id, 'raw'), jpgSizeBytes, rawSizeBytes };
}
/** For retry of a stored capture: verify local originals against database sizes, no HTTP. */
export async function readStoredCapture(id: string, expected: CaptureFiles): Promise<CaptureFiles> {
  assertCaptureId(id);
  if (expected.originalJpgPath !== relativePath(id, 'jpg') || expected.rawFilePath !== relativePath(id, 'raw')) throw new CaptureStorageError('INVALID_FILE', 'Metadata path tidak cocok.');
  const dir = await captureDirectory(id);
  const jpg = await inspectFile(path.join(dir, 'original.jpg'), 'jpg');
  const raw = await inspectFile(path.join(dir, 'original.raw'), 'raw');
  if (jpg === null || raw === null || jpg !== expected.jpgSizeBytes || raw !== expected.rawSizeBytes) throw new CaptureStorageError('INVALID_FILE', 'File asli tidak lengkap atau ukuran tidak cocok.');
  return expected;
}
