/**
 * Phase 2 — Negative and permission tests
 * Covers:
 *  - Unauthenticated requests → 401
 *  - Student token on admin-only routes → 403
 *  - Invalid payloads → 400 VALIDATION_ERROR
 *  - Missing file upload → 400 MISSING_FILE
 *  - Duplicate subject code → 409
 *  - Non-existent resource → 404
 *  - Wrong file type for CSV upload
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { app, adminToken, studentToken, testSqlite } from "./testApp.js";

let token: string;
let studToken: string;
let subjectId: number;

beforeAll(async () => {
  token = adminToken();

  // Create a student user for permission tests
  const sid = randomUUID();
  testSqlite.prepare(`
    INSERT OR IGNORE INTO users (id, student_id, full_name, role, is_active)
    VALUES (?, 'STU001', 'Test Student', 'student', 1)
  `).run(sid);
  studToken = studentToken(sid);

  // Create a subject to run 404 / permission tests against
  const res = await request(app)
    .post("/api/subjects")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Biology", code: "BIO" });
  subjectId = res.body.data.subject.id;
});

// ─── 401 Unauthenticated ──────────────────────────────────────────────────────

describe("Unauthenticated access — 401", () => {
  it("GET /api/subjects without token", async () => {
    const res = await request(app).get("/api/subjects");
    expect(res.status).toBe(401);
  });

  it("POST /api/subjects without token", async () => {
    const res = await request(app).post("/api/subjects").send({ name: "X", code: "X" });
    expect(res.status).toBe(401);
  });

  it("GET /api/questions without token", async () => {
    const res = await request(app).get("/api/questions");
    expect(res.status).toBe(401);
  });

  it("POST /api/questions/bulk without token", async () => {
    const res = await request(app).post("/api/questions/bulk");
    expect(res.status).toBe(401);
  });
});

// ─── 403 Forbidden — student on admin routes ─────────────────────────────────

describe("Student token on admin-only routes — 403", () => {
  it("POST /api/subjects as student", async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${studToken}`)
      .send({ name: "Maths", code: "MTH" });
    expect(res.status).toBe(403);
  });

  it("PATCH /api/subjects/:id as student", async () => {
    const res = await request(app)
      .patch(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${studToken}`)
      .send({ name: "Biology Advanced" });
    expect(res.status).toBe(403);
  });

  it("PUT /api/subjects/:id as student", async () => {
    const res = await request(app)
      .put(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${studToken}`)
      .send({ name: "Biology Advanced" });
    expect(res.status).toBe(403);
  });

  it("DELETE /api/subjects/:id as student", async () => {
    const res = await request(app)
      .delete(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${studToken}`);
    expect(res.status).toBe(403);
  });

  it("POST /api/questions as student", async () => {
    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${studToken}`)
      .send({
        subjectId,
        text: "Question?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0,
      });
    expect(res.status).toBe(403);
  });

  it("POST /api/questions/bulk as student", async () => {
    const res = await request(app)
      .post("/api/questions/bulk")
      .set("Authorization", `Bearer ${studToken}`)
      .attach("file", Buffer.from("a,b"), { filename: "x.csv", contentType: "text/csv" });
    expect(res.status).toBe(403);
  });

  it("GET /api/questions without subjectId as student — 400", async () => {
    const res = await request(app)
      .get("/api/questions")
      .set("Authorization", `Bearer ${studToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_PARAM");
  });
});

// ─── 400 Invalid payloads ─────────────────────────────────────────────────────

describe("Invalid payloads — 400 VALIDATION_ERROR", () => {
  it("POST /api/subjects — missing name", async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "XYZ" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/questions — wrong options length", async () => {
    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subjectId,
        text: "Test?",
        options: ["A", "B"],
        correctAnswer: 0,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/questions — correctAnswer out of range", async () => {
    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subjectId,
        text: "Test?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 9,
      });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/questions/:id — empty body", async () => {
    const res = await request(app)
      .patch("/api/questions/nonexistent-id")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH /api/subjects/:id — empty body", async () => {
    const res = await request(app)
      .patch(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ─── 400 Missing file ─────────────────────────────────────────────────────────

describe("CSV upload — missing file — 400 MISSING_FILE", () => {
  it("POST /api/questions/bulk without attaching a file", async () => {
    const res = await request(app)
      .post("/api/questions/bulk")
      .set("Authorization", `Bearer ${token}`)
      .field("dummy", "value"); // valid multipart body, no file field
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_FILE");
  });

  it("POST /api/questions/upload without attaching a file", async () => {
    const res = await request(app)
      .post("/api/questions/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("dummy", "value"); // valid multipart body, no file field
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_FILE");
  });
});

// ─── 409 Duplicate subject code ───────────────────────────────────────────────

describe("Duplicate subject code — 409", () => {
  it("POST /api/subjects with existing code", async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Biology Duplicate", code: "BIO" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("DUPLICATE_CODE");
  });
});

// ─── 404 Not found ────────────────────────────────────────────────────────────

describe("Non-existent resources — 404", () => {
  it("PATCH /api/subjects/9999 — subject not found", async () => {
    const res = await request(app)
      .patch("/api/subjects/9999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("DELETE /api/subjects/9999 — subject not found", async () => {
    const res = await request(app)
      .delete("/api/subjects/9999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("PATCH /api/questions/no-such-id — question not found", async () => {
    const res = await request(app)
      .patch("/api/questions/no-such-uuid")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Updated?" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("DELETE /api/questions/no-such-id — question not found", async () => {
    const res = await request(app)
      .delete("/api/questions/no-such-uuid")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
