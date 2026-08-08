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
  { id: 'hectares', iconKey: 'leaf', value: '2,400+' },
  { id: 'f1score', iconKey: 'target', value: '0.947' },
  { id: 'endurance', iconKey: 'timer', value: '28 min' },
  { id: 'gps', iconKey: 'satellite', value: '±0.8 m' },
] as const;

const TECH_TAGS = [
  'Ganoderma Detection', 'Edge AI / YOLOv8', 'Multispectral NDVI',
  'UAV Autonomy', 'RTK-GPS Tagging', 'RC Spraying'
];

export function AboutSection() {
  const t = useTranslations('Landing');

  return (
    <section 
      id="about" 
      className="scroll-mt-10 bg-white py-28 transition-colors duration-300 dark:bg-[#121212]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-20 lg:grid-cols-2">
          
          {/* BAGIAN KIRI: DESKRIPSI & TAGS */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
              {t('about.eyebrow')} {/* Fallback: Research Background */}
            </p>
            
            <h2 className="mb-6 font-bold leading-tight text-[#111827] dark:text-[#f3f4f6]" style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)' }}>
              {t.rich('about.title', {
                br: () => <br />
              })}
            </h2>
            
            <p className="mb-5 text-base leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
              {t.rich('about.description1', {
                em: (chunks) => <em>{chunks}</em>
              })}
            </p>
            
            <p className="mb-8 text-base leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
              {t('about.description2')}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map(tag => (
                <span 
                  key={tag} 
                  className="rounded-sm bg-[#f0f5e3] px-3 py-1 text-xs font-medium text-[#84994F] dark:bg-[#1e2a0e] dark:text-[#C1D343]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* BAGIAN KANAN: BENTO GRID STATS */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {ABOUT_STATS.map((stat) => {
              const Icon = ICON_MAP[stat.iconKey];
              
              return (
                <div 
                  key={stat.id} 
                  className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                >
                  <div className="mb-4 text-[#84994F] dark:text-[#C1D343]">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  
                  <div className="mb-0.5 text-2xl font-bold text-[#111827] dark:text-[#f3f4f6]">
                    {stat.value}
                  </div>
                  
                  <div className="mb-0.5 text-xs font-semibold text-[#111827] dark:text-[#f3f4f6]">
                    {t(`about.stats.${stat.id}.label`)}
                  </div>
                  
                  <div className="text-xs text-[#4b5563] dark:text-[#9ca3af]">
                    {t(`about.stats.${stat.id}.note`)}
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