import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, adminToken, studentToken, testSqlite } from "./testApp.js";

let adminJwt = "";
let studentJwt = "";
let subjectId = 0;
let questionIds: string[] = [];

beforeAll(async () => {
  adminJwt = adminToken();

  const sid = randomUUID();
  testSqlite
    .prepare(
      `INSERT OR IGNORE INTO users (id, student_id, full_name, role, is_active)
       VALUES (?, ?, 'Phase 3 Student', 'student', 1)`,
    )
    .run(sid, `STU-P3-${Date.now()}`);
  studentJwt = studentToken(sid);

  const subjectRes = await request(app)
    .post("/api/subjects")
    .set("Authorization", `Bearer ${adminJwt}`)
    .send({
      name: `Physics ${Date.now()}`,
      code: `PHY${Math.floor(Math.random() * 900 + 100)}`,
      active: true,
      timeLimit: 60,
      maxAttempts: 2,
    });

  subjectId = subjectRes.body.data.subject.id;

  const q1 = await request(app)
    .post("/api/questions")
    .set("Authorization", `Bearer ${adminJwt}`)
    .send({
      subjectId,
      text: "2 + 2 = ?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 2,
      difficulty: "Standard",
    });

  const q2 = await request(app)
    .post("/api/questions")
    .set("Authorization", `Bearer ${adminJwt}`)
    .send({
      subjectId,
      text: "3 + 3 = ?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 1,
      difficulty: "Standard",
    });

  questionIds = [q1.body.data.question.id, q2.body.data.question.id];
});

describe("Phase 3 exam session lifecycle", () => {
  it("starts a session and returns an active session id", async () => {
    const res = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    expect(res.status).toBe(201);
    expect(res.body.data.sessionId).toBeTruthy();
    expect(res.body.data.status).toBe("active");
  });

  it("returns the same active session on repeated start", async () => {
    const a = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    const b = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.body.data.sessionId).toBe(b.body.data.sessionId);
  });

  it("saves answer and flag, then reflects in GET session", async () => {
    const started = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    const sessionId = started.body.data.sessionId as string;

    const ansRes = await request(app)
      .patch(`/api/exams/session/${sessionId}/answer`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ questionId: questionIds[0], answer: 2 });
    expect(ansRes.status).toBe(200);

    const flagRes = await request(app)
      .patch(`/api/exams/session/${sessionId}/flag`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ questionId: questionIds[0], flagged: true });
    expect(flagRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/exams/session/${sessionId}`)
      .set("Authorization", `Bearer ${studentJwt}`);

    expect(getRes.status).toBe(200);
    const q = getRes.body.data.questions.find((x: { id: string }) => x.id === questionIds[0]);
    expect(q.answer).toBe(2);
    expect(q.flagged).toBe(true);
  });

  it("submits and is idempotent on repeated submit", async () => {
    const started = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    const sessionId = started.body.data.sessionId as string;

    await request(app)
      .patch(`/api/exams/session/${sessionId}/answer`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ questionId: questionIds[0], answer: 2 });

    const first = await request(app)
      .post(`/api/exams/session/${sessionId}/submit`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({});

    const second = await request(app)
      .post(`/api/exams/session/${sessionId}/submit`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({});

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.data.summary.status).toBe("submitted");
    expect(second.body.data.summary.sessionId).toBe(first.body.data.summary.sessionId);
    expect(second.body.data.summary.scorePct).toBe(first.body.data.summary.scorePct);
  });

  it("blocks answer edits after submit", async () => {
    const started = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId });

    const sessionId = started.body.data.sessionId as string;

    await request(app)
      .post(`/api/exams/session/${sessionId}/submit`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({});

    const ansRes = await request(app)
      .patch(`/api/exams/session/${sessionId}/answer`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ questionId: questionIds[0], answer: 1 });

    expect(ansRes.status).toBe(409);
    expect(ansRes.body.error.code).toBe("SESSION_FINALIZED");
  });

  it("auto-expires a timed-out active session", async () => {
    const subjectRes = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        name: `Bio ${Date.now()}`,
        code: `BIO${Math.floor(Math.random() * 900 + 100)}`,
        active: true,
        timeLimit: 60,
        maxAttempts: 5,
      });

    const sid = subjectRes.body.data.subject.id as number;

    await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        subjectId: sid,
        text: "Bio one",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0,
      });

    const started = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId: sid });

    const sessionId = started.body.data.sessionId as string;

    testSqlite
      .prepare("UPDATE exam_sessions SET expires_at = ?, status = 'active' WHERE id = ?")
      .run(new Date(Date.now() - 5000).toISOString(), sessionId);

    const getRes = await request(app)
      .get(`/api/exams/session/${sessionId}`)
      .set("Authorization", `Bearer ${studentJwt}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.session.status).toBe("expired");
    expect(getRes.body.data.session.canEdit).toBe(false);
  });

  it("handles rapid answer updates without failure", async () => {
    const subjectRes = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        name: `Chem ${Date.now()}`,
        code: `CHM${Math.floor(Math.random() * 900 + 100)}`,
        active: true,
        timeLimit: 60,
        maxAttempts: 2,
      });
    const sid = subjectRes.body.data.subject.id as number;

    const q = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        subjectId: sid,
        text: "H2O is?",
        options: ["Salt", "Water", "Acid", "Base"],
        correctAnswer: 1,
      });

    const qid = q.body.data.question.id as string;

    const started = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId: sid });

    const sessionId = started.body.data.sessionId as string;

    const saves = await Promise.all(
      Array.from({ length: 10 }).map((_, i) =>
        request(app)
          .patch(`/api/exams/session/${sessionId}/answer`)
          .set("Authorization", `Bearer ${studentJwt}`)
          .send({ questionId: qid, answer: i % 4 }),
      ),
    );

    for (const r of saves) {
      expect(r.status).toBe(200);
    }

    const getRes = await request(app)
      .get(`/api/exams/session/${sessionId}`)
      .set("Authorization", `Bearer ${studentJwt}`);

    const saved = getRes.body.data.questions.find((x: { id: string }) => x.id === qid);
    expect(saved.answer).not.toBeNull();
    expect([0, 1, 2, 3]).toContain(saved.answer);
  });

  it("enforces attempt limit by subject policy", async () => {
    const subjectRes = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        name: `Gov ${Date.now()}`,
        code: `GOV${Math.floor(Math.random() * 900 + 100)}`,
        active: true,
        timeLimit: 60,
        maxAttempts: 1,
      });

    const sid = subjectRes.body.data.subject.id as number;

    await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        subjectId: sid,
        text: "One question",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0,
      });

    const first = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId: sid });

    await request(app)
      .post(`/api/exams/session/${first.body.data.sessionId}/submit`)
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({});

    const second = await request(app)
      .post("/api/exams/start")
      .set("Authorization", `Bearer ${studentJwt}`)
      .send({ subjectId: sid });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("ATTEMPT_LIMIT_REACHED");
  });
});
