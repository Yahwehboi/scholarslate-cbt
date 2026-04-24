import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { hashPassword } from "../lib/password.js";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

/**
 * Creates the default admin account on first run if no admin exists.
 * The default password is intentionally weak and logged as a reminder to change it.
 */
export async function seedDefaultAdmin(): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, DEFAULT_ADMIN_USERNAME))
    .get();

  if (existing) return;

  await db.insert(users).values({
    id: randomUUID(),
    username: DEFAULT_ADMIN_USERNAME,
    fullName: "Super Admin",
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    role: "super_admin",
    isActive: true,
  });

  console.warn(
    `[SEED] Default admin created — username: "${DEFAULT_ADMIN_USERNAME}" password: "${DEFAULT_ADMIN_PASSWORD}". Change this password immediately.`,
  );
}
