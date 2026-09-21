"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPreviewSelect = exports.publicUserSelect = void 0;
exports.findUserByFirebaseIdentity = findUserByFirebaseIdentity;
exports.upsertUserFromDecodedToken = upsertUserFromDecodedToken;
exports.serializeUser = serializeUser;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const http_1 = require("../lib/http");
exports.publicUserSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    emailVerified: true,
    role: true,
    status: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
};
exports.userPreviewSelect = {
    id: true,
    email: true,
    name: true,
    emailVerified: true,
    role: true,
    status: true,
};
function normalizeEmail(email) {
    return email?.trim().toLowerCase() ?? null;
}
async function findUserByFirebaseIdentity(identity) {
    const email = normalizeEmail(identity.email);
    const orClauses = [{ firebaseUid: identity.uid }];
    if (email) {
        orClauses.push({ email });
    }
    return prisma_1.prisma.user.findFirst({
        where: {
            OR: orClauses,
        },
    });
}
async function upsertUserFromDecodedToken(decoded) {
    const email = normalizeEmail(decoded.email);
    if (!email) {
        throw new http_1.AppError(400, "Firebase ID token must include an email address.");
    }
    const existing = await findUserByFirebaseIdentity({
        uid: decoded.uid,
        email,
    });
    const sharedData = {
        firebaseUid: decoded.uid,
        email,
        name: decoded.name ?? existing?.name ?? null,
        avatarUrl: decoded.picture ?? existing?.avatarUrl ?? null,
        emailVerified: decoded.email_verified === true,
        lastLoginAt: new Date(),
    };
    if (existing) {
        return prisma_1.prisma.user.update({
            where: { id: existing.id },
            data: sharedData,
        });
    }
    return prisma_1.prisma.user.create({
        data: {
            ...sharedData,
            role: client_1.Role.FARMER,
            status: client_1.ApprovalStatus.PENDING,
        },
    });
}
function serializeUser(user) {
    const { passwordHash, firebaseUid, ...safeUser } = user;
    return safeUser;
}
