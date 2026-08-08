import type { DecodedIdToken } from "firebase-admin/auth";
import { Prisma, ApprovalStatus, Role } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/http";

export const publicUserSelect = {
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
} satisfies Prisma.UserSelect;

export const userPreviewSelect = {
  id: true,
  email: true,
  name: true,
  emailVerified: true,
  role: true,
  status: true,
} satisfies Prisma.UserSelect;

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

export async function findUserByFirebaseIdentity(identity: {
  uid: string;
  email?: string | null;
}): Promise<User | null> {
  const email = normalizeEmail(identity.email);

  const orClauses: Prisma.UserWhereInput[] = [{ firebaseUid: identity.uid }];
  if (email) {
    orClauses.push({ email });
  }

  return prisma.user.findFirst({
    where: {
      OR: orClauses,
    },
  });
}

export async function upsertUserFromDecodedToken(decoded: DecodedIdToken): Promise<User> {
  const email = normalizeEmail(decoded.email);

  if (!email) {
    throw new AppError(400, "Firebase ID token must include an email address.");
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
    return prisma.user.update({
      where: { id: existing.id },
      data: sharedData,
    });
  }

  return prisma.user.create({
    data: {
      ...sharedData,
      role: Role.PENGUSAHA,
      status: ApprovalStatus.PENDING,
    },
  });
}

export function serializeUser(user: User): Omit<User, "passwordHash" | "firebaseUid"> {
  const { passwordHash, firebaseUid, ...safeUser } = user;
  return safeUser;
}