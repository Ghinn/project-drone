'use client';

import { useTranslations } from 'next-intl';

const PARTNERS = [
  { id: 'itb', abbr: 'ITB' },
  { id: 'ipb', abbr: 'IPB' },
  { id: 'poltek', abbr: 'POLTEK' },
  { id: 'brin', abbr: 'BRIN' },
] as const;

export function PartnersSection() {
  const t = useTranslations('Landing.partners');

  return (
    <section 
      id="partners" 
      className="bg-[#f9fafb] py-28 transition-colors duration-300 dark:bg-[#0f0f0f]"
    >
      <div className="mx-auto max-w-6xl px-6">
        
        {/* HEADER SECTION */}
        <div className="mb-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
            {t('eyebrow')} {/* Fallback: Institutional Partners */}
          </p>
          <h2 
            className="font-bold leading-tight text-[#111827] dark:text-[#f3f4f6]" 
            style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}
          >
            {t('title')} {/* Fallback: Research collaboration */}
          </h2>
        </div>

        {/* BENTO GRID MITRA */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PARTNERS.map(p => (
            <div 
              key={p.id} 
              className="rounded-sm border border-[#e5e7eb] bg-white p-6 transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
            >
              {/* Ornamen Singkatan Institusi */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[#84994F]/10 text-sm font-bold text-[#84994F]">
                {p.abbr}
              </div>
              <p className="mb-1 text-sm font-semibold text-[#111827] dark:text-[#f3f4f6]">
                {t(`list.${p.id}.name`)}
              </p>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                {t(`list.${p.id}.dept`)}
              </p>
            </div>
          ))}
        </div>
        
        {/* FOOTNOTE */}
        <p className="mt-6 text-xs text-[#6b7280] dark:text-[#9ca3af]">
          {t('footnote')} {/* Fallback: * Partner names shown are placeholders for research documentation. */}
        </p>

      </div>
    </section>
  );
}