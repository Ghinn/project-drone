import 'server-only';

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type AppOptions
} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

function getAdminOptions(): AppOptions {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    };
  }

  if (projectId) {
    return {
      credential: applicationDefault(),
      projectId
    };
  }

  return {
    credential: applicationDefault()
  };
}

const adminApp = getApps().length
  ? getApps()[0]!
  : initializeApp(getAdminOptions());

export const adminAuth = getAuth(adminApp);