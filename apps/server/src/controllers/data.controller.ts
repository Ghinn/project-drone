import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addClient } from '../services/sse.service';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const latestData = await prisma.telemetryLog.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        
        res.status(200).json({ success: true, data: latestData });
    } catch (error) {
        console.error('[dataController] Error getDashboardData:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil dashboard data' });
    }
};

export const getDataLogs = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 100;
        
        const historyData = await prisma.telemetryLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit
        });
        
        res.status(200).json({ success: true, data: historyData });
    } catch (error) {
        console.error('[dataController] Error getDataLogs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat data' });
    }
};

export const getDataStats = async (req: Request, res: Response) => {
    try {
        const aggregations = await prisma.telemetryLog.aggregate({
            _avg: { altitude: true, battery: true, groundSpeed: true },
            _max: { altitude: true, groundSpeed: true },
            _min: { battery: true },
            _count: { id: true }
        });
        
        res.status(200).json({ success: true, data: aggregations });
    } catch (error) {
        console.error('[Controller] Error getDataStats:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan analisis statistik' });
    }
};

export const streamTelemetrySSE = (req: Request, res: Response) => {
    // Teruskan request dan response langsung ke service SSE
    addClient(req, res);
};