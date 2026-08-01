"use client";
import { useState, useEffect } from 'react';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';

export default function Home() {
  // Menghilangkan Typescript "Page"
  const [page, setPage] = useState('landing');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDark = () => setDarkMode(d => !d);

  if (page === 'dashboard') {
    return (
      <Dashboard
        onBack={() => setPage('landing')}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
    );
  }

  return (
    <LandingPage
      onGoToDashboard={() => setPage('dashboard')}
      darkMode={darkMode}
      toggleDark={toggleDark}
    />
  );
}