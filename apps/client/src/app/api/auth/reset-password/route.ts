import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Direct Request ke Express Backend
    const backendRes = await fetch(`${API_URL}/api/auth/forgot-password/verify-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || 'Gagal mengatur ulang kata sandi.' },
        { status: backendRes.status }
      );
    }

    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('BFF Reset Password Proxy Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}