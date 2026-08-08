'use client';

import { useTranslations } from 'next-intl';
import { LandingPrimaryCta } from '@/components/landingGuest/layout/landing-primary-cta';

export function HeroSection() {
  const t = useTranslations('Landing');

  return (
    <section
      className="relative min-h-screen flex items-center scroll-mt-24"
      style={{ background: '#0d1a06' }}
      id="home"
    >
      <div className="absolute inset-0">
        <img
          alt="Aerial plantation"
          className="w-full h-full object-cover"
          style={{ opacity: 0.35 }}
          src="https://images.unsplash.com/photo-1697350978674-4b40261b0dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow Label */}
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-sm"
            style={{ color: '#C1D343' }}
          >
            {t('hero.eyebrow')}
          </span>

          <h1
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', lineHeight: 1.08 }}
          >
            {t.rich('hero.title', {
              br: () => <br />,
              highlight: (chunks) => <span style={{ color: '#C1D343' }}>{chunks}</span>
            })}
          </h1>

          <p
            className="text-lg leading-relaxed mb-10 font-light"
            style={{ color: '#c8d4b8', maxWidth: 520 }}
          >
            {t('hero.description')}
          </p>

          <div className="flex flex-wrap gap-4">
            <LandingPrimaryCta />
            {/* Button Learn More*/}
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded transition-opacity hover:opacity-70"
              style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)' }}
            >
              {t('hero.learnMore')}
            </a>
          </div>
        </div>

        <div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32 }}
        >
          {[
            { v: '94.7%', l: t('hero.metrics.accuracy') },
            { v: '±12 ha', l: t('hero.metrics.coverage') },
            { v: '5-band', l: t('hero.metrics.sensor') },
            { v: '< 80 ms', l: t('hero.metrics.latency') },
          ].map((m, idx) => (
            <div key={idx} className="pr-8">
              <div className="text-2xl font-bold mb-1" style={{ color: '#C1D343' }}>{m.v}</div>
              <div className="text-xs font-medium" style={{ color: '#8a9e78' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}