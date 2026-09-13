import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getCookieHeader(request: Request): Promise<string> {
  const rawHeader = request.headers.get("cookie");
  if (rawHeader) return rawHeader;
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);
    const backendRes = await fetch(`${API_URL}/api/admin/drones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader(request);
    const backendRes = await fetch(`${API_URL}/api/admin/drones/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}