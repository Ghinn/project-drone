import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Inisialisasi Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

// KONFIGURASI USER
const targetUsers = [
  {
    uid: 'meN6HV8uVMXTy6cF1xWtdGDJAJ83',
    role: 'ADMIN',
    description: 'USER-ADM-001'
  },
  {
    uid: 'vr0b9wJWfxPIjQHF3lXWxIz980w1',
    role: 'FARMER',
    description: 'USER-FMR-001'
  },
  {
    uid: '7IMGz2UpyPZJ2t2bEWpTx3hTPnu1',
    role: 'FARMER',
    description: 'USER-FMR-002'
  },
  {
    uid: 'swpCST9UcxYXA4SSNtk1jVvwrH93',
    role: 'OPERATOR',
    description: 'USER-OPR-001'
  }
];

// 3. Fungsi Asynchronous Utama
async function assignRoles() {

  let successCount = 0;
  let failCount = 0;

  // Menggunakan for...of agar proses await berjalan berurutan (mencegah rate-limit Firebase)
  for (const user of targetUsers) {
    try {
      if (!user.uid || !user.role) {
        throw new Error('UID atau Role tidak boleh kosong.');
      }

      // Proses injeksi stempel role ke Firebase
      await getAuth().setCustomUserClaims(user.uid, { role: user.role });
      
      console.log(`[BERHASIL] Role '${user.role}' -> UID: ${user.uid} (${user.description})`);
      successCount++;
    } catch (error) {
      console.error(`[GAGAL] Role '${user.role}' -> UID: ${user.uid} (${user.description})`);
      console.error(`          Alasan: ${error.message}`);
      failCount++;
    }
  }

  // Rekapitulasi Eksekusi
  console.log(`==================================================================`);
  console.log(`PROSES SELESAI | Berhasil: ${successCount} | Gagal: ${failCount}\n`);
  
  process.exit(0);
}

assignRoles();