import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Sesuaikan jalur jika diperlukan

// 1. Endpoint Dashboard (Mengambil 1 data paling terbaru untuk real-time display)
export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const latestData = await prisma.akuisisiData.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        
        res.status(200).json({ success: true, data: latestData });
    } catch (error) {
        console.error('[Controller] Error getDashboardData:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard' });
    }
};

// 2. Endpoint Histori (Mengambil banyak data dengan batasan jumlah tertentu)
export const getHistoriData = async (req: Request, res: Response) => {
    try {
        // Secara default mengambil 100 data terbaru, bisa diubah melalui query parameter (?limit=50)
        const limit = Number(req.query.limit) || 100;
        
        const historyData = await prisma.akuisisiData.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit
        });
        
        res.status(200).json({ success: true, data: historyData });
    } catch (error) {
        console.error('[Controller] Error getHistoriData:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data histori' });
    }
};

// 3. Endpoint Analisis (Menghitung rata-rata, nilai tertinggi, dan terendah)
export const getAnalisisData = async (req: Request, res: Response) => {
    try {
        const aggregations = await prisma.akuisisiData.aggregate({
            _avg: { nh3: true, h2s: true, temperature: true, humidity: true },
            _max: { nh3: true, h2s: true, temperature: true, humidity: true },
            _min: { nh3: true, h2s: true, temperature: true, humidity: true },
            _count: { id: true }
        });
        
        res.status(200).json({ success: true, data: aggregations });
    } catch (error) {
        console.error('[Controller] Error getAnalisisData:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan analisis data' });
    }
};