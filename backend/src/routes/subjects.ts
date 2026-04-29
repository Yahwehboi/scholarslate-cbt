import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { subjects } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ApiError } from "../middleware/error-handler.js";
import { writeAuditLog } from "../lib/audit.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validation/subjects.schemas.js";

export const subjectsRouter = Router();

// GET /api/subjects — all subjects (any authenticated user)
subjectsRouter.get("/", requireAuth, async (_req: Request, res: Response) => {
  const all = await db.select().from(subjects).all();
  res.json({ success: true, data: { subjects: all } });
});

// POST /api/subjects — create a subject (admin+)
subjectsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const parsed = createSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { name, code, iconKey, iconBg, active, timeLimit, maxAttempts, description, credits } =
      parsed.data;

    // Ensure code is unique
    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.code, code.toUpperCase()))
      .get();
    if (existing) {
      throw new ApiError(409, "DUPLICATE_CODE", `A subject with code "${code}" already exists.`);
    }

    const result = await db
      .insert(subjects)
      .values({
        name,
        code: code.toUpperCase(),
        iconKey,
        iconBg,
        active,
        timeLimit,
        maxAttempts,
        description,
        credits,
        createdBy: req.auth!.userId,
      })
      .returning()
      .get();

    await writeAuditLog({
      userId: req.auth!.userId,
      action: "subject_created",
      resourceType: "subject",
      resourceId: String(result.id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({ success: true, data: { subject: result } });
  },
);

// PATCH/PUT /api/subjects/:id — update a subject (admin+)
subjectsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw new ApiError(400, "INVALID_PARAM", "Subject ID must be an integer.");

    const parsed = updateSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.code) updates.code = (updates.code as string).toUpperCase();
    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(subjects)
      .set(updates)
      .where(eq(subjects.id, id))
      .returning()
      .get();

    res.json({ success: true, data: { subject: updated } });
  },
);

// PUT /api/subjects/:id — alias for PATCH (plan spec compatibility)
subjectsRouter.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw new ApiError(400, "INVALID_PARAM", "Subject ID must be an integer.");

    const parsed = updateSubjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.code) updates.code = (updates.code as string).toUpperCase();
    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(subjects)
      .set(updates)
      .where(eq(subjects.id, id))
      .returning()
      .get();

    res.json({ success: true, data: { subject: updated } });
  },
);

// DELETE /api/subjects/:id — delete a subject (admin+)
subjectsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) throw new ApiError(400, "INVALID_PARAM", "Subject ID must be an integer.");

    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

    await db.delete(subjects).where(eq(subjects.id, id));

    await writeAuditLog({
      userId: req.auth!.userId,
      action: "subject_deleted",
      resourceType: "subject",
      resourceId: String(id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ success: true, data: { message: "Subject deleted." } });
  },
);
