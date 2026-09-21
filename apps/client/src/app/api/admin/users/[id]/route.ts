import { NextResponse } from "next/server";
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// GET user berdasarkan ID (database UUID atau Firebase UID)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      cache: "no-store",
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF GET /admin/users/:id Error:', error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
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
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF PATCH /admin/users/:id Error:', error);
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
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF DELETE /admin/users/:id Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}