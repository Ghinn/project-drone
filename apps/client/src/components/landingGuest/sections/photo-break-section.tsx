'use client';

import { useTranslations } from 'next-intl';

const BACKGROUND_IMG = 'https://images.unsplash.com/photo-1521480259767-07c6e39fe142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

export function PhotoBreakSection() {
  const t = useTranslations('Landing.photoBreak');

  return (
    <section className="relative h-72 overflow-hidden bg-[#0d1a06] md:h-96">
      
      <img 
        alt={t('imageAlt')} // Fallback string: "Plantation canopy"
        className="h-full w-full object-cover opacity-45" 
        src={BACKGROUND_IMG} 
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="mx-auto max-w-[640px] px-6 text-center text-xl font-bold text-white md:text-3xl">
          {t.rich('quote', {
            br: () => <br />
          })}
        </p>
      </div>
      
    </section>
  );
}