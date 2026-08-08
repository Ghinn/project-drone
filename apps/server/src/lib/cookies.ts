import type { CookieOptions } from "express";
import { env } from "../config/env";

export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
export const RECENT_SIGN_IN_WINDOW_MS = 5 * 60 * 1000;

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_MS): CookieOptions {
  const secure = env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none";

  return {
    httpOnly: true,
    secure,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    maxAge,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function getClearSessionCookieOptions(): CookieOptions {
  const { maxAge, ...rest } = getSessionCookieOptions();
  return rest;
}