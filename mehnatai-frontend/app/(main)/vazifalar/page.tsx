"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderOpen, Plus, Search, X, ChevronDown, ChevronRight,
  CheckCircle2, Circle, AlertCircle, Flame, Loader2,
  Trash2, User2, Flag, CalendarDays, LayoutList, Kanban,
  Edit3, Save, Paperclip, Upload, FileText, Download, Clock,
} from "lucide-react";
import { employeesApi, tasksApi, taskReportsApi, type Employee, type Task } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const PRIORITY_CFG: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past" },
};

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: "#F3F4F6", color: "#6B7280", label: "Kutmoqda" },
  in_progress: { bg: "#DBEAFE", color: "#1D4ED8", label: "Jarayonda" },
  hr_check:    { bg: "#FEF3C7", color: "#D97706", label: "HR tekshiruvi" },
  done:        { bg: "#D1FAE5", color: "#059669", label: "Bajarildi" },
};

function Sk({ h = 60 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 12, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

/* ─── Task Detail / Edit Modal ───────────────────────────────────────────────── */
function TaskDetailModal({
  task,
  employees,
  onClose,
  onUpdated,
  onDeleted,
  onSubtaskAdded,
}: {
  task: Task;
  employees: Employee[];
  onClose: () => void;
  onUpdated: (t: Task) => void;
  onDeleted: (id: number) => void;
  onSubtaskAdded: (parentId: number, sub: Task) => void;
}) {
  // Edit state
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(task.priority as "high" | "medium" | "low");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [employeeId, setEmployeeId] = useState<number>(task.employee_id);
  const [status, setStatus] = useState<"pending" | "in_progress" | "hr_check" | "done">(task.status as "pending" | "in_progress" | "hr_check" | "done");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Add subtask state
  const [showSubForm, setShowSubForm] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [subEmpId, setSubEmpId] = useState<number | "">("");
  const [subPriority, setSubPriority] = useState("medium");
  const [subDueDate, setSubDueDate] = useState("");
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState("");

  const dirty = title !== task.title || description !== (task.description ?? "") ||
    priority !== task.priority || dueDate !== (task.due_date ?? "") ||
    employeeId !== task.employee_id || status !== task.status;

  const handleSave = async () => {
    if (!title.trim()) { setSaveError("Nomi bo'sh bo'lmasin"); return; }
    setSaving(true); setSaveError("");
    try {
      const updated = await tasksApi.update(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as Task["priority"],
        due_date: dueDate || undefined,
        status: status as Task["status"],
      });
      onUpdated(updated);
      onClose();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSub = async () => {
    if (!subTitle.trim()) { setSubError("Topshiriq nomini kiriting"); return; }
    if (!subEmpId) { setSubError("Xodim tanlanishi shart"); return; }
    setSubSaving(true); setSubError("");
    try {
      const sub = await tasksApi.create({
        employee_id: Number(subEmpId),
        parent_id: task.id,
        title: subTitle.trim(),
        priority: subPriority,
        due_date: subDueDate || undefined,
      });
      onSubtaskAdded(task.id, sub);
      setSubTitle(""); setSubEmpId(""); setSubPriority("medium"); setSubDueDate("");
      setShowSubForm(false);
    } catch (e: unknown) {
      setSubError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSubSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${task.title}" o'chirilsinmi?`)) return;
    await tasksApi.delete(task.id).catch(() => null);
    onDeleted(task.id);
    onClose();
  };

  const subtasks = task.children ?? [];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "28px", width: "100%", maxWidth: "620px", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #00B8A0, #009984)", padding: "22px 26px", borderRadius: "28px 28px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Edit3 size={18} color="white" />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Vazifani Tahrirlash</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>ID: #{task.id}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleDelete} style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", padding: "7px 14px", cursor: "pointer", color: "white", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
              <Trash2 size={13} /> O'chirish
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "7px", cursor: "pointer", display: "flex" }}>
              <X size={18} color="white" />
            </button>
          </div>
        </div>

        <div style={{ padding: "22px 26px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* ── Edit fields ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Vazifa nomi</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "10px 13px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Tavsif</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Qo'shimcha ma'lumot..." style={{ width: "100%", padding: "10px 13px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Xodim</label>
                <select value={employeeId} onChange={e => setEmployeeId(Number(e.target.value))} style={{ width: "100%", padding: "9px 10px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Muhimlik</label>
                <select value={priority} onChange={e => setPriority(e.target.value as "high" | "medium" | "low")} style={{ width: "100%", padding: "9px 10px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                  <option value="high">🔴 Yuqori</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="low">🟢 Past</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as "pending" | "in_progress" | "hr_check" | "done")} style={{ width: "100%", padding: "9px 10px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                  <option value="pending">Kutmoqda</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="hr_check">HR tekshiruvi</option>
                  <option value="done">Bajarildi</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>Muddat</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            {saveError && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#DC2626" }}>{saveError}</div>}
            {dirty && (
              <button onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.8 : 1 }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                {saving ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
              </button>
            )}
          </div>

          {/* ── Divider ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px" }}>
              ICHKI TOPSHIRIQLAR ({subtasks.length})
            </span>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
          </div>

          {/* ── Existing subtasks ── */}
          {subtasks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {subtasks.map(sub => {
                const p = PRIORITY_CFG[sub.priority] ?? PRIORITY_CFG.medium;
                const s = STATUS_CFG[sub.status] ?? STATUS_CFG.pending;
                const emp = employees.find(e => e.id === sub.employee_id);
                return (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "12px", background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                    {sub.is_done ? <CheckCircle2 size={16} color="#10B981" /> : <Circle size={16} color="#D1D5DB" />}
                    <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: sub.is_done ? "#9CA3AF" : "#111827", textDecoration: sub.is_done ? "line-through" : "none" }}>{sub.title}</span>
                    {emp && (
                      <span style={{ fontSize: "11px", color: "#6366F1", fontWeight: 600, background: "#EEF2FF", padding: "2px 8px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                        {emp.first_name} {emp.last_name.charAt(0)}.
                      </span>
                    )}
                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "6px", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "6px", background: p.bg, color: p.color, whiteSpace: "nowrap" }}>{p.label}</span>
                    {sub.due_date && <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{sub.due_date.slice(5).replace("-", "/")}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Add subtask form ── */}
          {showSubForm ? (
            <div style={{ background: "#F0FDF9", border: "1.5px solid #00B8A0", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={14} color="#00B8A0" /> Yangi ichki topshiriq
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input value={subTitle} onChange={e => setSubTitle(e.target.value)} placeholder="Topshiriq nomi *" style={{ padding: "9px 12px", borderRadius: "9px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>XODIM *</label>
                    <select value={subEmpId} onChange={e => setSubEmpId(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: "9px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                      <option value="">Tanlang...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>MUHIMLIK</label>
                    <select value={subPriority} onChange={e => setSubPriority(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "9px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                      <option value="high">🔴 Yuqori</option>
                      <option value="medium">🟡 O'rta</option>
                      <option value="low">🟢 Past</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>MUDDAT</label>
                    <input type="date" value={subDueDate} onChange={e => setSubDueDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "9px", border: "1.5px solid #E5E7EB", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                {subError && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "7px 11px", fontSize: "12px", color: "#DC2626" }}>{subError}</div>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setShowSubForm(false)} style={{ flex: 1, padding: "9px", borderRadius: "9px", background: "#F3F4F6", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Bekor</button>
                  <button onClick={handleAddSub} disabled={subSaving} style={{ flex: 2, padding: "9px", borderRadius: "9px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "12px", fontWeight: 700, cursor: subSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: subSaving ? 0.8 : 1 }}>
                    {subSaving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                    {subSaving ? "Saqlanmoqda..." : "Qo'shish"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowSubForm(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "12px", background: "#F0FDF9", border: "1.5px dashed #00B8A0", color: "#00B8A0", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              <Plus size={14} /> Ichki topshiriq qo'shish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── New Project Modal ──────────────────────────────────────────────────────── */
function NewProjectModal({
  employees, onClose, onCreated,
}: {
  employees: Employee[];
  onClose: () => void;
  onCreated: (project: Task, subtasks: Task[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<
    { id: number; title: string; employeeId: number | ""; priority: string; dueDate: string }[]
  >([{ id: Date.now(), title: "", employeeId: "", priority: "medium", dueDate: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addSub = () => setSubtasks(p => [...p, { id: Date.now(), title: "", employeeId: "", priority: "medium", dueDate: "" }]);
  const removeSub = (id: number) => setSubtasks(p => p.filter(s => s.id !== id));
  const updateSub = (id: number, f: string, v: string | number) => setSubtasks(p => p.map(s => s.id === id ? { ...s, [f]: v } : s));

  const handleSave = async () => {
    if (!title.trim()) { setError("Loyiha nomi kiritilishi shart"); return; }
    const valid = subtasks.filter(s => s.title.trim() && s.employeeId);
    if (!valid.length) { setError("Kamida bitta topshiriq va xodim tanlang"); return; }
    setSaving(true); setError("");
    try {
      const firstEmpId = Number(valid[0].employeeId);
      const project = await tasksApi.create({ employee_id: firstEmpId, title: title.trim(), description: description.trim() || undefined, priority, due_date: dueDate || undefined });
      const subs: Task[] = [];
      for (const s of valid) {
        const t = await tasksApi.create({ employee_id: Number(s.employeeId), parent_id: project.id, title: s.title.trim(), priority: s.priority, due_date: s.dueDate || undefined });
        subs.push(t);
      }
      onCreated(project, subs);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "28px", width: "100%", maxWidth: "640px", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <div style={{ background: "linear-gradient(135deg,#00B8A0,#009984)", padding: "24px 28px", borderRadius: "28px 28px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderOpen size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "white" }}>Yangi Loyiha</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Topshiriqlarni xodimlarga bo'lib tashang</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", display: "flex" }}><X size={18} color="white" /></button>
        </div>
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Loyiha nomi *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Masalan: Mobil ilova v2.0 yaratish" style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Tavsif</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Loyiha maqsadi..." rows={2} style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Muhimlik</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
                  <option value="high">🔴 Yuqori</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="low">🟢 Past</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Tugash muddati</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px" }}>TOPSHIRIQLAR</span>
            <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {subtasks.map((sub, idx) => (
              <div key={sub.id} style={{ background: "#F8FFFE", border: "1.5px solid #E0F5F2", borderRadius: "14px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#E0F5F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#00B8A0" }}>{idx + 1}</span>
                  </div>
                  <input value={sub.title} onChange={e => updateSub(sub.id, "title", e.target.value)} placeholder="Topshiriq nomi *" style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", background: "white" }} />
                  {subtasks.length > 1 && (
                    <button onClick={() => removeSub(sub.id)} style={{ background: "#FEE2E2", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", flexShrink: 0 }}><X size={13} color="#DC2626" /></button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px", gap: "8px", paddingLeft: "30px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>XODIM *</label>
                    <select value={sub.employeeId} onChange={e => updateSub(sub.id, "employeeId", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                      <option value="">Xodim tanlang...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.position})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>MUHIMLIK</label>
                    <select value={sub.priority} onChange={e => updateSub(sub.id, "priority", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                      <option value="high">🔴 Yuqori</option>
                      <option value="medium">🟡 O'rta</option>
                      <option value="low">🟢 Past</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>MUDDAT</label>
                    <input type="date" value={sub.dueDate} onChange={e => updateSub(sub.id, "dueDate", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addSub} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", background: "#F0FDF9", border: "1.5px dashed #00B8A0", color: "#00B8A0", fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center" }}>
            <Plus size={14} /> Yana topshiriq qo'shish
          </button>
          {error && <div style={{ background: "#FEE2E2", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginTop: "14px" }}>{error}</div>}
        </div>
        <div style={{ padding: "16px 28px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Bekor qilish</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "13px", borderRadius: "12px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.8 : 1 }}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FolderOpen size={16} />}
            {saving ? "Saqlanmoqda..." : "Loyiha yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Task Modal ───────────────────────────────────────────────────────── */
function QuickTaskModal({ employees, onClose, onCreated }: { employees: Employee[]; onClose: () => void; onCreated: (t: Task) => void }) {
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [employeeId, setEmployeeId] = useState<number | "">("");
  const [priority, setPriority] = useState("medium"); const [dueDate, setDueDate] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const handleSave = async () => {
    if (!title.trim()) { setError("Vazifa nomi kiritilishi shart"); return; }
    if (!employeeId) { setError("Xodim tanlanishi shart"); return; }
    setSaving(true); setError("");
    try { const t = await tasksApi.create({ employee_id: Number(employeeId), title: title.trim(), description: description.trim() || undefined, priority, due_date: dueDate || undefined }); onCreated(t); onClose(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", padding: "22px 26px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Tezkor Vazifa</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}><X size={16} color="white" /></button>
        </div>
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Vazifa nomi *" style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none" }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tavsif (ixtiyoriy)" rows={2} style={{ padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit" }} />
          <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>XODIM *</label>
            <select value={employeeId} onChange={e => setEmployeeId(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
              <option value="">Xodim tanlang...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.position}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>MUHIMLIK</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
                <option value="high">🔴 Yuqori</option><option value="medium">🟡 O'rta</option><option value="low">🟢 Past</option>
              </select>
            </div>
            <div><label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>MUDDAT</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          {error && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#DC2626" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#F3F4F6", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Bekor qilish</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#4F46E5)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: saving ? 0.8 : 1 }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TaskItem ───────────────────────────────────────────────────────────────── */
function TaskItem({
  task, empMap, depth, onToggleDone, onDelete, onOpenDetail,
}: {
  task: Task; empMap: Record<number, Employee>; depth: number;
  onToggleDone: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
  onOpenDetail: (t: Task) => void;
}) {
  const [open, setOpen] = useState(true);
  const p = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.medium;
  const s = STATUS_CFG[task.status] ?? STATUS_CFG.pending;
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !!task.due_date && task.due_date < today && !task.is_done;
  const isToday = task.due_date === today;
  const emp = task.employee_id ? empMap[task.employee_id] : null;
  const hasChildren = task.children && task.children.length > 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: `10px 14px 10px ${14 + depth * 24}px`, borderRadius: "12px", marginBottom: "3px", background: task.is_done ? "#FAFAFA" : isToday ? "rgba(0,184,160,0.04)" : "white", border: `1px solid ${isOverdue ? "#FEE2E2" : "#F3F4F6"}` }}>
        {hasChildren ? (
          <button onClick={() => setOpen(v => !v)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#9CA3AF", display: "flex", flexShrink: 0 }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span style={{ width: 14, flexShrink: 0 }} />}

        <button onClick={() => onToggleDone(task.id, !task.is_done)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexShrink: 0 }}>
          {task.is_done ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color="#D1D5DB" />}
        </button>

        {/* Clickable title → opens detail modal */}
        <button
          onClick={() => onOpenDetail(task)}
          style={{ flex: 1, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontSize: depth === 0 ? "14px" : "13px", fontWeight: depth === 0 ? 700 : 500, color: task.is_done ? "#9CA3AF" : "#111827", textDecoration: task.is_done ? "line-through" : "none", minWidth: 0, display: "flex", alignItems: "center", gap: "6px" }}
        >
          {task.title}
          {hasChildren && <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 400 }}>({task.children.length} ta topshiriq)</span>}
          <Edit3 size={11} color="#D1D5DB" style={{ flexShrink: 0 }} />
        </button>

        {emp && (
          <Link href={`/employees/${emp.id}`} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: "#EEF2FF", textDecoration: "none", flexShrink: 0 }}>
            <User2 size={11} color="#6366F1" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6366F1", whiteSpace: "nowrap" }}>{emp.first_name} {emp.last_name.charAt(0)}.</span>
          </Link>
        )}
        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: s.bg, color: s.color, flexShrink: 0, whiteSpace: "nowrap" }}>{s.label}</span>
        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
        {task.due_date && (
          <span style={{ fontSize: "11px", color: isOverdue ? "#DC2626" : isToday ? "#00B8A0" : "#9CA3AF", fontWeight: isOverdue || isToday ? 600 : 400, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            {isOverdue && <AlertCircle size={10} />}{isToday && <Flame size={10} />}
            {task.due_date.slice(5).replace("-", "/")}
          </span>
        )}
        <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", padding: "3px", cursor: "pointer", color: "#D1D5DB", display: "flex", flexShrink: 0 }}><Trash2 size={13} /></button>
      </div>

      {hasChildren && open && (
        <div style={{ borderLeft: "2px dashed #E5E7EB", marginLeft: `${28 + depth * 24}px` }}>
          {task.children.map(c => (
            <TaskItem key={c.id} task={c} empMap={empMap} depth={depth + 1} onToggleDone={onToggleDone} onDelete={onDelete} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Report Modal ───────────────────────────────────────────────────────────── */
function ReportModal({ task, onClose, onSubmitted }: {
  task: Task;
  onClose: () => void;
  onSubmitted: (updated: Task) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setUploading(true); setError("");
    try {
      if (files.length > 0) {
        await taskReportsApi.upload(task.id, files, comment);
      }
      const updated = await tasksApi.update(task.id, { is_done: true });
      onSubmitted(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const fmtSize = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "520px", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#00B8A0,#009984)", padding: "22px 26px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "4px" }}>Hisobot yuborish</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", maxWidth: "360px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}><X size={16} color="white" /></button>
        </div>

        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          {/* Drag & Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("report-file-input")?.click()}
            style={{ border: `2px dashed ${dragging ? "#00B8A0" : "#D1D5DB"}`, borderRadius: "16px", padding: "28px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(0,184,160,0.04)" : "#FAFAFA", transition: "all 0.15s" }}
          >
            <input id="report-file-input" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
            <Upload size={28} color={dragging ? "#00B8A0" : "#9CA3AF"} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Fayllarni shu yerga tashlang yoki bosing</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF" }}>Rasm, PDF, Word, Excel — maks 20 MB</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                  <Paperclip size={14} color="#6B7280" />
                  <span style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>{fmtSize(f.size)}</span>
                  <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: "#D1D5DB" }}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px" }}>IZOH (IXTIYORIY)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Bajarilgan ish haqida qisqacha yozing..." rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ background: "#FEE2E2", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626" }}>{error}</div>}
        </div>

        <div style={{ padding: "16px 26px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Bekor qilish</button>
          <button onClick={handleSubmit} disabled={uploading} style={{ flex: 2, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: uploading ? 0.8 : 1 }}>
            {uploading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={16} />}
            {uploading ? "Yuklanmoqda..." : "Bajarildi deb belgilash"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Xodim Task Card ────────────────────────────────────────────────────────── */
function XodimTaskCard({ task, onMarkDone, onUpdate }: {
  task: Task;
  onMarkDone: () => void;
  onUpdate: (t: Task) => void;
}) {
  const p = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.medium;
  const s = STATUS_CFG[task.status] ?? STATUS_CFG.pending;
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !!task.due_date && task.due_date < today && !task.is_done;
  const [expanded, setExpanded] = useState(false);

  const canMarkDone = task.status === "pending" || task.status === "in_progress";

  const handleStartWork = async () => {
    if (task.status === "pending") {
      const updated = await tasksApi.update(task.id, { status: "in_progress" }).catch(() => null);
      if (updated) onUpdate(updated);
    }
  };

  return (
    <div style={{ background: "white", borderRadius: "16px", border: `1.5px solid ${isOverdue ? "#FEE2E2" : task.status === "done" ? "#D1FAE5" : task.status === "hr_check" ? "#FEF3C7" : "#E5E7EB"}`, overflow: "hidden", marginBottom: "10px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Status icon */}
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          {task.status === "done" ? <CheckCircle2 size={22} color="#10B981" /> :
           task.status === "hr_check" ? <Clock size={22} color="#D97706" /> :
           task.status === "in_progress" ? <Loader2 size={22} color="#1D4ED8" style={{ animation: "spin 2s linear infinite" }} /> :
           <Circle size={22} color="#D1D5DB" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: task.status === "done" ? "#9CA3AF" : "#111827", textDecoration: task.status === "done" ? "line-through" : "none" }}>{task.title}</span>
            <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: s.bg, color: s.color }}>{s.label}</span>
            <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color }}>{p.label}</span>
          </div>

          {task.description && <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px", lineHeight: 1.5 }}>{task.description}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            {task.due_date && (
              <span style={{ fontSize: "12px", color: isOverdue ? "#DC2626" : "#6B7280", display: "flex", alignItems: "center", gap: "4px", fontWeight: isOverdue ? 600 : 400 }}>
                {isOverdue && <AlertCircle size={11} />}<CalendarDays size={11} />
                {new Date(task.due_date).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })}
                {isOverdue && " — muddati o'tgan!"}
              </span>
            )}
            {task.reports && task.reports.length > 0 && (
              <button onClick={() => setExpanded(v => !v)} style={{ fontSize: "12px", color: "#6366F1", display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                <Paperclip size={11} /> {task.reports.length} ta fayl
                {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
          {task.status === "pending" && (
            <button onClick={handleStartWork} style={{ padding: "7px 14px", borderRadius: "10px", background: "#EEF2FF", border: "none", fontSize: "12px", fontWeight: 600, color: "#4F46E5", cursor: "pointer", whiteSpace: "nowrap" }}>
              Boshlash
            </button>
          )}
          {canMarkDone && (
            <button onClick={onMarkDone} style={{ padding: "7px 14px", borderRadius: "10px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", fontSize: "12px", fontWeight: 700, color: "white", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={12} /> Bajarildi
            </button>
          )}
          {task.status === "hr_check" && (
            <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600, padding: "7px 10px", background: "#FEF3C7", borderRadius: "10px", whiteSpace: "nowrap" }}>HR kutmoqda</span>
          )}
          {task.status === "done" && (
            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600, padding: "7px 10px", background: "#D1FAE5", borderRadius: "10px", whiteSpace: "nowrap" }}>Tasdiqlangan</span>
          )}
        </div>
      </div>

      {/* Attached reports */}
      {expanded && task.reports && task.reports.length > 0 && (
        <div style={{ padding: "0 20px 16px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", marginBottom: "4px" }}>YUKLANGAN FAYLLAR</div>
          {task.reports.map(r => (
            <button key={r.id} onClick={() => taskReportsApi.download(r.id, r.original_name)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB", textDecoration: "none", cursor: "pointer", width: "100%" }}>
              <FileText size={14} color="#6366F1" />
              <span style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.original_name}</span>
              {r.file_size && <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0 }}>{r.file_size > 1048576 ? `${(r.file_size / 1048576).toFixed(1)} MB` : `${(r.file_size / 1024).toFixed(0)} KB`}</span>}
              <Download size={13} color="#9CA3AF" />
            </button>
          ))}
          {task.reports[0]?.comment && (
            <div style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic", padding: "8px 12px", background: "#F3F4F6", borderRadius: "8px", marginTop: "4px" }}>"{task.reports[0].comment}"</div>
          )}
        </div>
      )}

      {/* Subtasks */}
      {task.children && task.children.length > 0 && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 20px", background: "#FAFAFA" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", marginBottom: "8px" }}>ICHKI TOPSHIRIQLAR ({task.children.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {task.children.map(child => {
              const cs = STATUS_CFG[child.status] ?? STATUS_CFG.pending;
              return (
                <div key={child.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", background: "white", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                  {child.is_done ? <CheckCircle2 size={14} color="#10B981" /> : <Circle size={14} color="#D1D5DB" />}
                  <span style={{ flex: 1, fontSize: "12px", color: child.is_done ? "#9CA3AF" : "#374151", textDecoration: child.is_done ? "line-through" : "none" }}>{child.title}</span>
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "5px", background: cs.bg, color: cs.color }}>{cs.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Xodim Vazifalar View ───────────────────────────────────────────────────── */
function XodimVazifalarView({ employeeId }: { employeeId: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("");
  const [reportTask, setReportTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list(employeeId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const TABS = [
    { key: "", label: "Barchasi" },
    { key: "pending", label: "Kutmoqda" },
    { key: "in_progress", label: "Jarayonda" },
    { key: "hr_check", label: "HR tekshirmoqda" },
    { key: "done", label: "Bajarilgan" },
  ];

  const rootTasks = tasks.filter(t => !t.parent_id);
  const filtered = filterTab ? rootTasks.filter(t => t.status === filterTab) : rootTasks;

  const stats = {
    total: rootTasks.length,
    done: rootTasks.filter(t => t.is_done).length,
    inProgress: rootTasks.filter(t => t.status === "in_progress").length,
    pending: rootTasks.filter(t => t.status === "pending").length,
    hrCheck: rootTasks.filter(t => t.status === "hr_check").length,
  };

  const handleUpdate = (updated: Task) =>
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));

  const handleSubmitted = (updated: Task) => {
    handleUpdate(updated);
    setReportTask(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {reportTask && <ReportModal task={reportTask} onClose={() => setReportTask(null)} onSubmitted={handleSubmitted} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: 0 }}>Mening Vazifalarim</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>{rootTasks.length} ta vazifa</p>
        </div>
        <button onClick={loadTasks} style={{ padding: "9px 18px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Yangilash</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
        {[
          { label: "Jami",         value: stats.total,      color: "#6366F1", bg: "#EEF2FF" },
          { label: "Kutmoqda",     value: stats.pending,    color: "#6B7280", bg: "#F3F4F6" },
          { label: "Jarayonda",    value: stats.inProgress, color: "#1D4ED8", bg: "#DBEAFE" },
          { label: "HR kutmoqda",  value: stats.hrCheck,    color: "#D97706", bg: "#FEF3C7" },
          { label: "Bajarildi",    value: stats.done,       color: "#10B981", bg: "#D1FAE5" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{label}</div>
            <div style={{ height: "3px", borderRadius: "3px", background: bg, marginTop: "8px" }} />
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", background: "white", borderRadius: "14px", padding: "6px", border: "1px solid #E5E7EB", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilterTab(tab.key)} style={{ padding: "8px 16px", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: filterTab === tab.key ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "transparent", color: filterTab === tab.key ? "white" : "#6B7280", transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{[1,2,3].map(i => <Sk key={i} h={90} />)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", border: "1px solid #E5E7EB" }}>
          <CheckCircle2 size={44} color="#E5E7EB" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Bu bo'limda vazifalar yo'q</p>
        </div>
      ) : (
        <div>
          {filtered.map(task => (
            <XodimTaskCard key={task.id} task={task} onMarkDone={() => setReportTask(task)} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
/* ─── Router: branches between xodim and management views ───────────────────── */
export default function VazifalarPage() {
  const { role, user } = useAuth();
  if (role === "xodim") {
    const empId = user?.employee_id;
    if (!empId) return <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Xodim profili topilmadi. HR bilan bog'laning.</div>;
    return <XodimVazifalarView employeeId={empId} />;
  }
  return <ManagementView />;
}

/* ─── Management View (rahbar / hr) ─────────────────────────────────────────── */
function ManagementView() {
  const { role } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEmp, setFilterEmp] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [showNewProject, setShowNewProject] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const emps = await employeesApi.list({ page_size: 100 });
      setEmployees(emps.items);
      const taskArrays = await Promise.all(
        emps.items.map((e: Employee) => tasksApi.list(e.id, { root_only: true }).catch(() => [] as Task[]))
      );
      setAllTasks(taskArrays.flat());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Helpers to patch state ── */
  const patchTask = useCallback((updated: Task) => {
    setAllTasks(prev => prev.map(t => t.id === updated.id ? { ...updated, children: t.children } : t));
    setDetailTask(prev => prev?.id === updated.id ? { ...updated, children: prev.children } : prev);
  }, []);

  const removeTask = useCallback((id: number) => {
    setAllTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addSubtaskToTree = useCallback((parentId: number, sub: Task) => {
    setAllTasks(prev => prev.map(t =>
      t.id === parentId ? { ...t, children: [...(t.children ?? []), sub] } : t
    ));
    setDetailTask(prev =>
      prev?.id === parentId ? { ...prev, children: [...(prev.children ?? []), sub] } : prev
    );
  }, []);

  const handleToggleDone = async (taskId: number, done: boolean) => {
    const updated = await tasksApi.update(taskId, { is_done: done }).catch(() => null);
    if (updated) {
      const patch = (list: Task[]): Task[] =>
        list.map(t => t.id === taskId ? { ...t, is_done: updated.is_done, status: updated.status } : { ...t, children: patch(t.children) });
      setAllTasks(prev => patch(prev));
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Bu vazifani o'chirmoqchimisiz?")) return;
    await tasksApi.delete(taskId).catch(() => null);
    const remove = (list: Task[]): Task[] =>
      list.filter(t => t.id !== taskId).map(t => ({ ...t, children: remove(t.children) }));
    setAllTasks(prev => remove(prev));
  };

  const filtered = allTasks.filter(t => {
    if (filterEmp && t.employee_id !== filterEmp) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = allTasks.length;
  const done = allTasks.filter(t => t.is_done).length;
  const inProgress = allTasks.filter(t => t.status === "in_progress").length;
  const pending = allTasks.filter(t => t.status === "pending").length;
  const hrCheck = allTasks.filter(t => t.status === "hr_check").length;
  const overdue = allTasks.filter(t => { const d = new Date().toISOString().slice(0, 10); return t.due_date && t.due_date < d && !t.is_done; }).length;
  const canAssign = role === "rahbar" || role === "hr";

  const COLUMNS = [
    { key: "pending",     label: "Kutmoqda",      color: "#6B7280" },
    { key: "in_progress", label: "Jarayonda",     color: "#1D4ED8" },
    { key: "hr_check",    label: "HR tekshiruvi", color: "#D97706" },
    { key: "done",        label: "Bajarildi",     color: "#059669" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {showNewProject && <NewProjectModal employees={employees} onClose={() => setShowNewProject(false)} onCreated={(project, subs) => setAllTasks(prev => [{ ...project, children: subs }, ...prev])} />}
      {showQuickTask && <QuickTaskModal employees={employees} onClose={() => setShowQuickTask(false)} onCreated={t => setAllTasks(prev => [t, ...prev])} />}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          employees={employees}
          onClose={() => setDetailTask(null)}
          onUpdated={patchTask}
          onDeleted={removeTask}
          onSubtaskAdded={addSubtaskToTree}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#00B8A0,#009984)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={18} color="white" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>Vazifalar Boshqaruvi</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Barcha xodimlarga vazifalar belgilang va jarayonni kuzating</p>
        </div>
        {canAssign && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowQuickTask(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px", background: "white", border: "1.5px solid #E5E7EB", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              <Plus size={15} /> Tezkor vazifa
            </button>
            <button onClick={() => setShowNewProject(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,184,160,0.3)" }}>
              <FolderOpen size={15} /> Yangi Loyiha
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
        {[
          { label: "Jami",        value: total,      color: "#6366F1", bg: "#EEF2FF" },
          { label: "Bajarildi",   value: done,       color: "#10B981", bg: "#D1FAE5" },
          { label: "Jarayonda",   value: inProgress, color: "#1D4ED8", bg: "#DBEAFE" },
          { label: "Kutmoqda",    value: pending,    color: "#6B7280", bg: "#F3F4F6" },
          { label: "HR kutmoqda", value: hrCheck,    color: "#D97706", bg: "#FEF3C7" },
          { label: "Kechikkan",   value: overdue,    color: "#DC2626", bg: "#FEE2E2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{label}</div>
            <div style={{ height: "3px", borderRadius: "3px", background: bg, marginTop: "8px" }} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
          <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Vazifa qidirish..." style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value ? Number(e.target.value) : "")} style={{ padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none", flex: "1 1 160px", minWidth: "140px" }}>
          <option value="">Barcha xodimlar</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
          <option value="">Barcha statuslar</option>
          <option value="pending">Kutmoqda</option>
          <option value="in_progress">Jarayonda</option>
          <option value="hr_check">HR tekshiruvi</option>
          <option value="done">Bajarildi</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
          <option value="">Barcha muhimlik</option>
          <option value="high">🔴 Yuqori</option>
          <option value="medium">🟡 O'rta</option>
          <option value="low">🟢 Past</option>
        </select>
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "10px", padding: "3px", gap: "2px", marginLeft: "auto" }}>
          {([["list", LayoutList, "Ro'yxat"], ["kanban", Kanban, "Kanban"]] as const).map(([v, Icon, lbl]) => (
            <button key={v} onClick={() => setView(v as "list" | "kanban")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: view === v ? "white" : "transparent", color: view === v ? "#111827" : "#6B7280", boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              <Icon size={14} /> {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{[1,2,3,4].map(i => <Sk key={i} h={58} />)}</div>
      ) : view === "list" ? (
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #E5E7EB", padding: "16px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
              <Flag size={40} color="#E5E7EB" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px" }}>Vazifalar topilmadi</p>
              {canAssign && <p style={{ fontSize: "12px", color: "#D1D5DB" }}>Yuqoridagi "Yangi Loyiha" tugmasidan boshlang</p>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {filtered.map(task => (
                <TaskItem key={task.id} task={task} empMap={empMap} depth={0} onToggleDone={handleToggleDone} onDelete={handleDelete} onOpenDetail={setDetailTask} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", alignItems: "start" }}>
          {COLUMNS.map(col => {
            const colTasks = allTasks.filter(t => t.status === col.key && (!filterEmp || t.employee_id === filterEmp) && (!filterPriority || t.priority === filterPriority) && (!search || t.title.toLowerCase().includes(search.toLowerCase())));
            return (
              <div key={col.key} style={{ background: "#FAFAFA", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "2px solid " + col.color, background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{col.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px", background: col.color + "22", color: col.color }}>{colTasks.length}</span>
                  </div>
                </div>
                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "120px" }}>
                  {colTasks.map(t => {
                    const p = PRIORITY_CFG[t.priority] ?? PRIORITY_CFG.medium;
                    const emp = t.employee_id ? empMap[t.employee_id] : null;
                    const d = new Date().toISOString().slice(0, 10);
                    const od = !!t.due_date && t.due_date < d && !t.is_done;
                    return (
                      <div key={t.id} onClick={() => setDetailTask(t)} style={{ background: "white", borderRadius: "12px", padding: "12px 14px", border: `1px solid ${od ? "#FEE2E2" : "#E5E7EB"}`, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px", lineHeight: 1.4 }}>{t.title}</div>
                        {emp && <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                          <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "linear-gradient(135deg,#6366F1,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "8px", fontWeight: 700, color: "white" }}>{emp.avatar_initials}</span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#6B7280" }}>{emp.first_name} {emp.last_name}</span>
                        </div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color }}>{p.label}</span>
                          {t.due_date && <span style={{ fontSize: "10px", color: od ? "#DC2626" : "#9CA3AF", display: "flex", alignItems: "center", gap: "3px" }}>{od && <AlertCircle size={9} />}<CalendarDays size={9} />{t.due_date.slice(5).replace("-", "/")}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <div style={{ textAlign: "center", padding: "20px", color: "#D1D5DB", fontSize: "12px" }}>Bo'sh</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
