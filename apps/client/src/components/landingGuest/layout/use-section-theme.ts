'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Returns resolved theme tokens for landing page sections.
 * Avoids hydration mismatch by returning a "mounted" flag.
 */
export function useSectionTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  return {
    mounted,
    isDark,
    // Section backgrounds
    bgLight: isDark ? '#0F172A' : '#ffffff',
    bgLightAlt: isDark ? '#1e293b' : '#f8fafc',
    bgDark: '#0F172A',           // always dark (hero, features, partners, footer)
    bgDarkAlt: isDark ? '#1e293b' : '#1e293b', // cards inside dark sections stay dark
    // Text colors
    textPrimary: isDark ? '#f1f5f9' : '#0F172A',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#64748b',
    // Card/border colors
    cardBg: isDark ? '#1e293b' : '#f8fafc',
    cardBorder: isDark ? '#334155' : '#e2e8f0',
    cardBgWhite: isDark ? '#0F172A' : '#ffffff',
  };
}
