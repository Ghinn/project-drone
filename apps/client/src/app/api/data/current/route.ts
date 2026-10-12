import { NextResponse } from "next/server";
import { getCookieHeader } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = await getCookieHeader(request);
    
    const { searchParams } = new URL(request.url);
    const droneId = searchParams.get("droneId");

    if (!droneId) {
      return NextResponse.json(
        { error: "Parameter droneId wajib disertakan." },
        { status: 400 }
      );
    }

    const backendUrl = `${API_URL}/api/drone/data/current?droneId=${droneId}`;

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Cookie": cookieHeader,
        "Accept": "application/json",
      },
      cache: "no-store", 
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil current state dari backend." },
        { status: backendRes.status }
      );
    }

    // Mengambil dan meneruskan data JSON dari backend
    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      },
    });
  } catch (error) {
    console.error("BFF Current State Proxy Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada proxy pengambilan current state." },
      { status: 500 }
    );
  }
}