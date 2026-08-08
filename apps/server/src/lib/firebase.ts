import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env";

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const hasInlineCredentials =
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY;

  if (hasInlineCredentials) {
    return initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID!,
        clientEmail: env.FIREBASE_CLIENT_EMAIL!,
        privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
      projectId: env.FIREBASE_PROJECT_ID!,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    ...(env.FIREBASE_PROJECT_ID ? { projectId: env.FIREBASE_PROJECT_ID } : {}),
  });
}

export const firebaseApp = getFirebaseApp();
export const firebaseAuth = getAuth(firebaseApp);