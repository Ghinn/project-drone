import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/http';

export const getMyProfile = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;

  if (!currentUser) {
    return res.status(401).json({ message: 'Tidak terautentikasi.', data: null });
  }

  return res.status(200).json({
    data: {
      id: currentUser.id,
      firebaseUid: currentUser.firebaseUid,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
      assignedDroneId: currentUser.assignedDroneId ?? null,
    },
  });
});

export const getMyDrone = asyncHandler(async (req, res) => {
  const assignedDroneId = req.currentUser?.assignedDroneId;

  if (!assignedDroneId) {
    return res.status(200).json({
      data: null,
      message: 'Tidak ada drone yang di-assign ke akun ini.',
    });
  }

  const drone = await prisma.drone.findUnique({
    where: { id: assignedDroneId },
    include: {
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!drone) {
    return res.status(404).json({
      data: null,
      message: 'Data drone tidak ditemukan meskipun sudah di-assign.',
    });
  }

  return res.status(200).json({
    data: {
      id: drone.id,
      name: drone.name,
      status: drone.status,
      isApproved: drone.isApproved,
      operator: drone.operator,
      linkFrequency: null,
    },
  });
});

export const savePredictionSnapshot = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;
  const { droneId, imageBase64, latitude, longitude, altitude } = req.body;

  if (!currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!imageBase64 || !droneId) {
    return res.status(400).json({ error: "Data gambar atau ID Drone tidak lengkap" });
  }

  try {
    // Simpan Gambar Base64 ke Local Storage Server
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `snapshot-${Date.now()}-${uuidv4().substring(0, 6)}.jpg`;
    
    // Asumsi eksekusi ada di dist/controllers atau src/controllers
    // Target ke folder apps/server/public/uploads
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    const imageUrl = `/uploads/${fileName}`; 

    // Simulasi Logika Engine AI (Data Dummy untuk Prototype)
    const isHealthy = Math.random() > 0.5;
    const classification = isHealthy ? "sehat" : "tidak sehat";
    const ndvi = isHealthy 
      ? parseFloat((0.6 + Math.random() * 0.3).toFixed(2)) 
      : parseFloat((0.1 + Math.random() * 0.2).toFixed(2));
    const diseaseSeverity = isHealthy 
      ? 0.0 
      : parseFloat((60 + Math.random() * 30).toFixed(1));
    const bandValue = 850.0; // NIR Mapir Survey3

    // Simpan Prediksi ke Database
    const predictionResult = await prisma.predictionAI.create({
      data: {
        droneId: droneId,
        snapshotPict: imageUrl,
        classification: classification,
        band: bandValue,
        ndvi: ndvi,
        diseaseSeverity: diseaseSeverity,
        latitudeAI: latitude || 0,
        longitudeAI: longitude || 0,
        altitudeAI: altitude || 0,
      }
    });

    // Rekam aktivitas log di tabel SysLog
    await prisma.sysLog.create({
      data: {
        userId: currentUser.id,
        role: currentUser.role,
        assignedDroneId: droneId,
        command: "take_picture" 
      }
    });

    return res.status(200).json({
      success: true,
      data: predictionResult,
      message: "Snapshot dan hasil AI berhasil disimpan"
    });

  } catch (error) {
    console.error("[AI Integration] Error:", error);
    return res.status(500).json({ error: "Gagal memproses dan menyimpan data snapshot" });
  }
});

export const saveSprayLog = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;
  const { droneId, durationSpray, volumeSpray, capacityTank, remainingTank } = req.body;

  if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
  if (!droneId) return res.status(400).json({ error: "ID Drone tidak ditemukan" });

  try {
    const sprayResult = await prisma.spray.create({
      data: {
        droneId: droneId,
        durationSpray: durationSpray,
        volumeSpray: volumeSpray,
        capacityTank: capacityTank,
        remainingTank: remainingTank
      }
    });

    return res.status(200).json({
      success: true,
      data: sprayResult,
      message: "Data Spray berhasil disimpan"
    });
  } catch (error) {
    console.error("[Spray DB] Error:", error);
    return res.status(500).json({ error: "Gagal menyimpan data spray ke database" });
  }
});