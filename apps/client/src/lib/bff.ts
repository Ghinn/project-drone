import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? '__session';

export async function getCookieHeader(request: Request): Promise<string> {
  const raw = request.headers.get('cookie');
  if (raw) return raw;
  const store = await cookies();
  return store.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
}

export function forwardResponse(backendRes: Response, data: unknown): NextResponse {
  if (!backendRes.ok && typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>;
    if (!d['error'] && d['message']) d['error'] = d['message'];
  }

  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookies: string[] =
    backendRes.headers.getSetCookie?.() ??
    (backendRes.headers.get('set-cookie')
      ? [backendRes.headers.get('set-cookie')!]
      : []);

  for (const cookieStr of setCookies) {
    const lower = cookieStr.toLowerCase();
    const key = SESSION_COOKIE.toLowerCase();

    // Blokir instruksi penghapusan session cookie dari Express
    const isClearingSession =
      lower.startsWith(`${key}=;`) ||
      (lower.includes(`${key}=`) && lower.includes('max-age=0'));

    if (!isClearingSession) {
      response.headers.append('Set-Cookie', cookieStr);
    }
  }

  return response;
}