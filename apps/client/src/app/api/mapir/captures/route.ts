import { NextResponse } from "next/server";
import { ApiError, assertSameOrigin, triggerCapture } from "@/lib/mapirClient";
import { assertCameraDrone, createCaptureOwner, mapirError, requireOperator } from "@/lib/production-mapir";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const droneId = await requireOperator(request);
    assertCameraDrone(droneId);
    const capture = await triggerCapture();
    if (capture.drone_id !== undefined && typeof capture.drone_id !== "string") throw new ApiError(502, "DRONE", "ID drone upstream tidak valid.");
    assertCameraDrone(droneId, capture.drone_id);
    await createCaptureOwner(capture.capture_id, droneId);
    return NextResponse.json({ capture_id: capture.capture_id, status: capture.status || "pending" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return mapirError(e); }
}
