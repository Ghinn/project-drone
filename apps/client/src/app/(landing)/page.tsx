'use client';
import { useEffect } from "react";
import { LandingShell } from "@/components/landingGuest/layout/landing-shell";
import { HeroSection } from "@/components/landingGuest/sections/hero-section";
import { AboutSection } from "@/components/landingGuest/sections/about-section";
import { ResearchSection } from "@/components/landingGuest/sections/research-section";
import { FeaturesSection } from "@/components/landingGuest/sections/features-section";
import { PhotoBreakSection } from "@/components/landingGuest/sections/photo-break-section";
import { PartnersSection } from "@/components/landingGuest/sections/partners-section";
import { ContactSection } from "@/components/landingGuest/sections/contact-section";
import { FooterSection } from "@/components/landingGuest/sections/footer-section";

export default function LandingPage() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    window.scrollTo(0, 0);
    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      clearTimeout(scrollTimeout);
    };
  }, []);
  
  return (
    <LandingShell initialSession={null}>
      <main className="flex flex-col min-h-screen w-full">
        <HeroSection />
        <AboutSection />
        <ResearchSection />
        <FeaturesSection />
        <PhotoBreakSection />
        <PartnersSection />
        <ContactSection />
        <FooterSection />
      </main>
    </LandingShell>
  );
}