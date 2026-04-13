"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronRight, ChevronDown, Plus, Flame, AlertCircle, Filter } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { tasksApi, type Task } from "@/lib/api";

const PRIORITY_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past" },
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Kutmoqda",
  in_progress: "Jarayonda",
  done: "Bajarildi",
};

function TaskRow({ task, depth, onToggle, openIds, onToggleOpen }: {
  task: Task; depth: number;
  onToggle: (id: number) => void;
  openIds: Set<number>;
  onToggleOpen: (id: number) => void;
}) {
  const hasChildren = task.children?.length > 0;
  const isOpen = openIds.has(task.id);
  const p = PRIORITY_COLOR[task.priority];
  const today = new Date().toISOString().slice(0, 10);
  const isToday = task.due_date === today;
  const isOverdue = !!task.due_date && task.due_date < today && !task.is_done;

  return (
    <>
      <tr
        style={{ borderBottom: "1px solid #F3F4F6" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <td style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <button onClick={() => onToggleOpen(task.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF", display: "flex" }}>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span style={{ width: 14 }} />
            )}
            <button onClick={() => onToggle(task.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
              {task.is_done ? <CheckCircle2 size={17} color="#10B981" /> : <Circle size={17} color="#D1D5DB" />}
            </button>
            <span style={{ fontSize: "13.5px", fontWeight: depth === 0 ? 600 : 400, color: task.is_done ? "#9CA3AF" : "#111827", textDecoration: task.is_done ? "line-through" : "none" }}>
              {task.title}
            </span>
          </div>
        </td>
        <td style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: "11.5px", padding: "3px 10px", borderRadius: "6px", background: p.bg, color: p.color, fontWeight: 600 }}>{p.label}</span>
        </td>
        <td style={{ padding: "12px 16px" }}>
          {task.due_date ? (
            <span style={{ fontSize: "12px", color: isOverdue ? "#DC2626" : isToday ? "#6366F1" : "#6B7280", fontWeight: isOverdue || isToday ? 600 : 400, display: "flex", alignItems: "center", gap: "4px" }}>
              {isOverdue && <AlertCircle size={12} />}
              {isToday && <Flame size={12} />}
              {task.due_date}
            </span>
          ) : <span style={{ color: "#D1D5DB", fontSize: "12px" }}>—</span>}
        </td>
        <td style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: "11.5px", padding: "3px 10px", borderRadius: "6px", fontWeight: 600, background: task.is_done ? "#D1FAE5" : task.status === "in_progress" ? "#EEF2FF" : "#F3F4F6", color: task.is_done ? "#065F46" : task.status === "in_progress" ? "#4F46E5" : "#6B7280" }}>
            {STATUS_LABEL[task.status] ?? task.status}
          </span>
        </td>
      </tr>
      {hasChildren && isOpen && task.children.map(child => (
        <TaskRow key={child.id} task={child} depth={depth + 1} onToggle={onToggle} openIds={openIds} onToggleOpen={onToggleOpen} />
      ))}
    </>
  );
}

export default function VazifalarPage() {
  const { user } = useAuth();
  const empId = user?.employee_id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "done">("all");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!empId) { setLoading(false); return; }
    (async () => {
      try {
        const t = await tasksApi.list(empId, { root_only: true });
        setTasks(t);
        setOpenIds(new Set(t.filter(x => x.children.length > 0).map(x => x.id)));
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [empId]);

  const toggleDone = async (id: number) => {
    const task = findTask(tasks, id);
    if (!task) return;
    const updated = await tasksApi.update(id, { is_done: !task.is_done }).catch(() => null);
    if (updated) setTasks(prev => updateTask(prev, id, updated));
  };

  const toggleOpen = (id: number) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const addTask = async () => {
    if (!empId || !newTitle.trim()) return;
    const t = await tasksApi.create({ employee_id: empId, title: newTitle.trim(), priority: "medium" }).catch(() => null);
    if (t) { setTasks(prev => [...prev, t]); setNewTitle(""); setAdding(false); }
  };

  function findTask(list: Task[], id: number): Task | null {
    for (const t of list) {
      if (t.id === id) return t;
      if (t.children.length) { const f = findTask(t.children, id); if (f) return f; }
    }
    return null;
  }

  function updateTask(list: Task[], id: number, updated: Task): Task[] {
    return list.map(t => {
      if (t.id === id) return { ...updated, children: t.children };
      if (t.children.length) return { ...t, children: updateTask(t.children, id, updated) };
      return t;
    });
  }

  const filteredTasks = filter === "all" ? tasks
    : filter === "done" ? tasks.filter(t => t.is_done)
    : tasks.filter(t => t.status === filter && !t.is_done);

  const S = {
    card: { background: "#ffffff", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as React.CSSProperties,
    th: { textAlign: "left" as const, padding: "11px 16px", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px", background: "#FAFAFA", borderBottom: "1px solid #E5E7EB" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Mening Vazifalarim</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>{tasks.length} ta vazifa</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
        >
          <Plus size={15} /> Yangi vazifa
        </button>
      </div>

      {/* Add task form */}
      {adding && (
        <div style={{ ...S.card, padding: "16px", display: "flex", gap: "10px" }}>
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAdding(false); setNewTitle(""); } }}
            placeholder="Vazifa nomini yozing..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #6366F1", fontSize: "14px", outline: "none", color: "#111827" }}
          />
          <button onClick={addTask} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#6366F1", color: "white", fontWeight: 600, cursor: "pointer" }}>Qo'shish</button>
          <button onClick={() => { setAdding(false); setNewTitle(""); }} style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "none", color: "#6B7280", cursor: "pointer" }}>Bekor</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Filter size={14} color="#9CA3AF" style={{ alignSelf: "center" }} />
        {(["all", "pending", "in_progress", "done"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", background: filter === f ? "#6366F1" : "#F3F4F6", color: filter === f ? "white" : "#6B7280" }}>
            {f === "all" ? "Barchasi" : f === "pending" ? "Kutmoqda" : f === "in_progress" ? "Jarayonda" : "Bajarilgan"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>VAZIFA NOMI</th>
              <th style={{ ...S.th, width: 120 }}>USTUVORLIK</th>
              <th style={{ ...S.th, width: 140 }}>MUDDAT</th>
              <th style={{ ...S.th, width: 130 }}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Yuklanmoqda...</td></tr>
            ) : filteredTasks.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Vazifalar topilmadi</td></tr>
            ) : (
              filteredTasks.map(task => (
                <TaskRow key={task.id} task={task} depth={0} onToggle={toggleDone} openIds={openIds} onToggleOpen={toggleOpen} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
