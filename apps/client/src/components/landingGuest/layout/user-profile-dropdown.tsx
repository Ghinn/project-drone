'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AppRole } from '@/lib/auth/roles';
import { useAuth } from '@/providers/auth-provider';

type UserProfileDropdownProps = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: AppRole | null;
};

function getInitials(source: string | null, fallback: string): string {
  if (!source) {
    return fallback;
  }

  const normalized = source.includes('@') ? source.split('@')[0]! : source;
  const parts = normalized.split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) {
    return fallback;
  }

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || fallback;
}

function formatDisplayName(displayName: string | null, email: string | null, fallback: string): string {
  if (displayName) return displayName.toUpperCase();
  if (email) {
    const namePart = email.split('@')[0];
    return namePart.replace(/[._-]/g, ' ').toUpperCase();
  }
  return fallback.toUpperCase();
}

function getRoleKey(role: AppRole | null): 'admin' | 'farmer' | 'operator' | 'unknown' {
  if (role === 'ADMIN') {
    return 'admin';
  }

  if (role === 'FARMER') {
    return 'farmer';
  }

  if (role === 'OPERATOR') {
    return 'operator';
  }

  return 'unknown';
}

function getWorkspace(role: AppRole | null): {
  href: string;
  labelKey: 'workspaceAdmin' | 'workspaceFarmer' | 'workspaceOperator' | 'workspaceHome';
} {
  if (role === 'ADMIN') {
    return {
      href: '/admin',
      labelKey: 'workspaceAdmin'
    };
  }

  if (role === 'FARMER') {
    return {
      href: '/monitoringFarmer',
      labelKey: 'workspaceFarmer'
    };
  }

  if (role === 'OPERATOR') {
    return {
      href: '/monitoringOperator',
      labelKey: 'workspaceOperator'
    };
  }

  return {
    href: '/',
    labelKey: 'workspaceHome'
  };
}

export function UserProfileDropdown({
  displayName,
  email,
  photoURL,
  role
}: UserProfileDropdownProps) {
  const t = useTranslations('Header');
  const router = useRouter();
  const { signOutApp } = useAuth();

  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const roleLabel = t(`roles.${getRoleKey(role)}`);
  const resolvedDisplayName = useMemo(
    () => formatDisplayName(displayName, email, t('menu.userFallback')),
    [displayName, email, t]
  );
  const resolvedEmail = email ?? t('menu.noEmail');
  const initials = useMemo(
    () => getInitials(displayName ?? email, t('avatarFallback')),
    [displayName, email, t]
  );

  const workspace = getWorkspace(role);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await signOutApp();
      setOpen(false);
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('menu.openUserMenu')}
        className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-2 shadow-sm transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {photoURL ? (
          <img
            alt={t('menu.avatarAlt', { name: resolvedDisplayName })}
            className="h-10 w-10 rounded-full object-cover"
            src={photoURL}
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#84994F] text-sm font-bold text-white">
            {initials}
          </span>
        )}

        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {resolvedDisplayName}
          </span>
          <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
            {roleLabel}
          </span>
        </span>

        <ChevronDown
          aria-hidden="true"
          className={[
            'h-4 w-4 text-neutral-500 transition',
            open ? 'rotate-180' : ''
          ].join(' ')}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-3 w-[20rem] rounded-3xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          role="menu"
        >
          <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
            {photoURL ? (
              <img
                alt={t('menu.avatarAlt', { name: resolvedDisplayName })}
                className="h-12 w-12 rounded-full object-cover"
                src={photoURL}
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#84994F] text-sm font-bold text-white">
                {initials}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {resolvedDisplayName}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {resolvedEmail}
              </p>
            </div>
          </div>

          <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {t('menu.roleLabel')}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                {roleLabel}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {t('menu.emailLabel')}
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-neutral-900 dark:text-white">
                {resolvedEmail}
              </p>
            </div>
          </div>

          <div className="grid gap-2 border-t border-neutral-200 px-3 pb-3 pt-3 dark:border-neutral-800">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#84994F] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-85"
              href={workspace.href}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
              {t(`menu.${workspace.labelKey}`)}
            </Link>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
              disabled={isSigningOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              {t('actions.logout')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}