'use client';

import { useTranslations } from 'next-intl';

const BACKGROUND_IMG = '/assets/images/hero-bg.svg';

export function PhotoBreakSection() {
  const t = useTranslations('Landing.photoBreak');

  return (
    <section className="relative h-72 overflow-hidden bg-[#0d1a06] md:h-96 bg-fixed bg-center bg-cover" 
      style={{ backgroundImage: 'url("/assets/images/hero-bg.svg")' }}
    >
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <p className="mx-auto max-w-180 px-6 text-center text-xl font-bold text-[#DCFA92] md:text-3xl">
          "{t.rich('quote', {
            br: () => <br />
          })}"
        </p>
      </div>

      <div className="absolute inset-0 w-full h-full bg-[#0D1A06]/60">
      </div>
    </section>
  );
}