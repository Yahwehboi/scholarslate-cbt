import { z } from "zod";

export const createQuestionSchema = z.object({
  subjectId: z.number().int().positive(),
  text: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(500)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  difficulty: z.enum(["Easy", "Standard", "Hard"]).default("Standard"),
});

export const updateQuestionSchema = z
  .object({
    subjectId: z.number().int().positive().optional(),
    text: z.string().min(1).max(2000).optional(),
    options: z.array(z.string().min(1).max(500)).length(4).optional(),
    correctAnswer: z.number().int().min(0).max(3).optional(),
    difficulty: z.enum(["Easy", "Standard", "Hard"]).optional(),
  })
  .refine((v) => Object.values(v).some((val) => val !== undefined), {
    message: "At least one field must be provided.",
  });

// For bulk CSV import: correctAnswer comes in as a letter A-D
export const bulkQuestionRowSchema = z.object({
  subject: z.string().min(1),
  question: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_answer: z.enum(["A", "B", "C", "D"]),
  difficulty: z.enum(["Easy", "Standard", "Hard"]).default("Standard"),
});

export type CreateQuestionBody = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionSchema>;
export type BulkQuestionRow = z.infer<typeof bulkQuestionRowSchema>;
