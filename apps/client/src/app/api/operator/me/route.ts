import { NextResponse } from 'next/server';
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: Request) {
  try {
    const cookieHeader = await getCookieHeader(request);

    const backendRes = await fetch(`${API_URL}/api/operator/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF GET /operator/me Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.', data: null },
      { status: 500 }
    );
  }
}