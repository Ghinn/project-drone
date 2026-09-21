import { NextResponse } from "next/server";
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// GET Daftar Pengguna
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `${API_URL}/api/admin/users${queryString ? `?${queryString}` : ""}`;

    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(endpoint, {
      method: "GET",
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF GET /admin/users Error:', error);
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
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF POST /admin/users Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}