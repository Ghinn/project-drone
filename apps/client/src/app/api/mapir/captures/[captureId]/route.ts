import { NextResponse } from "next/server";
import { authorizeMapirRequest } from "@/lib/mapir-auth";

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorDetail = (value: unknown, fallback: string) =>
  isJsonObject(value) && typeof value.detail === "string"
    ? value.detail
    : fallback;

const isAllowedImageUrl = (imageUrl: string, apiUrl: string) => {
  try {
    const image = new URL(imageUrl);
    const apiOrigin = new URL(apiUrl).origin;
    const storageOrigin = process.env.SUPABASE_STORAGE_URL
      ? new URL(process.env.SUPABASE_STORAGE_URL).origin
      : null;

    if (image.origin === apiOrigin) {
      return image.pathname.startsWith("/v1/mapir/captures/");
    }
    return (
      image.origin === storageOrigin &&
      image.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ captureId: string }> },
) {
  const authorizationError = await authorizeMapirRequest(request);
  if (authorizationError) return authorizationError;

  const { captureId } = await params;
  const apiUrl = process.env.DREAMPALM_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.DREAMPALM_API_KEY;
  const mlUrl = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").replace(
    /\/+$/,
    "",
  );

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "DREAMPALM_API_URL belum diatur." },
      { status: 500 },
    );
  }

  if (!captureId || captureId.length > 128 || captureId.includes("/")) {
    return NextResponse.json(
      { detail: "ID capture tidak valid." },
      { status: 400 },
    );
  }

  const targetStatusUrl = `${apiUrl}/captures/${encodeURIComponent(captureId)}`;

  try {
    const statusRes = await fetch(targetStatusUrl, {
      cache: "no-store",
      headers: {
        ...(apiKey ? { "X-DreamPalm-Key": apiKey } : {}),
      },
    });
    const statusData: unknown = await statusRes.json().catch(() => ({}));

    if (!statusRes.ok) {
      return NextResponse.json(
        {
          detail: getErrorDetail(
            statusData,
            `Upstream mengembalikan ${statusRes.status}`,
          ),
        },
        { status: statusRes.status },
      );
    }

    if (!isJsonObject(statusData) || statusData.status !== "completed") {
      return NextResponse.json(statusData);
    }

    const files = isJsonObject(statusData.files) ? statusData.files : null;
    const jpgFile = files && isJsonObject(files.jpg) ? files.jpg : null;
    const jpgUrl = jpgFile && typeof jpgFile.url === "string" ? jpgFile.url : null;

    if (!jpgUrl) {
      return NextResponse.json(
        { detail: "URL file JPG tidak ditemukan pada response capture." },
        { status: 502 },
      );
    }

    if (!isAllowedImageUrl(jpgUrl, apiUrl)) {
      console.error("[MAPIR Capture Error] URL gambar dari upstream tidak diizinkan.");
      return NextResponse.json(
        { detail: "Host URL gambar capture tidak diizinkan." },
        { status: 502 },
      );
    }

    const imageRes = await fetch(jpgUrl, {
      headers: {
        ...(apiKey ? { "X-DreamPalm-Key": apiKey } : {}),
      },
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { detail: `Gagal mengambil gambar capture (${imageRes.status}).` },
        { status: 502 },
      );
    }

    const formData = new FormData();
    formData.append("file", await imageRes.blob(), `${captureId}.jpg`);

    const mlRes = await fetch(`${mlUrl}/process-snapshot`, {
      method: "POST",
      body: formData,
    });
    const mlResult: unknown = await mlRes.json().catch(() => ({}));

    if (!mlRes.ok) {
      return NextResponse.json(
        { detail: getErrorDetail(mlResult, "Gagal memproses di FastAPI.") },
        { status: mlRes.status },
      );
    }

    const rawFile = files && isJsonObject(files.raw) ? files.raw : null;

    return NextResponse.json({
      status: "completed",
      capture_id: captureId,
      originalJpgUrl: jpgUrl,
      originalRawUrl:
        rawFile && typeof rawFile.url === "string" ? rawFile.url : null,
      mlResult,
    });
  } catch (error: unknown) {
    console.error("[MAPIR Status Exception]", error);
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses capture.",
      },
      { status: 502 },
    );
  }
}
