"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_controller_1 = require("../controllers/data.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireSession);
// Mendefinisikan endpoint untuk masing-masing halaman frontend
router.get('/dashboard', data_controller_1.getDashboardData);
router.get('/histori', data_controller_1.getDataLogs);
router.get('/analisis', data_controller_1.getDataStats);
// Endpoint baru untuk dikonsumsi Next.js EventSource
router.get('/stream', data_controller_1.streamTelemetrySSE);
exports.default = router;
