'use client';

import {useEffect, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {redirectForUnauthorized, type AppRole} from '@/lib/auth/roles';
import {useAuth} from '@/providers/auth-provider';

type RoleGateProps = {
  allow: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  redirectOnDeny?: boolean;
};

export function RoleGate({
  allow,
  children,
  fallback,
  loading = null,
  redirectOnDeny = false
}: RoleGateProps) {
  const router = useRouter();
  const t = useTranslations('RoleGate');
  const {role, status} = useAuth();

  const allowed =
    status === 'authenticated' && role !== null && allow.includes(role);

  useEffect(() => {
    if (!redirectOnDeny || status === 'loading' || allowed) {
      return;
    }

    router.replace(redirectForUnauthorized(role));
  }, [allowed, redirectOnDeny, role, router, status]);

  if (status === 'loading') {
    return <>{loading}</>;
  }

  if (!allowed) {
    return (
      <>
        {fallback ?? (
          <p className="text-sm text-red-600">{t('unauthorized')}</p>
        )}
      </>
    );
  }

  return <>{children}</>;
}