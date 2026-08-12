import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Direct ke Express Backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const backendRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || 'Gagal mendaftar ke server.' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('BFF Register Proxy Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}