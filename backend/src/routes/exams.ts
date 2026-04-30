import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Router, type Request, type Response } from "express";
import { writeAuditLog } from "../lib/audit.js";
import { db } from "../db/connection.js";
import { examSessionAnswers, examSessions, questions, subjects } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ApiError } from "../middleware/error-handler.js";
import { flagQuestionSchema, saveAnswerSchema, startExamSchema, reportViolationSchema } from "../validation/exams.schemas.js";

export const examsRouter = Router();

function parseOptions(options: string): string[] {
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nowIso() {
  return new Date().toISOString();
}

function addMinutesIso(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function getOwnedSessionOrThrow(sessionId: string, studentId: string) {
  const session = await db
    .select()
    .from(examSessions)
    .where(eq(examSessions.id, sessionId))
    .get();

  if (!session) throw new ApiError(404, "NOT_FOUND", "Exam session not found.");
  if (session.studentId !== studentId) throw new ApiError(403, "FORBIDDEN", "You cannot access this exam session.");
  return session;
}

async function finalizeSession(sessionId: string, status: "submitted" | "expired") {
  const session = await db.select().from(examSessions).where(eq(examSessions.id, sessionId)).get();
  if (!session) throw new ApiError(404, "NOT_FOUND", "Exam session not found.");

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.subjectId, session.subjectId))
    .all();

  const answerRows = await db
    .select()
    .from(examSessionAnswers)
    .where(eq(examSessionAnswers.sessionId, sessionId))
    .all();

  const answerMap = new Map(answerRows.map((a) => [a.questionId, a.answerIndex]));

  let correct = 0;
  let answered = 0;

  for (const q of qs) {
    const ans = answerMap.get(q.id);
    if (ans === undefined || ans === null) continue;
    answered += 1;
    if (ans === q.correctAnswer) correct += 1;
  }

  const total = qs.length;
  const incorrect = answered - correct;
  const unanswered = total - answered;
  const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const updated = await db
    .update(examSessions)
    .set({
      status,
      submittedAt: nowIso(),
      answeredCount: answered,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      totalQuestions: total,
      scorePct,
      updatedAt: nowIso(),
      lastActivityAt: nowIso(),
    })
    .where(eq(examSessions.id, sessionId))
    .returning()
    .get();

  return {
    session: updated,
    summary: {
      sessionId: updated.id,
      subjectId: updated.subjectId,
      status: updated.status,
      totalQuestions: total,
      answered,
      correct,
      incorrect,
      unanswered,
      scorePct,
      submittedAt: updated.submittedAt,
    },
  };
}

async function maybeExpireSession(sessionId: string) {
  const session = await db.select().from(examSessions).where(eq(examSessions.id, sessionId)).get();
  if (!session) return null;
  if (session.status !== "active") return session;

  const expired = new Date(session.expiresAt).getTime() <= Date.now();
  if (!expired) return session;

  const finalized = await finalizeSession(session.id, "expired");
  return finalized.session;
}

