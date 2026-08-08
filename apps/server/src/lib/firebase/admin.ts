import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initializeFirebaseAdmin() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    if (projectId && clientEmail && privateKey) {
      const app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      console.log('Backend diinisialisasi via Private Key.');
      return app;
    } else {
      const app = initializeApp({
        credential: applicationDefault(),
      });
      console.log('Backend diinisialisasi via Application Default.');
      return app;
    }
  } catch (error) {
    console.error('Gagal menginisialisasi Backend:', error);
  }
}

initializeFirebaseAdmin();

// Mengekspor objek yang memiliki struktur mirip dengan namespace lama
// sehingga kompatibel dengan pemanggilan admin.auth().verifyIdToken() di controller Anda
const admin = {
  auth: getAuth
};

export default admin;