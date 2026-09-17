'use client';

import {useTranslations} from 'next-intl';
import {UserProfileDropdown} from '@/components/landingGuest/layout/user-profile-dropdown';
import {useLandingContext} from '@/components/landingGuest/layout/landing-context';
import {type LandingSectionId} from '@/components/landingGuest/layout/landing-types';
import {ThemeToggle} from '@/components/theme-toggle';
import {LocaleToggle} from '@/components/locale-toggle';
import {useAuth} from '@/providers/auth-provider';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const NAV_ORDER: LandingSectionId[] = [
  'about',
  'platform',
  'capability',
  'security',
  // 'research',
  // 'features',
  // 'partners',
  // 'contact'
];

export function LandingNavbar() {
  const t = useTranslations('Landing');
  const { activeSection, initialSession, openAuthModal } = useLandingContext();
  const {status, user, role} = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = NAV_ORDER.map((id) => ({
    id,
    label: t(`nav.${id}`)
  }));

  const hasAccount =
    status === 'authenticated' ||
    (status === 'loading' && initialSession !== null);

  const effectiveEmail =
    status === 'authenticated'
      ? user?.email ?? initialSession?.email ?? null
      : initialSession?.email ?? null;

  const effectiveDisplayName =
    status === 'authenticated' ? user?.displayName ?? null : null;

  const effectivePhotoURL =
    status === 'authenticated' ? user?.photoURL ?? null : null;

  const effectiveRole =
    status === 'authenticated'
      ? role ?? initialSession?.role ?? null
      : initialSession?.role ?? null;

  // const headerBgClass = scrolled 
  //   ? 'bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md' 
  //   : 'bg-transparent';
  const headerBgClass = 'bg-white dark:bg-[#121212]/95 backdrop-blur-md';
  
  // const headerBorderClass = scrolled 
  //   ? 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]' 
  //   : 'border-b border-transparent';
  const headerBorderClass = 'border-b border-[#e5e7eb] dark:border-[#2a2a2a]';

  // const textColorClass = scrolled
  //   ? 'text-[#1a1a1a] dark:text-[#e5e7eb]'
  //   : 'text-white';
  const textColorClass = 'text-[#1a1a1a] dark:text-[#e5e7eb]';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBgClass} ${headerBorderClass}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* BRANDING / LOGO KIRI */}
        <a href="#home" className="flex items-center gap-2.5">
          <Image
            src="/assets/images/logo.svg"
            alt="Logo Perusahaan"
            width={36}
            height={36}
            priority
            className="h-10 w-auto object-contain"
          />
          <Image
            src="/assets/images/logo-text.svg"
            alt="Logo Perusahaan Text"
            width={200}
            height={200}
            priority
            className="w-28 h-28 object-contain"
          />
        </a>

        {/* NAVIGASI UTAMA (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`text-sm font-medium transition-opacity hover:opacity-60 ${textColorClass} ${isActive ? 'opacity-100' : 'opacity-80'}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* KONTROL KANAN (DESKTOP & MOBILE) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
          </div>

          {hasAccount ? (
            <div className="hidden md:block">
              <UserProfileDropdown
                displayName={effectiveDisplayName}
                email={effectiveEmail}
                photoURL={effectivePhotoURL}
                role={effectiveRole}
              />
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="hidden md:inline-flex items-center gap-2 rounded bg-[#84994F] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              Open Dashboard
            </button>
          )}

          {/* Tombol Hamburger Mobile */}
          <button 
            className={`md:hidden p-2 ${textColorClass}`} 
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
            </svg>
          </button>
        </div>
      </div>

      {/* MENU DROP-DOWN MOBILE */}
      {mobileMenuOpen && (
        <div className="flex flex-col gap-4 border-t border-[#e5e7eb] bg-white px-6 pb-5 pt-4 dark:border-[#2a2a2a] dark:bg-[#121212] md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-medium text-[#1a1a1a] dark:text-[#e5e7eb]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          
          <div className="flex items-center gap-4 py-2">
            <ThemeToggle />
            <LocaleToggle />
          </div>

          {!hasAccount && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full rounded bg-[#84994F] py-2.5 text-sm font-semibold text-white"
            >
              Open Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
}