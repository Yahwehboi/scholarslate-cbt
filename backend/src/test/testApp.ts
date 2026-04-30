/**
 * testApp.ts
 *
 * Creates a fully isolated Express app backed by an in-memory SQLite database
 * for use in vitest integration tests.
 *
 * Environment variables are set before importing any module that reads them.
 */
import { randomUUID } from "node:crypto";

// Must be set before env.ts is evaluated
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-at-least-16-chars";
process.env.DATABASE_PATH = ":memory:";
process.env.CORS_ORIGIN = "*";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashPassword } from "../lib/password.js";

// ── Inline schema bootstrap (mirrors connection.ts but uses :memory:) ────────
const sqlite = new Database(":memory:");

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL,
    class TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    icon_key TEXT NOT NULL DEFAULT 'book',
    icon_bg TEXT NOT NULL DEFAULT '#fff3e0',
    active INTEGER NOT NULL DEFAULT 0,
    time_limit INTEGER NOT NULL DEFAULT 60,
    max_attempts INTEGER NOT NULL DEFAULT 2,
    description TEXT NOT NULL DEFAULT '',
    questions_count INTEGER NOT NULL DEFAULT 0,
    credits INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Standard',
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'expired')),
    attempt_no INTEGER NOT NULL DEFAULT 1,
    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    submitted_at TEXT,
    last_activity_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_questions INTEGER NOT NULL DEFAULT 0,
    answered_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    score_pct INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS exam_session_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_index INTEGER,
    flagged INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, question_id)
  );
`);

export const testDb = drizzle(sqlite);
export { sqlite as testSqlite };

// ── Override the shared db singleton with the test instance ─────────────────
import { __setDb } from "../db/connection.js";
__setDb(testDb);

// ── Seed a default admin for auth ────────────────────────────────────────────
const adminId = randomUUID();
sqlite.prepare(`
  INSERT OR IGNORE INTO users (id, username, full_name, password_hash, role, is_active)
  VALUES (?, 'admin', 'Test Admin', ?, 'super_admin', 1)
`).run(adminId, hashPassword("admin123"));

// ── JWT helper ───────────────────────────────────────────────────────────────
import { signAccessToken } from "../lib/jwt.js";

export function adminToken() {
  return signAccessToken({ sub: adminId, role: "super_admin" });
}

export function studentToken(userId: string) {
  return signAccessToken({ sub: userId, role: "student" });
}

// ── App import (after db override) ──────────────────────────────────────────
export { app } from "../app.js";
