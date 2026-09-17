'use client';

import { useTranslations } from 'next-intl';

const DRONE_SPECS = [
  { id: 'driver', keyLabel: 'specDriver', keyValue: 'valDriver' },
  { id: 'sensor', keyLabel: 'specSensor', keyValue: 'valSensor' },
  { id: 'ai', keyLabel: 'specAi', keyValue: 'valAi' },
  { id: 'navigation', keyLabel: 'specNavigation', keyValue: 'valNavigation' },
  { id: 'spray', keyLabel: 'specSpray', keyValue: 'valSpray' },
] as const;

export function ResearchSection() {
  const t = useTranslations('Landing.research');

  return (
    <section 
      id="platform" 
      className="py-28 bg-[#f9fafb] transition-colors duration-300 dark:bg-[#0f0f0f]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="">
          
          {/* DESKRIPSI DAN SPESIFIKASI */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
              {t('eyebrow')} {/* Fallback: "Platform Overview" */}
            </p>
            
            <h2 
              className="mb-6 font-bold leading-tight text-[#C8553D] dark:text-[#f3f4f6]" 
              style={{ fontSize: 'clamp(1.6rem,2.5vw,2.4rem)' }}
            >
              {/* Menggunakan t.rich agar <br /> bisa dirender dengan aman */}
              {t.rich('title', {
                br: () => <br />
              })}
            </h2>
            
            <p className="mb-8 text-sm leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
              {t('description')}
            </p>
            
            {/* DAFTAR SPESIFIKASI */}
            <div className="space-y-3 max-w-3xl">
              {DRONE_SPECS.map((row) => (
                <div 
                  key={row.id} 
                  className="flex gap-4 border-b border-[#e5e7eb] py-3 dark:border-[#2a2a2a]"
                >
                  <span className="w-28 shrink-0 pt-0.5 text-xs font-semibold text-[#84994F]">
                    {t(`specs.${row.keyLabel}`)}
                  </span>
                  <span className="text-xs leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
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