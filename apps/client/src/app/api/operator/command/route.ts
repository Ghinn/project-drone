import { NextResponse } from 'next/server';
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
  try {
    const cookieHeader = await getCookieHeader(request);
    const body = await request.json(); 

    const backendRes = await fetch(`${API_URL}/api/operator/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF POST /operator/command Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.', data: null },
      { status: 500 }
    );
  }
}