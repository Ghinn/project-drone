'use client';

import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {homeForRole} from '@/lib/auth/roles';
import {useLandingContext} from '@/components/landingGuest/layout/landing-context';
import {useAuth} from '@/providers/auth-provider';

export function LandingPrimaryCta() {
  const router = useRouter();
  
  const tLanding = useTranslations('Landing');
  const tNav = useTranslations('Header.nav');

  const {openAuthModal, initialSession} = useLandingContext();
  const {status, role} = useAuth();

  const fallbackRole = initialSession?.role ?? null;
  const currentRole = role ?? fallbackRole;

  const isAuthenticated =
    status === 'authenticated' ||
    (status === 'loading' && initialSession !== null);

  function handleClick() {
    if (isAuthenticated) {
      router.push(homeForRole(currentRole));
      return;
    }
    openAuthModal();
  }

  let buttonText = tLanding('hero.primaryAction');
  if (isAuthenticated) {
    if (currentRole === 'FARMER') {
      buttonText = tNav('monitoringFarmer');
    } else if (currentRole === 'OPERATOR') {
      buttonText = tNav('monitoringOperator');
    } else if (currentRole === 'ADMIN') {
      buttonText = tNav('admin');
    }
  }

  return (
    <button
      className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#6B8E23]/25 hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(135deg, #6B8E23 0%, #7C3AED 100%)' }}
      onClick={handleClick}
      type="button"
    >
      {buttonText}
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  );
}