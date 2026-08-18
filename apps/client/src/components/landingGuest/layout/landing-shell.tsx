'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter(); 
  const [activeSection, setActiveSection] = useState<LandingSectionId>('home');

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
        nextSection = 'contact';
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
      openAuthModal: () => router.push('/login'),
      closeAuthModal: () => router.back()
    }),
    [activeSection, initialSession]
  );

  return (
    <LandingContext.Provider value={contextValue}>
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <LandingNavbar />
        <div className="relative">{children}</div>
      </div>
    </LandingContext.Provider>
  );
}