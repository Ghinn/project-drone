import { NextResponse } from "next/server";
import { getCookieHeader, forwardResponse } from '@/lib/bff';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader(request);
    
    const backendRes = await fetch(`${API_URL}/api/monitoringOperator/log-prediction/${id}`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return forwardResponse(backendRes, data);
  } catch (error) {
    console.error('BFF GET /monitoringOperator/log-prediction/:id Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}