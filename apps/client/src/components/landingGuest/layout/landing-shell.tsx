'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { LoginModal } from '@/components/auth/login-modal';
import { LandingContext } from '@/components/landingGuest/layout/landing-context';
import { LandingNavbar } from '@/components/landingGuest/layout/landing-navbar';
import {
  LANDING_SECTION_IDS,
  type LandingSectionId,
  type LandingSessionSnapshot
} from '@/components/landingGuest/layout/landing-types';

type LandingShellProps = {
  children: ReactNode;
  initialSession: LandingSessionSnapshot;
};

export function LandingShell({
  children,
  initialSession
}: LandingShellProps) {
  const [activeSection, setActiveSection] = useState<LandingSectionId>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const currentScroll = window.scrollY + 160;
      let nextSection: LandingSectionId = 'home';

      for (const sectionId of LANDING_SECTION_IDS) {
        const section = document.getElementById(sectionId);

        if (section && section.offsetTop <= currentScroll) {
          nextSection = sectionId;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10
      ) {
        nextSection = 'footer';
      }

      setActiveSection(nextSection);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      activeSection,
      initialSession,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false)
    }),
    [activeSection, initialSession]
  );

  return (
    <LandingContext.Provider value={contextValue}>
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <LandingNavbar />
        <div className="relative">{children}</div>
        <LoginModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
        />
      </div>
    </LandingContext.Provider>
  );
}