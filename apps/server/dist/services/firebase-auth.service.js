"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCustomUserRole = setCustomUserRole;
exports.revokeUserAccess = revokeUserAccess;
const firebase_1 = require("../lib/firebase");
const http_1 = require("../lib/http");
async function setCustomUserRole(uid, role, droneId = null) {
    try {
        const claims = { role: role };
        if (droneId) {
            claims.assignedDrone = droneId;
        }
        await firebase_1.firebaseAuth.setCustomUserClaims(uid, claims);
        await firebase_1.firebaseAuth.revokeRefreshTokens(uid);
        return true;
    }
    catch (error) {
        throw new http_1.AppError(500, "Gagal mensinkronisasi hak akses pengguna dengan Firebase Auth.");
    }
}
async function revokeUserAccess(uid) {
    try {
        await firebase_1.firebaseAuth.setCustomUserClaims(uid, { role: null, assignedDrone: null });
        await firebase_1.firebaseAuth.revokeRefreshTokens(uid);
        return true;
    }
    catch (error) {
        throw new http_1.AppError(500, "Failed to revoke Firebase User Access.");
    }
}
