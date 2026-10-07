import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Mendapatkan __dirname yang kompatibel dengan ES Module / TSX
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi Parameter
const DRONE_ID = 'v1-001';
const ALTITUDE_STATIC = 50.0;
const GROUND_SPEED_STATIC = 0.0;
const CLIMB_RATE_STATIC = 0.0;

const MAX_BATTERY = 100.0;
const MAX_TANK_CAPACITY = 700.0;
const SPRAY_VOLUME = 15.0; 
const SPRAY_DURATION = 5.0; 
const MAX_MISSION_SPRAYS = 12; 
const MISSIONS_PER_DAY = 4;

// Data Koordinat dan Waypoints
const LOCATIONS = {
  JONGGOL: {
    home: { lat: -6.475715, lng: 107.032235 },
    // 10 Titik Waypoints Jalur Terbang Jonggol (Menghasilkan 120 titik sebaran log)
    waypoints: [
      { lat: -6.4761495, lng: 107.0322462 },
      { lat: -6.4763000, lng: 107.0325000 },
      { lat: -6.4765000, lng: 107.0328000 },
      { lat: -6.4768000, lng: 107.0331000 },
      { lat: -6.4770000, lng: 107.0329000 },
      { lat: -6.4767000, lng: 107.0325000 },
      { lat: -6.4764000, lng: 107.0321000 },
      { lat: -6.4761000, lng: 107.0318000 },
      { lat: -6.4758000, lng: 107.0320000 },
      { lat: -6.4759500, lng: 107.0323000 },
    ]
  },
  CIKABAYAN: {
    home: { lat: -6.552211705425046, lng: 106.7185597960522 },
    // 8 Titik Waypoints Jalur Terbang Cikabayan (Menghasilkan 70 titik sebaran log)
    waypoints: [
      { lat: -6.5491118, lng: 106.7160657 },
      { lat: -6.5489800, lng: 106.7162400 },
      { lat: -6.5488200, lng: 106.7164100 },
      { lat: -6.5487100, lng: 106.7165800 },
      { lat: -6.5489200, lng: 106.7167100 },
      { lat: -6.5491800, lng: 106.7165600 },
      { lat: -6.5493400, lng: 106.7163300 },
      { lat: -6.5492100, lng: 106.7161100 },
    ]
  }
};

