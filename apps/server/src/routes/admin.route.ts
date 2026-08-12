import { Router } from "express";

// Import Controllers (Autentikasi Publik)
import { sessionLogin } from "../controllers/login.controller";
import { registerFarmer } from "../controllers/registration.controller";
import { verifyEmail } from "../controllers/verification.controller";
import { sendResetCode, verifyAndResetPassword } from "../controllers/forgot-password.controller";
import { setupAccountPassword } from "../controllers/setup-password.controller";

// Import Controllers (Sistem RBAC)
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/admin-users.controller";

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

// Route Autentikasi (Public)
router.post("/auth/session-login", sessionLogin);
router.post("/auth/register", registerFarmer);
router.get("/auth/verify", verifyEmail);
router.post("/auth/forgot-password/send-reset-code", sendResetCode);
router.post("/auth/forgot-password/verify-reset-password", verifyAndResetPassword);
router.post("/auth/setup-password", setupAccountPassword);

// Route Role Admin (Protected)
router.use("/admin", requireSession, requireAdmin);

// Data Fetching Endpoint untuk Halaman Admin
router.get('/admin/dashboard', getOverviewData);
router.get('/admin/user-management', listUsers);
router.get('/admin/system-logs', getSystemLogsData);
router.get('/admin/settings', getSettingsData);

// CRUD Specific User Operations
router.get("/admin/users", listUsers);
router.post("/admin/users", createUser);
router.get("/admin/users/:id", getUserById);
router.patch("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUser);

export default router;