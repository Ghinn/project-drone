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

    // Verifikasi token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Sinkronisasi DB ke Express (upsert user record di Prisma)
    try {
      await fetch(`${API_URL}/api/auth/session-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (syncError) {
      // Gagal sync DB tidak menghentikan proses login
      console.warn('[BFF] Gagal sinkronisasi DB ke Express:', syncError);
    }

    // Buat session cookie via Firebase Admin SDK di Next.js BFF
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    // Simpan ke cookie store Next.js (HttpOnly, tidak dapat diakses JS browser)
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
    // console.log(" -> Status        :", backendRes.status);
    // console.log(" -> Jumlah Cookie :", allCookies.length);
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
    console.error('[BFF] Session Login Error:', error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat sinkronisasi sesi." },
      { status: 500 }
    );
  }
}