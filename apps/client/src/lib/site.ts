export const siteConfig = {
  name: 'DREAMPALM',
  shortTagline: 'Smart Drone Management System',
  description: 'Sistem cerdas pemantauan dan manajemen armada drone',
  defaultLocale: 'id',
  locales: ['id', 'en'] as const
};

export type AppLocale = (typeof siteConfig.locales)[number];