'use client';

import {Mail, MapPin, Phone} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {siteConfig} from '@/lib/site';
import {cn, stripLocale} from '@/lib/utils';
import {ThemeToggle} from '@/components/theme-toggle';
import {LocaleToggle} from '@/components/locale-toggle';

// Komponen ini berisi Toggle Bahasa (EN/ID) dan Toggle Mode Gelap/Terang
export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <LocaleToggle />
      <ThemeToggle />
    </div>
  );
}

export function PublicShell({children}: {children: React.ReactNode}) {
  const t = useTranslations('common');
  const footer = useTranslations('footer');
  const pathname = stripLocale(usePathname());

  const navItems = [
    {href: '/', label: t('home')},
    {href: '/layanan', label: t('services')},
    {href: '/berita', label: t('news')},
    {href: '/tentang-kami', label: t('about')}
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-fresh-body dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container flex h-20 items-center justify-between gap-6">
          
          {/* BAGIAN KIRI: LOGO FRESHSCAN */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/assets/logo/logoHorizontalFreshscan.png" 
              alt="Logo FreshScan" 
              className="h-10 w-auto object-contain dark:brightness-200 dark:contrast-200" 
            />
          </Link>

          {/* BAGIAN TENGAH: NAVIGASI */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-label transition hover:text-fresh-accent',
                    active
                      ? 'text-fresh-accent'
                      : 'text-fresh-title dark:text-slate-200'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* BAGIAN KANAN: TOGGLE & LOGO INSTITUSI */}
          <div className="flex items-center gap-6">
            {/* Memanggil Toggle Bahasa dan Tema */}
            <HeaderActions />
            
            {/* Memanggil Gambar Logo Institusi */}
            <div className="hidden items-center gap-4 border-l border-slate-200 pl-6 dark:border-slate-700 lg:flex">
              <img src="/assets/logo/logoBRIN.png" alt="Logo BRIN" className="h-8 w-auto object-contain" />
              <img src="/assets/logo/logoIPB.png" alt="Logo IPB" className="h-8 w-auto object-contain" />
              <img src="/assets/logo/logoUNM.png" alt="Logo UNM" className="h-8 w-auto object-contain" />
            </div>
          </div>

        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container grid gap-10 py-14 md:grid-cols-3">
          <div>
            <p className="text-section text-white">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-sm text-slate-300">
              {footer('description')}
            </p>
          </div>

          <div>
            <p className="text-subtitle text-white">{footer('navigation')}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-subtitle text-white">{footer('contact')}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>Jl. Sangkuriang, Dago, Kecamatan Coblong, Kota Bandung</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>freshscan@brin.go.id</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>0813-1777-3184</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container border-t border-white/10 py-6 text-center text-sm text-slate-400">
          {footer('copyright')}
        </div>
      </footer>
    </div>
  );
}