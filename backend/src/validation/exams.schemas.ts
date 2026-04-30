import { z } from "zod";

export const startExamSchema = z.object({
  subjectId: z.number().int().positive(),
});

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.number().int().min(0).max(3).nullable(),
});

export const flagQuestionSchema = z.object({
  questionId: z.string().uuid(),
  flagged: z.boolean(),
});

export const reportViolationSchema = z.object({
  type: z.enum(["tab_switch", "window_blur", "unauthorized_key"]),
});
