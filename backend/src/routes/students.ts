import { Router, type Request, type Response } from "express";
import { like, or, eq, and, inArray, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { db } from "../db/connection.js";
import { users, examSessions, subjects } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listStudentsQuerySchema, bulkStudentRowSchema } from "../validation/auth.schemas.js";
import { ApiError } from "../middleware/error-handler.js";

export const studentsRouter = Router();

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

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

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
          ? and(
              baseWhere,
              or(
                like(users.studentId, `%${q}%`),
                like(users.fullName, `%${q}%`),
                like(users.className, `%${q}%`),
              ),
            )
          : baseWhere,
      )
      .limit(limit)
      .offset(offset)
      .all();

    res.json({
      success: true,
      data: {
        students: rows,
        total: rows.length,
        limit,
        offset,
      },
    });
  },
);

// POST /api/students/upload - bulk register students
studentsRouter.post(
  "/upload",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "MISSING_FILE", "No CSV file was uploaded.");
    }

    const raw = req.file.buffer.toString("utf-8");
    const rows = parseCsv(raw);

    if (rows.length === 0) {
      throw new ApiError(400, "EMPTY_FILE", "CSV file contains no data rows.");
    }

    const toInsert: Array<typeof users.$inferInsert> = [];
    const errors: string[] = [];
    const seenStudentIds = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = bulkStudentRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push(`Row ${rowNum}: ${parsed.error.issues[0].message}`);
        continue;
      }

      const { student_id, full_name, class: className } = parsed.data;

      // Duplicate detection within CSV
      if (seenStudentIds.has(student_id.toLowerCase())) {
        errors.push(`Row ${rowNum}: Duplicate student ID "${student_id}" in file.`);
        continue;
      }
      seenStudentIds.add(student_id.toLowerCase());

      toInsert.push({
        id: randomUUID(),
        studentId: student_id,
        fullName: full_name,
        className: className ?? null,
        role: "student",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (toInsert.length === 0) {
      throw new ApiError(422, "NO_VALID_ROWS", `No valid rows found. Errors: ${errors.join("; ")}`);
    }

    let insertedCount = 0;

    // Use transaction if possible, or insert one by one to catch UNIQUE constraint failures
    // Note: Drizzle SQLite run() will throw on unique constraint violation
    db.transaction((tx) => {
      for (const student of toInsert) {
        try {
          // Check if student ID already exists
          const existing = tx.select({ id: users.id }).from(users).where(eq(users.studentId, student.studentId!)).get();
          if (!existing) {
            tx.insert(users).values(student).run();
            insertedCount++;
          } else {
            // Already exists, just skip or log
            errors.push(`Student ID "${student.studentId}" already exists. Skipped.`);
          }
        } catch (e) {
          errors.push(`Failed to insert ${student.studentId}: ${(e as Error).message}`);
        }
      }
    });

    res.json({
      success: true,
      data: {
        inserted: insertedCount,
        skipped: rows.length - insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  }
);

// GET /api/students/results
studentsRouter.get(
  "/results",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const results = await db
      .select({
        id: examSessions.id,
        subjectId: examSessions.subjectId,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        iconKey: subjects.iconKey,
        iconBg: subjects.iconBg,
        status: examSessions.status,
        attemptNo: examSessions.attemptNo,
        totalQuestions: examSessions.totalQuestions,
        answeredCount: examSessions.answeredCount,
        correctCount: examSessions.correctCount,
        incorrectCount: examSessions.incorrectCount,
        unansweredCount: examSessions.unansweredCount,
        scorePct: examSessions.scorePct,
        startedAt: examSessions.startedAt,
        submittedAt: examSessions.submittedAt,
        createdAt: examSessions.createdAt,
      })
      .from(examSessions)
      .innerJoin(subjects, eq(examSessions.subjectId, subjects.id))
      .where(
        and(
          eq(examSessions.studentId, req.auth!.userId),
          inArray(examSessions.status, ["submitted", "expired"])
        )
      )
      .orderBy(desc(examSessions.submittedAt))
      .all();

    res.json({ success: true, data: { results } });
  }
);

// GET /api/students/results/:resultId
studentsRouter.get(
  "/results/:resultId",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const { resultId } = req.params;
    const result = await db
      .select({
        id: examSessions.id,
        subjectId: examSessions.subjectId,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        iconKey: subjects.iconKey,
        iconBg: subjects.iconBg,
        status: examSessions.status,
        attemptNo: examSessions.attemptNo,
        totalQuestions: examSessions.totalQuestions,
        answeredCount: examSessions.answeredCount,
        correctCount: examSessions.correctCount,
        incorrectCount: examSessions.incorrectCount,
        unansweredCount: examSessions.unansweredCount,
        scorePct: examSessions.scorePct,
        startedAt: examSessions.startedAt,
        submittedAt: examSessions.submittedAt,
      })
      .from(examSessions)
      .innerJoin(subjects, eq(examSessions.subjectId, subjects.id))
      .where(
        and(
          eq(examSessions.id, resultId),
          eq(examSessions.studentId, req.auth!.userId),
          inArray(examSessions.status, ["submitted", "expired"])
        )
      )
      .get();

    if (!result) {
      throw new ApiError(404, "NOT_FOUND", "Result not found.");
    }

    res.json({ success: true, data: { result } });
  }
);
