"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsData = exports.getSystemLogsData = exports.getOverviewData = void 0;
const getOverviewData = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Data Overview berhasil diambil",
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};
exports.getOverviewData = getOverviewData;
const getSystemLogsData = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Data System Logs berhasil diambil",
            data: []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};
exports.getSystemLogsData = getSystemLogsData;
const getSettingsData = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Data Settings berhasil diambil",
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};
exports.getSettingsData = getSettingsData;
