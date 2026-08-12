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
    .join("; ");
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

// UPDATE Data Pengguna berdasarkan ID
export async function PATCH(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(body),
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

// DELETE pengguna berdasarkan ID
export async function DELETE(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    const data = await backendRes.json();

    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error("BFF Delete Users Proxy Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}