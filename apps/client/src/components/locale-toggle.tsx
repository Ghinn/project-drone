'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {type AppLocale} from '@/i18n/config';

const LOCALE_OPTIONS: ReadonlyArray<{
  code: AppLocale;
  flag: string;
  labelKey: 'indonesian' | 'english';
}> = [
  {code: 'id', flag: '🇮🇩', labelKey: 'indonesian'},
  {code: 'en', flag: '🇬🇧', labelKey: 'english'}
];

export function LocaleToggle() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('LocaleToggle');
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);

  async function handleChange(nextLocale: AppLocale) {
    if (nextLocale === locale || pendingLocale !== null) {
      return;
    }

    try {
      setPendingLocale(nextLocale);

      const response = await fetch('/server/locale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        body: JSON.stringify({locale: nextLocale})
      });

      if (!response.ok) {
        throw new Error('Failed to update locale cookie.');
      }

      router.refresh();
    } finally {
      setPendingLocale(null);
    }
  }

  return (
    <div
      aria-label={t('label')}
      className="flex items-center gap-1 rounded-full border border-neutral-200 p-1 dark:border-neutral-800"
      role="group"
    >
      {LOCALE_OPTIONS.map((option) => {
        const active = option.code === locale;
        const label = t(option.labelKey);

        return (
          <button
            key={option.code}
            aria-label={t('switchTo', {locale: label})}
            aria-pressed={active}
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full text-base transition',
              active
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
            ].join(' ')}
            disabled={pendingLocale !== null}
            onClick={() => void handleChange(option.code)}
            title={label}
            type="button"
          >
            <span aria-hidden="true">{option.flag}</span>
          </button>
        );
      })}
    </div>
  );
}