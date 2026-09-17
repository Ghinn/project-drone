'use client';

import { Leaf, Target, Timer, Satellite } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ICON_MAP = {
  leaf: Leaf,
  target: Target,
  timer: Timer,
  satellite: Satellite
};

const ABOUT_FEATURES = [
  { id: 'spray', iconKey: 'leaf', variant: 'green' },
  { id: 'protocol', iconKey: 'target', variant: 'red' },
  { id: 'ai', iconKey: 'timer', variant: 'red' },
  { id: 'camera', iconKey: 'satellite', variant: 'green' },
] as const;

const VARIANT_STYLES = {
  green: {
    card: 'border-[#BADC75] bg-[#6B8E231A] dark:border-[#384B20] dark:bg-[#18240F]/80',
    icon: 'text-[#6B8E23] dark:text-[#B4CC40]',
    title: 'text-[#6B8E23] dark:text-[#B4CC40]',
    note: 'text-slate-900 dark:text-[#D1D5DB]',
  },
  red: {
    card: 'border-[#FFBAAC] bg-[#C8553D1A] dark:border-[#50231B] dark:bg-[#251210]/80',
    icon: 'text-[#C8553D] dark:text-[#E8735C]',
    title: 'text-[#C8553D] dark:text-[#E8735C]',
    note: 'text-slate-900 dark:text-[#D1D5DB]',
  },
} as const;

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
        <div className="items-start gap-20">
          
          {/* JUDUL SECTION */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
              {t('about.eyebrow')} 
            </p>
            
            <h2 className="mb-6 font-bold leading-tight text-[#C8553D] dark:text-[#f3f4f6]" style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)' }}>
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
            
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {ABOUT_FEATURES.map((feature) => {
              const Icon = ICON_MAP[feature.iconKey];
              const Style = VARIANT_STYLES[feature.variant];
              
              return (
                <div 
                  key={feature.id} 
                  className={`rounded-sm border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${Style.card}`}
                >
                  <div className={`mb-4 ${Style.icon}`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  
                  <div className={`mb-0.5 text-lg font-bold ${Style.title}`}>
                    {t(`about.features.${feature.id}.label`)}
                  </div>
                  
                  <div className={`text-xs ${Style.note}`}>
                    {t(`about.features.${feature.id}.note`)}
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