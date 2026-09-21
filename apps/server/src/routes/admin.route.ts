import { Router } from "express";

// Import Controllers (Sistem RBAC)
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/admin-users.controller";

// Import Controllers (Drone Management)
import {
  listDrones,
  updateDrone,
  deleteDrone,
  createDrone,
  getDroneById,
} from "../controllers/admin-drone.controller";

// Import Controllers (Admin)
import {
  getOverviewData,
  getSystemLogsData,
  getSettingsData
} from "../controllers/admin.controller";

import { requireAdmin, requireSession } from "../middleware/auth.middleware";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "drone-tech-backend",
    timestamp: new Date().toISOString(),
  });
});

// Middleware proteksi untuk semua route '/api/admin'
router.use(requireSession, requireAdmin);

// Data Fetching Endpoint untuk Halaman Admin
router.get('/overview', getOverviewData);
router.get('/user-management', listUsers);
router.get('/drones-management', listDrones);
router.get('/logs', getSystemLogsData);
router.get('/settings', getSettingsData);

// CRUD Specific User Operations
router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// CRUD Specific Drone Operations
router.get("/drones", listDrones);
router.post("/drones", createDrone);
router.get("/drones/:id", getDroneById); 
router.patch("/drones/:id", updateDrone);
router.delete("/drones/:id", deleteDrone);

export default router;