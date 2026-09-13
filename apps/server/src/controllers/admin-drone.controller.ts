import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError, asyncHandler } from "../lib/http";

const updateDroneSchema = z.object({
  name: z.string().trim().min(1, "Nama perangkat tidak boleh kosong").optional(),
  isApproved: z.boolean().optional(),
});

export const listDrones = asyncHandler(async (req, res) => {
  const drones = await prisma.drone.findMany({
    include: {
      operator: {
        select: { 
          id: true, 
          name: true, 
          email: true,
          status: true,
          emailVerified: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    data: drones,
  });
});

export const updateDrone = asyncHandler(async (req, res) => {
  const droneId = req.params.id as string;
  const input = updateDroneSchema.parse(req.body);

  const existingDrone = await prisma.drone.findUnique({
    where: { id: droneId }
  });

  if (!existingDrone) {
    throw new AppError(404, "Data drone tidak ditemukan.");
  }

  const updatedDrone = await prisma.drone.update({
    where: { id: droneId },
    data: { 
      name: input.name,
      isApproved: input.isApproved
    },
  });

  return res.status(200).json({
    success: true,
    message: "Data drone berhasil diperbarui.",
    data: updatedDrone,
  });
});

export const deleteDrone = asyncHandler(async (req, res) => {
  const droneId = req.params.id as string;

  const existingDrone = await prisma.drone.findUnique({
    where: { id: droneId },
    include: { operator: true }
  });

  if (!existingDrone) {
    throw new AppError(404, "Data drone tidak ditemukan.");
  }

  if (existingDrone.operator) {
    throw new AppError(
      400, 
      `Drone tidak dapat dihapus karena masih di-assign ke pengguna ${existingDrone.operator.name}. Cabut assign terlebih dahulu di User Management.`
    );
  }

  await prisma.drone.delete({
    where: { id: droneId }
  });

  return res.status(200).json({
    success: true,
    message: "Data drone berhasil dihapus dari sistem."
  });
});