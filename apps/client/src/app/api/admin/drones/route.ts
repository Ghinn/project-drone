import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getCookieHeader(request: Request): Promise<string> {
  const rawHeader = request.headers.get("cookie");
  if (rawHeader) return rawHeader;
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

export async function GET(request: Request) {
  try {
    const cookieHeader = await getCookieHeader(request);
    const backendRes = await fetch(`${API_URL}/api/admin/drones`, {
      method: "GET",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      cache: 'no-store',
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

function forwardResponse(backendRes: Response, data: any) {
  if (!backendRes.ok && !data.error && data.message) {
    data.error = data.message;
  }

  const response = NextResponse.json(data, { status: backendRes.status });

  // Meneruskan perintah Hapus Cookie dari Backend ke Browser
  const setCookies = backendRes.headers.getSetCookie?.() || [];
  if (setCookies.length > 0) {
    setCookies.forEach((c) => response.headers.append("Set-Cookie", c));
  } else {
    const sc = backendRes.headers.get("set-cookie");
    if (sc) response.headers.set("Set-Cookie", sc);
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/drones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error("BFF Add Drone and Send Email Message Proxy Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}