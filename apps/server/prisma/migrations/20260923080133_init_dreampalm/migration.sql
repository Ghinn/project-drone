-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'FARMER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SysCommand" AS ENUM ('take_picture', 'reboot_os');

-- CreateTable
CREATE TABLE "Drone" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "macAddress" TEXT,
    "linkFrequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'GUEST',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "assignedDroneId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "droneId" TEXT NOT NULL,
    "roll" DOUBLE PRECISION NOT NULL,
    "pitch" DOUBLE PRECISION NOT NULL,
    "yaw" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "groundSpeed" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL,
    "battery" DOUBLE PRECISION NOT NULL,
    "voltage" DOUBLE PRECISION,
    "current" DOUBLE PRECISION,
    "sys_check" JSONB,
    "rc" JSONB,

    CONSTRAINT "TelemetryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionAI" (
    "id" TEXT NOT NULL,
    "snapshotPict" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "band" DOUBLE PRECISION NOT NULL,
    "ndvi" DOUBLE PRECISION NOT NULL,
    "diseaseSeverity" DOUBLE PRECISION NOT NULL,
    "altitudeAI" DOUBLE PRECISION NOT NULL,
    "latitudeAI" DOUBLE PRECISION NOT NULL,
    "longitudeAI" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "droneId" TEXT NOT NULL,

    CONSTRAINT "PredictionAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spray" (
    "id" TEXT NOT NULL,
    "durationSpray" DOUBLE PRECISION NOT NULL,
    "volumeSpray" DOUBLE PRECISION NOT NULL,
    "capacityTank" DOUBLE PRECISION NOT NULL,
    "remainingTank" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "droneId" TEXT NOT NULL,

    CONSTRAINT "Spray_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SysLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "assignedDroneId" TEXT NOT NULL,
    "command" "SysCommand" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SysLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drone_macAddress_key" ON "Drone"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");

-- CreateIndex
CREATE INDEX "TelemetryLog_droneId_timestamp_idx" ON "TelemetryLog"("droneId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "PredictionAI_droneId_timestamp_idx" ON "PredictionAI"("droneId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "Spray_droneId_timestamp_idx" ON "Spray"("droneId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "SysLog_userId_idx" ON "SysLog"("userId");

-- CreateIndex
CREATE INDEX "SysLog_assignedDroneId_timestamp_idx" ON "SysLog"("assignedDroneId", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedDroneId_fkey" FOREIGN KEY ("assignedDroneId") REFERENCES "Drone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetryLog" ADD CONSTRAINT "TelemetryLog_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionAI" ADD CONSTRAINT "PredictionAI_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spray" ADD CONSTRAINT "Spray_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SysLog" ADD CONSTRAINT "SysLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SysLog" ADD CONSTRAINT "SysLog_assignedDroneId_fkey" FOREIGN KEY ("assignedDroneId") REFERENCES "Drone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
