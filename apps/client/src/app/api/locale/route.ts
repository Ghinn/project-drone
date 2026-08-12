import { NextResponse } from 'next/server';
import {cookies} from 'next/headers';
import {
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_NAME
} from '@/i18n/config';

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | {locale?: unknown}
      | null;

    const locale = isAppLocale(payload?.locale)
      ? payload.locale
      : DEFAULT_LOCALE;

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      name: LOCALE_COOKIE_NAME,
      value: locale,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 365
    });

    return NextResponse.json(
      { success: true, locale },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Next.js Locale Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengatur preferensi bahasa.' },
      { status: 500 }
    );
  }
}