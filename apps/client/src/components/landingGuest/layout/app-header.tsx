import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HeaderAuthControls, type HeaderAuthSnapshot } from '@/components/landingGuest/layout/header-auth-controls';
import { LocaleToggle } from '@/components/locale-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { getServerSession } from '@/lib/auth/server';

export async function AppHeader() {
  const t = await getTranslations('Header');
  const session = await getServerSession();

  const initialUser: HeaderAuthSnapshot = session
    ? {
        email: session.email,
        role: session.role
      }
    : null;

  const navItems: Array<{href: string; label: string}> = [
    {
      href: '/',
      label: t('nav.home')
    }
  ];

  if (session?.role === 'FARMER') {
    navItems.push({
      href: '/monitoringFarmer',
      label: t('nav.monitoringFarmer')
    });
  }

  if (session?.role === 'OPERATOR') {
    navItems.push({
      href: '/monitoringOperator',
      label: t('nav.monitoringOperator')
    });
  }

  if (session?.role === 'ADMIN') {
    navItems.push({
      href: '/admin',
      label: t('nav.admin')
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-950/85">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3"
          href="/"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-black text-white dark:bg-white dark:text-neutral-900">
            {t('brandMark')}
          </span>

          <span className="min-w-0">
            <span className="block text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
              {t('brand')}
            </span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              {t('tagline')}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <LocaleToggle />
          <ThemeToggle />
          <HeaderAuthControls initialUser={initialUser} />
        </div>
      </div>

      {navItems.length > 1 ? (
        <div className="border-t border-neutral-200/80 md:hidden dark:border-neutral-800/80">
          <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="whitespace-nowrap rounded-full bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}