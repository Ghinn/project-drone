"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.listUsers = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const http_1 = require("../lib/http");
const user_service_1 = require("../services/user.service");
const mailer_1 = require("../lib/mailer");
const firebase_1 = require("../lib/firebase");
const firebase_auth_service_1 = require("../services/firebase-auth.service");
const crypto_1 = __importDefault(require("crypto"));
const listUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().min(1).optional(),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
    status: zod_1.z.nativeEnum(client_1.ApprovalStatus).optional(),
});
const updateUserSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(120).optional(),
    phone: zod_1.z.string().trim().min(6).max(30).nullable().optional(),
    avatarUrl: zod_1.z.string().url().nullable().optional(),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
    status: zod_1.z.nativeEnum(client_1.ApprovalStatus).optional(),
    assignedDroneId: zod_1.z.string().nullable().optional(),
})
    .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
});
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Nama wajib diisi"),
    email: zod_1.z.string().trim().email("Format email tidak valid"),
    role: zod_1.z.nativeEnum(client_1.Role).default(client_1.Role.FARMER),
    status: zod_1.z.nativeEnum(client_1.ApprovalStatus).default(client_1.ApprovalStatus.PENDING),
    assignedDroneId: zod_1.z.string().nullable().optional(),
});
exports.listUsers = (0, http_1.asyncHandler)(async (req, res) => {
    const query = listUsersQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;
    const where = {
        ...(query.role ? { role: query.role } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.search
            ? {
                OR: [
                    { email: { contains: query.search, mode: "insensitive" } },
                    { name: { contains: query.search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [data, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.findMany({
            where,
            select: { ...user_service_1.publicUserSelect, assignedDroneId: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: query.limit,
        }),
        prisma_1.prisma.user.count({ where }),
    ]);
    return res.status(200).json({
        data,
        meta: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    });
});
exports.getUserById = (0, http_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            ...user_service_1.publicUserSelect,
            assignedDroneId: true,
        },
    });
    if (!user) {
        throw new http_1.AppError(404, "User not found.");
    }
    return res.status(200).json({ data: user });
});
exports.updateUser = (0, http_1.asyncHandler)(async (req, res) => {
    const input = updateUserSchema.parse(req.body);
    const userId = req.params.id;
    if (req.currentUser?.id === userId) {
        if (input.role && input.role !== client_1.Role.ADMIN) {
            throw new http_1.AppError(400, "You cannot remove your own admin role.");
        }
        if (input.status && input.status !== client_1.ApprovalStatus.APPROVED) {
            throw new http_1.AppError(400, "You cannot change your own admin approval status.");
        }
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            firebaseUid: true,
            role: true,
            status: true,
            assignedDroneId: true
        },
    });
    if (!existingUser) {
        throw new http_1.AppError(404, "User record not found.");
    }
    // if (input.assignedDroneId !== undefined && input.assignedDroneId !== null) {
    //   const droneTaken = await prisma.user.findUnique({
    //     where: { assignedDroneId: input.assignedDroneId },
    //     select: { id: true, name: true, email: true }
    //   });
    //   if (droneTaken && droneTaken.id !== userId) {
    //     throw new AppError(
    //       400, 
    //       `Drone ini sedang digunakan oleh akun ${droneTaken.name || droneTaken.email}. Harap cabut pengidentifikasi sebelumnya.`
    //     );
    //   }
    // }
    const targetRole = input.role ?? existingUser.role;
    const targetStatus = input.status ?? existingUser.status;
    const targetDrone = input.assignedDroneId !== undefined ? input.assignedDroneId : existingUser.assignedDroneId;
    // Sinkronisasi Perubahan Status dan Firebase Custom Claims (RBAC)
    if (existingUser.firebaseUid) {
        const isDisabled = targetStatus !== client_1.ApprovalStatus.APPROVED;
        try {
            await firebase_1.firebaseAuth.updateUser(existingUser.firebaseUid, {
                disabled: isDisabled,
            });
            if (targetStatus === client_1.ApprovalStatus.APPROVED) {
                await (0, firebase_auth_service_1.setCustomUserRole)(existingUser.firebaseUid, targetRole, targetDrone);
            }
            else {
                await (0, firebase_auth_service_1.revokeUserAccess)(existingUser.firebaseUid);
            }
        }
        catch (error) {
            throw new http_1.AppError(500, "Failed to synchronize RBAC claims with Firebase Auth.");
        }
    }
    const updated = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: input,
        select: { ...user_service_1.publicUserSelect, assignedDroneId: true },
    });
    if (existingUser.assignedDroneId && existingUser.assignedDroneId !== targetDrone) {
        await prisma_1.prisma.drone.update({
            where: { id: existingUser.assignedDroneId },
            data: {
                status: "offline",
                isApproved: false
            }
        });
    }
    if (targetDrone && targetDrone !== existingUser.assignedDroneId) {
        const droneStatus = targetStatus === client_1.ApprovalStatus.APPROVED ? "Waiting Approval" : "Pending Approval";
        await prisma_1.prisma.drone.update({
            where: { id: targetDrone },
            data: {
                status: droneStatus,
                isApproved: false
            }
        });
    }
    return res.status(200).json({
        message: "User updated.",
        data: updated,
    });
});
exports.deleteUser = (0, http_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    if (req.currentUser?.id === req.params.id) {
        throw new http_1.AppError(400, "You cannot delete your own account from this endpoint.");
    }
    const userToDelete = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { firebaseUid: true }
    });
    if (!userToDelete) {
        throw new http_1.AppError(404, "Akun tidak ditemukan di dalam database.");
    }
    if (userToDelete.firebaseUid) {
        try {
            await firebase_1.firebaseAuth.deleteUser(userToDelete.firebaseUid);
        }
        catch (error) {
            if (error.code !== "auth/user-not-found") {
                console.error("Gagal menghapus akun:", error);
                throw new http_1.AppError(500, "Gagal menghapus akun pengguna dari Firebase Auth.");
            }
        }
    }
    // Hapus data akun dari Prisma
    const deleted = await prisma_1.prisma.user.delete({
        where: { id: userId },
        select: user_service_1.publicUserSelect,
    });
    return res.status(200).json({
        message: "User deleted.",
        data: deleted,
    });
});
exports.createUser = (0, http_1.asyncHandler)(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    // Cek duplikasi email di Prisma
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    // if (input.assignedDroneId) {
    //   const droneTaken = await prisma.user.findUnique({
    //     where: { assignedDroneId: input.assignedDroneId },
    //     select: { id: true }
    //   });
    //   if (droneTaken) throw new AppError(400, "Drone ini sudah di-assign ke pengguna lain.");
    // }
    // Registrasi di Firebase Authentication terlebih dahulu
    let firebaseUid = "";
    try {
        const firebaseUser = await firebase_1.firebaseAuth.createUser({
            email: input.email,
            displayName: input.name,
            emailVerified: false,
            disabled: input.status !== client_1.ApprovalStatus.APPROVED,
        });
        firebaseUid = firebaseUser.uid;
    }
    catch (err) {
        if (err.code === "auth/email-already-exists") {
            const existingFbUser = await firebase_1.firebaseAuth.getUserByEmail(input.email);
            firebaseUid = existingFbUser.uid;
        }
        else {
            throw new http_1.AppError(500, "Gagal mendaftarkan akun ke Firebase Auth.");
        }
    }
    // Sinkronkan Custom Claims Role awal
    if (input.status === client_1.ApprovalStatus.APPROVED) {
        await (0, firebase_auth_service_1.setCustomUserRole)(firebaseUid, input.role);
    }
    // HOLD DULU
    // // Geneartor Drone Otomatis (role OPERATOR)
    // let autoGeneratedDroneId = null;
    // // GET seluruh Drone ID yang berawalan "v1-"
    // if (input.role === Role.OPERATOR) {
    //   const existingDrones = await prisma.drone.findMany({
    //     where: { id: { startsWith: "v1-" } },
    //     select: { id: true }
    //   });
    //   // Ekstrak nomor urut dan urutkan dari terkecil ke terbesar
    //   const usedNumbers = existingDrones
    //     .map(drone => {
    //       const match = drone.id.match(/v1-(\d+)/);
    //       return match ? parseInt(match[1], 10) : 0;
    //     })
    //     .filter(n => n > 0)
    //     .sort((a, b) => a - b);
    //   // FIND gap pertama yang tersedia
    //   let nextSequence = 1;
    //   for (const num of usedNumbers) {
    //     if (num === nextSequence) {
    //       nextSequence++;
    //     } else if (num > nextSequence) {
    //       break;
    //     }
    //   }
    //   // Format menjadi 3 digit angka
    //   const seqStr = nextSequence.toString().padStart(3, "0");
    //   autoGeneratedDroneId = `v1-${seqStr}`;
    //   const droneName = `DreamPalm Drone V1-${seqStr}`;
    //   const droneStatus = input.status === ApprovalStatus.APPROVED ? "Waiting Approval" : "Pending Approval";
    //   // Buat entri Drone baru secara otomatis
    //   await prisma.drone.create({
    //     data: {
    //       id: autoGeneratedDroneId,
    //       name: droneName,
    //       status: droneStatus,
    //     }
    //   });
    // }
    // Create Pengguna Baru di Prisma (tanpa password, emailVerified: false)
    console.log("payloaddd: ", input);
    const newUser = await prisma_1.prisma.user.create({
        data: {
            email: input.email,
            name: input.name,
            role: input.role,
            status: input.status,
            emailVerified: false,
            firebaseUid: firebaseUid,
            assignedDroneId: input.assignedDroneId || null,
        },
        select: { ...user_service_1.publicUserSelect, assignedDroneId: true },
    });
    // Generate Token Undangan (berlaku 24 jam)
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma_1.prisma.verificationToken.create({
        data: {
            token,
            expires,
            userId: newUser.id,
        },
    });
    // Panggil utilitas Nodemailer
    try {
        await (0, mailer_1.sendAdminInvitationEmail)(input.email, token, input.name);
    }
    catch (emailError) {
        console.warn("Gagal mengirim email undangan:", emailError);
    }
    return res.status(201).json({
        message: "Pengguna baru berhasil ditambahkan dan disinkronkan ke Firebase Auth.",
        data: newUser,
    });
});
