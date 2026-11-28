import { assertCaptureId } from './captureStorage';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export function cameraConfig() {
  const base = process.env.DREAMPALM_API_URL?.replace(/\/+$/, '');
  const key = process.env.DREAMPALM_API_KEY;
  if (!base || !key) throw new ApiError(503, 'CONFIG_MISSING', 'Konfigurasi Capture API belum lengkap.');
  const url = new URL(base);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new ApiError(503, 'CONFIG_INVALID', 'Konfigurasi Capture API tidak valid.');
  return { base, key };
}
export type CameraCapture = { capture_id?: string; status?: string; drone_id?: string; captured_at?: string; files?: { jpg?: { url?: string }; raw?: { url?: string } } };
async function cameraRequest(suffix: string, method: 'GET' | 'POST'): Promise<CameraCapture> {
  const { base, key } = cameraConfig();
  let res: Response;
  try {
    res = await fetch(`${base}${suffix}`, { method, headers: { 'X-DreamPalm-Key': key }, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new ApiError(res.status === 404 ? 404 : res.status === 409 ? 409 : 502, 'CAMERA_UPSTREAM', 'Capture API tidak dapat menyelesaikan permintaan.');
    const data = await res.json() as CameraCapture;
    if (!data || typeof data !== 'object') throw new Error('Invalid camera response');
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(502, 'CAMERA_UNAVAILABLE', 'Gagal menghubungi Capture API.');
  }
}
export async function triggerCapture() {
  const data = await cameraRequest('/captures', 'POST');
  if (typeof data.capture_id !== 'string') throw new ApiError(502, 'CAMERA_RESPONSE', 'Capture API tidak mengembalikan ID. Jangan trigger ulang sebelum memeriksa kamera.');
  try { assertCaptureId(data.capture_id); } catch { throw new ApiError(502, 'CAMERA_RESPONSE', 'Capture API mengembalikan ID tidak valid.'); }
  return { ...data, capture_id: data.capture_id };
}
export async function getCameraStatus(id: string) {
  assertCaptureId(id);
  const data = await cameraRequest(`/captures/${encodeURIComponent(id)}`, 'GET');
  if (data.capture_id !== undefined && data.capture_id !== id) throw new ApiError(502, 'CAMERA_RESPONSE', 'ID capture dari kamera tidak cocok.');
  if (typeof data.status !== 'string') throw new ApiError(502, 'CAMERA_RESPONSE', 'Status kamera tidak valid.');
  return data;
}
export function captureMetadata(data: CameraCapture) {
  const time = typeof data.captured_at === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/i.test(data.captured_at) ? new Date(data.captured_at) : null;
  return { droneId: typeof data.drone_id === 'string' && data.drone_id.trim() ? data.drone_id : null, capturedAt: time && Number.isFinite(time.getTime()) ? time : null };
}
/** All browser mutations are same-origin. Behind Nginx, preserve Host and set X-Forwarded-Proto. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || new URL(request.url).host;
  const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.slice(0, -1);
  if (request.headers.get('sec-fetch-site') === 'cross-site' || !origin || origin !== `${proto}://${host}`) throw new ApiError(403, 'ORIGIN_DENIED', 'Permintaan harus berasal dari website yang sama.');
}
