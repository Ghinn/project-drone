"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import Controllers Operator
const monitoringOperator_controller_1 = require("../controllers/monitoringOperator.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Route Role Operator (Protected)
router.use(auth_middleware_1.requireSession, auth_middleware_1.requireOperator);
// Data Fetching Endpoint untuk Halaman Operator
router.get('/dashboard', monitoringOperator_controller_1.getDashboardData);
router.get('/live-camera', monitoringOperator_controller_1.getLiveCameraData);
router.get('/ai-prediction-log', monitoringOperator_controller_1.getAnalisisData);
router.get('/history', monitoringOperator_controller_1.getHistoriData);
router.get('/settings', monitoringOperator_controller_1.getSettingsData);
exports.default = router;
