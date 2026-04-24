import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type UserRole } from "../lib/jwt.js";

function unauthorized(res: Response, message = "Unauthorized") {
  return res.status(401).json({
    success: false,
    error: {
      code: "UNAUTHORIZED",
      message,
    },
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    unauthorized(res);
    return;
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    unauthorized(res, "Invalid or expired token");
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      unauthorized(res);
      return;
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });
      return;
    }

    next();
  };
}
