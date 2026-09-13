import { firebaseAuth } from "../lib/firebase";
import { Role } from "../generated/prisma";
import { AppError } from "../lib/http";

export async function setCustomUserRole(uid: string, role: Role, droneId: string | null = null) {
  try {
    const claims: any = { role: role };
    if (droneId) {
      claims.assignedDrone = droneId;
    }

    await firebaseAuth.setCustomUserClaims(uid, claims);
    await firebaseAuth.revokeRefreshTokens(uid);
    
    return true;
  } catch (error) {
    throw new AppError(500, "Gagal mensinkronisasi hak akses pengguna dengan Firebase Auth.");
  }
}

export async function revokeUserAccess(uid: string) {
  try {
    await firebaseAuth.setCustomUserClaims(uid, { role: null, assignedDrone: null });
    await firebaseAuth.revokeRefreshTokens(uid);
    return true;
    
  } catch (error) {
    throw new AppError(500, "Failed to revoke Firebase User Access.");
  }
}