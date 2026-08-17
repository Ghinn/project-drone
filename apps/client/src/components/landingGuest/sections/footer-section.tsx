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
      style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Top gradient accent */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, #6B8E23, #C8553D, #7C3AED, #6B8E23)' }}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            {/* Mini logo mark — matches the drone/palm icon style */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6B8E23, #C8553D)' }}
            >
              DP
            </div>
            <div>
              <span className="text-sm font-extrabold text-white">
                Dream<span style={{ color: '#C8553D' }}>Palm</span>
              </span>
              <span className="ml-2 text-xs" style={{ color: '#334155' }}>
                {t('tagline')}
              </span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-center" style={{ color: '#334155' }}>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>

          {/* Links */}
          <div className="flex gap-5">
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.id}
                href={link.href}
                className="text-xs transition-all hover:opacity-70"
                style={{ color: '#475569' }}
              >
                {t(`links.${link.id}`)}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}