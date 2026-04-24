import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type UserRole = "student" | "admin" | "super_admin";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || !decoded.sub || !decoded.role) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: String(decoded.sub),
    role: decoded.role as UserRole,
  };
}
