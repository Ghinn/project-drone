import { Router } from "express";
import adminRoutes from "./admin.route";

// Import Controllers (Autentikasi Publik)
import { sessionLogin } from "../controllers/login.controller";
import { registerFarmer } from "../controllers/registration.controller";
import { verifyEmail } from "../controllers/verification.controller";
import { sendResetCode, verifyAndResetPassword } from "../controllers/forgot-password.controller";
import { setupAccountPassword } from "../controllers/setup-password.controller";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "drone-tech-backend",
    timestamp: new Date().toISOString(),
  });
});

// Integrasi route '/admin'
router.use("/admin", adminRoutes);

// Route Autentikasi (Public)
router.post("/auth/session-login", sessionLogin);
router.post("/auth/register", registerFarmer);
router.get("/auth/verify", verifyEmail);
router.post("/auth/forgot-password/send-reset-code", sendResetCode);
router.post("/auth/forgot-password/verify-reset-password", verifyAndResetPassword);
router.post("/auth/setup-password", setupAccountPassword);

export default router;