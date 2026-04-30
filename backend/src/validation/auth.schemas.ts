import { z } from "zod";

export const studentLoginSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const listStudentsQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const bulkStudentRowSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  full_name: z.string().min(1, "Full name is required"),
  class: z.string().optional(),
}).passthrough(); // allows extra fields like email, phone, gender from CSV
