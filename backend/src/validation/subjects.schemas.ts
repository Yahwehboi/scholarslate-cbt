import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  iconKey: z.enum(["math", "science", "english", "history", "book"]).default("book"),
  iconBg: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#fff3e0"),
  active: z.boolean().default(false),
  timeLimit: z.number().int().min(15).max(180).default(60),
  maxAttempts: z.number().int().min(1).max(5).default(2),
  description: z.string().max(1000).default(""),
  credits: z.number().int().min(1).max(6).default(1),
});

export const updateSubjectSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    code: z.string().min(1).max(50).optional(),
    iconKey: z.enum(["math", "science", "english", "history", "book"]).optional(),
    iconBg: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    active: z.boolean().optional(),
    timeLimit: z.number().int().min(15).max(180).optional(),
    maxAttempts: z.number().int().min(1).max(5).optional(),
    description: z.string().max(1000).optional(),
    credits: z.number().int().min(1).max(6).optional(),
  })
  .refine((v) => Object.values(v).some((val) => val !== undefined), {
    message: "At least one field must be provided.",
  });

export type CreateSubjectBody = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectBody = z.infer<typeof updateSubjectSchema>;
