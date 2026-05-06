import { Router, type Request, type Response } from "express";
import { eq, desc, inArray } from "drizzle-orm";
import { db } from "../db/connection.js";
import { examSessions, users, subjects } from "../db/schema.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

// GET /api/admin/results
adminRouter.get(
  "/results",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const results = await db
      .select({
        id: examSessions.id,
        studentId: users.studentId,
        studentName: users.fullName,
        subject: subjects.name,
        score: examSessions.scorePct,
        date: examSessions.submittedAt,
      })
      .from(examSessions)
      .innerJoin(users, eq(examSessions.studentId, users.id))
      .innerJoin(subjects, eq(examSessions.subjectId, subjects.id))
      .where(inArray(examSessions.status, ["submitted", "expired"]))
      .orderBy(desc(examSessions.submittedAt))
      .all();

    const formattedResults = results.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      subject: r.subject,
      score: r.score,
      status: r.score >= 50 ? "Pass" : "Fail",
      date: r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown",
    }));

    res.json({ success: true, data: { results: formattedResults } });
  }
);

// GET /api/admin/results/metrics
adminRouter.get(
  "/results/metrics",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  async (req: Request, res: Response) => {
    const results = await db
      .select({ score: examSessions.scorePct })
      .from(examSessions)
      .where(inArray(examSessions.status, ["submitted", "expired"]))
      .all();

    const totalExams = results.length;
    const passed = results.filter(r => r.score >= 50).length;
    const averageScore = totalExams > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalExams) : 0;
    const failed = totalExams - passed;

    res.json({
      success: true,
      data: {
        totalExams,
        passed,
        averageScore,
        failed,
      }
    });
  }
);
