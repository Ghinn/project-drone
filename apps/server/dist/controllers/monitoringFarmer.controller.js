"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFarmerSettings = exports.getFarmerReports = exports.getFarmerFields = exports.getFarmerDashboard = void 0;
const getFarmerDashboard = async (req, res) => {
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
exports.getFarmerDashboard = getFarmerDashboard;
const getFarmerFields = async (req, res) => {
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
exports.getFarmerFields = getFarmerFields;
const getFarmerReports = async (req, res) => {
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
exports.getFarmerReports = getFarmerReports;
const getFarmerSettings = async (req, res) => {
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
exports.getFarmerSettings = getFarmerSettings;
