"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsData = exports.getLiveCameraData = exports.getAnalisisData = exports.getHistoriData = exports.getDashboardData = void 0;
const getDashboardData = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Data Dashboard berhasil diambil",
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};
exports.getDashboardData = getDashboardData;
const getHistoriData = async (req, res) => {
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
exports.getHistoriData = getHistoriData;
const getAnalisisData = async (req, res) => {
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
exports.getAnalisisData = getAnalisisData;
const getLiveCameraData = async (req, res) => {
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
exports.getLiveCameraData = getLiveCameraData;
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
