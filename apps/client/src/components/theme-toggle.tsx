'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300"
    >
      {/* Menampilkan Ikon Matahari saat tema aktif adalah dark */}
      {theme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        // Menampilkan Ikon Bulan saat tema aktif adalah light
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}