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
  //  const { 
  //   droneId, snapshotRAW, snapshotNDVI, snapshotRG, 
  //   snapshotRGR, ndviRAW, latitudeAI, longitudeAI, altitudeAI 
  // } = req.body;
  const { 
    droneId, snapshotRAW, snapshotNDVI, snapshotRG, 
    snapshotRGR, ndviRAW, ndviAI, classification, latitudeAI, longitudeAI, altitudeAI 
  } = req.body;

  if (!currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (!snapshotRGR || !droneId || classification === undefined || ndviAI === undefined) {
    console.error("[Prediction AI] Payload tidak lengkap:", req.body);
    return res.status(400).json({ error: "Data payload prediksi tidak lengkap dari frontend" });
  }

  try {
    // Prediction hanya menerima citra RGR dan mengembalikan classification
    // const isHealthyCNN = Math.random() > 0.5;
    // const classificationOutput = isHealthyCNN ? "sehat" : "tidak_sehat";

    // const outputNdviAI = isHealthyCNN 
    //   ? parseFloat((0.6 + Math.random() * 0.3).toFixed(2)) 
    //   : parseFloat((0.1 + Math.random() * 0.2).toFixed(2));

    // Simpan Prediction ke Database
    const predictionResult = await prisma.predictionAI.create({
      data: {
        droneId: droneId,
        snapshotRAW: snapshotRAW,
        snapshotNDVI: snapshotNDVI,
        snapshotRG: snapshotRG,
        snapshotRGR: snapshotRGR,
        // classification: classificationOutput,
        // ndviRAW: ndviRAW,
        // ndviAI: outputNdviAI,
        classification: classification,
        ndviRAW: ndviRAW,
        ndviAI: ndviAI,
        latitudeAI: latitudeAI || 0,
        longitudeAI: longitudeAI || 0,
        altitudeAI: altitudeAI || 0,
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
    console.error("[Prediction AI] Error:", error);
    return res.status(500).json({ error: "Gagal memproses Prediction AI" });
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