// Helper function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Membaca seluruh nama file secara dinamis dari direktori fisik
function getDynamicBase64Image(folder: 'SEHAT' | 'TIDAK_SEHAT', fileList: string[]): string {
  try {
    if (fileList.length === 0) return "";
    const randomFileName = fileList[Math.floor(Math.random() * fileList.length)];
    const filePath = path.resolve(__dirname, `../../client/public/test/${folder}/${randomFileName}`);
    
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return `data:image/png;base64,${fileBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.warn(`[Peringatan] Gagal memproses gambar di folder ${folder}:`, error);
  }
  return ""; 
}

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = <T>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

// Seeder
async function main() {
  console.log('Mereset data PredictionAI dan Spray lama...');
  await prisma.spray.deleteMany();
  await prisma.predictionAI.deleteMany();

  // Membaca daftar nama file asli secara otomatis dari direktori
  const sehatDir = path.resolve(__dirname, '../../client/public/test/SEHAT');
  const tidakSehatDir = path.resolve(__dirname, '../../client/public/test/TIDAK_SEHAT');

  const sehatFiles = fs.existsSync(sehatDir) 
    ? fs.readdirSync(sehatDir).filter(file => file.endsWith('.png')) 
    : [];
    
  const tidakSehatFiles = fs.existsSync(tidakSehatDir) 
    ? fs.readdirSync(tidakSehatDir).filter(file => file.endsWith('.png')) 
    : [];

  console.log(`Ditemukan ${sehatFiles.length} file Sehat dan ${tidakSehatFiles.length} file Tidak Sehat di direktori.`);

  // Validasi jika folder kosong
  if (sehatFiles.length === 0 || tidakSehatFiles.length === 0) {
    console.error("[PERINGATAN] Folder SEHAT atau TIDAK_SEHAT kosong atau tidak ditemukan!");
    return;
  }

  const sehatAlloc = Array.from({ length: 95 }, () => ({ class: 'sehat', loc: Math.random() > 0.37 ? 'JONGGOL' : 'CIKABAYAN' }));
  const tidakSehatAlloc = Array.from({ length: 95 }, () => ({ class: 'tidak_sehat', loc: Math.random() > 0.37 ? 'JONGGOL' : 'CIKABAYAN' }));

  // 120 Data Jonggol (60 Sehat, 60 Tidak Sehat)
  const jonggolData = shuffleArray([
    ...sehatAlloc.filter(x => x.loc === 'JONGGOL'),
    ...tidakSehatAlloc.filter(x => x.loc === 'JONGGOL')
  ]);

  // 70 Data Cikabayan (35 Sehat, 35 Tidak Sehat)
  const cikabayanData = shuffleArray([
    ...sehatAlloc.filter(x => x.loc === 'CIKABAYAN'),
    ...tidakSehatAlloc.filter(x => x.loc === 'CIKABAYAN')
  ]);

  // Eksekusi wilayah Jonggol (Mulai 4 Agustus 2026)
  console.log('Memproses misi wilayah JONGGOL (4 Agustus 2026)...');
  let jonggolTimestamp = new Date('2026-08-04T08:00:00+07:00');
  let currentBattery = MAX_BATTERY;
  let currentTank = MAX_TANK_CAPACITY;
  let spraysInMission = 0;
  let missionsToday = 0;
  let jonggolWaypointIndex = 0;

  for (let i = 0; i < jonggolData.length; i++) {
    const data = jonggolData[i];
    const isHealthy = data.class === 'sehat';
    const folder = isHealthy ? 'SEHAT' : 'TIDAK_SEHAT';
    
    const rawBase64Image = getDynamicBase64Image(folder, isHealthy ? sehatFiles : tidakSehatFiles);
    
    const wp = LOCATIONS.JONGGOL.waypoints[jonggolWaypointIndex % LOCATIONS.JONGGOL.waypoints.length];
    const lat = wp.lat + randomInRange(-0.0001, 0.0001);
    const lng = wp.lng + randomInRange(-0.0001, 0.0001);
    const homeLat = LOCATIONS.JONGGOL.home.lat;
    const homeLng = LOCATIONS.JONGGOL.home.lng;
    jonggolWaypointIndex++;

    const distToHome = calculateDistance(lat, lng, homeLat, homeLng);
    const rssi = randomInt(216, 241); 
    const ndviAI = isHealthy ? randomInRange(0.55, 0.85) : randomInRange(0.15, 0.45);
    const ndviRAW = ndviAI - randomInRange(-0.05, 0.05);

    jonggolTimestamp = new Date(jonggolTimestamp.getTime() + randomInt(60, 180) * 1000);
    currentBattery = Math.max(15, currentBattery - randomInRange(2, 4));

    const predictionPayload = {
      droneId: DRONE_ID,
      snapshotRAW: rawBase64Image,
      snapshotNDVI: "", 
      snapshotRG: "",
      snapshotRGR: "",
      classification: data.class,
      ndviRAW,
      ndviAI,
      altitudeAI: ALTITUDE_STATIC,
      latitudeAI: lat,
      longitudeAI: lng,
      groundSpeedAI: GROUND_SPEED_STATIC,
      climbRateAI: CLIMB_RATE_STATIC,
      distanceToHomeAI: distToHome,
      batteryAI: currentBattery,
      radioAI: { rssi, noise: 0, txbuf: 100 },
      timestamp: jonggolTimestamp
    };

    if (isHealthy) {
      await prisma.predictionAI.create({ data: predictionPayload });
    } else {
      spraysInMission++;
      currentTank = Math.max(0, currentTank - SPRAY_VOLUME);

      await prisma.predictionAI.create({
        data: {
          ...predictionPayload,
          spray: {
            create: {
              droneId: DRONE_ID,
              durationSpray: SPRAY_DURATION,
              volumeSpray: SPRAY_VOLUME,
              capacityTank: MAX_TANK_CAPACITY,
              remainingTank: currentTank,
              timestamp: new Date(jonggolTimestamp.getTime() + 1000)
            }
          }
        }
      });
    }

    if (spraysInMission >= MAX_MISSION_SPRAYS || currentBattery <= 25) {
      missionsToday++;
      spraysInMission = 0;
      currentBattery = MAX_BATTERY;
      currentTank = MAX_TANK_CAPACITY;

      if (missionsToday >= MISSIONS_PER_DAY) {
        missionsToday = 0;
        jonggolTimestamp = new Date(jonggolTimestamp.getTime() + 16 * 60 * 60 * 1000);
      } else {
        jonggolTimestamp = new Date(jonggolTimestamp.getTime() + 2 * 60 * 60 * 1000);
      }
    }
  }

  // Eksekusi wilayah Cikabayan (Mulai 19 September 2026)
  console.log('Memproses misi wilayah CIKABAYAN (19 September 2026)...');
  let cikabayanTimestamp = new Date('2026-09-19T08:00:00+07:00');
  currentBattery = MAX_BATTERY;
  currentTank = MAX_TANK_CAPACITY;
  spraysInMission = 0;
  missionsToday = 0;
  let cikabayanWaypointIndex = 0;

  for (let i = 0; i < cikabayanData.length; i++) {
    const data = cikabayanData[i];
    const isHealthy = data.class === 'sehat';
    const folder = isHealthy ? 'SEHAT' : 'TIDAK_SEHAT';
    
    const rawBase64Image = getDynamicBase64Image(folder, isHealthy ? sehatFiles : tidakSehatFiles);
    
    const wp = LOCATIONS.CIKABAYAN.waypoints[cikabayanWaypointIndex % LOCATIONS.CIKABAYAN.waypoints.length];
    const lat = wp.lat + randomInRange(-0.0001, 0.0001);
    const lng = wp.lng + randomInRange(-0.0001, 0.0001);
    const homeLat = LOCATIONS.CIKABAYAN.home.lat;
    const homeLng = LOCATIONS.CIKABAYAN.home.lng;
    cikabayanWaypointIndex++;

    const distToHome = calculateDistance(lat, lng, homeLat, homeLng);
    const rssi = randomInt(216, 241); 
    const ndviAI = isHealthy ? randomInRange(0.55, 0.85) : randomInRange(0.15, 0.45);
    const ndviRAW = ndviAI - randomInRange(-0.05, 0.05);

    cikabayanTimestamp = new Date(cikabayanTimestamp.getTime() + randomInt(60, 180) * 1000);
    currentBattery = Math.max(15, currentBattery - randomInRange(2, 4));

    const predictionPayload = {
      droneId: DRONE_ID,
      snapshotRAW: rawBase64Image,
      snapshotNDVI: "", 
      snapshotRG: "",
      snapshotRGR: "",
      classification: data.class,
      ndviRAW,
      ndviAI,
      altitudeAI: ALTITUDE_STATIC,
      latitudeAI: lat,
      longitudeAI: lng,
      groundSpeedAI: GROUND_SPEED_STATIC,
      climbRateAI: CLIMB_RATE_STATIC,
      distanceToHomeAI: distToHome,
      batteryAI: currentBattery,
      radioAI: { rssi, noise: 0, txbuf: 100 },
      timestamp: cikabayanTimestamp
    };

    if (isHealthy) {
      await prisma.predictionAI.create({ data: predictionPayload });
    } else {
      spraysInMission++;
      currentTank = Math.max(0, currentTank - SPRAY_VOLUME);

      await prisma.predictionAI.create({
        data: {
          ...predictionPayload,
          spray: {
            create: {
              droneId: DRONE_ID,
              durationSpray: SPRAY_DURATION,
              volumeSpray: SPRAY_VOLUME,
              capacityTank: MAX_TANK_CAPACITY,
              remainingTank: currentTank,
              timestamp: new Date(cikabayanTimestamp.getTime() + 1000)
            }
          }
        }
      });
    }

    if (spraysInMission >= MAX_MISSION_SPRAYS || currentBattery <= 25) {
      missionsToday++;
      spraysInMission = 0;
      currentBattery = MAX_BATTERY;
      currentTank = MAX_TANK_CAPACITY;

      if (missionsToday >= MISSIONS_PER_DAY) {
        missionsToday = 0;
        cikabayanTimestamp = new Date(cikabayanTimestamp.getTime() + 16 * 60 * 60 * 1000);
      } else {
        cikabayanTimestamp = new Date(cikabayanTimestamp.getTime() + 2 * 60 * 60 * 1000);
      }
    }
  }

  console.log('✅ Injeksi 190 Log Prediksi berhasil!');
}

main()
  .catch(e => {
    console.error('Gagal menjalankan seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });