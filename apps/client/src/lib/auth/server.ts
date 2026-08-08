import 'server-only';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminAuth} from '@/lib/firebase/admin';
import {
  normalizeRole,
  redirectForUnauthorized,
  type AppRole
} from '@/lib/auth/roles';

const SESSION_COOKIE_NAMES = Array.from(
  new Set([process.env.AUTH_SESSION_COOKIE_NAME ?? 'session', '__session'])
);

export type AppSession = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: AppRole | null;
  claims: Record<string, unknown>;
};

export async function getServerSession(
  checkRevoked = false
): Promise<AppSession | null> {
  const cookieStore = await cookies();

  const sessionCookie = SESSION_COOKIE_NAMES
    .map((name) => cookieStore.get(name)?.value)
    .find((value): value is string => Boolean(value));

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(
      sessionCookie,
      checkRevoked
    );

    const claims = decoded as unknown as Record<string, unknown>;
    const role = normalizeRole(
      claims.role ?? (claims.admin === true ? 'ADMIN' : null)
    );

    return {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : null,
      emailVerified: claims.email_verified === true,
      role,
      claims
    };
  } catch {
    return null;
  }
}

export async function requireRole(requiredRole: AppRole): Promise<AppSession> {
  const session = await getServerSession(requiredRole === 'ADMIN');

  if (!session) {
    redirect('/');
  }

  if (session.role !== requiredRole) {
    redirect(redirectForUnauthorized(session.role));
  }

  return session;
}