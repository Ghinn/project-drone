'use client';

import { useTranslations } from 'next-intl';

export function PhotoBreakSection() {
  const t = useTranslations('Landing.photoBreak');

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#0F172A' }}
    >
      {/* Full bleed image with stronger color overlay */}
      <div className="relative h-72 md:h-96">
        <img
          alt={t('imageAlt')}
          className="h-full w-full object-cover opacity-25"
          src="https://images.unsplash.com/photo-1521480259767-07c6e39fe142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        />

        {/* Multi-stop color overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(107,142,35,0.4) 0%, rgba(15,23,42,0.6) 50%, rgba(124,58,237,0.4) 100%)',
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-3xl">
            {/* Decorative line */}
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="h-px flex-1 max-w-16" style={{ background: 'rgba(107,142,35,0.5)' }} />
              <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#6B8E23' }}>
                DreamPalm
              </span>
              <div className="h-px flex-1 max-w-16" style={{ background: 'rgba(107,142,35,0.5)' }} />
            </div>

            <p
              className="font-extrabold text-white leading-tight"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
            >
              {t.rich('quote', {
                br: () => <br />
              })}
            </p>

            {/* Bottom decoration */}
            <div className="mt-6 flex justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#6B8E23' }} />
              <span className="h-1.5 w-8 rounded-full" style={{ background: '#C8553D' }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#7C3AED' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}