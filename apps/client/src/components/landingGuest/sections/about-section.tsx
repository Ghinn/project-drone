'use client';

import { Leaf, Target, Timer, Satellite } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ICON_MAP = {
  leaf: Leaf,
  target: Target,
  timer: Timer,
  satellite: Satellite
};

const ABOUT_STATS = [
  { id: 'hectares', iconKey: 'leaf', value: '2,400+', accent: '#6B8E23' },
  { id: 'f1score', iconKey: 'target', value: '0.947', accent: '#C8553D' },
  { id: 'endurance', iconKey: 'timer', value: '28 min', accent: '#7C3AED' },
  { id: 'gps', iconKey: 'satellite', value: '±0.8 m', accent: '#6B8E23' },
] as const;

const TECH_TAGS = [
  'NDVI · Multispektral', 'CNN & Random Forest', 'WebRTC Live Feed',
  'Smart Spot Marking', 'RTK-GPS Tagging', 'RC Spraying'
];

const TAG_COLORS = [
  { bg: 'rgba(107,142,35,0.1)', border: 'rgba(107,142,35,0.3)', text: '#6B8E23' },
  { bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)', text: '#7C3AED' },
  { bg: 'rgba(200,85,61,0.1)', border: 'rgba(200,85,61,0.3)', text: '#C8553D' },
  { bg: 'rgba(107,142,35,0.1)', border: 'rgba(107,142,35,0.3)', text: '#6B8E23' },
  { bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)', text: '#7C3AED' },
  { bg: 'rgba(200,85,61,0.1)', border: 'rgba(200,85,61,0.3)', text: '#C8553D' },
];

export function AboutSection() {
  const t = useTranslations('Landing');

  return (
    <section
      id="about"
      className="scroll-mt-10 py-28 transition-colors duration-300 relative overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      {/* Subtle decorative corner mark */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-80 h-80 opacity-5 dark:opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle at top right, #6B8E23, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">

          {/* LEFT: Description & Tags */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div
                className="h-px w-8"
                style={{ background: '#6B8E23' }}
              />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#6B8E23' }}>
                {t('about.eyebrow')}
              </p>
            </div>

            <h2
              className="mb-6 font-extrabold leading-[1.1]"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#0F172A' }}
            >
              {t.rich('about.title', {
                br: () => <br />
              })}
            </h2>

            <p className="mb-5 text-base leading-relaxed" style={{ color: '#475569' }}>
              {t.rich('about.description1', {
                em: (chunks) => <em className="not-italic font-semibold" style={{ color: '#0F172A' }}>{chunks}</em>
              })}
            </p>

            <p className="mb-10 text-base leading-relaxed" style={{ color: '#475569' }}>
              {t('about.description2')}
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map((tag, i) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 cursor-default"
                  style={{
                    background: TAG_COLORS[i % TAG_COLORS.length].bg,
                    border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length].border}`,
                    color: TAG_COLORS[i % TAG_COLORS.length].text,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {ABOUT_STATS.map((stat) => {
              const Icon = ICON_MAP[stat.iconKey as keyof typeof ICON_MAP];
              return (
                <div
                  key={stat.id}
                  className="relative group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {/* Hover color fill */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: `${stat.accent}06` }}
                  />

                  {/* Top accent line on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: stat.accent }}
                  />

                  <div className="relative">
                    <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                      <Icon className="h-5 w-5" style={{ color: stat.accent }} strokeWidth={2} />
                    </div>
                    <div className="mb-0.5 text-3xl font-extrabold" style={{ color: '#0F172A' }}>
                      {stat.value}
                    </div>
                    <div className="mb-0.5 text-xs font-bold" style={{ color: '#0F172A' }}>
                      {t(`about.stats.${stat.id}.label`)}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b' }}>
                      {t(`about.stats.${stat.id}.note`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </section>
  );
}