// POST /api/exams/start
examsRouter.post(
  "/start",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const parsed = startExamSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { subjectId } = parsed.data;

    const subject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .get();

    if (!subject) throw new ApiError(404, "NOT_FOUND", "Subject not found.");
    if (!subject.active) throw new ApiError(403, "FORBIDDEN", "This subject is not available.");

    const studentId = req.auth!.userId;

    const staleActive = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.studentId, studentId),
          eq(examSessions.subjectId, subjectId),
          eq(examSessions.status, "active"),
        ),
      )
      .all();

    for (const s of staleActive) {
      await maybeExpireSession(s.id);
    }

    const active = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.studentId, studentId),
          eq(examSessions.subjectId, subjectId),
          eq(examSessions.status, "active"),
        ),
      )
      .get();

    if (active) {
      return res.json({
        success: true,
        data: {
          sessionId: active.id,
          status: active.status,
          expiresAt: active.expiresAt,
          subjectId: active.subjectId,
          attemptNo: active.attemptNo,
        },
      });
    }

    const finalizedCountRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(examSessions)
      .where(
        and(
          eq(examSessions.studentId, studentId),
          eq(examSessions.subjectId, subjectId),
          inArray(examSessions.status, ["submitted", "expired"]),
        ),
      )
      .get();

    const completedAttempts = Number(finalizedCountRow?.count ?? 0);
    if (completedAttempts >= subject.maxAttempts) {
      throw new ApiError(409, "ATTEMPT_LIMIT_REACHED", "Maximum attempts reached for this subject.");
    }

    const subjectQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.subjectId, subjectId))
      .all();

    if (subjectQuestions.length === 0) {
      throw new ApiError(400, "NO_QUESTIONS", "This subject has no questions yet.");
    }

    const session = await db
      .insert(examSessions)
      .values({
        id: randomUUID(),
        studentId,
        subjectId,
        status: "active",
        attemptNo: completedAttempts + 1,
        expiresAt: addMinutesIso(subject.timeLimit),
        totalQuestions: subjectQuestions.length,
        lastActivityAt: nowIso(),
      })
      .returning()
      .get();

    await writeAuditLog({
      userId: studentId,
      action: "exam_session_started",
      resourceType: "exam_session",
      resourceId: session.id,
      details: { subjectId, attemptNo: session.attemptNo },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        expiresAt: session.expiresAt,
        subjectId: session.subjectId,
        attemptNo: session.attemptNo,
      },
    });
  },
);

// GET /api/exams/session/:sessionId
examsRouter.get(
  "/session/:sessionId",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    let session = await getOwnedSessionOrThrow(sessionId, req.auth!.userId);

    if (session.status === "active") {
      session = (await maybeExpireSession(session.id)) ?? session;
    }

    const subject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, session.subjectId))
      .get();

    if (!subject) throw new ApiError(404, "NOT_FOUND", "Subject not found.");

    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.subjectId, session.subjectId))
      .all();

    const answers = await db
      .select()
      .from(examSessionAnswers)
      .where(eq(examSessionAnswers.sessionId, session.id))
      .all();

    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    const payloadQuestions = qs.map((q) => ({
      id: q.id,
      text: q.text,
      options: parseOptions(q.options),
      difficulty: q.difficulty,
      answer: answerMap.get(q.id)?.answerIndex ?? null,
      flagged: Boolean(answerMap.get(q.id)?.flagged ?? false),
      // Hide answer keys from student session payload
      correctAnswer: undefined,
    }));

    const remainingSeconds =
      session.status === "active"
        ? Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000))
        : 0;

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          status: session.status,
          subjectId: session.subjectId,
          attemptNo: session.attemptNo,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
          remainingSeconds,
          totalQuestions: session.totalQuestions,
          canEdit: session.status === "active" && remainingSeconds > 0,
        },
        subject: {
          id: subject.id,
          name: subject.name,
          timeLimit: subject.timeLimit,
        },
        questions: payloadQuestions,
      },
    });
  },
);

// PATCH /api/exams/session/:sessionId/answer
examsRouter.patch(
  "/session/:sessionId/answer",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const parsed = saveAnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { questionId, answer } = parsed.data;

    let session = await getOwnedSessionOrThrow(sessionId, req.auth!.userId);
    if (session.status === "active") {
      session = (await maybeExpireSession(session.id)) ?? session;
    }

    if (session.status !== "active") {
      throw new ApiError(409, "SESSION_FINALIZED", "This exam session is no longer editable.");
    }

    const q = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.subjectId, session.subjectId)))
      .get();

    if (!q) throw new ApiError(404, "NOT_FOUND", "Question not found in this session subject.");

    const existing = await db
      .select()
      .from(examSessionAnswers)
      .where(and(eq(examSessionAnswers.sessionId, session.id), eq(examSessionAnswers.questionId, questionId)))
      .get();

    if (!existing) {
      await db.insert(examSessionAnswers).values({
        id: randomUUID(),
        sessionId: session.id,
        questionId,
        answerIndex: answer,
        flagged: false,
      });
    } else {
      await db
        .update(examSessionAnswers)
        .set({ answerIndex: answer, updatedAt: nowIso() })
        .where(eq(examSessionAnswers.id, existing.id));
    }

    await db
      .update(examSessions)
      .set({ lastActivityAt: nowIso(), updatedAt: nowIso() })
      .where(eq(examSessions.id, session.id));

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        questionId,
        answer,
      },
    });
  },
);

