import { Router } from "express";
// import sensorRoutes from './data.routes';
import { sessionLogin } from "../controllers/login.controller";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/admin-users.controller";

import { requireAdmin, requireSession } from "../middleware/login.middleware";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "drone-tech-backend",
    timestamp: new Date().toISOString(),
  });
});

// router.use('/data', dataRoutes);

// Route Autentikasi
router.post("/auth/session-login", sessionLogin);

// Middleware proteksi untuk semua route '/admin'
router.use("/admin", requireSession, requireAdmin);

// Role Admin (CRUD Uses)
router.get("/admin/users", listUsers);
router.get("/admin/users/:id", getUserById);
router.patch("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUser);

// Role Admin (Chat Guest, Farmer, dan Operator)
// router.get("/admin/chats", getChatHistory); 
// router.post("/admin/chats/send", sendMessage);

export default router;