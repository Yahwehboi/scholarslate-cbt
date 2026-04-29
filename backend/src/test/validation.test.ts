/**
 * Phase 2 — Validation unit tests
 * Covers: createQuestionSchema, updateQuestionSchema, bulkQuestionRowSchema,
 *         createSubjectSchema, updateSubjectSchema
 */
import { describe, it, expect } from "vitest";
import {
  createQuestionSchema,
  updateQuestionSchema,
  bulkQuestionRowSchema,
} from "../validation/questions.schemas.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validation/subjects.schemas.js";

// ─── Question schemas ─────────────────────────────────────────────────────────

describe("createQuestionSchema", () => {
  const valid = {
    subjectId: 1,
    text: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    difficulty: "Standard",
  };

  it("accepts a fully valid payload", () => {
    expect(createQuestionSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults difficulty to Standard when omitted", () => {
    const { difficulty: _, ...without } = valid;
    const result = createQuestionSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.difficulty).toBe("Standard");
  });

  it("rejects missing text", () => {
    expect(createQuestionSchema.safeParse({ ...valid, text: "" }).success).toBe(false);
  });

  it("rejects options array with wrong length", () => {
    expect(createQuestionSchema.safeParse({ ...valid, options: ["A", "B"] }).success).toBe(false);
  });

  it("rejects correctAnswer out of range", () => {
    expect(createQuestionSchema.safeParse({ ...valid, correctAnswer: 5 }).success).toBe(false);
  });

  it("rejects invalid difficulty value", () => {
    expect(createQuestionSchema.safeParse({ ...valid, difficulty: "Extreme" }).success).toBe(false);
  });

  it("rejects non-integer subjectId", () => {
    expect(createQuestionSchema.safeParse({ ...valid, subjectId: 1.5 }).success).toBe(false);
  });
});

describe("updateQuestionSchema", () => {
  it("accepts a partial payload", () => {
    expect(updateQuestionSchema.safeParse({ text: "New text?" }).success).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateQuestionSchema.safeParse({}).success).toBe(false);
  });
});

describe("bulkQuestionRowSchema", () => {
  const valid = {
    subject: "Mathematics",
    question: "What is 2+2?",
    option_a: "3",
    option_b: "4",
    option_c: "5",
    option_d: "6",
    correct_answer: "B",
    difficulty: "Standard",
  };

  it("accepts a fully valid CSV row", () => {
    expect(bulkQuestionRowSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all valid correct_answer letters", () => {
    for (const letter of ["A", "B", "C", "D"]) {
      expect(bulkQuestionRowSchema.safeParse({ ...valid, correct_answer: letter }).success).toBe(true);
    }
  });

  it("rejects invalid correct_answer letter", () => {
    expect(bulkQuestionRowSchema.safeParse({ ...valid, correct_answer: "E" }).success).toBe(false);
  });

  it("rejects missing question text", () => {
    expect(bulkQuestionRowSchema.safeParse({ ...valid, question: "" }).success).toBe(false);
  });

  it("rejects invalid difficulty", () => {
    expect(bulkQuestionRowSchema.safeParse({ ...valid, difficulty: "Extreme" }).success).toBe(false);
  });

  it("defaults difficulty to Standard when omitted", () => {
    const { difficulty: _, ...without } = valid;
    const result = bulkQuestionRowSchema.safeParse(without);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.difficulty).toBe("Standard");
  });
});

// ─── Subject schemas ──────────────────────────────────────────────────────────

describe("createSubjectSchema", () => {
  const valid = { name: "Mathematics", code: "MATH" };

  it("accepts minimal valid payload", () => {
    expect(createSubjectSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createSubjectSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects empty code", () => {
    expect(createSubjectSchema.safeParse({ ...valid, code: "" }).success).toBe(false);
  });
});

describe("updateSubjectSchema", () => {
  it("accepts partial payload", () => {
    expect(updateSubjectSchema.safeParse({ active: true }).success).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateSubjectSchema.safeParse({}).success).toBe(false);
  });
});
