import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';

// Buat Token Verifikasi Kustom
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // Kedaluwarsa 5 hari
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__session';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'idToken wajib disertakan dalam payload.' },
        { status: 400 }
      );
    }

    let backendRes: Response | { status: number } = { status: 0 };
    let allCookies: string[] = [];
    
    try {
      backendRes = await fetch(`${API_URL}/api/auth/session-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if ('headers' in backendRes) {
        const setCookies = backendRes.headers.getSetCookie?.() || [];
        allCookies = setCookies.length > 0 
          ? setCookies 
          : backendRes.headers.get("set-cookie") 
            ? [backendRes.headers.get("set-cookie")!] 
            : [];
      }

    } catch (syncError) {
      console.warn("Gagal memanggil Express Backend untuk sinkronisasi database Prisma.", syncError);
    }

    // Verifikasi Token menggunakan Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);

    // Generate Session Cookie Firebase
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    // Find Cookie menggunakan API Native SSR
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    console.log('=========================================');
    console.log('[SSR Login] Session Cookie Berhasil Diterbitkan:');
    console.log(' -> UID Pengguna  :', decodedToken.uid);
    console.log(' -> Email Pengguna:', decodedToken.email);
    console.log(' -> Nama Cookie   :', SESSION_COOKIE_NAME);
    console.log(" -> Status        :", backendRes.status);
    console.log(" -> Jumlah Cookie :", allCookies.length);
    console.log('=========================================');

    return NextResponse.json(
      {
        success: true,
        message: 'Session SSR berhasil diinisialisasi.',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("BFF Sync Session Proxy Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat sinkronisasi sesi." },
      { status: 500 }
    );
  }
}