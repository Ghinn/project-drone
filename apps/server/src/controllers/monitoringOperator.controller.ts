import { Request, Response } from 'express';
import { publishDroneCommand } from '../services/mqtt.service';
import { prisma } from '../lib/prisma';

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
    const currentUser = (req as any).currentUser;
    const droneId = currentUser?.assignedDroneId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    
    let search = (req.query.search as string) || '';
    search = search.replace('#', '').trim();

    const filterSev = req.query.filterSev as string || 'all';

    const skip = (page - 1) * limit;

    // Logika Kondisi Pencarian (Where Clause)
    const baseWhere: any = droneId ? { droneId } : {};
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
    const id = (req.params.id as string)?.trim();

    if (!id) {
      return res.status(400).json({ success: false, message: "ID Data Log tidak diberikan" });
    }

    const logDetail = await prisma.predictionAI.findFirst({
      where: { id: id },
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

    return res.status(200).json({
      success: true,
      message: "Data detail log berhasil diambil",
      data: logDetail
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