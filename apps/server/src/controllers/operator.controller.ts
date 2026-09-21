import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/http';

export const getMyProfile = asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;

  if (!currentUser) {
    return res.status(401).json({ message: 'Tidak terautentikasi.', data: null });
  }

  return res.status(200).json({
    data: {
      id: currentUser.id,
      firebaseUid: currentUser.firebaseUid,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
      assignedDroneId: currentUser.assignedDroneId ?? null,
    },
  });
});

export const getMyDrone = asyncHandler(async (req, res) => {
  const assignedDroneId = req.currentUser?.assignedDroneId;

  if (!assignedDroneId) {
    return res.status(200).json({
      data: null,
      message: 'Tidak ada drone yang di-assign ke akun ini.',
    });
  }

  const drone = await prisma.drone.findUnique({
    where: { id: assignedDroneId },
    include: {
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!drone) {
    return res.status(404).json({
      data: null,
      message: 'Data drone tidak ditemukan meskipun sudah di-assign.',
    });
  }

  return res.status(200).json({
    data: {
      id: drone.id,
      name: drone.name,
      status: drone.status,
      isApproved: drone.isApproved,
      operator: drone.operator,
      linkFrequency: null,
    },
  });
});