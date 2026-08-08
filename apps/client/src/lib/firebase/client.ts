"use client";

import {getApp, getApps, initializeApp, type FirebaseApp} from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  type Auth
} from 'firebase/auth';

function requiredPublicEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required public env var: ${name}`);
  }

  return value;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Validasi manual
if (!firebaseConfig.apiKey) {
  throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth: Auth = (() => {
  if (typeof window !== 'undefined') {
    try {
      return initializeAuth(firebaseApp, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver
      });
    } catch {
      return getAuth(firebaseApp);
    }
  }
  return getAuth(firebaseApp);
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({prompt: 'select_account'});