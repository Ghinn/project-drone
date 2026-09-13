import { z } from "zod";
import { Prisma, ApprovalStatus, Role } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { AppError, asyncHandler } from "../lib/http";
import { publicUserSelect } from "../services/user.service";
import { sendAdminInvitationEmail } from "../lib/mailer";
import { firebaseAuth } from "../lib/firebase";
import { setCustomUserRole, revokeUserAccess } from "../services/firebase-auth.service";
import crypto from 'crypto';

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(ApprovalStatus).optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().min(6).max(30).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(ApprovalStatus).optional(),
    assignedDroneId: z.string().nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
  });

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().trim().email("Format email tidak valid"),
  role: z.nativeEnum(Role).default(Role.FARMER),
  status: z.nativeEnum(ApprovalStatus).default(ApprovalStatus.PENDING), 
  assignedDroneId: z.string().nullable().optional(),
});

export const listUsers = asyncHandler(async (req, res) => {
  const query = listUsersQuerySchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.UserWhereInput = {
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

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { ...publicUserSelect, assignedDroneId: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.user.count({ where }),
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

export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id as string },
    select: {
      ...publicUserSelect,
      assignedDroneId: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return res.status(200).json({ data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const input = updateUserSchema.parse(req.body);
  const userId = req.params.id as string;

  if (req.currentUser?.id === userId) {
    if (input.role && input.role !== Role.ADMIN) {
      throw new AppError(400, "You cannot remove your own admin role.");
    }

    if (input.status && input.status !== ApprovalStatus.APPROVED) {
      throw new AppError(400, "You cannot change your own admin approval status.");
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firebaseUid: true,
      role: true,
      status: true,
      assignedDroneId: true  },
  });

  if (!existingUser) {
    throw new AppError(404, "User record not found.");
  }

  if (input.assignedDroneId !== undefined && input.assignedDroneId !== null) {
    const droneTaken = await prisma.user.findUnique({
      where: { assignedDroneId: input.assignedDroneId },
      select: { id: true, name: true, email: true }
    });

    if (droneTaken && droneTaken.id !== userId) {
      throw new AppError(
        400, 
        `Drone ini sedang digunakan oleh akun ${droneTaken.name || droneTaken.email}. Harap cabut pengidentifikasi sebelumnya.`
      );
    }
  }

  const targetRole = input.role ?? existingUser.role;
  const targetStatus = input.status ?? existingUser.status;
  const targetDrone = input.assignedDroneId !== undefined ? input.assignedDroneId : existingUser.assignedDroneId;

  // Sinkronisasi Perubahan Status dan Firebase Custom Claims (RBAC)
  if (existingUser.firebaseUid) {
    const isDisabled = targetStatus !== ApprovalStatus.APPROVED;
    
    try {
      await firebaseAuth.updateUser(existingUser.firebaseUid, {
        disabled: isDisabled,
      });

      if (targetStatus === ApprovalStatus.APPROVED) {
        await setCustomUserRole(existingUser.firebaseUid, targetRole, targetDrone);
      } else {
        await revokeUserAccess(existingUser.firebaseUid);
      }
    } catch (error: any) {
      throw new AppError(500, "Failed to synchronize RBAC claims with Firebase Auth.");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: { ...publicUserSelect, assignedDroneId: true },
  });

  if (existingUser.assignedDroneId && existingUser.assignedDroneId !== targetDrone) {
    await prisma.drone.update({
      where: { id: existingUser.assignedDroneId },
      data: { 
        status: "offline", 
        isApproved: false
      } 
    });
  }

  if (targetDrone && targetDrone !== existingUser.assignedDroneId) {
    const droneStatus = targetStatus === ApprovalStatus.APPROVED ? "Waiting Approval" : "Pending Approval";
    await prisma.drone.update({
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

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id as string;

  if (req.currentUser?.id === req.params.id) {
    throw new AppError(400, "You cannot delete your own account from this endpoint.");
  }

  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
    select: { firebaseUid: true }
  });

  if (!userToDelete) {
    throw new AppError(404, "Akun tidak ditemukan di dalam database.");
  }

  if (userToDelete.firebaseUid) {
    try {
      await firebaseAuth.deleteUser(userToDelete.firebaseUid);
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        console.error("Gagal menghapus akun:", error);
        throw new AppError(500, "Gagal menghapus akun pengguna dari Firebase Auth.");
      }
    }
  }

  // Hapus data akun dari Prisma
  const deleted = await prisma.user.delete({
    where: { id: userId },
    select: publicUserSelect,
  });

  return res.status(200).json({
    message: "User deleted.",
    data: deleted,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const input = createUserSchema.parse(req.body);

  // Cek duplikasi email di Prisma
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (input.assignedDroneId) {
    const droneTaken = await prisma.user.findUnique({
      where: { assignedDroneId: input.assignedDroneId },
      select: { id: true }
    });
    if (droneTaken) throw new AppError(400, "Drone ini sudah di-assign ke pengguna lain.");
  }

  // Registrasi di Firebase Authentication terlebih dahulu
  let firebaseUid = "";
  try {
    const firebaseUser = await firebaseAuth.createUser({
      email: input.email,
      displayName: input.name,
      emailVerified: false,
      disabled: input.status !== ApprovalStatus.APPROVED,
    });
    firebaseUid = firebaseUser.uid;
  } catch (err: any) {
    if (err.code === "auth/email-already-exists") {
      const existingFbUser = await firebaseAuth.getUserByEmail(input.email);
      firebaseUid = existingFbUser.uid;
    } else {
      throw new AppError(500, "Gagal mendaftarkan akun ke Firebase Auth.");
    }
  }

  // Sinkronkan Custom Claims Role awal
  if (input.status === ApprovalStatus.APPROVED) {
    await setCustomUserRole(firebaseUid, input.role);
  }

  // Geneartor Drone Otomatis (role OPERATOR)
  let autoGeneratedDroneId = null;

  // GET seluruh Drone ID yang berawalan "v1-"
  if (input.role === Role.OPERATOR) {
    const existingDrones = await prisma.drone.findMany({
      where: { id: { startsWith: "v1-" } },
      select: { id: true }
    });

    // Ekstrak nomor urut dan urutkan dari terkecil ke terbesar
    const usedNumbers = existingDrones
      .map(drone => {
        const match = drone.id.match(/v1-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0)
      .sort((a, b) => a - b);

    // FIND gap pertama yang tersedia
    let nextSequence = 1;
    for (const num of usedNumbers) {
      if (num === nextSequence) {
        nextSequence++;
      } else if (num > nextSequence) {
        break;
      }
    }

    // Format menjadi 3 digit angka
    const seqStr = nextSequence.toString().padStart(3, "0");
    autoGeneratedDroneId = `v1-${seqStr}`;
    const droneName = `DreamPalm Drone V1-${seqStr}`;
    const droneStatus = input.status === ApprovalStatus.APPROVED ? "Waiting Approval" : "Pending Approval";

    // Buat entri Drone baru secara otomatis
    await prisma.drone.create({
      data: {
        id: autoGeneratedDroneId,
        name: droneName,
        status: droneStatus,
      }
    });
  }

  // Create Pengguna Baru di Prisma (tanpa password, emailVerified: false)
  const newUser = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      status: input.status,
      emailVerified: false,
      firebaseUid: firebaseUid,
      assignedDroneId: autoGeneratedDroneId,
    },
    select: { ...publicUserSelect, assignedDroneId: true },
  });

  // Generate Token Undangan (berlaku 24 jam)
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      token,
      expires,
      userId: newUser.id,
    },
  });

  // Panggil utilitas Nodemailer
  try {
    await sendAdminInvitationEmail(input.email, token, input.name);
  } catch (emailError) {
    console.warn("Gagal mengirim email undangan:", emailError);
  }

  return res.status(201).json({
    message: "Pengguna baru berhasil ditambahkan dan disinkronkan ke Firebase Auth.",
    data: newUser,
  });
});