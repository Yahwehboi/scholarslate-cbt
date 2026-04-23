import { Router, type Request, type Response } from "express";
import { like, or, eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listStudentsQuerySchema } from "../validation/auth.schemas.js";
import { ApiError } from "../middleware/error-handler.js";

export const studentsRouter = Router();

// GET /api/students  — admin: list all students with optional search
studentsRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const parsed = listStudentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        parsed.error.issues[0].message,
      );
    }

    const { q, limit, offset } = parsed.data;

    const baseWhere = eq(users.role, "student");

    const rows = await db
      .select({
        id: users.id,
        studentId: users.studentId,
        fullName: users.fullName,
        className: users.className,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        q
          ? or(
              like(users.studentId, `%${q}%`),
              like(users.fullName, `%${q}%`),
              like(users.className, `%${q}%`),
            )
          : baseWhere,
      )
      .limit(limit)
      .offset(offset)
      .all();

    // When filtering by search query, rows may include non-students, so filter
    const students = q
      ? rows.filter((r) => r.studentId !== null)
      : rows;

    res.json({
      success: true,
      data: {
        students,
        total: students.length,
        limit,
        offset,
      },
    });
  },
);
