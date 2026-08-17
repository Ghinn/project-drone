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
      className="py-28 transition-colors duration-300 relative overflow-hidden"
      style={{ background: '#f8fafc' }}
    >
      {/* Decorative blob */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6B8E23 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-6xl px-6 relative">

        {/* Top section: CTA banner */}
        <div
          className="rounded-2xl overflow-hidden mb-16 relative"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1a0f2e 100%)',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          {/* Gradient top line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #6B8E23, #7C3AED, #C8553D)' }}
          />
          <div className="px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#7C3AED' }}>
                Dashboard Access
              </p>
              <h3 className="text-2xl font-extrabold text-white">
                Siap memulai monitoring perkebunan?
              </h3>
              <p className="text-sm mt-2" style={{ color: '#64748b' }}>
                Masuk ke dashboard untuk memantau drone, hasil deteksi, dan laporan lapangan secara real-time.
              </p>
            </div>
            <button
              onClick={openAuthModal}
              className="shrink-0 inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
            >
              {t('accessDashboard')}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom section: Contact info + Form */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

          {/* LEFT: Contact Info */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8" style={{ background: '#C8553D' }} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#C8553D' }}>
                {t('eyebrow')}
              </p>
            </div>

            <h2
              className="mb-6 font-extrabold leading-[1.1] text-[#0F172A]"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}
            >
              {t.rich('title', { br: () => <br /> })}
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-[#475569]">
              {t('description')}
            </p>

            <div className="space-y-4">
              <div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(107,142,35,0.05)', border: '1px solid rgba(107,142,35,0.15)' }}
              >
                <div
                  className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(107,142,35,0.12)' }}
                >
                  <svg width="14" height="14" fill="none" stroke="#6B8E23" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">{t('emailLabel')}</p>
                  <a
                    href="mailto:dreampalm@research.ac.id"
                    className="text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: '#6B8E23' }}
                  >
                    dreampalm@research.ac.id
                  </a>
                </div>
              </div>

              <div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <div
                  className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(124,58,237,0.12)' }}
                >
                  <svg width="14" height="14" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] mb-0.5">{t('locationLabel')}</p>
                  <p className="text-sm text-[#475569]">{t('locationValue')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
            }}
          >
            <h3 className="text-base font-bold text-[#0F172A] mb-6">Kirim Pesan</h3>
            <div className="space-y-4">
              {FORM_FIELDS.map(f => (
                <div key={f.id}>
                  <label
                    htmlFor={f.id}
                    className="mb-1.5 block text-xs font-bold text-[#0F172A]"
                  >
                    {t(`form.${f.id}.label`)}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    placeholder={t(`form.${f.id}.placeholder`)}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] outline-none transition-all"
                    style={{
                      border: '1.5px solid #e2e8f0',
                      background: '#f8fafc',
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1.5px solid #6B8E23';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1.5px solid #e2e8f0';
                      e.target.style.background = '#f8fafc';
                    }}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="msg" className="mb-1.5 block text-xs font-bold text-[#0F172A]">
                  {t('form.message.label')}
                </label>
                <textarea
                  id="msg"
                  rows={4}
                  placeholder={t('form.message.placeholder')}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm text-[#0F172A] outline-none transition-all"
                  style={{
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1.5px solid #6B8E23';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1.5px solid #e2e8f0';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>

              <button
                type="button"
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
              >
                {t('form.submit')}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Dark mode */}
      <style>{`
        .dark #contact { background: #0f172a !important; }
        .dark #contact h2 { color: #f1f5f9 !important; }
        .dark #contact p { color: #94a3b8 !important; }
        .dark #contact h3 { color: #f1f5f9 !important; }
        .dark #contact label { color: #e2e8f0 !important; }
        .dark #contact .rounded-2xl { background: #1e293b !important; border-color: #334155 !important; }
      `}</style>
    </section>
  );
}