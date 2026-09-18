"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_route_1 = __importDefault(require("./admin.route"));
// Import Controllers (Autentikasi Publik)
const login_controller_1 = require("../controllers/login.controller");
const registration_controller_1 = require("../controllers/registration.controller");
const verification_controller_1 = require("../controllers/verification.controller");
const forgot_password_controller_1 = require("../controllers/forgot-password.controller");
const setup_password_controller_1 = require("../controllers/setup-password.controller");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "drone-tech-backend",
        timestamp: new Date().toISOString(),
    });
});
// Integrasi route '/admin'
router.use("/admin", admin_route_1.default);
// Route Autentikasi (Public)
router.post("/auth/session-login", login_controller_1.sessionLogin);
router.post("/auth/register", registration_controller_1.registerFarmer);
router.get("/auth/verify", verification_controller_1.verifyEmail);
router.post("/auth/forgot-password/send-reset-code", forgot_password_controller_1.sendResetCode);
router.post("/auth/forgot-password/verify-reset-password", forgot_password_controller_1.verifyAndResetPassword);
router.post("/auth/setup-password", setup_password_controller_1.setupAccountPassword);
exports.default = router;
