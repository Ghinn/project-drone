import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addClient } from '../services/sse.service';
import { getTelemetryLogStateByDrone } from '../services/mqtt.service';

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

export const getCurrentDroneState = async (req: Request, res: Response) => {
    try {
        const droneId = req.query.droneId as string;
        
        if (!droneId) {
            return res.status(400).json({ success: false, error: 'Parameter droneId wajib disertakan' });
        }

        // Ambil state telemetri dari memory MQTT Service
        const memoryState = getTelemetryLogStateByDrone(droneId);
        
        // Format response sesuai kebutuhan Frontend { status: string, telemetry: object }
        const currentState = {
            status: memoryState?.status || 'unknown',
            telemetry: memoryState || null
        };

        // Fallback: Jika di memory belum ada status, query ke database (berguna saat backend baru restart)
        if (currentState.status === 'unknown') {
            const dbDrone = await prisma.drone.findUnique({
                where: { id: droneId },
                select: { status: true }
            });
            
            if (dbDrone && dbDrone.status) {
                currentState.status = dbDrone.status;
            }
        }

        res.status(200).json({ success: true, data: currentState });
    } catch (error) {
        console.error('[dataController] Error getCurrentDroneState:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil state saat ini' });
    }
};