const BASE = "http://localhost:3000/api";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  // Don't force Content-Type for FormData — browser sets it with boundary
  if (options?.body instanceof FormData) {
    delete headers["Content-Type"];
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiClientError(json.error.code, json.error.message, res.status);
  }
  return json.data;
}

export class ApiClientError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

// ─── Token helpers ───────────────────────────────────────────────────────────
const TOKEN_KEY = "cbt_token";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const storeToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Auth ────────────────────────────────────────────────────────────────────
export type ApiUser =
  | { id: string; studentId: string; fullName: string; className: string | null; role: "student" }
  | { id: string; username: string; fullName: string; role: "admin" | "super_admin" };

export const api = {
  auth: {
    loginStudent: (studentId: string) =>
      request<{ token: string; user: ApiUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ studentId }),
      }),

    loginAdmin: (username: string, password: string) =>
      request<{ token: string; user: ApiUser }>("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    me: () => request<ApiUser>("/auth/me"),

    logout: () =>
      request<{ message: string }>("/auth/logout", { method: "POST" }),
  },

  students: {
    list: (params?: { q?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.q) qs.set("q", params.q);
      if (params?.limit !== undefined) qs.set("limit", String(params.limit));
      if (params?.offset !== undefined) qs.set("offset", String(params.offset));
      return request<{
        students: { id: string; studentId: string | null; fullName: string; className: string | null; isActive: boolean; createdAt: string }[];
        total: number;
        limit: number;
        offset: number;
      }>(`/students?${qs.toString()}`);
    },

    uploadCsv: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ inserted: number; skipped: number; errors?: string[] }>("/students/upload", {
        method: "POST",
        body: form,
      });
    },

    getResults: () =>
      request<{ results: ApiResult[] }>("/students/results"),

    getResult: (resultId: string) =>
      request<{ result: ApiResult }>(`/students/results/${resultId}`),
  },

  subjects: {
    list: () =>
      request<{ subjects: ApiSubject[] }>("/subjects"),

      create: (body: {
        name: string; code: string; iconKey?: string; iconBg?: string;
        active?: boolean; timeLimit?: number; maxAttempts?: number;
        description?: string; credits?: number;
      }) =>
        request<{ subject: ApiSubject }>("/subjects", {
          method: "POST",
          body: JSON.stringify(body),
        }),

      update: (id: number, body: Partial<{
        name: string; code: string; iconKey: string; iconBg: string;
        active: boolean; timeLimit: number; maxAttempts: number;
        description: string; credits: number;
      }>) =>
        request<{ subject: ApiSubject }>(`/subjects/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),

      delete: (id: number) =>
        request<{ message: string }>(`/subjects/${id}`, { method: "DELETE" }),
    },

    questions: {
      listAll: (params?: { limit?: number }) => {
        const qs = new URLSearchParams();
        if (params?.limit !== undefined) qs.set("limit", String(params.limit));
        const suffix = qs.toString();
        return request<{ questions: ApiQuestion[]; total: number }>(`/questions${suffix ? `?${suffix}` : ""}`);
      },

      listBySubject: (subjectId: number) =>
        request<{ questions: ApiQuestion[]; total: number }>(`/questions?subjectId=${subjectId}`),

      create: (body: {
        subjectId: number; text: string; options: string[];
        correctAnswer: number; difficulty?: "Easy" | "Standard" | "Hard";
      }) =>
        request<{ question: ApiQuestion }>("/questions", {
          method: "POST",
          body: JSON.stringify(body),
        }),

      uploadCsv: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return request<{ inserted: number; skipped: number; errors?: string[] }>("/questions/bulk", {
          method: "POST",
          body: form,
        });
      },

      update: (id: string, body: Partial<{
        subjectId: number; text: string; options: string[];
        correctAnswer: number; difficulty: "Easy" | "Standard" | "Hard";
      }>) =>
        request<{ question: ApiQuestion }>(`/questions/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),

      delete: (id: string) =>
        request<{ message: string }>(`/questions/${id}`, { method: "DELETE" }),
    },

    exams: {
      start: (subjectId: number) =>
        request<{
          sessionId: string;
          status: "active" | "submitted" | "expired";
          expiresAt: string;
          subjectId: number;
          attemptNo: number;
        }>("/exams/start", {
          method: "POST",
          body: JSON.stringify({ subjectId }),
        }),

      getSession: (sessionId: string) =>
        request<{
          session: {
            id: string;
            status: "active" | "submitted" | "expired";
            subjectId: number;
            attemptNo: number;
            startedAt: string;
            expiresAt: string;
            remainingSeconds: number;
            totalQuestions: number;
            canEdit: boolean;
          };
          subject: {
            id: number;
            name: string;
            timeLimit: number;
          };
          questions: {
            id: string;
            text: string;
            options: string[];
            difficulty: "Easy" | "Standard" | "Hard";
            answer: number | null;
            flagged: boolean;
          }[];
        }>(`/exams/session/${sessionId}`),

      saveAnswer: (sessionId: string, body: { questionId: string; answer: number | null }) =>
        request<{ sessionId: string; questionId: string; answer: number | null }>(`/exams/session/${sessionId}/answer`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),

      setFlag: (sessionId: string, body: { questionId: string; flagged: boolean }) =>
        request<{ sessionId: string; questionId: string; flagged: boolean }>(`/exams/session/${sessionId}/flag`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),

      submit: (sessionId: string) =>
        request<{
          summary: {
            sessionId: string;
            subjectId: number;
            status: "submitted" | "expired";
            totalQuestions: number;
            answered: number;
            correct: number;
            incorrect: number;
            unanswered: number;
            scorePct: number;
            submittedAt: string | null;
          };
        }>(`/exams/session/${sessionId}/submit`, { method: "POST" }),

      reportViolation: (sessionId: string, type: "tab_switch" | "window_blur" | "unauthorized_key") =>
        request<{ recorded: boolean }>(`/exams/session/${sessionId}/violation`, {
          method: "POST",
          body: JSON.stringify({ type }),
        }),
    },
};

  // ─── Shared API types ─────────────────────────────────────────────────────────
  export type ApiSubject = {
    id: number; name: string; code: string;
    iconKey: string; iconBg: string;
    active: boolean; timeLimit: number; maxAttempts: number;
    description: string; questionsCount: number; credits: number;
    createdAt: string; updatedAt: string;
  };

  export type ApiQuestion = {
    id: string; subjectId: number; text: string;
    options: string[]; correctAnswer?: number;
    difficulty: "Easy" | "Standard" | "Hard"; createdAt: string;
  };

  export type ApiResult = {
    id: string; subjectId: number; subjectName: string; subjectCode: string;
    iconKey: string; iconBg: string; status: "submitted" | "expired";
    attemptNo: number; totalQuestions: number; answeredCount: number;
    correctCount: number; incorrectCount: number; unansweredCount: number;
    scorePct: number; startedAt: string; submittedAt: string | null;
  };
