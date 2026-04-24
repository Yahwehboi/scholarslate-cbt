import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { ApiError } from "../middleware/error-handler.js";
import { writeAuditLog } from "../lib/audit.js";
import { signAccessToken } from "../lib/jwt.js";
import { verifyPassword } from "../lib/password.js";
import {
  adminLoginSchema,
  studentLoginSchema,
} from "../validation/auth.schemas.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// POST /api/auth/login  — student login by student ID (no password)
authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = studentLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const normalised = parsed.data.studentId.trim().toUpperCase();

  const student = await db
    .select()
    .from(users)
    .where(eq(users.studentId, normalised))
    .get();

  if (!student || !student.isActive) {
    throw new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "Student ID not found. Contact your school administrator to get registered.",
    );
  }

  const token = signAccessToken({ sub: student.id, role: "student" });

  await writeAuditLog({
    userId: student.id,
    action: "student_login",
    resourceType: "user",
    resourceId: student.id,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        className: student.className,
        role: student.role,
      },
    },
  });
});

// POST /api/auth/admin-login  — admin login with username + password
authRouter.post("/admin-login", async (req: Request, res: Response) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
  }

  const { username, password } = parsed.data;

  const admin = await db
    .select()
    .from(users)
    .where(eq(users.username, username.trim().toLowerCase()))
    .get();

  if (
    !admin ||
    !admin.isActive ||
    (admin.role !== "admin" && admin.role !== "super_admin")
  ) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid admin credentials.");
  }

  if (!admin.passwordHash || !verifyPassword(password, admin.passwordHash)) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid admin credentials.");
  }

  const token = signAccessToken({
    sub: admin.id,
    role: admin.role as "admin" | "super_admin",
  });

  await writeAuditLog({
    userId: admin.id,
    action: "admin_login",
    resourceType: "user",
    resourceId: admin.id,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    },
  });
});

// GET /api/auth/me  — return current session user from token
authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, req.auth!.userId))
    .get();

  if (!user || !user.isActive) {
    throw new ApiError(401, "UNAUTHORIZED", "Session is no longer valid.");
  }

  const base = {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
  };

  if (user.role === "student") {
    res.json({
      success: true,
      data: {
        ...base,
        studentId: user.studentId,
        className: user.className,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      ...base,
      username: user.username,
    },
  });
});

// POST /api/auth/logout  — stateless: client discards token; we log the event
authRouter.post("/logout", requireAuth, async (req: Request, res: Response) => {
  await writeAuditLog({
    userId: req.auth!.userId,
    action: "logout",
    resourceType: "user",
    resourceId: req.auth!.userId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.json({ success: true, data: { message: "Logged out successfully." } });
});
