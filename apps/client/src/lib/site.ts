export const siteConfig = {
  name: 'AgriSpectra',
  shortTagline: 'Smart Drone Management System',
  description: 'Sistem cerdas pemantauan dan manajemen armada drone',
  defaultLocale: 'id',
  locales: ['id', 'en'] as const
};

export type AppLocale = (typeof siteConfig.locales)[number];