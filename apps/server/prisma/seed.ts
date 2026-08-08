import "dotenv/config";

import { hash } from "bcryptjs";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { prisma } from "../src/lib/prisma";
import { env } from "../src/config/env";
import { ApprovalStatus, Role } from "../src/generated/prisma";

const SEED_USERS = [
  {
    email: "halo.agrispectra@gmail.com",
    password: "@agrispectra123",
    name: "Super Admin",
    role: Role.ADMIN,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: "ahmadsaiziraden@gmail.com",
    password: "admin123",
    name: "Ahmad Sazira",
    role: Role.OPERATOR,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: "ghiinarania@gmail.com",
    password: "admin123",
    name: "Ghina Rania",
    role: Role.FARMER,
    status: ApprovalStatus.APPROVED,
  },
  {
    email: "dellaarviyanti@gmail.com",
    password: "admin123",
    name: "Della Arviyanti",
    role: Role.FARMER,
    status: ApprovalStatus.APPROVED,
  },
];

const placeholder = (label: string) =>
  `https://placehold.co/1200x800/png?text=${encodeURIComponent(label)}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function firebaseSeedApp() {
  const hasInlineCredentials =
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY;

  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (hasInlineCredentials) {
    return initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID!,
        clientEmail: env.FIREBASE_CLIENT_EMAIL!,
        privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
      projectId: env.FIREBASE_PROJECT_ID!,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    ...(env.FIREBASE_PROJECT_ID ? { projectId: env.FIREBASE_PROJECT_ID } : {}),
  });
}

async function seedUser(userData: typeof SEED_USERS[0]) {
  const passwordHash = await hash(userData.password, 12);

  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: {
      name: userData.name,
      passwordHash,
      role: userData.role,
      status: userData.status,
      emailVerified: true,
    },
    create: {
      email: userData.email,
      name: userData.name,
      passwordHash,
      role: userData.role,
      status: userData.status,
      emailVerified: true,
    },
  });

  return user;
}

async function syncUserToFirebase(userId: string, userData: typeof SEED_USERS[0]) {
  try {
    const app = firebaseSeedApp();
    const auth = getAuth(app);

    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(userData.email);
      firebaseUser = await auth.updateUser(firebaseUser.uid, {
        email: userData.email,
        password: userData.password,
        emailVerified: true,
        displayName: userData.name,
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/user-not-found") {
        throw error;
      }

      firebaseUser = await auth.createUser({
        email: userData.email,
        password: userData.password,
        emailVerified: true,
        displayName: userData.name,
      });
    }

    await auth.setCustomUserClaims(firebaseUser.uid, { role: userData.role });

    // Update Firebase UID kembali ke Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        firebaseUid: firebaseUser.uid,
        emailVerified: true,
      },
    });

    console.info(`Firebase user synced & claim injected: ${userData.email} [${userData.role}]`);
  } catch (error) {
    console.warn(
      `Skipping Firebase Auth sync for ${userData.email}. Prisma seed succeeded, but Firebase credentials/ADC were not available or valid.`,
      error,
    );
  }
}

async function main() {
  console.info("Starting multi-role seed process...\n");

  for (const userData of SEED_USERS) {
    const user = await seedUser(userData);
    await syncUserToFirebase(user.id, userData);
  }

  console.info("\nSeed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });