'use client';

import { createContext, useContext } from 'react';
import type {
  LandingSectionId,
  LandingSessionSnapshot
} from '@/components/landingGuest/layout/landing-types';

type LandingContextValue = {
  activeSection: LandingSectionId;
  initialSession: LandingSessionSnapshot;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

export const LandingContext = createContext<LandingContextValue | null>(null);

export function useLandingContext(): LandingContextValue {
  const context = useContext(LandingContext);

  if (!context) {
    throw new Error('useLandingContext must be used within LandingShell.');
  }

  return context;
}