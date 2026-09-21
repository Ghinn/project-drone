"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFarmer = exports.requireOperator = exports.requireAdmin = void 0;
exports.requireSession = requireSession;
exports.requireRole = requireRole;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const firebase_1 = require("../lib/firebase");
const cookies_1 = require("../lib/cookies");
const user_service_1 = require("../services/user.service");
async function requireSession(req, res, next) {
    const sessionCookie = req.cookies?.[env_1.env.SESSION_COOKIE_NAME];
    if (!sessionCookie) {
        return res.status(401).json({
            message: "Authentication required.",
        });
    }
    try {
        const decoded = await firebase_1.firebaseAuth.verifySessionCookie(sessionCookie, true);
        const user = await (0, user_service_1.findUserByFirebaseIdentity)({
            uid: decoded.uid,
            email: decoded.email,
        });
        if (!user) {
            res.clearCookie(env_1.env.SESSION_COOKIE_NAME, (0, cookies_1.getClearSessionCookieOptions)());
            return res.status(401).json({
                message: "User record not found.",
            });
        }
        req.firebaseToken = decoded;
        req.currentUser = user;
        return next();
    }
    catch {
        res.clearCookie(env_1.env.SESSION_COOKIE_NAME, (0, cookies_1.getClearSessionCookieOptions)());
        return res.status(401).json({
            message: "Invalid or expired session.",
        });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.currentUser) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }
        if (req.currentUser.status !== client_1.ApprovalStatus.APPROVED) {
            return res.status(403).json({
                message: "Account not approved by admin."
            });
        }
        if (!allowedRoles.includes(req.currentUser.role)) {
            return res.status(403).json({
                message: `Access denied. Required roles: ${allowedRoles.join(", ")}`
            });
        }
        return next();
    };
}
exports.requireAdmin = requireRole([client_1.Role.ADMIN]);
exports.requireOperator = requireRole([client_1.Role.OPERATOR, client_1.Role.ADMIN]);
exports.requireFarmer = requireRole([client_1.Role.FARMER, client_1.Role.ADMIN]);
