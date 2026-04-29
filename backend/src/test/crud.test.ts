/**
 * Phase 2 — CRUD integration tests
 * Covers: subjects CRUD, question CRUD, CSV bulk import (both /bulk and /upload aliases)
 *
 * Uses an in-memory SQLite database; the real data/scholarslate.db is never touched.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, adminToken } from "./testApp.js";

let token: string;

beforeAll(() => {
  token = adminToken();
});

// ─── Subjects ─────────────────────────────────────────────────────────────────

describe("Subjects CRUD", () => {
  let subjectId: number;

  it("GET /api/subjects — returns empty list initially", async () => {
    const res = await request(app).get("/api/subjects").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.subjects)).toBe(true);
  });

  it("POST /api/subjects — creates a subject", async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mathematics", code: "MATH" });
    expect(res.status).toBe(201);
    expect(res.body.data.subject.name).toBe("Mathematics");
    expect(res.body.data.subject.code).toBe("MATH");
    subjectId = res.body.data.subject.id;
  });

  it("GET /api/subjects — lists newly created subject", async () => {
    const res = await request(app).get("/api/subjects").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.subjects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.subjects.some((s: { code: string }) => s.code === "MATH")).toBe(true);
  });

  it("PATCH /api/subjects/:id — updates name", async () => {
    const res = await request(app)
      .patch(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Advanced Mathematics" });
    expect(res.status).toBe(200);
    expect(res.body.data.subject.name).toBe("Advanced Mathematics");
  });

  it("PUT /api/subjects/:id — alias for PATCH, updates description", async () => {
    const res = await request(app)
      .put(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Core maths curriculum" });
    expect(res.status).toBe(200);
    expect(res.body.data.subject.description).toBe("Core maths curriculum");
  });

  it("DELETE /api/subjects/:id — deletes subject", async () => {
    const res = await request(app)
      .delete(`/api/subjects/${subjectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });
});

// ─── Questions ────────────────────────────────────────────────────────────────

describe("Questions CRUD", () => {
  let subjectId: number;
  let questionId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Physics", code: "PHY" });
    subjectId = res.body.data.subject.id;
  });

  it("POST /api/questions — creates a question", async () => {
    const res = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        subjectId,
        text: "What is Newton's first law?",
        options: ["Inertia", "Force", "Gravity", "Momentum"],
        correctAnswer: 0,
        difficulty: "Standard",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.question.text).toBe("What is Newton's first law?");
    expect(Array.isArray(res.body.data.question.options)).toBe(true);
    questionId = res.body.data.question.id;
  });

  it("GET /api/questions?subjectId — returns the created question", async () => {
    const res = await request(app)
      .get(`/api/questions?subjectId=${subjectId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions.some((q: { id: string }) => q.id === questionId)).toBe(true);
  });

  it("GET /api/questions (no subjectId) — admin can list all questions", async () => {
    const res = await request(app)
      .get("/api/questions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.questions)).toBe(true);
  });

  it("GET /api/questions?limit=1 — respects limit param", async () => {
    const res = await request(app)
      .get("/api/questions?limit=1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBeLessThanOrEqual(1);
  });

  it("PATCH /api/questions/:id — updates question text", async () => {
    const res = await request(app)
      .patch(`/api/questions/${questionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "What is Newton's first law of motion?" });
    expect(res.status).toBe(200);
    expect(res.body.data.question.text).toBe("What is Newton's first law of motion?");
  });

  it("PUT /api/questions/:id — alias for PATCH, updates difficulty", async () => {
    const res = await request(app)
      .put(`/api/questions/${questionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ difficulty: "Hard" });
    expect(res.status).toBe(200);
    expect(res.body.data.question.difficulty).toBe("Hard");
  });

  it("DELETE /api/questions/:id — deletes question", async () => {
    const res = await request(app)
      .delete(`/api/questions/${questionId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });
});

// ─── CSV Bulk / Upload ────────────────────────────────────────────────────────

describe("CSV import (POST /api/questions/bulk and /upload)", () => {
  let subjectId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Chemistry", code: "CHEM" });
    subjectId = res.body.data.subject.id;
    expect(subjectId).toBeTruthy();
  });

  const validCsv = [
    "subject,question,option_a,option_b,option_c,option_d,correct_answer,difficulty",
    "Chemistry,What is H2O?,Water,Salt,Acid,Base,A,Standard",
    "Chemistry,What is NaCl?,Water,Salt,Acid,Base,B,Easy",
  ].join("\n");

  it("POST /api/questions/bulk — imports valid CSV rows", async () => {
    const res = await request(app)
      .post("/api/questions/bulk")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(validCsv), { filename: "questions.csv", contentType: "text/csv" });
    expect(res.status).toBe(200);
    expect(res.body.data.inserted).toBe(2);
    expect(res.body.data.skipped).toBe(0);
  });

  it("POST /api/questions/upload — alias also imports valid CSV rows", async () => {
    const res = await request(app)
      .post("/api/questions/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(validCsv), { filename: "questions.csv", contentType: "text/csv" });
    expect(res.status).toBe(200);
    expect(res.body.data.inserted).toBe(2);
  });

  it("CSV with unknown subject — skips those rows and reports errors", async () => {
    const csv = [
      "subject,question,option_a,option_b,option_c,option_d,correct_answer,difficulty",
      "UnknownSubject,Some question?,A,B,C,D,A,Standard",
    ].join("\n");

    const res = await request(app)
      .post("/api/questions/bulk")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(csv), { filename: "q.csv", contentType: "text/csv" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("NO_VALID_ROWS");
  });

  it("CSV with only header row — returns EMPTY_FILE error", async () => {
    const csv = "subject,question,option_a,option_b,option_c,option_d,correct_answer,difficulty\n";
    const res = await request(app)
      .post("/api/questions/bulk")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(csv), { filename: "q.csv", contentType: "text/csv" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMPTY_FILE");
  });

  it("questionsCount on subject is updated after bulk import", async () => {
    const res = await request(app).get("/api/subjects").set("Authorization", `Bearer ${token}`);
    const chem = res.body.data.subjects.find((s: { code: string }) => s.code === "CHEM");
    // Two /bulk imports + two /upload imports = at least 4 questions
    expect(chem.questions_count ?? chem.questionsCount).toBeGreaterThanOrEqual(4);
  });
});
