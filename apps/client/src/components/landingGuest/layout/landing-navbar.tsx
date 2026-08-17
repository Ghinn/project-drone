'use client';

import {useTranslations} from 'next-intl';
import {UserProfileDropdown} from '@/components/landingGuest/layout/user-profile-dropdown';
import {useLandingContext} from '@/components/landingGuest/layout/landing-context';
import {type LandingSectionId} from '@/components/landingGuest/layout/landing-types';
import {ThemeToggle} from '@/components/theme-toggle';
import {LocaleToggle} from '@/components/locale-toggle';
import {useAuth} from '@/providers/auth-provider';
import { useState, useEffect } from 'react';

const NAV_ORDER: LandingSectionId[] = [
  'about',
  'research',
  'features',
  'partners',
  'contact'
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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(15,23,42,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* BRANDING / LOGO */}
        <a href="#home" className="flex items-center gap-2.5 group">
          {/* Logo mark: gradient circle with DP */}
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white shadow-lg transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #6B8E23 0%, #C8553D 60%, #7C3AED 100%)' }}
          >
            <span className="relative z-10">DP</span>
          </div>
          {/* Logotype */}
          <span className="text-base font-extrabold tracking-tight text-white">
            Dream
            <span
              className="transition-colors group-hover:text-[#C8553D]"
              style={{ color: '#6B8E23' }}
            >
              Palm
            </span>
          </span>
        </a>

        {/* NAV: Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="relative text-sm font-medium transition-all group"
                style={{
                  color: isActive ? '#6B8E23' : 'rgba(255,255,255,0.7)',
                }}
              >
                {item.label}
                {/* Active underline */}
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px transition-transform origin-left"
                  style={{
                    background: '#6B8E23',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
                {/* Hover underline */}
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px opacity-0 group-hover:opacity-100 group-hover:scale-x-100 scale-x-0 transition-all origin-left"
                  style={{ background: 'rgba(107,142,35,0.5)' }}
                />
              </a>
            );
          })}
        </nav>

        {/* CONTROLS: Right side */}
        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-2 pr-3"
            style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ThemeToggle />
            <LocaleToggle />
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
              className="hidden md:inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#6B8E23]/20"
              style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
            >
              Open Dashboard
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="flex flex-col gap-4 px-6 pb-6 pt-4 md:hidden"
          style={{
            background: 'rgba(15,23,42,0.98)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-semibold transition-colors hover:text-[#6B8E23]"
              style={{ color: activeSection === item.id ? '#6B8E23' : 'rgba(255,255,255,0.8)' }}
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
              className="w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6B8E23, #7C3AED)' }}
            >
              Open Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
}