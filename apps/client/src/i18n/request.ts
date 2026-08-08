import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
import {
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_NAME
} from '@/i18n/config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isAppLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  try {
    // Memuat file JSON dari masing-masing sub-direktori
    const landingGuestTranslate = (await import(`../../translateLocale/landingGuest/${locale}-landingGuest.json`)).default;
    const monitoringFarmerTranslate = (await import(`../../translateLocale/monitoringFarmer/${locale}-monitoringFarmer.json`)).default;
    const monitoringOperatorTranslate = (await import(`../../translateLocale/monitoringOperator/${locale}-monitoringOperator.json`)).default;
    const adminTranslate = (await import(`../../translateLocale/admin/${locale}-admin.json`)).default;

  return {
      locale,
      messages: {
        ...landingGuestTranslate,
        ...monitoringFarmerTranslate,
        ...monitoringOperatorTranslate,
        ...adminTranslate,
      }
    };
  } catch (error) {
    console.error(`Gagal memuat file terjemahan untuk locale: ${locale}`, error);
    return {
      locale,
      messages: {}
    };
  }
});