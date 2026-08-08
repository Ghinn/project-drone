import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/app-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: 'AgriSpectra',
  description: 'Sistem Drone Terpadu dengan Spot Marking dan Spraying'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}