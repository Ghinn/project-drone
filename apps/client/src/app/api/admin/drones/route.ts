import { NextResponse } from "next/server";
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET(request: Request) {
  try {
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/drones`, {
      method: "GET",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF GET /admin/drones Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/admin/drones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF POST /admin/drones Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}