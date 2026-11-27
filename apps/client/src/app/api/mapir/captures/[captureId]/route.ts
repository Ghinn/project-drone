import { NextResponse } from "next/server";
import { mkdir, readFile, rmdir } from "node:fs/promises";
import path from "node:path";
import { assertCaptureId, downloadAndSave } from "@/lib/captureStorage";
import { ApiError, assertSameOrigin, cameraConfig, getCameraStatus } from "@/lib/mapirClient";
import { assertCameraDrone, captureDir, captureResponse, getCaptureOwner, mapirError, readResult, requireOperator, saveResult } from "@/lib/production-mapir";

export const runtime = "nodejs";
// POST: this operation can download files and run inference, so GET is not used.
export async function POST(request: Request, { params }: { params: Promise<{ captureId: string }> }) {
  const { captureId } = await params;
  try { assertCaptureId(captureId); } catch { return NextResponse.json({ detail: "ID capture tidak valid." }, { status: 400 }); }
  let lock: string | undefined;
  try {
    assertSameOrigin(request);
    const droneId = await requireOperator(request);
    assertCameraDrone(droneId);
    const owner = await getCaptureOwner(captureId, droneId);
    const cached = await readResult(captureId);
    if (cached) return NextResponse.json(captureResponse(captureId, cached));
    const status = await getCameraStatus(captureId);
    assertCameraDrone(droneId, status.drone_id);
    if (status.status === "failed") return NextResponse.json({ status: "failed", detail: "Capture MAPIR gagal." });
    if (status.status !== "completed" || !status.files?.raw?.url) return NextResponse.json({ status: "pending", capture_id: captureId });
    const candidate = path.join(captureDir(captureId), ".analysis-lock");
    try { await mkdir(candidate, { mode: 0o700 }); lock = candidate; }
    catch (e) { if ((e as NodeJS.ErrnoException).code === "EEXIST") return NextResponse.json({ status: "processing", capture_id: captureId }); throw e; }
    const afterLock = await readResult(captureId);
    if (afterLock) return NextResponse.json(captureResponse(captureId, afterLock));
    const { base, key } = cameraConfig();
    if (!status.files.jpg?.url) throw new ApiError(502, "JPG", "URL JPG belum tersedia.");
    await downloadAndSave({ captureId, jpgUrl: status.files.jpg.url, rawUrl: status.files.raw.url, apiKey: key, apiBaseUrl: base });
    const jpg = await readFile(path.join(captureDir(captureId), "original.jpg"));
    const mlUrl = process.env.FASTAPI_URL?.replace(/\/+$/, "");
    if (mlUrl !== "http://127.0.0.1:8003") throw new ApiError(503, "ML_CONFIG", "FastAPI produksi belum dikonfigurasi.");
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(jpg)], { type: "image/jpeg" }), `${captureId}.jpg`);
    const res = await fetch(`${mlUrl}/process-snapshot`, { method: "POST", body: form, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new ApiError(502, "ML", "FastAPI gagal memproses capture.");
    const result = await saveResult(owner, await res.json());
    return NextResponse.json(captureResponse(captureId, result), { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return mapirError(e); }
  finally { if (lock) await rmdir(lock).catch(() => console.error("[MAPIR] Lock cleanup failed")); }
}
