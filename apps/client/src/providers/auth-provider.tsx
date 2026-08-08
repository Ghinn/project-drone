'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import {useRouter} from 'next/navigation';
import {auth as firebaseAuth} from '@/lib/firebase/client';
import {normalizeRole, type AppRole} from '@/lib/auth/roles';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

type AuthContextValue = {
  user: User | null;
  role: AppRole | null;
  status: AuthStatus;
  emailVerified: boolean;
  isSessionSynced: boolean;
  syncSession: (explicitUser?: User | null) => Promise<AppRole | null>;
  refreshClaims: () => Promise<AppRole | null>;
  signOutApp: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function readRoleFromUser(
  user: User,
  forceRefresh = false
): Promise<AppRole | null> {
  const tokenResult = await user.getIdTokenResult(forceRefresh);

  return normalizeRole(
    tokenResult.claims.role ?? (tokenResult.claims.admin === true ? 'ADMIN' : null)
  );
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({children}: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSessionSynced, setIsSessionSynced] = useState(false);

  const previousUidRef = useRef<string | null>(null);
  const syncRef = useRef<{
    uid: string;
    promise: Promise<AppRole | null>;
  } | null>(null);

  const clearServerSessionCookie = useCallback(async () => {
    await fetch('/api/auth/session-logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store'
    }).catch(() => undefined);
  }, []);

  const syncSession = useCallback(
    async (explicitUser?: User | null): Promise<AppRole | null> => {
      const targetUser = explicitUser ?? firebaseAuth.currentUser;

      if (!targetUser) {
        setRole(null);
        setIsSessionSynced(false);
        return null;
      }

      if (syncRef.current?.uid === targetUser.uid) {
        return syncRef.current.promise;
      }

      const promise = (async () => {
        const idToken = await targetUser.getIdToken(true);

        const response = await fetch(`${API_BASE_URL}/api/auth/session-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({idToken})
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.warn('[AuthProvider] Backend menolak sesi (401). Sesi terlalu lama. Melakukan force logout...');
            await firebaseSignOut(firebaseAuth);
            setUser(null);
            setRole(null);
            setIsSessionSynced(false);
            throw new Error('Sesi kedaluwarsa (auth_time > 5 menit). Silakan login kembali.');
          }
          throw new Error(`Session sync failed with status ${response.status}`);
        }

        const nextRole = await readRoleFromUser(targetUser, true);

        setUser(targetUser);
        setRole(nextRole);
        setIsSessionSynced(true);

        router.refresh();

        return nextRole;
      })();

      syncRef.current = {
        uid: targetUser.uid,
        promise
      };

      try {
        return await promise;
      } finally {
        if (syncRef.current?.promise === promise) {
          syncRef.current = null;
        }
      }
    },
    [router]
  );

  const refreshClaims = useCallback(async (): Promise<AppRole | null> => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      setRole(null);
      return null;
    }

    const nextRole = await readRoleFromUser(currentUser, true);
    setRole(nextRole);

    return nextRole;
  }, []);

  const signOutApp = useCallback(async () => {
    await firebaseSignOut(firebaseAuth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!nextUser) {
        const hadPreviousUser = previousUidRef.current !== null;

        previousUidRef.current = null;
        setUser(null);
        setRole(null);
        setIsSessionSynced(false);

        if (hadPreviousUser) {
          await clearServerSessionCookie();
          router.refresh();
        }

        setIsReady(true);
        return;
      }

      previousUidRef.current = nextUser.uid;
      setUser(nextUser);

      try {
        await syncSession(nextUser);
      } catch (error) {
        console.error('[AuthProvider] session sync failed', error);

        const fallbackRole = await readRoleFromUser(nextUser).catch(
          () => null as AppRole | null
        );

        setRole(fallbackRole);
        setIsSessionSynced(false);
      } finally {
        setIsReady(true);
      }
    });

    return unsubscribe;
  }, [clearServerSessionCookie, router, syncSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      status: isReady ? (user ? 'authenticated' : 'guest') : 'loading',
      emailVerified: Boolean(user?.emailVerified),
      isSessionSynced,
      syncSession,
      refreshClaims,
      signOutApp
    }),
    [user, role, isReady, isSessionSynced, syncSession, refreshClaims, signOutApp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}