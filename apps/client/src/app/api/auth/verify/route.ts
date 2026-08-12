import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token verifikasi hilang.' }, { status: 400 });
    }

    // Direct Request ke Express Backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const backendRes = await fetch(`${API_URL}/api/auth/verify?token=${token}`, {
      method: 'GET',
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ error: data.error }, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('BFF Verify Proxy Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}