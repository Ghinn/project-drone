import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),

  SESSION_COOKIE_NAME: z.string().default("session"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().optional(),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = Object.entries(parsed.error.flatten().fieldErrors)
    .map(([field, errors]) => `${field}: ${(errors ?? []).join(", ")}`)
    .join("; ");

  throw new Error(`Invalid environment variables. ${details}`);
}

export const env = parsed.data;