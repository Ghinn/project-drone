'use client';

import { useTranslations } from 'next-intl';
import { LandingPrimaryCta } from '@/components/landingGuest/layout/landing-primary-cta';

export function HeroSection() {
  const t = useTranslations('Landing');

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden scroll-mt-24"
      style={{ background: '#0F172A' }}
      id="home"
    >
      {/* Radial glow background blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6B8E23 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #C8553D 0%, transparent 70%)' }}
      />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(107,142,35,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,142,35,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT: Text Content */}
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-8">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: '#6B8E23' }}
              />
              <span
                className="text-xs font-bold tracking-[0.25em] uppercase"
                style={{ color: '#6B8E23' }}
              >
                {t('hero.eyebrow')}
              </span>
            </div>

            {/* Main Title */}
            <h1
              className="font-extrabold leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', color: '#FFFFFF' }}
            >
              {t.rich('hero.title', {
                br: () => <br />,
                highlight: (chunks) => (
                  <span
                    className="relative"
                    style={{
                      background: 'linear-gradient(135deg, #6B8E23 0%, #C8553D 50%, #7C3AED 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {chunks}
                  </span>
                )
              })}
            </h1>

            {/* Description */}
            <p
              className="text-lg leading-relaxed mb-10"
              style={{ color: '#94a3b8', maxWidth: 500 }}
            >
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-16">
              <LandingPrimaryCta />
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-sm transition-all hover:bg-white/10"
                style={{ color: '#e2e8f0', border: '1.5px solid rgba(255,255,255,0.2)' }}
              >
                {t('hero.learnMore')}
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { v: '94.7%', l: t('hero.metrics.accuracy'), accent: '#6B8E23' },
                { v: '±12 ha', l: t('hero.metrics.coverage'), accent: '#C8553D' },
                { v: '5-band', l: t('hero.metrics.sensor'), accent: '#7C3AED' },
                { v: '<80 ms', l: t('hero.metrics.latency'), accent: '#6B8E23' },
              ].map((m, idx) => (
                <div key={idx} className="group">
                  <div
                    className="text-2xl font-extrabold mb-0.5 transition-all group-hover:scale-105"
                    style={{ color: m.accent }}
                  >
                    {m.v}
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#64748b' }}>
                    {m.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual Card Stack */}
          <div className="relative hidden lg:block">
            {/* Main visual card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e2d14 0%, #1a1040 100%)',
                border: '1px solid rgba(107,142,35,0.3)',
                padding: '2.5rem',
              }}
            >
              {/* Decorative top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #6B8E23, #C8553D, #7C3AED)' }}
              />

              {/* Aerial imagery placeholder styled */}
              <div
                className="rounded-xl overflow-hidden mb-4 aspect-video relative"
                style={{ background: '#0d1a06' }}
              >
                <img
                  alt="Aerial palm plantation"
                  className="w-full h-full object-cover opacity-70"
                  src="https://images.unsplash.com/photo-1697350978674-4b40261b0dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900"
                />
                {/* Status overlay */}
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(15,23,42,0.85)', color: '#6B8E23', border: '1px solid rgba(107,142,35,0.4)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6B8E23] animate-pulse" />
                  LIVE · Scanning
                </div>
                <div
                  className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono"
                  style={{ background: 'rgba(15,23,42,0.85)', color: '#C8553D' }}
                >
                  2 alerts detected
                </div>
              </div>

              {/* Drone stats mini grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Altitude', val: '42m', color: '#6B8E23' },
                  { label: 'Battery', val: '87%', color: '#7C3AED' },
                  { label: 'Detected', val: '3 zones', color: '#C8553D' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="text-base font-bold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating tag: AI model */}
            <div
              className="absolute -top-5 -right-5 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-2xl"
              style={{
                background: '#7C3AED',
                color: '#fff',
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              NDVI · CNN · Random Forest
            </div>

            {/* Floating alert card */}
            <div
              className="absolute -bottom-5 -left-5 rounded-xl px-4 py-3 shadow-2xl"
              style={{
                background: 'rgba(200,85,61,0.12)',
                border: '1px solid rgba(200,85,61,0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-xs font-bold mb-0.5" style={{ color: '#C8553D' }}>
                ⚠ Penyakit BPB Terdeteksi
              </div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>Blok B-12 · 3 pohon terdampak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, #0F172A)' }}
      />
    </section>
  );
}