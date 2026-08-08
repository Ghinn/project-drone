'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FOOTER_LINKS = [
  { id: 'privacy', href: '#' },
  { id: 'terms', href: '#' },
  { id: 'contact', href: '#contact' },
] as const;

export function FooterSection() {
  const t = useTranslations('Landing.footer');

  return (
    <footer 
      className="bg-[#111827] py-10 transition-colors duration-300 dark:bg-[#0a0a0a]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        
        {/* IDENTITAS BRANDING */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#84994F] text-xs font-bold text-white">
            PS
          </span>
          <span className="text-sm font-semibold text-white">
            {t('brand')} {/* Fallback: Drone */}
          </span>
          <span className="text-xs text-[#6b7280]">
            {t('tagline')} {/* Fallback: Research Project */}
          </span>
        </div>
        
        {/* TEKS HAK CIPTA (COPYRIGHT) */}
        <p className="text-xs text-[#6b7280]">
          {/* Teks dapat dibuat dinamis menggunakan interpolasi dari next-intl */}
          {t('copyright', { year: new Date().getFullYear() })} 
          {/* Fallback: © {year} Drone · Academic Research Use Only · All data is simulated */}
        </p>
        
        {/* TAUTAN NAVIGASI FOOTER */}
        <div className="flex gap-5">
          {FOOTER_LINKS.map(link => (
            <Link 
              key={link.id} 
              href={link.href} 
              className="text-xs text-[#6b7280] transition-opacity hover:opacity-60"
            >
              {t(`links.${link.id}`)}
            </Link>
          ))}
        </div>

      </div>
    </footer>
  );
}