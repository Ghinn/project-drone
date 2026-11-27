import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCookieHeader } from "@/lib/bff";
import { assertCaptureId, storageRoot } from "./captureStorage";
import { ApiError } from "./mapirClient";

export type Owner = { captureId: string; droneId: string };
export type MlResult = Record<string, unknown> & { predictionId: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

export async function requireOperator(request: Request): Promise<string> {
  const cookie = await getCookieHeader(request);
  if (!cookie) throw new ApiError(401, "AUTH", "Autentikasi diperlukan.");
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/operator/me`, { headers: { Cookie: cookie }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new ApiError([401,403].includes(res.status) ? res.status : 503, "AUTH", "Akses operator tidak dapat diverifikasi.");
  const json: unknown = await res.json();
  const p = record(json) ? json.data : null;
  if (!record(p) || !["OPERATOR", "ADMIN"].includes(String(p.role)) || p.status !== "APPROVED" || typeof p.assignedDroneId !== "string" || !p.assignedDroneId) {
    throw new ApiError(403, "AUTH", "Akun tidak memiliki akses drone yang ditugaskan.");
  }
  return p.assignedDroneId;
}

export function assertCameraDrone(droneId: string, upstreamId?: string) {
  const configured = process.env.DREAMPALM_CAMERA_DRONE_ID;
  const upstream = process.env.DREAMPALM_CAMERA_UPSTREAM_ID;
  if (!configured || !upstream) throw new ApiError(503, "CONFIG", "Pemetaan drone MAPIR belum diatur.");
  if (configured !== droneId || (upstreamId !== undefined && upstreamId !== upstream)) {
    throw new ApiError(403, "DRONE", "Kamera tidak sesuai dengan drone yang ditugaskan.");
  }
}

export function captureDir(id: string) {
  assertCaptureId(id);
  return path.join(storageRoot(), "captures", id);
}
export function predictionDir(id: string) {
  if (!uuid.test(id)) throw new ApiError(400, "ID", "ID prediksi tidak valid.");
  return path.join(storageRoot(), "predictions", id);
}

async function readJson(file: string): Promise<unknown> {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return null; throw e; }
}
async function writeJson(file: string, data: unknown) {
  const temp = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(data), { flag: "wx", mode: 0o600 });
    await rename(temp, file);
  } finally { await rm(temp, { force: true }).catch(() => {}); }
}
function parseOwner(value: unknown): Owner | null {
  if (!record(value) || typeof value.captureId !== "string" || typeof value.droneId !== "string") return null;
  assertCaptureId(value.captureId);
  return { captureId: value.captureId, droneId: value.droneId };
}
export async function createCaptureOwner(id: string, droneId: string) {
  // Never overwrite a registered capture, even if the upstream unexpectedly reuses an ID.
  const dir = captureDir(id);
  await mkdir(dir, { mode: 0o750 });
  await writeJson(path.join(dir, "owner.json"), { captureId: id, droneId });
}
export async function getCaptureOwner(id: string, droneId: string): Promise<Owner> {
  const owner = parseOwner(await readJson(path.join(captureDir(id), "owner.json")));
  if (!owner || owner.captureId !== id || owner.droneId !== droneId) throw new ApiError(404, "NOT_FOUND", "Capture tidak ditemukan.");
  return owner;
}
export async function readResult(id: string): Promise<MlResult | null> {
  const value = await readJson(path.join(captureDir(id), "result.json"));
  if (value === null) return null;
  if (!record(value) || value.success !== true || typeof value.predictionId !== "string" || !uuid.test(value.predictionId)) throw new Error("Invalid cached result");
  return value as MlResult;
}
export function captureResponse(id: string, result: MlResult) {
  return { status: "completed", capture_id: id, originalJpgUrl: `/api/media/captures/${id}/original.jpg`, originalRawUrl: `/api/media/captures/${id}/original.raw`, mlResult: result };
}
export async function resolveFile(group: "captures" | "predictions", id: string, name: string) {
  const dir = group === "captures" ? captureDir(id) : predictionDir(id);
  const allowed = group === "captures" ? ["original.jpg", "original.raw"] : ["processed.jpg", "ndvi.png"];
  if (!allowed.includes(name)) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
  const root = await realpath(storageRoot());
  const candidate = path.join(root, group, path.basename(dir), name);
  const resolved = await realpath(candidate);
  if (resolved !== candidate) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
  const stat = await lstat(candidate);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size <= 0) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
  return { file: candidate, size: stat.size };
}
export async function saveResult(owner: Owner, value: unknown): Promise<MlResult> {
  if (!record(value) || value.success !== true || typeof value.predictionId !== "string" || !uuid.test(value.predictionId)) throw new ApiError(502, "ML", "Response FastAPI tidak valid.");
  const id = value.predictionId;
  const jpg = `predictions/${id}/processed.jpg`;
  const png = `predictions/${id}/ndvi.png`;
  if (value.processedJpgPath !== jpg || value.ndviVisualPath !== png) throw new ApiError(502, "ML", "Path hasil FastAPI tidak valid.");
  await resolveFile("predictions", id, "processed.jpg");
  await resolveFile("predictions", id, "ndvi.png");
  const result = { ...value, predictionId: id, snapshotThumbnail: `/api/media/${jpg}`, snapshotNDVI: `/api/media/${png}` };
  await writeJson(path.join(predictionDir(id), "owner.json"), owner);
  await writeJson(path.join(captureDir(owner.captureId), "result.json"), result);
  return result;
}
export async function authorizeMedia(group: "captures" | "predictions", id: string, droneId: string) {
  if (group === "captures") { await getCaptureOwner(id, droneId); return; }
  const owner = parseOwner(await readJson(path.join(predictionDir(id), "owner.json")));
  if (!owner || owner.droneId !== droneId) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
  await getCaptureOwner(owner.captureId, droneId);
  const result = await readResult(owner.captureId);
  if (result?.predictionId !== id) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
}
export function mapirError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ code: error.code, detail: error.message }, { status: error.status });
  console.error("[Production MAPIR] Operation failed", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ detail: "Operasi MAPIR gagal. Periksa layanan sebelum mengulang capture." }, { status: 502 });
}
