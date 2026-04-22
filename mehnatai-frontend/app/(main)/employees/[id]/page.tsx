"use client";

import { useState, use, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft, Zap, BadgeCheck,
  Terminal, Mail, TrendingDown, Medal, Edit3,
  Plus, CheckCircle2, Circle, ChevronRight, ChevronDown,
  AlertCircle, Flame, KeyRound, User2, X, Loader2,
  ClipboardList,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import {
  employeesApi, kpiApi, evaluationsApi, aiApi, tasksApi, usersApi,
  type Employee, type KpiRecord, type Evaluation, type AiPrediction, type Task, type UserAccount,
} from "@/lib/api";

const tabs = ["Umumiy", "KPI Ko'rsatkichlari", "Baholash", "Vazifalar", "AI Tavsiyalar"];

const STATUS_MAP: Record<string, "YUQORI" | "O'RTA" | "RIVOJLANISH KERAK"> = {
  yuqori: "YUQORI",
  orta: "O'RTA",
  rivojlanish: "RIVOJLANISH KERAK",
};

const EVAL_TYPE_LABEL: Record<string, string> = {
  rahbar: "Rahbar Baholash",
  peer_360: "360° Feedback",
  mijoz: "Mijoz Feedback",
};

const SENTIMENT_COLOR: Record<string, string> = {
  ijobiy: "#10B981",
  neytral: "#F59E0B",
  salbiy: "#EF4444",
};

const SENTIMENT_LABEL: Record<string, string> = {
  ijobiy: "Ijobiy",
  neytral: "Neytral",
  salbiy: "Salbiy",
};

const PRIORITY_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past" },
};

function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

