import { Router, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { db } from "../db/connection.js";
import { questions, subjects } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ApiError } from "../middleware/error-handler.js";
import {
  createQuestionSchema,
  bulkQuestionRowSchema,
  updateQuestionSchema,
} from "../validation/questions.schemas.js";

export const questionsRouter = Router();

// multer: store CSV in memory (no disk writes, max 2 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted."));
    }
  },
});

/** Parse a raw CSV string into an array of header-keyed objects. */
function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

function parseOptions(options: string): string[] {
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// GET /api/questions?subjectId=:id
// Admin: all questions for a subject. Student: only from an active subject.
questionsRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  const subjectIdRaw = req.query.subjectId as string | undefined;
  const subjectId = subjectIdRaw ? parseInt(subjectIdRaw, 10) : NaN;
  const limitRaw = req.query.limit as string | undefined;
  const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;

  if (!subjectIdRaw) {
    if (req.auth!.role === "student") {
      throw new ApiError(400, "MISSING_PARAM", "subjectId query parameter is required.");
    }

    const rows =
      limit !== undefined && Number.isFinite(limit) && limit > 0
        ? await db.select().from(questions).limit(Math.min(limit, 200)).all()
        : await db.select().from(questions).all();
    const normalised = rows.map((q) => ({
      ...q,
      options: parseOptions(q.options),
    }));

    return res.json({ success: true, data: { questions: normalised, total: normalised.length } });
  }

  if (isNaN(subjectId)) {
    throw new ApiError(400, "INVALID_PARAM", "subjectId must be a valid number.");
  }

  // Check subject exists; students can only query active subjects
  const subject = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .get();

  if (!subject) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

  if (req.auth!.role === "student" && !subject.active) {
    throw new ApiError(403, "FORBIDDEN", "This subject is not available.");
  }

  const rows = await db
    .select()
    .from(questions)
    .where(eq(questions.subjectId, subjectId))
    .all();

  const normalised = rows.map((q) => ({
    ...q,
    options: parseOptions(q.options),
  }));

  // For students, strip the correctAnswer field
  const data =
    req.auth!.role === "student"
      ? normalised.map(({ correctAnswer: _ca, ...q }) => q)
      : normalised;

  res.json({ success: true, data: { questions: data, total: data.length } });
});

// POST /api/questions — create a single question
questionsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { subjectId, text, options, correctAnswer, difficulty } = parsed.data;

    const subject = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .get();
    if (!subject) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

    const id = randomUUID();
    const result = await db
      .insert(questions)
      .values({
        id,
        subjectId,
        text,
        options: JSON.stringify(options),
        correctAnswer,
        difficulty,
        createdBy: req.auth!.userId,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    // Increment questionsCount on the subject
    await db
      .update(subjects)
      .set({ questionsCount: sql`questions_count + 1`, updatedAt: new Date().toISOString() })
      .where(eq(subjects.id, subjectId));

    res.status(201).json({
      success: true,
      data: {
        question: { ...result, options: JSON.parse(result.options) },
      },
    });
  },
);

async function handleCsvUpload(req: Request, res: Response) {
  if (!req.file) {
    throw new ApiError(400, "MISSING_FILE", "No CSV file was uploaded. Use field name 'file'.");
  }

  const raw = req.file.buffer.toString("utf-8");
  const rows = parseCsv(raw);

  if (rows.length === 0) {
    throw new ApiError(400, "EMPTY_FILE", "CSV file contains no data rows.");
  }

  const allSubjects = await db.select({ id: subjects.id, name: subjects.name }).from(subjects).all();
  const subjectMap = new Map(allSubjects.map((s) => [s.name.toLowerCase(), s.id]));

  const toInsert: Array<typeof questions.$inferInsert> = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const parsed = bulkQuestionRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${rowNum}: ${parsed.error.issues[0].message}`);
      continue;
    }

    const { subject, question, option_a, option_b, option_c, option_d, correct_answer, difficulty } =
      parsed.data;

    const subjectId = subjectMap.get(subject.toLowerCase());
    if (subjectId === undefined) {
      errors.push(`Row ${rowNum}: subject "${subject}" not found. Create it first.`);
      continue;
    }

    const answerIndex = ["A", "B", "C", "D"].indexOf(correct_answer);

    toInsert.push({
      id: randomUUID(),
      subjectId,
      text: question,
      options: JSON.stringify([option_a, option_b, option_c, option_d]),
      correctAnswer: answerIndex,
      difficulty,
      createdBy: req.auth!.userId,
      createdAt: new Date().toISOString(),
    });
  }

  if (toInsert.length === 0) {
    throw new ApiError(422, "NO_VALID_ROWS", `No valid rows found. Errors: ${errors.join("; ")}`);
  }

  db.transaction((tx) => {
    for (const q of toInsert) {
      tx.insert(questions).values(q).run();
    }
    const affectedIds = [...new Set(toInsert.map((q) => q.subjectId))];
    for (const sid of affectedIds) {
      const count = toInsert.filter((q) => q.subjectId === sid).length;
      tx
        .update(subjects)
        .set({ questionsCount: sql`questions_count + ${count}`, updatedAt: new Date().toISOString() })
        .where(eq(subjects.id, sid))
        .run();
    }
  });

  res.json({
    success: true,
    data: {
      inserted: toInsert.length,
      skipped: rows.length - toInsert.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
}

// POST /api/questions/bulk — upload CSV file of questions
questionsRouter.post(
  "/bulk",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  upload.single("file"),
  handleCsvUpload,
);

// POST /api/questions/upload — alias for /bulk (plan spec compatibility)
questionsRouter.post(
  "/upload",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  upload.single("file"),
  handleCsvUpload,
);

// PATCH /api/questions/:id — update an existing question
questionsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const parsed = updateQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Question not found.");

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.options) updates.options = JSON.stringify(updates.options);

    const updated = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning()
      .get();

    res.json({
      success: true,
      data: {
        question: {
          ...updated,
          options: parseOptions(updated.options),
        },
      },
    });
  },
);

// PUT /api/questions/:id — alias for PATCH (plan spec compatibility)
questionsRouter.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const parsed = updateQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Question not found.");

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.options) updates.options = JSON.stringify(updates.options);

    const updated = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning()
      .get();

    res.json({
      success: true,
      data: {
        question: {
          ...updated,
          options: parseOptions(updated.options),
        },
      },
    });
  },
);

// DELETE /api/questions/:id
questionsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const existing = await db
      .select({ id: questions.id, subjectId: questions.subjectId })
      .from(questions)
      .where(eq(questions.id, id))
      .get();
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Question not found.");

    await db.delete(questions).where(eq(questions.id, id));

    // Decrement questionsCount
    await db
      .update(subjects)
      .set({ questionsCount: sql`MAX(questions_count - 1, 0)`, updatedAt: new Date().toISOString() })
      .where(eq(subjects.id, existing.subjectId));

    res.json({ success: true, data: { message: "Question deleted." } });
  },
);
