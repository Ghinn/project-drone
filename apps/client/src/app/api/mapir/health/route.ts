import { NextResponse } from "next/server";
import { authorizeMapirRequest } from "@/lib/mapir-auth";

export async function GET(request: Request) {
  const authorizationError = await authorizeMapirRequest(request);
  if (authorizationError) return authorizationError;

  const apiUrl = process.env.DREAMPALM_API_URL?.replace(/\/+$/, "");

  if (!apiUrl) {
    return NextResponse.json(
      {
        raspberry_pi: "offline",
        mapir: { ready: false },
        capture_busy: false,
        detail: "DREAMPALM_API_URL belum diatur.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("[MAPIR Health Error]", error);
    return NextResponse.json(
      {
        raspberry_pi: "offline",
        mapir: { ready: false },
        capture_busy: false,
      },
      { status: 503 },
    );
  }
}
