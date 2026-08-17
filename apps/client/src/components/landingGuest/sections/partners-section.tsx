'use client';

import { useTranslations } from 'next-intl';

const PARTNERS = [
  { id: 'itb', abbr: 'ITB', accent: '#6B8E23', bg: 'rgba(107,142,35,0.08)', border: 'rgba(107,142,35,0.25)' },
  { id: 'ipb', abbr: 'IPB', accent: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
  { id: 'poltek', abbr: 'POLTEK', accent: '#C8553D', bg: 'rgba(200,85,61,0.08)', border: 'rgba(200,85,61,0.25)' },
  { id: 'brin', abbr: 'BRIN', accent: '#6B8E23', bg: 'rgba(107,142,35,0.08)', border: 'rgba(107,142,35,0.25)' },
] as const;

export function PartnersSection() {
  const t = useTranslations('Landing.partners');

  return (
    <section
      id="partners"
      className="py-28 transition-colors duration-300 relative"
      style={{ background: '#0F172A' }}
    >
      {/* Gradient separator top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(107,142,35,0.4), rgba(124,58,237,0.4), transparent)' }}
      />

      <div className="mx-auto max-w-6xl px-6">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 mb-6 justify-center">
            <div className="h-px w-8" style={{ background: '#6B8E23' }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#6B8E23' }}>
              {t('eyebrow')}
            </p>
            <div className="h-px w-8" style={{ background: '#6B8E23' }} />
          </div>
          <h2
            className="font-extrabold leading-[1.1] text-white"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}
          >
            {t('title')}
          </h2>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PARTNERS.map(p => (
            <div
              key={p.id}
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: p.bg }}
              />
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: p.accent }}
              />

              <div className="relative">
                {/* Abbr badge */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black"
                  style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.accent }}
                >
                  {p.abbr}
                </div>
                <p className="mb-1 text-sm font-bold text-white">
                  {t(`list.${p.id}.name`)}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {t(`list.${p.id}.dept`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: '#334155' }}>
          {t('footnote')}
        </p>

      </div>

      {/* Gradient separator bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,85,61,0.4), rgba(124,58,237,0.4), transparent)' }}
      />
    </section>
  );
}