import {cookies} from 'next/headers';
import {
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_NAME
} from '@/i18n/config';

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {locale?: unknown}
    | null;

  const locale = isAppLocale(payload?.locale)
    ? payload.locale
    : DEFAULT_LOCALE;

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365
  });

  return Response.json({ok: true, locale});
}