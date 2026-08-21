'use client';

import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
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
  const router = useRouter();
  const {user, role, status} = useAuth();

  const hasAuthenticatedState =
    status === 'authenticated' ||
    (status === 'loading' && initialUser !== null);

  if (!hasAuthenticatedState) {
    return (
      <button
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded text-white transition-opacity hover:opacity-85 bg-[#84994F]"
        onClick={() => router.push('/login')}
        type="button"
      >
        {t('actions.loginGetStarted')}
      </button>
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