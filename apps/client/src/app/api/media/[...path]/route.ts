import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { ApiError } from "@/lib/mapirClient";
import { authorizeMedia, mapirError, requireOperator, resolveFile } from "@/lib/production-mapir";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  try {
    const droneId = await requireOperator(request);
    if (parts.length !== 3 || (parts[0] !== "captures" && parts[0] !== "predictions")) throw new ApiError(404, "MEDIA", "Media tidak ditemukan.");
    const [group, id, name] = parts as ["captures" | "predictions", string, string];
    await authorizeMedia(group, id, droneId);
    const media = await resolveFile(group, id, name);
    const raw = name === "original.raw";
    const stream = Readable.toWeb(createReadStream(media.file)) as ReadableStream<Uint8Array>;
    return new Response(stream, { headers: {
      "Content-Type": raw ? "application/octet-stream" : name.endsWith(".png") ? "image/png" : "image/jpeg",
      "Content-Length": String(media.size),
      "Content-Disposition": `${raw ? "attachment" : "inline"}; filename="${id}-${name}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ detail: "Media tidak ditemukan." }, { status: 404 });
    return mapirError(e);
  }
}
