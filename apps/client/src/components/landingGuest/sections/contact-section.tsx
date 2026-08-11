'use client';

import { useTranslations } from 'next-intl';
import { useLandingContext } from '@/components/landingGuest/layout/landing-context';

const FORM_FIELDS = [
  { id: 'name', type: 'text' },
  { id: 'email', type: 'email' },
  { id: 'org', type: 'text' },
] as const;

export function ContactSection() {
  const t = useTranslations('Landing.contact');
  const { openAuthModal } = useLandingContext();

  return (
    <section 
      id="contact" 
      className="border-t border-[#e5e7eb] bg-white py-28 transition-colors duration-300 dark:border-[#1e1e1e] dark:bg-[#121212]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          
          {/* BAGIAN KIRI: INFORMASI KONTAK */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#84994F]">
              {t('eyebrow')} {/* Fallback: Get in Touch */}
            </p>
            <h2 
              className="mb-6 font-bold leading-tight text-[#111827] dark:text-[#f3f4f6]" 
              style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}
            >
              {t.rich('title', { br: () => <br /> })} {/* Fallback: Collaborate with<br />the Drone team */}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">
              {t('description')}
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="mb-0.5 text-xs font-semibold text-[#111827] dark:text-[#f3f4f6]">
                  {t('emailLabel')}
                </p>
                <a 
                  href="mailto:Drone@research.ac.id" 
                  className="text-sm text-[#84994F] hover:underline"
                >
                  Drone@research.ac.id
                </a>
              </div>
              <div>
                <p className="mb-0.5 text-xs font-semibold text-[#111827] dark:text-[#f3f4f6]">
                  {t('locationLabel')}
                </p>
                <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  {t('locationValue')} {/* Fallback: Department of Electrical Engineering, Indonesia */}
                </p>
              </div>
            </div>
            
            {/* Tombol Akses Dashboard memanfaatkan fungsi context openAuthModal */}
            <button 
              onClick={openAuthModal}
              className="mt-8 inline-flex items-center gap-2.5 rounded-sm bg-[#84994F] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              {t('accessDashboard')} {/* Fallback: Access Dashboard → */}
            </button>
          </div>

          {/* BAGIAN KANAN: FORMULIR KONTAK */}
          <div>
            <div className="space-y-4">
              {/* Loop Input Dasar */}
              {FORM_FIELDS.map(f => (
                <div key={f.id}>
                  <label 
                    htmlFor={f.id} 
                    className="mb-1.5 block text-xs font-semibold text-[#111827] dark:text-[#f3f4f6]"
                  >
                    {t(`form.${f.id}.label`)}
                  </label>
                  <input 
                    id={f.id} 
                    type={f.type} 
                    placeholder={t(`form.${f.id}.placeholder`)} 
                    className="w-full rounded-sm border border-[#d1d5db] bg-[#f9fafb] px-4 py-2.5 text-sm text-[#111827] outline-none transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#f3f4f6]" 
                  />
                </div>
              ))}
              
              {/* Input Area Pesan */}
              <div>
                <label 
                  htmlFor="msg" 
                  className="mb-1.5 block text-xs font-semibold text-[#111827] dark:text-[#f3f4f6]"
                >
                  {t('form.message.label')}
                </label>
                <textarea 
                  id="msg" 
                  rows={4} 
                  placeholder={t('form.message.placeholder')} 
                  className="w-full resize-none rounded-sm border border-[#d1d5db] bg-[#f9fafb] px-4 py-2.5 text-sm text-[#111827] outline-none transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#f3f4f6]" 
                />
              </div>
              
              <button 
                type="button"
                className="w-full rounded-sm bg-[#84994F] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                {t('form.submit')} {/* Fallback: Send Message */}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}