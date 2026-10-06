import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/app-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';
import { normalizeRole, type AppRole } from '@/lib/auth/roles';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: 'DreamPalm',
  description: 'Disease Recognition and Enhanced Aerial Marking for Precision Application in Oil Palm'
};

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__session';

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const messages = await getMessages();
  
  let initialRole: AppRole | null = null;
  let initialUserData: { email?: string; name?: string; picture?: string } | null = null;
  
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      
      const rawRole = decodedClaims.role ?? (decodedClaims.admin === true ? 'ADMIN' : null);
      initialRole = normalizeRole(rawRole);
      
      initialUserData = {
        email: decodedClaims.email,
        name: decodedClaims.name,
        picture: decodedClaims.picture,
      };
    }
  } catch (error) {
  }

  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders initialRole={initialRole} initialUserData={initialUserData}>
            {children}
            {modal}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}