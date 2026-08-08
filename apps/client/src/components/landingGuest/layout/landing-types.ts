import type {AppRole} from '@/lib/auth/roles';

export const LANDING_SECTION_IDS = [
  'home',
  'about',
  'research',
  'features',
  'partners',
  'contact'
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

export type LandingSessionSnapshot = {
  email: string | null;
  role: AppRole | null;
} | null;