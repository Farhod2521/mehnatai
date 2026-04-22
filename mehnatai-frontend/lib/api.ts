/**
 * MehnatAI — centralized API client
 * All calls go through `apiFetch` which automatically:
 *  - Prepends NEXT_PUBLIC_API_URL
 *  - Attaches Authorization: Bearer <token>
 *  - On 401 → tries refresh, retries once, else clears tokens
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ─── Token helpers ─────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mehnatai_access");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mehnatai_refresh");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("mehnatai_access", access);
  localStorage.setItem("mehnatai_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("mehnatai_access");
  localStorage.removeItem("mehnatai_refresh");
  localStorage.removeItem("mehnatai_role");
  localStorage.removeItem("mehnatai_user");
}

// ─── Core fetch ────────────────────────────────────────────────────────────

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(path, options, false);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Sessiya tugadi, qayta kiring");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Xatolik yuz berdi");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserMe {
  id: number;
  username: string;
  email: string;
  role: "rahbar" | "xodim" | "hr";
  is_active: boolean;
  employee_id: number | null;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => apiFetch<UserMe>("/auth/me"),

  refresh: (refresh_token: string) =>
    apiFetch<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  employees: { total: number; yuqori: number; orta: number; rivojlanish: number };
  avg_usi: number;
  tasks: { total: number; done: number; completion_rate: number };
  evaluations_total: number;
}

export interface TopPerformer {
  id: number;
  full_name: string;
  position: string;
  department: string;
  usi_score: number;
  status: string;
  avatar_initials: string;
}

export const dashboardApi = {
  stats: () => apiFetch<DashboardStats>("/dashboard/stats"),
  topPerformers: (limit = 5) => apiFetch<TopPerformer[]>(`/dashboard/top-performers?limit=${limit}`),
  myStats: () => apiFetch<{
    employee_id: number;
    full_name: string;
    usi_score: number;
    status: string;
    tasks: { total: number; done: number };
    latest_kpi_avg: number | null;
  }>("/dashboard/my-stats"),
};

// ─── Employees ─────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  status: "yuqori" | "orta" | "rivojlanish";
  usi_score: number;
  avatar_initials: string;
  experience_years: number;
  email: string | null;
  phone: string | null;
  hired_date: string | null;
  bio: string | null;
  cluster: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEmployees {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  experience_years?: number;
  email?: string;
  phone?: string;
  hired_date?: string;
  bio?: string;
}

export const employeesApi = {
  list: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    department?: string;
    status?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.department) q.set("department", params.department);
    if (params.status) q.set("status", params.status);
    return apiFetch<PaginatedEmployees>(`/employees?${q}`);
  },

  get: (id: number) => apiFetch<Employee>(`/employees/${id}`),

  create: (data: EmployeeCreate) =>
    apiFetch<Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<EmployeeCreate>) =>
    apiFetch<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) => apiFetch<void>(`/employees/${id}`, { method: "DELETE" }),
};

// ─── KPI ───────────────────────────────────────────────────────────────────

export interface KpiRecord {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  code_quality: number;
  deadline_adherence: number;
  bug_fix_speed: number;
  documentation: number;
  team_participation: number;
  new_technologies: number;
  kpi_avg: number;
  created_at: string;
}

export interface KpiSummary {
  employee_id: number;
  latest_month: number;
  latest_year: number;
  kpi_avg: number;
  trend: { month: number; year: number; kpi_avg: number }[];
}

export const kpiApi = {
  list: (employeeId: number) => apiFetch<KpiRecord[]>(`/kpi/employee/${employeeId}`),
  summary: (employeeId: number) => apiFetch<KpiSummary>(`/kpi/employee/${employeeId}/summary`),
  create: (data: {
    employee_id: number;
    month: number;
    year: number;
    code_quality: number;
    deadline_adherence: number;
    bug_fix_speed: number;
    documentation: number;
    team_participation: number;
    new_technologies: number;
  }) => apiFetch<KpiRecord>("/kpi", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Evaluations ───────────────────────────────────────────────────────────

export interface Evaluation {
  id: number;
  employee_id: number;
  evaluator_id: number | null;
  eval_type: "rahbar" | "peer_360" | "mijoz";
  overall_score: number;
  work_quality: number | null;
  punctuality: number | null;
  communication: number | null;
  initiative: number | null;
  teamwork: number | null;
  comment: string | null;
  sentiment: "ijobiy" | "neytral" | "salbiy" | null;
  is_anonymous: boolean;
  created_at: string;
}

export interface EvaluationSummary {
  employee_id: number;
  rahbar_avg: number | null;
  peer_360_avg: number | null;
  mijoz_avg: number | null;
  total_count: number;
}

export const evaluationsApi = {
  list: (employeeId: number, evalType?: string) => {
    const q = evalType ? `?eval_type=${evalType}` : "";
    return apiFetch<Evaluation[]>(`/evaluations/employee/${employeeId}${q}`);
  },
  summary: (employeeId: number) =>
    apiFetch<EvaluationSummary>(`/evaluations/employee/${employeeId}/summary`),
  create: (data: {
    employee_id: number;
    eval_type: string;
    overall_score: number;
    comment?: string;
    work_quality?: number;
    punctuality?: number;
    communication?: number;
    initiative?: number;
    teamwork?: number;
    is_anonymous?: boolean;
  }) => apiFetch<Evaluation>("/evaluations", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/evaluations/${id}`, { method: "DELETE" }),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  employee_id: number;
  parent_id: number | null;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "done";
  due_date: string | null;
  is_done: boolean;
  created_at: string;
  updated_at: string;
  children: Task[];
}

export interface TaskStats {
  employee_id: number;
  total: number;
  done: number;
  pending: number;
  in_progress: number;
  completion_rate: number;
}

export const tasksApi = {
  list: (employeeId: number, params: { status?: string; root_only?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.root_only) q.set("root_only", "true");
    return apiFetch<Task[]>(`/tasks/employee/${employeeId}?${q}`);
  },
  stats: (employeeId: number) => apiFetch<TaskStats>(`/tasks/employee/${employeeId}/stats`),
  update: (taskId: number, data: { is_done?: boolean; status?: string; title?: string }) =>
    apiFetch<Task>(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(data) }),
  create: (data: {
    employee_id: number;
    title: string;
    priority?: string;
    due_date?: string;
    description?: string;
    parent_id?: number;
  }) => apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  delete: (taskId: number) => apiFetch<void>(`/tasks/${taskId}`, { method: "DELETE" }),
};

// ─── Users (HR manages employee accounts) ─────────────────────────────────

export interface UserAccount {
  id: number;
  username: string;
  email: string;
  role: "rahbar" | "xodim" | "hr";
  is_active: boolean;
  employee_id: number | null;
}

export interface UserAccountCreate {
  username: string;
  email: string;
  password: string;
  role?: "xodim" | "hr";
  employee_id?: number;
}

export const usersApi = {
  create: (data: UserAccountCreate) =>
    apiFetch<UserAccount>("/users", { method: "POST", body: JSON.stringify(data) }),

  checkEmployee: (employeeId: number) =>
    apiFetch<UserAccount | null>(`/users/by-employee/${employeeId}`),
};

// ─── AI ────────────────────────────────────────────────────────────────────

export interface AiPrediction {
  id: number;
  employee_id: number;
  predicted_usi: number;
  confidence: number;
  prediction_date: string;
  model_version: string;
  cluster_label: string | null;
  sentiment_summary: string | null;
  positive_pct: number | null;
  neutral_pct: number | null;
  negative_pct: number | null;
  recommendations: string | null;
  created_at: string;
}

export interface UsiResult {
  employee_id: number;
  kpi_avg: number;
  rahbar_score: number;
  peer_360_score: number;
  mijoz_score: number;
  usi_score: number;
  label: string;
}

export interface ClusterMember {
  id: number;
  full_name: string;
  usi_score: number;
  department: string;
}

export interface ClusterGroup {
  cluster: string;
  count: number;
  members: ClusterMember[];
}

export const aiApi = {
  predictions: (employeeId: number) => apiFetch<AiPrediction[]>(`/ai/predictions/${employeeId}`),
  createPrediction: (employeeId: number) =>
    apiFetch<AiPrediction>(`/ai/predictions/${employeeId}`, { method: "POST" }),
  usi: (employeeId: number) => apiFetch<UsiResult>(`/ai/usi/${employeeId}`),
  clusters: () => apiFetch<ClusterGroup[]>("/ai/clusters"),
};
