'use client';

import { useTranslations } from 'next-intl';

const DRONE_SPECS = [
  { id: 'sensor', keyLabel: 'specSensor', keyValue: 'valSensor' },
  { id: 'ai', keyLabel: 'specAi', keyValue: 'valAi' },
  { id: 'positioning', keyLabel: 'specPositioning', keyValue: 'valPositioning' },
  { id: 'endurance', keyLabel: 'specEndurance', keyValue: 'valEndurance' },
  { id: 'spray', keyLabel: 'specSpray', keyValue: 'valSpray' },
  { id: 'comm', keyLabel: 'specComm', keyValue: 'valComm' },
] as const;

export function ResearchSection() {
  const t = useTranslations('Landing.research');

  return (
    <section 
      id="research" 
      className="py-28 bg-[#f9fafb] transition-colors duration-300 dark:bg-[#0f0f0f]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          {/* BAGIAN KIRI: FOTO DRONE & LABEL */}
          <div className="relative overflow-hidden rounded-sm aspect-[4/3]">
            <img 
              alt={t('imageAlt')} // Fallback: "Research drone"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
            />
            <div 
              className="absolute bottom-0 left-0 right-0 p-5" 
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}
            >
              <p className="text-xs font-medium text-white">
                {t('imageCaption')} {/* Fallback: "Drone UAV Platform · Multispectral & RC Spray Module" */}
              </p>
            </div>
          </div>

          {/* BAGIAN KANAN: DESKRIPSI DAN SPESIFIKASI */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
              {t('eyebrow')} {/* Fallback: "Platform Overview" */}
            </p>
            
            <h2 
              className="mb-6 font-bold leading-tight text-[#111827] dark:text-[#f3f4f6]" 
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
            <div className="space-y-3">
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