/* ─── TaskRow ──────────────────────────────────────────────────────────── */
function TaskRow({ task, depth, onToggle, openIds, onToggleOpen }: {
  task: Task; depth: number;
  onToggle: (id: number) => void;
  openIds: Set<number>;
  onToggleOpen: (id: number) => void;
}) {
  const hasChildren = task.children && task.children.length > 0;
  const isOpen = openIds.has(task.id);
  const p = PRIORITY_COLOR[task.priority];
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !!task.due_date && task.due_date < today && !task.is_done;
  const isToday = task.due_date === today;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: `8px 12px 8px ${12 + depth * 20}px`, borderRadius: "10px", marginBottom: "2px", background: isToday && !task.is_done ? "rgba(0,184,160,0.04)" : "transparent" }}>
        {hasChildren ? (
          <button onClick={() => onToggleOpen(task.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#9CA3AF", flexShrink: 0, display: "flex" }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span style={{ width: 14, flexShrink: 0 }} />}

        <button onClick={() => onToggle(task.id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, display: "flex" }}>
          {task.is_done ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color="#D1D5DB" />}
        </button>

        <span style={{ flex: 1, fontSize: "13px", fontWeight: depth === 0 ? 600 : 400, color: task.is_done ? "#9CA3AF" : "#1F2937", textDecoration: task.is_done ? "line-through" : "none" }}>
          {task.title}
        </span>

        {task.due_date && (
          <span style={{ fontSize: "11px", color: isOverdue ? "#DC2626" : isToday ? "#00B8A0" : "#9CA3AF", fontWeight: isOverdue || isToday ? 600 : 400, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            {isOverdue && <AlertCircle size={11} />}
            {isToday && <Flame size={11} />}
            {task.due_date.slice(5).replace("-", "/")}
          </span>
        )}

        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: p.bg, color: p.color, flexShrink: 0 }}>
          {p.label}
        </span>
      </div>
      {hasChildren && isOpen && (
        <div style={{ borderLeft: "1.5px dashed #E5E7EB", marginLeft: `${20 + depth * 20}px` }}>
          {task.children.map(c => (
            <TaskRow key={c.id} task={c} depth={depth + 1} onToggle={onToggle} openIds={openIds} onToggleOpen={onToggleOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LoginModal ───────────────────────────────────────────────────────── */
function LoginModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [phone, setPhone] = useState("");        // faqat raqamlar: "901234567"
  const [displayPhone, setDisplayPhone] = useState(""); // formatlangan: "90 123 45 67"
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<UserAccount | null>(null);

  const formatPhone = (digits: string) => {
    const d = digits.slice(0, 9);
    let out = "";
    if (d.length > 0) out += d.slice(0, 2);
    if (d.length > 2) out += " " + d.slice(2, 5);
    if (d.length > 5) out += " " + d.slice(5, 7);
    if (d.length > 7) out += " " + d.slice(7, 9);
    return out;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPhone(raw);
    setDisplayPhone(formatPhone(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 9) { setError("Telefon raqamni to'liq kiriting (9 ta raqam)"); return; }
    if (password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    if (password !== confirm) { setError("Parollar mos kelmayapti"); return; }
    setSaving(true);
    try {
      const username = "+998" + phone;
      const result = await usersApi.create({
        username,
        password,
        role: "xodim",
        employee_id: employee.id,
      });
      setCreated(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #00B8A0, #009984)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <KeyRound size={22} color="white" />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Login yaratish</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{employee.first_name} {employee.last_name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={18} color="white" />
          </button>
        </div>

        <div style={{ padding: "28px" }}>
          {created ? (
            /* ── Muvaffaqiyat ── */
            <div>
              <div style={{ background: "#D1FAE5", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid #6EE7B7" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#065F46", marginBottom: "16px" }}>
                  ✓ Akkaunt muvaffaqiyatli yaratildi!
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: "white", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>Telefon raqam:</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827", letterSpacing: "0.5px" }}>{created.username}</span>
                  </div>
                  <div style={{ background: "white", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>Parol:</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#9CA3AF", fontStyle: "italic" }}>Xavfsizlik uchun ko'rsatilmaydi</span>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#065F46", marginTop: "14px", lineHeight: 1.5 }}>
                  Telefon raqam va parolni xodimga yetkazib bering. Xodim ushbu ma'lumotlar bilan tizimga kiradi.
                </p>
              </div>
              <button onClick={onClose} style={{ width: "100%", padding: "13px", borderRadius: "12px", background: "#111827", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Yopish
              </button>
            </div>
          ) : (
            /* ── Forma ── */
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Telefon raqam */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Telefon raqam *</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#F6FAF9", border: "1.5px solid #DFF0EC", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 12px 0 14px", background: "#EDF8F5", borderRight: "1.5px solid #DFF0EC", height: "48px", flexShrink: 0 }}>
                      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <rect width="20" height="4.67" fill="#1EB6E8"/>
                        <rect y="4.67" width="20" height="4.66" fill="#FFFFFF"/>
                        <rect y="9.33" width="20" height="4.67" fill="#3BB54A"/>
                        <rect y="4.2" width="20" height="0.9" fill="#E8112D"/>
                        <rect y="8.9" width="20" height="0.9" fill="#E8112D"/>
                        <circle cx="4.2" cy="2.33" r="1.3" fill="white"/>
                        <circle cx="4.8" cy="2.33" r="1.0" fill="#1EB6E8"/>
                        <circle cx="6.5" cy="1.3" r="0.35" fill="white"/>
                        <circle cx="7.2" cy="2.0" r="0.35" fill="white"/>
                        <circle cx="6.5" cy="2.7" r="0.35" fill="white"/>
                        <circle cx="7.5" cy="1.0" r="0.35" fill="white"/>
                        <circle cx="7.5" cy="3.0" r="0.35" fill="white"/>
                      </svg>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#00B8A0", whiteSpace: "nowrap" }}>+998</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={displayPhone}
                      onChange={handlePhoneChange}
                      placeholder="90 123 45 67"
                      maxLength={12}
                      style={{ flex: 1, padding: "13px 14px", background: "transparent", border: "none", outline: "none", fontSize: "15px", fontWeight: 500, letterSpacing: "1px", color: "#0D3D30", fontFamily: "inherit" }}
                    />
                    <span style={{ padding: "0 12px", fontSize: "11px", fontWeight: 600, color: phone.length === 9 ? "#00B8A0" : "#C0D8D2" }}>{phone.length}/9</span>
                  </div>
                </div>

                {/* Parol */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Parol * (kamida 6 belgi)</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: "100%", padding: "13px 42px 13px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex" }}>
                      {showPass
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Parolni tasdiqlash */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Parolni tasdiqlang *</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "13px 14px", borderRadius: "12px", border: `1.5px solid ${confirm && confirm !== password ? "#EF4444" : "#E5E7EB"}`, fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px" }}>Parollar mos kelmayapti</p>
                  )}
                </div>

                {error && (
                  <div style={{ background: "#FEE2E2", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button type="button" onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", background: "#F3F4F6", border: "none", color: "#374151", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: "13px", borderRadius: "12px", background: "linear-gradient(135deg, #00B8A0, #009984)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.8 : 1 }}>
                    {saving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Yaratilmoqda...</> : "Akkaunt yaratish"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── AddTaskForm ──────────────────────────────────────────────────────── */
function AddTaskForm({ employeeId, onAdd }: { employeeId: number; onAdd: (t: Task) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vazifa nomi kiritilishi shart"); return; }
    setSaving(true);
    setError("");
    try {
      const t = await tasksApi.create({
        employee_id: employeeId,
        title: title.trim(),
        priority,
        due_date: dueDate || undefined,
        description: description.trim() || undefined,
      });
      onAdd(t);
      setTitle(""); setPriority("medium"); setDueDate(""); setDescription("");
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "12px", background: "linear-gradient(135deg, #00B8A0, #009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
        <Plus size={15} /> Vazifa qo'shish
      </button>
    );
  }

  return (
    <div style={{ background: "#F8FFFE", border: "1.5px solid #00B8A0", borderRadius: "16px", padding: "20px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <ClipboardList size={16} color="#00B8A0" /> Yangi vazifa
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Vazifa nomi *"
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none" }}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tavsif (ixtiyoriy)"
            rows={2}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>Muhimlik darajasi</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
                <option value="high">Yuqori</option>
                <option value="medium">O'rta</option>
                <option value="low">Past</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>Muddati</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {error && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#DC2626" }}>{error}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#F3F4F6", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, #00B8A0, #009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1 }}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */
export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState("Umumiy");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [kpiRecords, setKpiRecords] = useState<KpiRecord[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [prediction, setPrediction] = useState<AiPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  // Tasks tab
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  // Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [existingAccount, setExistingAccount] = useState<UserAccount | null | undefined>(undefined);

  const empId = Number(id);

  useEffect(() => {
    (async () => {
      try {
        const [emp, kpis, evals, preds] = await Promise.all([
          employeesApi.get(empId),
          kpiApi.list(empId).catch(() => []),
          evaluationsApi.list(empId).catch(() => []),
          aiApi.predictions(empId).catch(() => []),
        ]);
        setEmployee(emp);
        setKpiRecords(kpis);
        setEvaluations(evals);
        setPrediction(preds[0] ?? null);
      } catch {
        // employee not found
      } finally {
        setLoading(false);
      }
    })();
  }, [empId]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const t = await tasksApi.list(empId, { root_only: true });
      setTasks(t);
      setOpenIds(new Set(t.filter(x => x.children.length > 0).map(x => x.id)));
    } catch {
      // ignore
    } finally {
      setTasksLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    if (activeTab === "Vazifalar") loadTasks();
  }, [activeTab, loadTasks]);

  // Check if employee has an account (HR only)
  useEffect(() => {
    if (role !== "hr" && role !== "rahbar") return;
    usersApi.checkEmployee(empId)
      .then(acc => setExistingAccount(acc))
      .catch(() => setExistingAccount(null));
  }, [empId, role]);

  const toggleDone = async (taskId: number) => {
    const find = (list: Task[], id: number): Task | null => {
      for (const t of list) {
        if (t.id === id) return t;
        const f = find(t.children, id); if (f) return f;
      }
      return null;
    };
    const upd = (list: Task[], id: number, updated: Task): Task[] =>
      list.map(t => t.id === id ? { ...updated, children: t.children } : { ...t, children: upd(t.children, id, updated) });

    const task = find(tasks, taskId);
    if (!task) return;
    const updated = await tasksApi.update(taskId, { is_done: !task.is_done }).catch(() => null);
    if (updated) setTasks(prev => upd(prev, taskId, updated));
  };

  const toggleOpen = (id: number) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const countTasks = (list: Task[]): { total: number; done: number } => {
    let total = 0, done = 0;
    for (const t of list) {
      total++; if (t.is_done) done++;
      const c = countTasks(t.children); total += c.total; done += c.done;
    }
    return { total, done };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <Skeleton w={200} h={24} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
          <Skeleton h={180} />
          <Skeleton h={180} />
        </div>
        <Skeleton h={48} />
        <Skeleton h={300} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#9CA3AF" }}>
        <p style={{ fontSize: "16px" }}>Xodim topilmadi</p>
        <Link href="/employees" style={{ color: "#00B8A0", fontWeight: 600, textDecoration: "none" }}>
          ← Ro'yxatga qaytish
        </Link>
      </div>
    );
  }

  const R = 64, C = 2 * Math.PI * R;
  const offset = C - (employee.usi_score / 100) * C;

  const latestKpi = kpiRecords[0];
  const radarData = latestKpi ? [
    { subject: "SIFAT", value: latestKpi.code_quality },
    { subject: "TEZLIK", value: latestKpi.deadline_adherence },
    { subject: "JAMOAVIY", value: latestKpi.team_participation },
    { subject: "INTIZOM", value: latestKpi.documentation },
    { subject: "INNOVATSIYA", value: latestKpi.new_technologies },
  ] : [
    { subject: "SIFAT", value: 0 }, { subject: "TEZLIK", value: 0 },
    { subject: "JAMOAVIY", value: 0 }, { subject: "INTIZOM", value: 0 },
    { subject: "INNOVATSIYA", value: 0 },
  ];

  const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
  const growthData = [...kpiRecords].reverse().slice(0, 6).map(r => ({
    oy: MONTHS[r.month - 1],
    value: r.kpi_avg,
  }));

  const { total: taskTotal, done: taskDone } = countTasks(tasks);
  const taskPct = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;

  const isHR = role === "hr" || role === "rahbar";
  const isRahbar = role === "rahbar";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {showLoginModal && (
        <LoginModal employee={employee} onClose={() => { setShowLoginModal(false); usersApi.checkEmployee(empId).then(setExistingAccount).catch(() => setExistingAccount(null)); }} />
      )}

      {/* Back */}
      <Link href="/employees" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>
        <ChevronLeft size={16} /> Xodimlar ro'yxatiga qaytish
      </Link>

      {/* ── Profile Header ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "20px" }}>
        <div style={{
          background: "#ffffff", borderRadius: "24px", padding: "32px",
          border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex", gap: "28px", alignItems: "flex-start",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,184,160,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "110px", height: "110px", borderRadius: "24px", background: "linear-gradient(135deg, #00B8A0, #009984)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "30px", fontWeight: 800, boxShadow: "0 8px 24px rgba(0,184,160,0.3)" }}>
              {employee.avatar_initials}
            </div>
            <div style={{ position: "absolute", bottom: "-6px", right: "-6px", width: "28px", height: "28px", borderRadius: "10px", background: "#4AE176", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BadgeCheck size={14} color="white" fill="white" strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
                {employee.first_name} {employee.last_name}
              </h2>
              <StatusBadge status={STATUS_MAP[employee.status] ?? "O'RTA"} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "24px" }}>
              <Terminal size={13} color="#00B8A0" />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#00B8A0" }}>{employee.position}</span>
              <span style={{ color: "#D1D5DB" }}>•</span>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>{employee.department}</span>
            </div>
            <div style={{ display: "flex", gap: "32px", paddingTop: "20px", borderTop: "1px solid #F3F4F6" }}>
              {[
                { label: "TAJRIBA", value: `${employee.experience_years} yil` },
                { label: "USI BALL", value: `${employee.usi_score}%` },
                { label: "CLUSTER", value: employee.cluster ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* HR: Login yaratish button */}
            {isHR && (
              <div style={{ marginTop: "20px" }}>
                {existingAccount === undefined ? (
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Tekshirilmoqda...</span>
                ) : existingAccount ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "#D1FAE5", border: "1px solid #6EE7B7" }}>
                    <User2 size={14} color="#065F46" />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#065F46" }}>
                      Akkaunt mavjud: <b>{existingAccount.username}</b>
                    </span>
                  </div>
                ) : (
                  <button onClick={() => setShowLoginModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                    <KeyRound size={15} /> Login yaratish
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Score ring */}
        <div style={{ borderRadius: "24px", padding: "28px", background: "linear-gradient(160deg, #001f18, #00352c)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,184,160,0.3) 0%, transparent 60%)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: "144px", height: "144px", margin: "0 auto 16px" }}>
              <svg width="144" height="144" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="72" cy="72" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="72" cy="72" r={R} fill="none" stroke="#00B8A0" strokeWidth="8" strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "white", lineHeight: 1 }}>{employee.usi_score}%</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "1.5px", marginTop: "4px" }}>UMUMIY USI</span>
              </div>
            </div>
            <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, maxWidth: "180px" }}>
              {employee.first_name} jamoaning faol a'zosi
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #F3F4F6", overflowX: "auto" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 20px", fontSize: "13.5px", fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "#00B8A0" : "#6B7280", background: "transparent", border: "none", cursor: "pointer", borderBottom: activeTab === tab ? "2px solid #00B8A0" : "2px solid transparent", marginBottom: "-2px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.15s" }}>
            {tab}
            {tab === "AI Tavsiyalar" && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366F1", animation: "pulse 2s infinite" }} />}
          </button>
        ))}
      </div>

      {/* ── UMUMIY ── */}
      {activeTab === "Umumiy" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #E5E7EB" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>Kompetensiyalar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} outerRadius={75}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#9CA3AF", fontWeight: 600 }} />
                    <Radar dataKey="value" stroke="#00B8A0" fill="#00B8A0" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: "#00B8A0", strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #E5E7EB" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>O'sish Dinamikasi</h3>
                {growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={growthData} barSize={28} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="oy" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={(v) => [`${v ?? 0}%`, "KPI"]} cursor={{ fill: "rgba(0,184,160,0.05)" }} />
                      <Bar dataKey="value" fill="#00B8A0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "13px" }}>
                    KPI ma'lumotlari yo'q
                  </div>
                )}
              </div>
            </div>

            {/* AI Insight */}
            <div style={{ background: "linear-gradient(160deg, #001f18, #003d31)", borderRadius: "24px", padding: "28px", display: "flex", gap: "20px", alignItems: "flex-start", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,184,160,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                <Zap size={26} color="#00B8A0" />
              </div>
              <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "2px" }}>SUN'IY INTELLEKT TAHLILI</span>
                <h4 style={{ fontSize: "17px", fontWeight: 700, color: "white", margin: "8px 0 10px", lineHeight: 1.4 }}>
                  {prediction ? `Bashorat: ${prediction.predicted_usi}% (${Math.round(prediction.confidence * 100)}% ishonch)` : `${employee.first_name} profili tahlil qilinmoqda...`}
                </h4>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "18px" }}>
                  {prediction?.recommendations ?? "AI bashorat yaratish uchun ko'proq ma'lumot kerak. KPI va baholash ma'lumotlari qo'shing."}
                </p>
                <button style={{ padding: "10px 22px", borderRadius: "20px", background: "white", color: "#111827", fontSize: "12.5px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  To'liq hisobotni ko'rish
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#F5F7FA", borderRadius: "20px", padding: "24px", border: "1px solid #E5E7EB" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Oxirgi Baholashlar</h3>
              {evaluations.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Baholashlar yo'q</p>
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "11px", top: "8px", bottom: "8px", width: "2px", background: "#E5E7EB" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {evaluations.slice(0, 4).map((ev, i) => (
                      <div key={ev.id} style={{ display: "flex", gap: "16px", position: "relative" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, background: "white", border: `2px solid ${i === 0 ? "#00B8A0" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === 0 ? "#00B8A0" : "#D1D5DB" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", marginBottom: "3px" }}>
                            {new Date(ev.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "5px" }}>
                            {EVAL_TYPE_LABEL[ev.eval_type] ?? ev.eval_type}
                          </h4>
                          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "10px", padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ev.comment ? "6px" : "0" }}>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Ball:</span>
                              <span style={{ fontSize: "13px", fontWeight: 800, color: "#22C55E" }}>{ev.overall_score}/10</span>
                            </div>
                            {ev.sentiment && (
                              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: SENTIMENT_COLOR[ev.sentiment] + "22", color: SENTIMENT_COLOR[ev.sentiment], fontWeight: 600 }}>
                                {SENTIMENT_LABEL[ev.sentiment]}
                              </span>
                            )}
                            {ev.comment && (
                              <p style={{ fontSize: "11px", fontStyle: "italic", color: "#9CA3AF", lineHeight: 1.4, marginTop: "6px" }}>"{ev.comment}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#E6E8EB", borderRadius: "20px", padding: "24px", border: "1px solid #E5E7EB" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>Amallar</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Baholash", icon: Edit3, color: "#00B8A0" },
                  { label: "Xabar", icon: Mail, color: "#6366F1" },
                  { label: "Ogohlantirish", icon: TrendingDown, color: "#EF4444" },
                  { label: "Rag'batlantirish", icon: Medal, color: "#111827" },
                ].map(({ label, icon: Icon, color }) => (
                  <button key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", gap: "8px", background: "white", borderRadius: "16px", border: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  >
                    <Icon size={20} color={color} />
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#111827" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI ── */}
      {activeTab === "KPI Ko'rsatkichlari" && (
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>KPI Ko'rsatkichlari</div>
          {kpiRecords.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: "14px" }}>KPI ma'lumotlari topilmadi</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {latestKpi && [
                { name: "Kod sifati", actual: latestKpi.code_quality, target: 90 },
                { name: "Muddatga rioya", actual: latestKpi.deadline_adherence, target: 85 },
                { name: "Bug-fix tezligi", actual: latestKpi.bug_fix_speed, target: 80 },
                { name: "Hujjatlashtirish", actual: latestKpi.documentation, target: 75 },
                { name: "Jamoaviy ishtirok", actual: latestKpi.team_participation, target: 85 },
                { name: "Yangi texnologiyalar", actual: latestKpi.new_technologies, target: 70 },
              ].map(kpi => {
                const pct = Math.min(100, Math.round((kpi.actual / kpi.target) * 100));
                const ok = kpi.actual >= kpi.target;
                return (
                  <div key={kpi.name} style={{ padding: "16px 18px", borderRadius: "14px", background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{kpi.name}</span>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Maqsad: <b>{kpi.target}%</b></span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: ok ? "#10B981" : "#F59E0B" }}>{kpi.actual}%</span>
                        <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "3px 12px", borderRadius: "20px", background: ok ? "#D1FAE5" : "#FEF3C7", color: ok ? "#065F46" : "#92400E" }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: "7px", borderRadius: "10px", background: "#E5E7EB" }}>
                      <div style={{ height: "7px", borderRadius: "10px", width: `${Math.min(pct, 100)}%`, background: ok ? "linear-gradient(90deg,#10B981,#059669)" : "linear-gradient(90deg,#F59E0B,#D97706)", transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BAHOLASH ── */}
      {activeTab === "Baholash" && (
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>Baholash Tarixi</div>
            <Link href="/baholash" style={{ padding: "10px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #00B8A0, #009984)", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              + Yangi Baholash
            </Link>
          </div>
          {evaluations.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Baholashlar yo'q</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {evaluations.map(ev => (
                <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: "14px", background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{EVAL_TYPE_LABEL[ev.eval_type]}</div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "3px" }}>
                      {new Date(ev.created_at).toLocaleDateString("uz-UZ")}
                      {ev.is_anonymous ? " • Anonim" : ""}
                    </div>
                    {ev.comment && <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "5px", fontStyle: "italic" }}>"{ev.comment}"</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: ev.overall_score >= 8 ? "#10B981" : ev.overall_score >= 6 ? "#F59E0B" : "#EF4444" }}>
                      {ev.overall_score}/10
                    </span>
                    {ev.sentiment && (
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: SENTIMENT_COLOR[ev.sentiment] + "22", color: SENTIMENT_COLOR[ev.sentiment], fontWeight: 600 }}>
                        {SENTIMENT_LABEL[ev.sentiment]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VAZIFALAR ── */}
      {activeTab === "Vazifalar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { label: "Jami", value: taskTotal, color: "#6366F1", bg: "#EEF2FF" },
              { label: "Bajarilgan", value: taskDone, color: "#10B981", bg: "#D1FAE5" },
              { label: "Qolgan", value: taskTotal - taskDone, color: "#F59E0B", bg: "#FEF3C7" },
              { label: "Bajarilish %", value: `${taskPct}%`, color: "#00B8A0", bg: "#E8F8F6" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: "white", borderRadius: "16px", padding: "16px 18px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>{label}</div>
                <div style={{ width: "32px", height: "4px", borderRadius: "4px", background: bg, marginTop: "4px" }} />
              </div>
            ))}
          </div>

          {/* Task list card */}
          <div style={{ background: "white", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                  {employee.first_name}ning vazifalari
                </div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                  {isRahbar ? "Rahbar sifatida vazifalar belgilashingiz mumkin" : "Xodimga biriktirilgan vazifalar"}
                </div>
              </div>
              {isRahbar && (
                <AddTaskForm employeeId={empId} onAdd={t => setTasks(prev => [t, ...prev])} />
              )}
            </div>

            {/* Progress bar */}
            {taskTotal > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Umumiy progress</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#00B8A0" }}>{taskPct}%</span>
                </div>
                <div style={{ height: "6px", borderRadius: "10px", background: "#F3F4F6" }}>
                  <div style={{ height: "6px", borderRadius: "10px", width: `${taskPct}%`, background: "linear-gradient(90deg,#00B8A0,#009984)", transition: "width 0.4s" }} />
                </div>
              </div>
            )}

            {tasksLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px", display: "block" }} color="#9CA3AF" />
                Yuklanmoqda...
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <ClipboardList size={40} color="#E5E7EB" style={{ margin: "0 auto 12px", display: "block" }} />
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "4px" }}>Vazifalar yo'q</p>
                {isRahbar && <p style={{ fontSize: "12px", color: "#D1D5DB" }}>Yuqoridagi "Vazifa qo'shish" tugmasidan foydalaning</p>}
              </div>
            ) : (
              <div style={{ maxHeight: "480px", overflowY: "auto" }}>
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} depth={0} onToggle={toggleDone} openIds={openIds} onToggleOpen={toggleOpen} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI TAVSIYALAR ── */}
      {activeTab === "AI Tavsiyalar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {prediction ? (
            <>
              <div style={{ background: "linear-gradient(160deg, #001f18, #003d31)", borderRadius: "24px", padding: "32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,184,160,0.3) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
                    {[
                      { label: "Bashorat USI", value: `${prediction.predicted_usi}%`, color: "#00B8A0" },
                      { label: "Ishonch darajasi", value: `${Math.round(prediction.confidence * 100)}%`, color: "#6366F1" },
                      { label: "Cluster", value: prediction.cluster_label ?? "—", color: "#F59E0B" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{label}</div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {prediction.sentiment_summary && (
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>SENTIMENT TAHLILI</div>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", margin: 0 }}>{prediction.sentiment_summary}</p>
                      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                        {[
                          { label: "Ijobiy", pct: prediction.positive_pct, color: "#10B981" },
                          { label: "Neytral", pct: prediction.neutral_pct, color: "#F59E0B" },
                          { label: "Salbiy", pct: prediction.negative_pct, color: "#EF4444" },
                        ].map(({ label, pct, color }) => pct != null ? (
                          <div key={label} style={{ fontSize: "12px", fontWeight: 700, color, background: color + "22", padding: "3px 10px", borderRadius: "8px" }}>
                            {label}: {pct}%
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {prediction.recommendations && (
                <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Zap size={18} color="#6366F1" />
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>AI Tavsiyalar</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {prediction.recommendations}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "60px 24px", textAlign: "center" }}>
              <Zap size={40} color="#E5E7EB" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: "15px", color: "#9CA3AF" }}>AI bashorat hali yaratilmagan</p>
              <p style={{ fontSize: "13px", color: "#D1D5DB" }}>KPI va baholash ma'lumotlarini qo'shing</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
