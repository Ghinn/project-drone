import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__session';

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 0,
    });

    return NextResponse.json(
      { success: true, message: 'Sesi server berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Next.js SSR Logout] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus sesi di server.' },
      { status: 500 }
    );
  }
}