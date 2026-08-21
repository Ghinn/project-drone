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
  title: 'DreamPalm',
  description: 'Disease Recognition and Enhanced Aerial Marking for Precision Application in Oil Palm'
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
      <body className={`${montserrat.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
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