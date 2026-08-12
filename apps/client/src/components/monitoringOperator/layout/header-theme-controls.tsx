"use client";
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function HeaderThemeControls() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-sm transition-opacity hover:opacity-60 bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <path strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}