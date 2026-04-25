"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderOpen, Plus, Search, X, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Clock, AlertCircle, Flame, Loader2,
  Trash2, User2, Flag, CalendarDays, LayoutList, Kanban,
} from "lucide-react";
import { employeesApi, tasksApi, type Employee, type Task } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/* ─── Constants ────────────────────────────────────────────────────────────── */
const PRIORITY_CFG: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori",  icon: "🔴" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta",   icon: "🟡" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past",    icon: "🟢" },
};

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: "#F3F4F6", color: "#6B7280", label: "Kutmoqda" },
  in_progress: { bg: "#DBEAFE", color: "#1D4ED8", label: "Jarayonda" },
  hr_check:    { bg: "#FEF3C7", color: "#D97706", label: "HR tekshiruvi" },
  done:        { bg: "#D1FAE5", color: "#059669", label: "Bajarildi" },
};

function Skeleton({ h = 60 }: { h?: number }) {
  return (
    <div style={{
      height: h, borderRadius: 12,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

/* ─── New Project Modal ─────────────────────────────────────────────────────── */
function NewProjectModal({
  employees,
  onClose,
  onCreated,
}: {
  employees: Employee[];
  onClose: () => void;
  onCreated: (project: Task, subtasks: Task[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  // Subtasks: each has title, employee_id, priority, due_date
  const [subtasks, setSubtasks] = useState<
    { id: number; title: string; employeeId: number | ""; priority: string; dueDate: string }[]
  >([{ id: Date.now(), title: "", employeeId: "", priority: "medium", dueDate: "" }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addSubtask = () =>
    setSubtasks(prev => [...prev, { id: Date.now(), title: "", employeeId: "", priority: "medium", dueDate: "" }]);

  const removeSubtask = (id: number) =>
    setSubtasks(prev => prev.filter(s => s.id !== id));

  const updateSubtask = (id: number, field: string, value: string | number) =>
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleSave = async () => {
    if (!title.trim()) { setError("Loyiha nomi kiritilishi shart"); return; }
    const validSubs = subtasks.filter(s => s.title.trim() && s.employeeId);
    if (validSubs.length === 0) { setError("Kamida bitta topshiriq va xodim tanlang"); return; }

    setSaving(true);
    setError("");
    try {
      // Use the first assigned employee as project owner
      const firstEmpId = Number(validSubs[0].employeeId);
      const project = await tasksApi.create({
        employee_id: firstEmpId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });

      // Create subtasks under the project
      const createdSubs: Task[] = [];
      for (const sub of validSubs) {
        const t = await tasksApi.create({
          employee_id: Number(sub.employeeId),
          parent_id: project.id,
          title: sub.title.trim(),
          priority: sub.priority,
          due_date: sub.dueDate || undefined,
        });
        createdSubs.push(t);
      }

      onCreated(project, createdSubs);
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
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #00B8A0, #009984)", padding: "24px 28px", borderRadius: "28px 28px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderOpen size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "white" }}>Yangi Loyiha</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Topshiriqlarni xodimlarga bo'lib tashang</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", display: "flex" }}>
            <X size={18} color="white" />
          </button>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          {/* Project fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Loyiha nomi *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Masalan: Mobil ilova v2.0 yaratish"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tavsif</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Loyiha maqsadi va qo'shimcha ma'lumotlar..."
                rows={2}
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Muhimlik</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
                  <option value="high">🔴 Yuqori</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="low">🟢 Past</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tugash muddati</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px" }}>TOPSHIRIQLAR</span>
            <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
          </div>

          {/* Subtasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {subtasks.map((sub, idx) => (
              <div key={sub.id} style={{ background: "#F8FFFE", border: "1.5px solid #E0F5F2", borderRadius: "14px", padding: "14px 16px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#E0F5F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#00B8A0" }}>{idx + 1}</span>
                  </div>
                  <input
                    value={sub.title}
                    onChange={e => updateSubtask(sub.id, "title", e.target.value)}
                    placeholder="Topshiriq nomi *"
                    style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", background: "white" }}
                  />
                  {subtasks.length > 1 && (
                    <button onClick={() => removeSubtask(sub.id)} style={{ background: "#FEE2E2", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                      <X size={13} color="#DC2626" />
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px", gap: "8px", marginTop: "8px", paddingLeft: "30px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>XODIM *</label>
                    <select
                      value={sub.employeeId}
                      onChange={e => updateSubtask(sub.id, "employeeId", e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}
                    >
                      <option value="">Xodim tanlang...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.position})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>MUHIMLIK</label>
                    <select value={sub.priority} onChange={e => updateSubtask(sub.id, "priority", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", background: "white", outline: "none" }}>
                      <option value="high">🔴 Yuqori</option>
                      <option value="medium">🟡 O'rta</option>
                      <option value="low">🟢 Past</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>MUDDAT</label>
                    <input type="date" value={sub.dueDate} onChange={e => updateSubtask(sub.id, "dueDate", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E5E7EB", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSubtask}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", background: "#F0FDF9", border: "1.5px dashed #00B8A0", color: "#00B8A0", fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center" }}
          >
            <Plus size={14} /> Yana topshiriq qo'shish
          </button>

          {error && (
            <div style={{ background: "#FEE2E2", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginTop: "14px" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
            Bekor qilish
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "13px", borderRadius: "12px", background: "linear-gradient(135deg, #00B8A0, #009984)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.8 : 1 }}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FolderOpen size={16} />}
            {saving ? "Saqlanmoqda..." : "Loyiha yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Task Modal ──────────────────────────────────────────────────────── */
function QuickTaskModal({
  employees,
  onClose,
  onCreated,
}: {
  employees: Employee[];
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Vazifa nomi kiritilishi shart"); return; }
    if (!employeeId) { setError("Xodim tanlanishi shart"); return; }
    setSaving(true);
    setError("");
    try {
      const t = await tasksApi.create({
        employee_id: Number(employeeId),
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      onCreated(t);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", padding: "22px 26px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Tezkor Vazifa</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="white" />
          </button>
        </div>
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "12px" }}>
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
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>XODIM *</label>
            <select value={employeeId} onChange={e => setEmployeeId(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
              <option value="">Xodim tanlang...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.position}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>MUHIMLIK</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", background: "white", outline: "none" }}>
                <option value="high">🔴 Yuqori</option>
                <option value="medium">🟡 O'rta</option>
                <option value="low">🟢 Past</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "5px" }}>MUDDAT</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          {error && <div style={{ background: "#FEE2E2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#DC2626" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#F3F4F6", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Bekor qilish</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: saving ? 0.8 : 1 }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TaskItem (tree node) ──────────────────────────────────────────────────── */
function TaskItem({
  task,
  empMap,
  depth,
  onToggleDone,
  onDelete,
}: {
  task: Task;
  empMap: Record<number, Employee>;
  depth: number;
  onToggleDone: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
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
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: `10px 14px 10px ${14 + depth * 24}px`,
        borderRadius: "12px", marginBottom: "3px",
        background: task.is_done ? "#FAFAFA" : isToday ? "rgba(0,184,160,0.04)" : "white",
        border: `1px solid ${isOverdue ? "#FEE2E2" : "#F3F4F6"}`,
        transition: "all 0.15s",
      }}>
        {/* Expand toggle */}
        {hasChildren ? (
          <button onClick={() => setOpen(v => !v)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#9CA3AF", display: "flex", flexShrink: 0 }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span style={{ width: 14, flexShrink: 0 }} />}

        {/* Done toggle */}
        <button
          onClick={() => onToggleDone(task.id, !task.is_done)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexShrink: 0 }}
        >
          {task.is_done
            ? <CheckCircle2 size={18} color="#10B981" />
            : <Circle size={18} color="#D1D5DB" />}
        </button>

        {/* Title */}
        <span style={{ flex: 1, fontSize: depth === 0 ? "14px" : "13px", fontWeight: depth === 0 ? 700 : 500, color: task.is_done ? "#9CA3AF" : "#111827", textDecoration: task.is_done ? "line-through" : "none", minWidth: 0 }}>
          {task.title}
        </span>

        {/* Employee badge */}
        {emp && (
          <Link href={`/employees/${emp.id}`} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: "#EEF2FF", textDecoration: "none", flexShrink: 0 }}>
            <User2 size={11} color="#6366F1" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6366F1", whiteSpace: "nowrap" }}>
              {emp.first_name} {emp.last_name.charAt(0)}.
            </span>
          </Link>
        )}

        {/* Status */}
        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: s.bg, color: s.color, flexShrink: 0, whiteSpace: "nowrap" }}>
          {s.label}
        </span>

        {/* Priority */}
        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color, flexShrink: 0 }}>
          {p.label}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span style={{ fontSize: "11px", color: isOverdue ? "#DC2626" : isToday ? "#00B8A0" : "#9CA3AF", fontWeight: isOverdue || isToday ? 600 : 400, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            {isOverdue && <AlertCircle size={10} />}
            {isToday && <Flame size={10} />}
            {task.due_date.slice(5).replace("-", "/")}
          </span>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          style={{ background: "none", border: "none", padding: "3px", cursor: "pointer", color: "#D1D5DB", display: "flex", flexShrink: 0 }}
          title="O'chirish"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div style={{ borderLeft: "2px dashed #E5E7EB", marginLeft: `${28 + depth * 24}px` }}>
          {task.children.map(c => (
            <TaskItem key={c.id} task={c} empMap={empMap} depth={depth + 1} onToggleDone={onToggleDone} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function VazifalarPage() {
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

  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const emps = await employeesApi.list({ page_size: 100 });
      setEmployees(emps.items);
      // Load tasks for all employees in parallel
      const taskArrays = await Promise.all(
        emps.items.map((e: Employee) =>
          tasksApi.list(e.id, { root_only: true }).catch(() => [] as Task[])
        )
      );
      setAllTasks(taskArrays.flat());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleToggleDone = async (taskId: number, done: boolean) => {
    const updated = await tasksApi.update(taskId, { is_done: done }).catch(() => null);
    if (updated) {
      const patch = (list: Task[]): Task[] =>
        list.map(t => t.id === taskId
          ? { ...t, is_done: updated.is_done, status: updated.status }
          : { ...t, children: patch(t.children) }
        );
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

  // Filter tasks
  const filtered = allTasks.filter(t => {
    if (filterEmp && t.employee_id !== filterEmp) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const total = allTasks.length;
  const done = allTasks.filter(t => t.is_done).length;
  const pending = allTasks.filter(t => t.status === "pending").length;
  const inProgress = allTasks.filter(t => t.status === "in_progress").length;
  const hrCheck = allTasks.filter(t => t.status === "hr_check").length;
  const overdue = allTasks.filter(t => {
    const today = new Date().toISOString().slice(0, 10);
    return t.due_date && t.due_date < today && !t.is_done;
  }).length;

  const canAssign = role === "rahbar" || role === "hr";

  // Kanban columns
  const COLUMNS = [
    { key: "pending",     label: "Kutmoqda",      color: "#6B7280" },
    { key: "in_progress", label: "Jarayonda",     color: "#1D4ED8" },
    { key: "hr_check",    label: "HR tekshiruvi", color: "#D97706" },
    { key: "done",        label: "Bajarildi",     color: "#059669" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {showNewProject && (
        <NewProjectModal
          employees={employees}
          onClose={() => setShowNewProject(false)}
          onCreated={(project, subs) => {
            setAllTasks(prev => [{ ...project, children: subs }, ...prev]);
          }}
        />
      )}
      {showQuickTask && (
        <QuickTaskModal
          employees={employees}
          onClose={() => setShowQuickTask(false)}
          onCreated={t => setAllTasks(prev => [t, ...prev])}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #00B8A0, #009984)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={18} color="white" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>Vazifalar Boshqaruvi</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>
            Barcha xodimlarga vazifalar belgilang va jarayonni kuzating
          </p>
        </div>

        {canAssign && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowQuickTask(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px", background: "white", border: "1.5px solid #E5E7EB", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}
            >
              <Plus size={15} /> Tezkor vazifa
            </button>
            <button
              onClick={() => setShowNewProject(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #00B8A0, #009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,184,160,0.3)" }}
            >
              <FolderOpen size={15} /> Yangi Loyiha
            </button>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
        {[
          { label: "Jami", value: total,      color: "#6366F1", bg: "#EEF2FF" },
          { label: "Bajarildi", value: done,  color: "#10B981", bg: "#D1FAE5" },
          { label: "Jarayonda", value: inProgress, color: "#1D4ED8", bg: "#DBEAFE" },
          { label: "Kutmoqda", value: pending, color: "#6B7280", bg: "#F3F4F6" },
          { label: "HR kutmoqda", value: hrCheck, color: "#D97706", bg: "#FEF3C7" },
          { label: "Kechikkan", value: overdue, color: "#DC2626", bg: "#FEE2E2" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{label}</div>
            <div style={{ height: "3px", borderRadius: "3px", background: bg, marginTop: "8px" }} />
          </div>
        ))}
      </div>

      {/* ── Filters + View toggle ── */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
          <Search size={14} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Vazifa qidirish..."
            style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
          />
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

        {/* View toggle */}
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "10px", padding: "3px", gap: "2px", marginLeft: "auto" }}>
          {([["list", LayoutList], ["kanban", Kanban]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v as "list" | "kanban")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: view === v ? "white" : "transparent", color: view === v ? "#111827" : "#6B7280", boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              <Icon size={14} /> {v === "list" ? "Ro'yxat" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} h={58} />)}
        </div>
      ) : view === "list" ? (
        /* List view */
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
                <TaskItem
                  key={task.id}
                  task={task}
                  empMap={empMap}
                  depth={0}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Kanban view */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", alignItems: "start" }}>
          {COLUMNS.map(col => {
            const colTasks = allTasks.filter(t => t.status === col.key &&
              (!filterEmp || t.employee_id === filterEmp) &&
              (!filterPriority || t.priority === filterPriority) &&
              (!search || t.title.toLowerCase().includes(search.toLowerCase()))
            );
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
                    const today = new Date().toISOString().slice(0, 10);
                    const overdue = !!t.due_date && t.due_date < today && !t.is_done;
                    return (
                      <div key={t.id} style={{ background: "white", borderRadius: "12px", padding: "12px 14px", border: `1px solid ${overdue ? "#FEE2E2" : "#E5E7EB"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px", lineHeight: 1.4 }}>{t.title}</div>
                        {emp && (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: "8px", fontWeight: 700, color: "white" }}>{emp.avatar_initials}</span>
                            </div>
                            <span style={{ fontSize: "11px", color: "#6B7280" }}>{emp.first_name} {emp.last_name}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color }}>{p.label}</span>
                          {t.due_date && (
                            <span style={{ fontSize: "10px", color: overdue ? "#DC2626" : "#9CA3AF", display: "flex", alignItems: "center", gap: "3px" }}>
                              {overdue && <AlertCircle size={9} />}
                              <CalendarDays size={9} />
                              {t.due_date.slice(5).replace("-", "/")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#D1D5DB", fontSize: "12px" }}>Bo'sh</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
