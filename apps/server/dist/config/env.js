"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    CLIENT_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    SESSION_COOKIE_NAME: zod_1.z.string().default("session"),
    COOKIE_SAME_SITE: zod_1.z.enum(["lax", "strict", "none"]).default("lax"),
    COOKIE_DOMAIN: zod_1.z.string().optional(),
    FIREBASE_PROJECT_ID: zod_1.z.string().optional(),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const details = Object.entries(parsed.error.flatten().fieldErrors)
        .map(([field, errors]) => `${field}: ${(errors ?? []).join(", ")}`)
        .join("; ");
    throw new Error(`Invalid environment variables. ${details}`);
}
exports.env = parsed.data;
