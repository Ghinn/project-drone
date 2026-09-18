"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import Controllers Farmer
const monitoringFarmer_controller_1 = require("../controllers/monitoringFarmer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Route Role Farmer (Protected)
router.use(auth_middleware_1.requireSession, auth_middleware_1.requireFarmer);
// Data Fetching Endpoint untuk Halaman Farmer
router.get('/dashboard', monitoringFarmer_controller_1.getFarmerDashboard);
router.get('/fields-map', monitoringFarmer_controller_1.getFarmerFields);
router.get('/reports', monitoringFarmer_controller_1.getFarmerReports);
router.get('/settings', monitoringFarmer_controller_1.getFarmerSettings);
exports.default = router;
