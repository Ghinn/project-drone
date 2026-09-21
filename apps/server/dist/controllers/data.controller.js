"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamTelemetrySSE = exports.getDataStats = exports.getDataLogs = exports.getDashboardData = void 0;
const prisma_1 = require("../lib/prisma");
const sse_service_1 = require("../services/sse.service");
const getDashboardData = async (req, res) => {
    try {
        const latestData = await prisma_1.prisma.telemetryLog.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        res.status(200).json({ success: true, data: latestData });
    }
    catch (error) {
        console.error('[dataController] Error getDashboardData:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil dashboard data' });
    }
};
exports.getDashboardData = getDashboardData;
const getDataLogs = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const historyData = await prisma_1.prisma.telemetryLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit
        });
        res.status(200).json({ success: true, data: historyData });
    }
    catch (error) {
        console.error('[dataController] Error getDataLogs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat data' });
    }
};
exports.getDataLogs = getDataLogs;
const getDataStats = async (req, res) => {
    try {
        const aggregations = await prisma_1.prisma.telemetryLog.aggregate({
            _avg: { altitude: true, battery: true, groundSpeed: true },
            _max: { altitude: true, groundSpeed: true },
            _min: { battery: true },
            _count: { id: true }
        });
        res.status(200).json({ success: true, data: aggregations });
    }
    catch (error) {
        console.error('[Controller] Error getDataStats:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan analisis statistik' });
    }
};
exports.getDataStats = getDataStats;
const streamTelemetrySSE = (req, res) => {
    // Teruskan request dan response langsung ke service SSE
    (0, sse_service_1.addClient)(req, res);
};
exports.streamTelemetrySSE = streamTelemetrySSE;
