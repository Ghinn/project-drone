export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export const SUPPORTED_LOCALES = ['id', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'id';

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}