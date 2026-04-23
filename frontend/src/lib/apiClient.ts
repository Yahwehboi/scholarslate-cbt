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
  },
};
