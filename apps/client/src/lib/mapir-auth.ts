import { NextResponse } from "next/server";
import { getCookieHeader } from "@/lib/bff";

export async function authorizeMapirRequest(request: Request) {
  const cookieHeader = await getCookieHeader(request);
  if (!cookieHeader) {
    return NextResponse.json({ detail: "Autentikasi diperlukan." }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${apiUrl}/api/operator/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          detail:
            response.status === 401 || response.status === 403
              ? "Autentikasi diperlukan."
              : "Gagal memverifikasi autentikasi operator.",
        },
        {
          status:
            response.status === 401 || response.status === 403
              ? response.status
              : 503,
        },
      );
    }

    const data: unknown = await response.json();
    if (
      typeof data !== "object" ||
      data === null ||
      !("data" in data) ||
      typeof data.data !== "object" ||
      data.data === null ||
      !("role" in data.data) ||
      (data.data.role !== "OPERATOR" && data.data.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { detail: "Akses MAPIR tidak diizinkan." },
        { status: 403 },
      );
    }

    return null;
  } catch (error) {
    console.error("[MAPIR Auth] Gagal memverifikasi akses operator:", error);
    return NextResponse.json(
      { detail: "Gagal memverifikasi autentikasi operator." },
      { status: 503 },
    );
  }
}
