import { NextResponse } from "next/server";
import { getCookieHeader } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Menonaktifkan runtime statis agar Next.js tidak melakukan caching pada stream ini
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const droneId = searchParams.get("droneId");

    const cookieHeader = await getCookieHeader(request);

    // Menyusun URL target ke backend Express
    const backendUrl = `${API_URL}/api/data/stream${droneId ? `?droneId=${droneId}` : ""}`;

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Cookie": cookieHeader,
        "Accept": "text/event-stream",
      },
      cache: "no-store", 
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Gagal terhubung ke stream backend." },
        { status: backendRes.status }
      );
    }

    // Meneruskan ReadableStream dari backend langsung ke browser
    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("BFF SSE Proxy Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada proxy stream SSE." },
      { status: 500 }
    );
  }
}