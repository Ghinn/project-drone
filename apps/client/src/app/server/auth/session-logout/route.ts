import {cookies} from 'next/headers';

const SESSION_COOKIE_NAMES = Array.from(
  new Set([process.env.AUTH_SESSION_COOKIE_NAME ?? 'session', '__session'])
);

export async function POST() {
  const cookieStore = await cookies();

  for (const cookieName of SESSION_COOKIE_NAMES) {
    cookieStore.set(cookieName, '', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 0
    });
  }

  return Response.json({ok: true});
}