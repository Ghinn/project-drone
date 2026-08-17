import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/app-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost'
});

export const metadata: Metadata = {
  title: 'DREAMPALM',
  description: 'Sistem Drone Terpadu dengan Spot Marking dan Spraying'
};

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${jost.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
            {modal}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}