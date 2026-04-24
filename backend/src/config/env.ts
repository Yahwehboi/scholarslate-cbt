import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const rootEnvPath = path.resolve(process.cwd(), ".env");
const backendEnvPath = path.resolve(process.cwd(), "backend/.env");

if (fs.existsSync(rootEnvPath)) {
  config({ path: rootEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
  config({ path: backendEnvPath });
} else {
  config();
}

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default("0.0.0.0"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().min(1).default("8h"),
  DATABASE_PATH: z.string().min(1).default("./data/scholarslate.db"),
  CORS_ORIGIN: z.string().min(1).default("*"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