// PATCH /api/exams/session/:sessionId/flag
examsRouter.patch(
  "/session/:sessionId/flag",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const parsed = flagQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { questionId, flagged } = parsed.data;

    let session = await getOwnedSessionOrThrow(sessionId, req.auth!.userId);
    if (session.status === "active") {
      session = (await maybeExpireSession(session.id)) ?? session;
    }

    if (session.status !== "active") {
      throw new ApiError(409, "SESSION_FINALIZED", "This exam session is no longer editable.");
    }

    const q = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.id, questionId), eq(questions.subjectId, session.subjectId)))
      .get();

    if (!q) throw new ApiError(404, "NOT_FOUND", "Question not found in this session subject.");

    const existing = await db
      .select()
      .from(examSessionAnswers)
      .where(and(eq(examSessionAnswers.sessionId, session.id), eq(examSessionAnswers.questionId, questionId)))
      .get();

    if (!existing) {
      await db.insert(examSessionAnswers).values({
        id: randomUUID(),
        sessionId: session.id,
        questionId,
        answerIndex: null,
        flagged,
      });
    } else {
      await db
        .update(examSessionAnswers)
        .set({ flagged, updatedAt: nowIso() })
        .where(eq(examSessionAnswers.id, existing.id));
    }

    await db
      .update(examSessions)
      .set({ lastActivityAt: nowIso(), updatedAt: nowIso() })
      .where(eq(examSessions.id, session.id));

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        questionId,
        flagged,
      },
    });
  },
);

// POST /api/exams/session/:sessionId/submit
examsRouter.post(
  "/session/:sessionId/submit",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const session = await getOwnedSessionOrThrow(sessionId, req.auth!.userId);

    if (session.status === "submitted" || session.status === "expired") {
      return res.json({
        success: true,
        data: {
          summary: {
            sessionId: session.id,
            subjectId: session.subjectId,
            status: session.status,
            totalQuestions: session.totalQuestions,
            answered: session.answeredCount,
            correct: session.correctCount,
            incorrect: session.incorrectCount,
            unanswered: session.unansweredCount,
            scorePct: session.scorePct,
            submittedAt: session.submittedAt,
          },
        },
      });
    }

    const finalized = await finalizeSession(session.id, "submitted");

    await writeAuditLog({
      userId: req.auth!.userId,
      action: "exam_session_submitted",
      resourceType: "exam_session",
      resourceId: session.id,
      details: finalized.summary,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: {
        summary: finalized.summary,
      },
    });
  },
);

// POST /api/exams/session/:sessionId/violation
examsRouter.post(
  "/session/:sessionId/violation",
  requireAuth,
  requireRole(["student"]),
  async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const parsed = reportViolationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
    }

    const { type } = parsed.data;

    let session = await getOwnedSessionOrThrow(sessionId, req.auth!.userId);
    if (session.status === "active") {
      session = (await maybeExpireSession(session.id)) ?? session;
    }

    if (session.status !== "active") {
      throw new ApiError(409, "SESSION_FINALIZED", "This exam session is no longer active.");
    }

    await writeAuditLog({
      userId: req.auth!.userId,
      action: "exam_violation",
      resourceType: "exam_session",
      resourceId: session.id,
      details: { type, subjectId: session.subjectId },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: { recorded: true },
    });
  },
);
