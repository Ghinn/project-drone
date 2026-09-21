"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import Controllers (Sistem RBAC)
const admin_users_controller_1 = require("../controllers/admin-users.controller");
// Import Controllers (Drone Management)
const admin_drone_controller_1 = require("../controllers/admin-drone.controller");
// Import Controllers (Admin)
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "drone-tech-backend",
        timestamp: new Date().toISOString(),
    });
});
// Middleware proteksi untuk semua route '/api/admin'
router.use(auth_middleware_1.requireSession, auth_middleware_1.requireAdmin);
// Data Fetching Endpoint untuk Halaman Admin
router.get('/overview', admin_controller_1.getOverviewData);
router.get('/user-management', admin_users_controller_1.listUsers);
router.get('/drones-management', admin_drone_controller_1.listDrones);
router.get('/logs', admin_controller_1.getSystemLogsData);
router.get('/settings', admin_controller_1.getSettingsData);
// CRUD Specific User Operations
router.get("/users", admin_users_controller_1.listUsers);
router.post("/users", admin_users_controller_1.createUser);
router.get("/users/:id", admin_users_controller_1.getUserById);
router.patch("/users/:id", admin_users_controller_1.updateUser);
router.delete("/users/:id", admin_users_controller_1.deleteUser);
// CRUD Specific Drone Operations
router.get("/drones", admin_drone_controller_1.listDrones);
router.post("/drones", admin_drone_controller_1.createDrone);
router.patch("/drones/:id", admin_drone_controller_1.updateDrone);
router.delete("/drones/:id", admin_drone_controller_1.deleteDrone);
exports.default = router;
