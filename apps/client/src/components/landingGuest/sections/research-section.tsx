'use client';

import { useTranslations } from 'next-intl';

const DRONE_SPECS = [
  { id: 'sensor', keyLabel: 'specSensor', keyValue: 'valSensor', accent: '#6B8E23' },
  { id: 'ai', keyLabel: 'specAi', keyValue: 'valAi', accent: '#7C3AED' },
  { id: 'positioning', keyLabel: 'specPositioning', keyValue: 'valPositioning', accent: '#6B8E23' },
  { id: 'endurance', keyLabel: 'specEndurance', keyValue: 'valEndurance', accent: '#C8553D' },
  { id: 'spray', keyLabel: 'specSpray', keyValue: 'valSpray', accent: '#C8553D' },
  { id: 'comm', keyLabel: 'specComm', keyValue: 'valComm', accent: '#7C3AED' },
] as const;

export function ResearchSection() {
  const t = useTranslations('Landing.research');

  return (
    <section
      id="research"
      className="py-28 transition-colors duration-300 relative overflow-hidden"
      style={{ background: '#f8fafc' }}
    >
      {/* Decorative side accent */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-1"
        style={{ background: 'linear-gradient(180deg, transparent, #6B8E23, #7C3AED, transparent)' }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

          {/* LEFT: Drone photo with styled overlay */}
          <div className="relative">
            {/* Outer frame */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(107,142,35,0.2)',
                boxShadow: '0 25px 60px rgba(107,142,35,0.1)',
              }}
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  alt={t('imageAlt')}
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
                />
                {/* Dark overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(15,23,42,0.85) 100%)' }}
                />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs font-bold text-white/90 mb-1">
                    {t('imageCaption')}
                  </p>
                  {/* Drone photo caption tags */}
                <div className="flex gap-2">
                  {['NDVI', 'RTK-GPS', 'Raspberry Pi'].map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: 'rgba(107,142,35,0.4)', color: '#d4e8a0' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* Floating spec badge */}
            <div
              className="absolute -top-4 -right-4 rounded-xl px-4 py-3 shadow-2xl"
              style={{
                background: '#0F172A',
                border: '1px solid rgba(124,58,237,0.4)',
              }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: '#7C3AED' }}>AI Model</div>
              <div className="text-sm font-black text-white">CNN + RF</div>
              <div className="text-xs" style={{ color: '#64748b' }}>F1: 0.947</div>
            </div>
          </div>

          {/* RIGHT: Description & Specs */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8" style={{ background: '#6B8E23' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#6B8E23' }}>
                {t('eyebrow')}
              </p>
            </div>

            <h2
              className="mb-6 font-extrabold leading-[1.1]"
              style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)', color: '#0F172A' }}
            >
              {t.rich('title', {
                br: () => <br />
              })}
            </h2>

            <p className="mb-8 text-sm leading-relaxed" style={{ color: '#475569' }}>
              {t('description')}
            </p>

            {/* Specs table — enhanced */}
            <div className="space-y-0 rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              {DRONE_SPECS.map((row, idx) => (
                <div
                  key={row.id}
                  className="flex gap-4 items-start px-5 py-4 transition-colors hover:bg-[#f1f5f9] group"
                  style={{
                    borderBottom: idx < DRONE_SPECS.length - 1 ? '1px solid #e2e8f0' : 'none',
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  {/* Color dot */}
                  <div
                    className="mt-1 h-2 w-2 rounded-full shrink-0"
                    style={{ background: row.accent }}
                  />
                  <span
                    className="w-28 shrink-0 text-xs font-bold"
                    style={{ color: row.accent }}
                  >
                    {t(`specs.${row.keyLabel}`)}
                  </span>
                  <span className="text-xs leading-relaxed text-[#475569]">
                    {t(`specs.${row.keyValue}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}