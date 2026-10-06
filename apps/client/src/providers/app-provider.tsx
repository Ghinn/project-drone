'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from './auth-provider';
import { type AppRole } from '@/lib/auth/roles';

type AppProvidersProps = {
  children: React.ReactNode;
  initialRole?: AppRole | null;
  initialUserData?: { email?: string; name?: string; picture?: string } | null;
};

export function AppProviders({ children, initialRole = null, initialUserData = null }: AppProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider initialRole={initialRole} initialUserData={initialUserData}>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  );
}