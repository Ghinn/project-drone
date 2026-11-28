import { Request, Response } from 'express';
import { publishDroneCommand } from '../services/mqtt.service';
import { prisma } from '../lib/prisma';

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
  classification: 'Sehat' | 'Terserang';
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

type StoredMapirFields = {
  filename: string | null;
  modelName: string | null;
  modelStatus: string | null;
  classification: string;
  classIndex: number | null;
  scoreTerserang: number | null;
  scoreSehat: number | null;
  predictionScore: number | null;
  scoreCalibrated: boolean | null;
  threshold: number | null;
  ndviAI: number | null;
  bands: unknown;
  validPixelPercentage: number | null;
  inputShape: unknown;
  snapshotThumbnail: string | null;
  snapshotNDVI: string;
  radiometricMode: string | null;
  radiometricValidated: boolean | null;
  physicalCoverageTargetMeters: number | null;
  physicalCoverageValidated: boolean | null;
  automaticSprayingAllowed: boolean | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNullableFiniteNumber = (value: unknown): value is number | null =>
  value === null || isFiniteNumber(value);

const isMapirBands = (value: unknown): value is MapirBands =>
  isRecord(value) &&
  isNullableFiniteNumber(value.green) &&
  isNullableFiniteNumber(value.red) &&
  isNullableFiniteNumber(value.nir);

const isFiniteNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every(isFiniteNumber);

const buildMapirPredictionResult = (
  fields: StoredMapirFields,
): MapirPredictionResult | null => {
  const classification =
    fields.classification === 'sehat'
      ? 'Sehat'
      : fields.classification === 'tidak_sehat'
        ? 'Terserang'
        : null;

  if (
    !classification ||
    fields.filename === null ||
    fields.modelName === null ||
    fields.modelStatus === null ||
    (fields.classIndex !== 0 && fields.classIndex !== 1) ||
    !isFiniteNumber(fields.scoreTerserang) ||
    !isFiniteNumber(fields.scoreSehat) ||
    !isFiniteNumber(fields.predictionScore) ||
    fields.scoreCalibrated === null ||
    !isFiniteNumber(fields.threshold) ||
    !isNullableFiniteNumber(fields.ndviAI) ||
    !isMapirBands(fields.bands) ||
    !isFiniteNumber(fields.validPixelPercentage) ||
    !isFiniteNumberArray(fields.inputShape) ||
    fields.snapshotThumbnail === null ||
    fields.radiometricMode === null ||
    fields.radiometricValidated === null ||
    !isFiniteNumber(fields.physicalCoverageTargetMeters) ||
    fields.physicalCoverageValidated === null ||
    fields.automaticSprayingAllowed === null
  ) {
    return null;
  }

  return {
    success: true,
    filename: fields.filename,
    modelName: fields.modelName,
    modelStatus: fields.modelStatus,
    classification,
    classIndex: fields.classIndex,
    scoreTerserang: fields.scoreTerserang,
    scoreSehat: fields.scoreSehat,
    predictionScore: fields.predictionScore,
    scoreCalibrated: fields.scoreCalibrated,
    threshold: fields.threshold,
    ndvi: fields.ndviAI,
    bands: fields.bands,
    validPixelPercentage: fields.validPixelPercentage,
    inputShape: fields.inputShape,
    snapshotThumbnail: fields.snapshotThumbnail,
    snapshotNDVI: fields.snapshotNDVI,
    radiometricMode: fields.radiometricMode,
    radiometricValidated: fields.radiometricValidated,
    physicalCoverageTargetMeters: fields.physicalCoverageTargetMeters,
    physicalCoverageValidated: fields.physicalCoverageValidated,
    automaticSprayingAllowed: fields.automaticSprayingAllowed,
  };
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Data Dashboard berhasil diambil",
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const getHistoriData = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Data System Logs berhasil diambil",
      data: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const getAnalisisData = async (req: Request, res: Response) => {
  try {

    const currentUser = req.currentUser;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan"
      });
    }

    if (
      currentUser.role !== "OPERATOR" ||
      currentUser.status !== "APPROVED" ||
      !currentUser.assignedDroneId
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses drone tidak diizinkan"
      });
    }

    const droneId = currentUser.assignedDroneId;


    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    
    let search = (req.query.search as string) || '';
    search = search.replace('#', '').trim();

    const filterSev = req.query.filterSev as string || 'all';

    const skip = (page - 1) * limit;

    // Logika Kondisi Pencarian (Where Clause)
    const baseWhere = { droneId };
    const filterWhere: any = { ...baseWhere };

    if (filterSev !== 'all') {
      filterWhere.classification = filterSev;
    }
    if (search) {
      filterWhere.id = { contains: search, mode: 'insensitive' };
    }

    const [predictionLogs, totalFiltered, totalAll, totalSehat, totalTidakSehat] = await Promise.all([
      prisma.predictionAI.findMany({
        where: filterWhere,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, timestamp: true, latitudeAI: true, longitudeAI: true,
          ndviAI: true, classification: true,
          spray: { select: { id: true } }
        }
      }),
      prisma.predictionAI.count({ where: filterWhere }),
      prisma.predictionAI.count({ where: baseWhere }),
      prisma.predictionAI.count({ where: { ...baseWhere, classification: 'sehat' } }),
      prisma.predictionAI.count({ where: { ...baseWhere, classification: 'tidak_sehat' } })
    ]);

    res.status(200).json({
      success: true,
      message: "Data Log Prediksi berhasil diambil",
      data: predictionLogs,
      stats: {
        total: totalAll,
        sehat: totalSehat,
        tidak_sehat: totalTidakSehat
      },
      pagination: {
        totalRecords: totalFiltered,
        currentPage: page,
        totalPages: Math.ceil(totalFiltered / limit),
        limit
      }
    });
  } catch (error) {
    console.error("[Prediction Log] Fetching Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const getAnalisisDetail = async (req: Request, res: Response) => {
  try {

    const currentUser = req.currentUser;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan"
      });
    }

    if (
      currentUser.role !== "OPERATOR" ||
      currentUser.status !== "APPROVED" ||
      !currentUser.assignedDroneId
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses drone tidak diizinkan"
      });
    }

    const droneId = currentUser.assignedDroneId;

    const id = (req.params.id as string)?.trim();

    if (!id) {
      return res.status(400).json({ success: false, message: "ID Data Log tidak diberikan" });
    }

    const logDetail = await prisma.predictionAI.findFirst({
      where: { id: id, droneId },
      include: {
        spray: true 
      }
    });

    if (!logDetail) {
      return res.status(404).json({ 
        success: false,
        message: "Data Log tidak ditemukan"
      });
    }

    const mapirResult = buildMapirPredictionResult(logDetail);

    return res.status(200).json({
      success: true,
      message: "Data detail log berhasil diambil",
      data: {
        ...logDetail,
        mapirResult,
      },
    });
  } catch (error) {
    console.error("[Prediction Log] Fetching Error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const getLiveCameraData = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Data System Logs berhasil diambil",
      data: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const getSettingsData = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Data Settings berhasil diambil",
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

export const sendDroneCommand = async (req: Request, res: Response) => {
  try {
    const { droneId, targetTopic, command } = req.body;
    
    if (!droneId || !targetTopic || !command) {
      return res.status(400).json({ success: false, message: "Parameter tidak lengkap." });
    }

    publishDroneCommand(droneId, targetTopic, command);
    res.status(200).json({ success: true, message: `Berhasil mengirim trigger ${command}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};