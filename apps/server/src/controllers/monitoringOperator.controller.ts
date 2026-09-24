import { Request, Response } from 'express';
import { publishDroneCommand } from '../services/mqtt.service';

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
    res.status(200).json({
      success: true,
      message: "Data System Logs berhasil diambil",
      data: []
    });
  } catch (error) {
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