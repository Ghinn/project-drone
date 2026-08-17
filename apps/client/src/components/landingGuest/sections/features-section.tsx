'use client';

import { useTranslations } from 'next-intl';

const MAIN_FEATURES = [
  { id: 'classification', num: '01', accent: '#6B8E23', bgAccent: 'rgba(107,142,35,0.08)' },
  { id: 'monitoring', num: '02', accent: '#7C3AED', bgAccent: 'rgba(124,58,237,0.08)' },
  { id: 'mapping', num: '03', accent: '#C8553D', bgAccent: 'rgba(200,85,61,0.08)' },
] as const;

export function FeaturesSection() {
  const t = useTranslations('Landing.features');

  return (
    <section
      id="features"
      className="py-28 transition-colors duration-300 relative overflow-hidden"
      style={{ background: '#0F172A' }}
    >
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="mx-auto max-w-6xl px-6 relative">

        {/* HEADER */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8" style={{ background: '#7C3AED' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#7C3AED' }}>
                {t('eyebrow')}
              </p>
            </div>
            <h2
              className="font-extrabold leading-[1.1] text-white"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
            >
              {t.rich('title', {
                br: () => <br />
              })}
            </h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
            Sistem terintegrasi dari udara hingga tindakan — deteksi penyakit, pemetaan, dan penyemprotan presisi dalam satu misi.
          </p>
        </div>

        {/* MAIN FEATURES: 3 Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
          {MAIN_FEATURES.map(f => (
            <div
              key={f.id}
              className="group relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Accent glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: f.bgAccent }}
              />
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: f.accent }}
              />

              <div className="relative">
                {/* Number badge */}
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black mb-6"
                  style={{
                    background: `${f.accent}20`,
                    color: f.accent,
                    border: `1px solid ${f.accent}40`,
                  }}
                >
                  {f.num}
                </div>

                <h3 className="mb-3 text-lg font-bold text-white">
                  {t(`items.${f.id}.title`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                  {t(`items.${f.id}.body`)}
                </p>

                {/* Arrow on hover */}
                <div
                  className="mt-6 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: f.accent }}
                >
                  Pelajari lebih lanjut
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SPECIAL FEATURE: Full-width horizontal card */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(200,85,61,0.12) 0%, rgba(124,58,237,0.12) 100%)',
            border: '1px solid rgba(200,85,61,0.25)',
          }}
        >
          {/* Gradient line top */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #C8553D, #7C3AED)' }}
          />

          <div className="p-8 md:p-10 flex flex-col md:flex-row items-start gap-8">
            {/* Number + title */}
            <div className="md:w-1/3 shrink-0">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black mb-4"
                style={{
                  background: 'rgba(200,85,61,0.2)',
                  color: '#C8553D',
                  border: '1px solid rgba(200,85,61,0.4)',
                }}
              >
                04
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('specialFeature.title')}
              </h3>

              {/* Precision Spray badge */}
              <div
                className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(200,85,61,0.15)', color: '#C8553D', border: '1px solid rgba(200,85,61,0.3)' }}
              >
                🎯 Precision Spraying
              </div>
            </div>

            <div className="md:w-2/3">
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                {t('specialFeature.body')}
              </p>

              {/* Mini spec strips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['RC-Triggered', 'RTK Accuracy ±0.8m', 'Real-time Marking', 'Zone-based Dosage'].map(chip => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}