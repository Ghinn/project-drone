'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Mail } from 'lucide-react';
import { homeForRole } from '@/lib/auth/roles';
import { useLandingContext } from '@/components/landingGuest/layout/landing-context';
import { useAuth } from '@/providers/auth-provider';

export function FooterSection() {
  const t = useTranslations('Landing.footer');
  const router = useRouter();
  const { openAuthModal, initialSession } = useLandingContext();
  const { status, role } = useAuth();

  const fallbackRole = initialSession?.role ?? null;
  const currentRole = role ?? fallbackRole;
  const isAuthenticated =
    status === 'authenticated' ||
    (status === 'loading' && initialSession !== null);

  function handleActionClick() {
    if (isAuthenticated) {
      router.push(homeForRole(currentRole));
      return;
    }
    openAuthModal();
  }

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-10 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/images/logo.svg"
                alt="DreamPalm Logo"
                width={36}
                height={36}
                className="h-10 w-auto object-contain"
              />
              <Image
                src="/assets/images/logo-text.svg"
                alt="DreamPalm Logo Text"
                width={160}
                height={40}
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-white">
              {t('exploration.title')}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#about" className="transition-colors hover:text-white">
                  {t('exploration.links.about')}
                </a>
              </li>
              <li>
                <a href="#platform" className="transition-colors hover:text-white">
                  {t('exploration.links.platform')}
                </a>
              </li>
              <li>
                <a href="#capability" className="transition-colors hover:text-white">
                  {t('exploration.links.capabilities')}
                </a>
              </li>
              <li>
                <a href="#security" className="transition-colors hover:text-white">
                  {t('exploration.links.security')}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="cursor-pointer text-left transition-colors hover:text-white"
                >
                  {t('exploration.links.login')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-white">
              {t('contact.title')}
            </h3>
            <div className="space-y-3.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#C1D343]" />
                <p className="leading-relaxed">{t('contact.address')}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 shrink-0 text-[#C1D343]" />
                <a
                  href={`mailto:${t('contact.email')}`}
                  className="transition-colors hover:text-white"
                >
                  {t('contact.email')}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-white">
              {t('partnership.title')}
            </h3>
            <div className="mb-5 space-y-2 text-sm text-slate-400">
              <p>{t('partnership.trials')}</p>
              <p>{t('partnership.collaboration')}</p>
            </div>
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#C8553D] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              <span>{t('partnership.action')}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-8">
          <p className="text-xs text-slate-500">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}