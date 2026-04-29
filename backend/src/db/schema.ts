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
