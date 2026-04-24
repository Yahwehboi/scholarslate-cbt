import crypto from "node:crypto";

/** Hashes a plain-text password using PBKDF2 (SHA-256, 100k iterations). */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

/** Returns true if the plain-text password matches the stored hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha256")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
