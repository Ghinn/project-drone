import type { NextFunction, Request, Response } from "express";
import { ApprovalStatus, Role } from "../generated/prisma";
import { env } from "../config/env";
import { firebaseAuth } from "../lib/firebase";
import { getClearSessionCookieOptions } from "../lib/cookies";
import { findUserByFirebaseIdentity } from "../services/user.service";

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const sessionCookie = req.cookies?.[env.SESSION_COOKIE_NAME];

  if (!sessionCookie) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const decoded = await firebaseAuth.verifySessionCookie(sessionCookie, true);

    const user = await findUserByFirebaseIdentity({
      uid: decoded.uid!,
      email: decoded.email!,
    });

    if (!user) {
      res.clearCookie(env.SESSION_COOKIE_NAME, getClearSessionCookieOptions());
      return res.status(401).json({
        message: "User record not found.",
      });
    }

    req.firebaseToken = decoded;
    req.currentUser = user;

    return next();
  } catch {
    res.clearCookie(env.SESSION_COOKIE_NAME, getClearSessionCookieOptions());
    return res.status(401).json({
      message: "Invalid or expired session.",
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (
    req.currentUser.role !== Role.ADMIN ||
    req.currentUser.status !== ApprovalStatus.APPROVED
  ) {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  return next();
}

export function requireFarmer(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (
    req.currentUser.role !== Role.FARMER ||
    req.currentUser.status !== ApprovalStatus.APPROVED
  ) {
    return res.status(403).json({
      message: "Farmer access required.",
    });
  }

  return next();
}

export function requireOperator(req: Request, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (
    req.currentUser.role !== Role.OPERATOR ||
    req.currentUser.status !== ApprovalStatus.APPROVED
  ) {
    return res.status(403).json({
      message: "Operator access required.",
    });
  }

  return next();
}