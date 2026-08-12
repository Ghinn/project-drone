import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getCookieHeader(request: Request): Promise<string> {
  const rawHeader = request.headers.get("cookie");
  if (rawHeader) return rawHeader;

  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
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

// GET Daftar Pengguna
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `${API_URL}/api/admin/users${queryString ? `?${queryString}` : ""}`;

    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    const data = await backendRes.json();

    return forwardResponse(backendRes, data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

// POST Daftar Pengguna dan Kirim Pesan Email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/users`, {
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
    console.error("BFF Add Users and Send Email Message Proxy Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}