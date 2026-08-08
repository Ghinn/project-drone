'use client';

import { useTranslations } from 'next-intl';

const MAIN_FEATURES = [
  { id: 'classification', num: '01' },
  { id: 'monitoring', num: '02' },
  { id: 'mapping', num: '03' },
] as const;

export function FeaturesSection() {
  const t = useTranslations('Landing.features');

  return (
    <section 
      id="features" 
      className="py-28 bg-white transition-colors duration-300 dark:bg-[#121212]"
    >
      <div className="mx-auto max-w-6xl px-6">
        
        {/* HEADER SECTION */}
        <div className="mb-14 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
            {t('eyebrow')} {/* Fallback: System Capabilities */}
          </p>
          <h2 
            className="font-bold leading-tight text-[#111827] dark:text-[#f3f4f6]" 
            style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}
          >
            {t.rich('title', {
              br: () => <br />
            })} {/* Fallback: End-to-end detection <br /> in a single flight */}
          </h2>
        </div>

        {/* BENTO GRID 3 KOLOM */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {MAIN_FEATURES.map(f => (
            <div 
              key={f.id} 
              className="rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-8 transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
            >
              <span className="mb-6 block text-xs font-bold tracking-widest text-[#C1D343]">
                {f.num}
              </span>
              <h3 className="mb-3 text-base font-semibold text-[#111827] dark:text-[#f3f4f6]">
                {t(`items.${f.id}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">
                {t(`items.${f.id}.body`)}
              </p>
            </div>
          ))}
        </div>

        {/* KARTU FITUR SPESIAL (LEBAR PENUH) */}
        <div className="mt-6 flex flex-col items-start gap-8 rounded-sm border border-[#e5e7eb] bg-[#f9fafb] p-8 transition-colors duration-300 md:flex-row dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <div className="md:w-1/3">
            {/* Warna angka '04' menggunakan C.amber dari referensi awal */}
            <span className="mb-4 block text-xs font-bold tracking-widest text-[#FCB53B]">
              04
            </span>
            <h3 className="mb-3 text-base font-semibold text-[#111827] dark:text-[#f3f4f6]">
              {t('specialFeature.title')} {/* Fallback: RC-Triggered Precision Spraying */}
            </h3>
          </div>
          <div className="md:w-2/3">
            <p className="text-sm leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">
              {t('specialFeature.body')}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}