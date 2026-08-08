'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {LoginModal} from '@/components/auth/login-modal';
import {UserProfileDropdown} from '@/components/landingGuest/layout/user-profile-dropdown';
import type {AppRole} from '@/lib/auth/roles';
import {useAuth} from '@/providers/auth-provider';

export type HeaderAuthSnapshot = {
  email: string | null;
  role: AppRole | null;
} | null;

type HeaderAuthControlsProps = {
  initialUser: HeaderAuthSnapshot;
};

export function HeaderAuthControls({
  initialUser
}: HeaderAuthControlsProps) {
  const t = useTranslations('Header');
  const {user, role, status} = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const hasAuthenticatedState =
    status === 'authenticated' ||
    (status === 'loading' && initialUser !== null);

  if (!hasAuthenticatedState) {
    return (
      <>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded text-white transition-opacity hover:opacity-85 bg-[#84994F]"
          onClick={() => setIsAuthModalOpen(true)}
          type="button"
        >
          {t('actions.loginGetStarted')}
        </button>

        <LoginModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
        />
      </>
    );
  }

  const effectiveEmail =
    status === 'authenticated'
      ? user?.email ?? initialUser?.email ?? null
      : initialUser?.email ?? null;

  const effectiveDisplayName =
    status === 'authenticated' ? user?.displayName ?? null : null;

  const effectivePhotoURL =
    status === 'authenticated' ? user?.photoURL ?? null : null;

  const effectiveRole =
    status === 'authenticated'
      ? role ?? initialUser?.role ?? null
      : initialUser?.role ?? null;

  return (
    <UserProfileDropdown
      displayName={effectiveDisplayName}
      email={effectiveEmail}
      photoURL={effectivePhotoURL}
      role={effectiveRole}
    />
  );
}