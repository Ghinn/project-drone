import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/http";

type MapirBands = {
  green: number | null;
  red: number | null;
  nir: number | null;
};

type MapirPredictionResult = {
  success: true;
  filename: string;
  modelName: string;
  modelStatus: string;
  classification: "Sehat" | "Terserang";
  classIndex: 0 | 1;
  scoreTerserang: number;
  scoreSehat: number;
  predictionScore: number;
  scoreCalibrated: boolean;
  threshold: number;
  ndvi: number | null;
  bands: MapirBands;
  validPixelPercentage: number;
  inputShape: number[];
  snapshotThumbnail: string;
  snapshotNDVI: string;
  radiometricMode: string;
  radiometricValidated: boolean;
  physicalCoverageTargetMeters: number;
  physicalCoverageValidated: boolean;
  automaticSprayingAllowed: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNullableFiniteNumber = (value: unknown): value is number | null =>
  value === null || isFiniteNumber(value);

const isMapirPredictionResult = (
  value: unknown,
): value is MapirPredictionResult => {
  if (!isRecord(value) || !isRecord(value.bands)) return false;

  return (
    value.success === true &&
    typeof value.filename === "string" &&
    typeof value.modelName === "string" &&
    typeof value.modelStatus === "string" &&
    (value.classification === "Sehat" ||
      value.classification === "Terserang") &&
    (value.classIndex === 0 || value.classIndex === 1) &&
    isFiniteNumber(value.scoreTerserang) &&
    isFiniteNumber(value.scoreSehat) &&
    isFiniteNumber(value.predictionScore) &&
    typeof value.scoreCalibrated === "boolean" &&
    isFiniteNumber(value.threshold) &&
    isNullableFiniteNumber(value.ndvi) &&
    isNullableFiniteNumber(value.bands.green) &&
    isNullableFiniteNumber(value.bands.red) &&
    isNullableFiniteNumber(value.bands.nir) &&
    isFiniteNumber(value.validPixelPercentage) &&
    Array.isArray(value.inputShape) &&
    value.inputShape.every(isFiniteNumber) &&
    typeof value.snapshotThumbnail === "string" &&
    typeof value.snapshotNDVI === "string" &&
    typeof value.radiometricMode === "string" &&
    typeof value.radiometricValidated === "boolean" &&
    isFiniteNumber(value.physicalCoverageTargetMeters) &&
    typeof value.physicalCoverageValidated === "boolean" &&
    typeof value.automaticSprayingAllowed === "boolean"
  );
};

export const getMyProfile = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;

  if (!currentUser) {
    return res
      .status(401)
      .json({ message: "Tidak terautentikasi.", data: null });
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
      message: "Tidak ada drone yang di-assign ke akun ini.",
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
      message: "Data drone tidak ditemukan meskipun sudah di-assign.",
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

  if (req.body?.mapirResult !== undefined) {
    const { droneId, mapirResult, telemetryAI } = req.body;

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (
      typeof droneId !== "string" ||
      !droneId ||
      !isMapirPredictionResult(mapirResult)
    ) {
      return res
        .status(400)
        .json({ error: "Data hasil prediksi MAPIR tidak valid" });
    }
    if (droneId !== currentUser.assignedDroneId) {
      return res
        .status(403)
        .json({ error: "Drone tidak ditugaskan ke akun ini" });
    }

    const telemetry = isRecord(telemetryAI) ? telemetryAI : {};
    const numberOrZero = (value: unknown) =>
      isFiniteNumber(value) ? value : 0;

    try {
      const [predictionResult] = await prisma.$transaction([
        prisma.predictionAI.create({
          data: {
            droneId,
            snapshotRAW:
              typeof req.body.snapshotRAW === "string"
                ? req.body.snapshotRAW
                : mapirResult.snapshotThumbnail,
            snapshotNDVI: mapirResult.snapshotNDVI,
            snapshotRG: null,
            snapshotRGR: null,
            classification:
              mapirResult.classification === "Sehat" ? "sehat" : "tidak_sehat",
            ndviRAW: null,
            ndviAI: mapirResult.ndvi,
            latitudeAI: numberOrZero(telemetry.latitude),
            longitudeAI: numberOrZero(telemetry.longitude),
            altitudeAI: numberOrZero(telemetry.altitude),
            groundSpeedAI: numberOrZero(telemetry.groundSpeed),
            climbRateAI: numberOrZero(telemetry.climbRate),
            distanceToHomeAI: numberOrZero(telemetry.distanceToHome),
            batteryAI: numberOrZero(telemetry.battery),
            filename: mapirResult.filename,
            modelName: mapirResult.modelName,
            modelStatus: mapirResult.modelStatus,
            classIndex: mapirResult.classIndex,
            scoreTerserang: mapirResult.scoreTerserang,
            scoreSehat: mapirResult.scoreSehat,
            predictionScore: mapirResult.predictionScore,
            scoreCalibrated: mapirResult.scoreCalibrated,
            threshold: mapirResult.threshold,
            bands: mapirResult.bands,
            validPixelPercentage: mapirResult.validPixelPercentage,
            inputShape: mapirResult.inputShape,
            snapshotThumbnail: mapirResult.snapshotThumbnail,
            radiometricMode: mapirResult.radiometricMode,
            radiometricValidated: mapirResult.radiometricValidated,
            physicalCoverageTargetMeters:
              mapirResult.physicalCoverageTargetMeters,
            physicalCoverageValidated: mapirResult.physicalCoverageValidated,
            automaticSprayingAllowed: mapirResult.automaticSprayingAllowed,
          },
        }),
        prisma.sysLog.create({
          data: {
            userId: currentUser.id,
            role: currentUser.role,
            assignedDroneId: droneId,
            command: "take_picture",
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: predictionResult,
        message: "Hasil prediksi MAPIR berhasil disimpan",
      });
    } catch (error) {
      console.error("[Prediction AI] Gagal menyimpan hasil MAPIR:", error);
      return res
        .status(500)
        .json({ error: "Gagal menyimpan hasil prediksi MAPIR" });
    }
  }

  //  const {
  //   droneId, snapshotRAW, snapshotNDVI, snapshotRG,
  //   snapshotRGR, ndviRAW, latitudeAI, longitudeAI, altitudeAI
  // } = req.body;
  const {
    droneId,
    snapshotRAW,
    snapshotNDVI,
    snapshotRG,
    snapshotRGR,
    ndviRAW,
    ndviAI,
    classification,
    latitudeAI,
    longitudeAI,
    altitudeAI,
    groundSpeedAI,
    climbRateAI,
    distanceToHomeAI,
    batteryAI,
    radioAI,
  } = req.body;

  if (!currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (
    !snapshotRGR ||
    !droneId ||
    classification === undefined ||
    ndviAI === undefined
  ) {
    console.error("[Prediction AI] Payload tidak lengkap:", req.body);
    return res
      .status(400)
      .json({ error: "Data payload prediksi tidak lengkap dari frontend" });
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
        droneId,
        snapshotRAW,
        snapshotNDVI,
        snapshotRG,
        snapshotRGR,
        classification,
        ndviRAW,
        ndviAI,
        latitudeAI: latitudeAI || 0,
        longitudeAI: longitudeAI || 0,
        altitudeAI: altitudeAI || 0,
        groundSpeedAI: groundSpeedAI || 0,
        climbRateAI: climbRateAI || 0,
        distanceToHomeAI: distanceToHomeAI || 0,
        batteryAI: batteryAI || 0,
        radioAI: radioAI || null,
      },
    });

    // Rekam aktivitas log di tabel SysLog
    await prisma.sysLog.create({
      data: {
        userId: currentUser.id,
        role: currentUser.role,
        assignedDroneId: droneId,
        command: "take_picture",
      },
    });

    return res.status(200).json({
      success: true,
      data: predictionResult,
      message: "Snapshot dan hasil AI berhasil disimpan",
    });
  } catch (error) {
    console.error("[Prediction AI] Error:", error);
    return res.status(500).json({ error: "Gagal memproses Prediction AI" });
  }
});

export const saveSprayLog = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;
  const {
    droneId,
    predictionId,
    durationSpray,
    volumeSpray,
    capacityTank,
    remainingTank,
  } = req.body;

  if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
  if (!droneId)
    return res.status(400).json({ error: "ID Drone tidak ditemukan" });

  try {
    const sprayResult = await prisma.spray.create({
      data: {
        droneId: droneId,
        predictionId: predictionId || null,
        durationSpray: durationSpray,
        volumeSpray: volumeSpray,
        capacityTank: capacityTank,
        remainingTank: remainingTank,
      },
    });

    return res.status(200).json({
      success: true,
      data: sprayResult,
      message: "Data Spray berhasil disimpan",
    });
  } catch (error) {
    console.error("[Spray DB] Error:", error);
    return res
      .status(500)
      .json({ error: "Gagal menyimpan data spray ke database" });
  }
});
