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
    
    const whereClause = currentUser?.assignedDroneId 
      ? { droneId: currentUser.assignedDroneId } 
      : {};

    const predictionLogs = await prisma.predictionAI.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        spray: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Data Log Prediksi berhasil diambil",
      data: predictionLogs
    });
  } catch (error) {
    console.error("[Prediction Log] Fetching Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
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