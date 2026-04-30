import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  studentId: text("student_id").unique(),
  username: text("username").unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["student", "admin", "super_admin"] }).notNull(),
  className: text("class"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  iconKey: text("icon_key").notNull().default("book"),
  iconBg: text("icon_bg").notNull().default("#fff3e0"),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  timeLimit: integer("time_limit").notNull().default(60),
  maxAttempts: integer("max_attempts").notNull().default(2),
  description: text("description").notNull().default(""),
  questionsCount: integer("questions_count").notNull().default(0),
  credits: integer("credits").notNull().default(1),
  createdBy: text("created_by"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  text: text("text").notNull(),
  options: text("options").notNull(), // JSON array of 4 strings
  correctAnswer: integer("correct_answer").notNull(), // 0-3 index
  difficulty: text("difficulty", { enum: ["Easy", "Standard", "Hard"] }).notNull().default("Standard"),
  createdBy: text("created_by"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const examSessions = sqliteTable("exam_sessions", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  status: text("status", { enum: ["active", "submitted", "expired"] }).notNull().default("active"),
  attemptNo: integer("attempt_no").notNull().default(1),
  startedAt: text("started_at").notNull().default("CURRENT_TIMESTAMP"),
  expiresAt: text("expires_at").notNull(),
  submittedAt: text("submitted_at"),
  lastActivityAt: text("last_activity_at").notNull().default("CURRENT_TIMESTAMP"),
  totalQuestions: integer("total_questions").notNull().default(0),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  unansweredCount: integer("unanswered_count").notNull().default(0),
  scorePct: integer("score_pct").notNull().default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const examSessionAnswers = sqliteTable("exam_session_answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  questionId: text("question_id").notNull(),
  answerIndex: integer("answer_index"),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
