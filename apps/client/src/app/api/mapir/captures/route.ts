import { NextResponse } from "next/server";
import { authorizeMapirRequest } from "@/lib/mapir-auth";

export async function POST(request: Request) {
  const authorizationError = await authorizeMapirRequest(request);
  if (authorizationError) return authorizationError;

  const apiUrl = process.env.DREAMPALM_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.DREAMPALM_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { detail: "Konfigurasi DREAMPALM_API_URL atau DREAMPALM_API_KEY belum diatur." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/captures`, {
      method: "POST",
      headers: { "X-DreamPalm-Key": apiKey },
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("[MAPIR Capture Error]", error);
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Gagal menghubungi Capture API.",
      },
      { status: 502 },
    );
  }
}
