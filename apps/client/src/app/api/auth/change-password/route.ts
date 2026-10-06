import { NextResponse } from 'next/server';
import { getCookieHeader, forwardResponse } from '@/lib/bff';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = await getCookieHeader(request);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const backendRes = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Cookie': cookieHeader
      },
      body: JSON.stringify(body),
    });
    
    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF PATCH Change Password Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}