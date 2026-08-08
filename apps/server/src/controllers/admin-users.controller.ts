import { z } from "zod";
import { Prisma, ApprovalStatus, Role } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { AppError, asyncHandler } from "../lib/http";
import { publicUserSelect } from "../services/user.service";

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
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
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
      select: publicUserSelect,
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
    where: { id: req.params.id },
    select: {
      ...publicUserSelect,
      _count: {
        select: {
          news: true,
          ownedSppgs: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return res.status(200).json({ data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const input = updateUserSchema.parse(req.body);

  if (req.currentUser?.id === req.params.id) {
    if (input.role && input.role !== Role.ADMIN) {
      throw new AppError(400, "You cannot remove your own admin role.");
    }

    if (input.status && input.status !== ApprovalStatus.APPROVED) {
      throw new AppError(400, "You cannot change your own admin approval status.");
    }
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: input,
    select: publicUserSelect,
  });

  return res.status(200).json({
    message: "User updated.",
    data: updated,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.currentUser?.id === req.params.id) {
    throw new AppError(400, "You cannot delete your own account from this endpoint.");
  }

  const deleted = await prisma.user.delete({
    where: { id: req.params.id },
    select: publicUserSelect,
  });

  return res.status(200).json({
    message: "User deleted.",
    data: deleted,
  });
});