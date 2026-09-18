"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECENT_SIGN_IN_WINDOW_MS = exports.SESSION_MAX_AGE_MS = void 0;
exports.getSessionCookieOptions = getSessionCookieOptions;
exports.getClearSessionCookieOptions = getClearSessionCookieOptions;
const env_1 = require("../config/env");
exports.SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // Kedaluwarsa 5 hari
exports.RECENT_SIGN_IN_WINDOW_MS = 5 * 60 * 1000; // Kedaluwarsa 5 jam
// Development Phase
function getSessionCookieOptions(maxAge = exports.SESSION_MAX_AGE_MS) {
    const isProduction = env_1.env.NODE_ENV === "production";
    const secure = isProduction;
    const sameSite = isProduction ? env_1.env.COOKIE_SAME_SITE : "lax";
    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge,
        ...(isProduction && env_1.env.COOKIE_DOMAIN ? { domain: env_1.env.COOKIE_DOMAIN } : {}),
    };
}
function getClearSessionCookieOptions() {
    const { maxAge, ...rest } = getSessionCookieOptions();
    return rest;
}
// Production Phase
// export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_MS): CookieOptions {
//   const secure = env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none";
//   return {
//     httpOnly: true,
//     secure,
//     sameSite: env.COOKIE_SAME_SITE,
//     path: "/",
//     maxAge,
//     ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
//   };
// }
