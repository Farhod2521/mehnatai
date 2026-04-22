"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, ChevronRight, ChevronDown,
  Clock, AlertCircle, TrendingUp, Star, Target,
  CalendarDays, Flame,
} from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import { useAuth } from "@/lib/auth";
import { tasksApi, kpiApi, dashboardApi, type Task } from "@/lib/api";

/* ─── Types ─────────────────────────────────────── */
const PRIORITY_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past" },
};

/* ─── TaskNode Component ─────────────────────────── */
function TaskNode({ task, depth, onToggleDone, onToggleOpen, openIds }: {
  task: Task; depth: number;
  onToggleDone: (id: number) => void;
  onToggleOpen: (id: number) => void;
  openIds: Set<number>;
}) {
  const hasChildren = task.children && task.children.length > 0;
  const isOpen = openIds.has(task.id);
  const p = PRIORITY_COLOR[task.priority];
  const today = new Date().toISOString().slice(0, 10);
  const isToday = task.due_date === today;
  const isOverdue = !!task.due_date && task.due_date < today && !task.is_done;

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", padding: `9px 12px 9px ${12 + depth * 20}px`, borderRadius: "10px", marginBottom: "2px", background: task.is_done ? "transparent" : isToday ? "rgba(99,102,241,0.04)" : "transparent", cursor: "pointer" }}
        onMouseEnter={e => { if (!task.is_done) (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.06)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = task.is_done ? "transparent" : isToday ? "rgba(99,102,241,0.04)" : "transparent"; }}
      >
        {hasChildren ? (
          <button onClick={() => onToggleOpen(task.id)} style={{ background: "none", border: "none", padding: "0", cursor: "pointer", color: "#9CA3AF", flexShrink: 0, display: "flex", alignItems: "center" }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span style={{ width: "14px", flexShrink: 0 }} />
        )}

        <button onClick={() => onToggleDone(task.id)} style={{ background: "none", border: "none", padding: "0", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
          {task.is_done ? <CheckCircle2 size={18} color="#10B981" /> : <Circle size={18} color="#D1D5DB" />}
        </button>

        <span style={{ flex: 1, fontSize: "13.5px", fontWeight: depth === 0 ? 600 : 500, color: task.is_done ? "#9CA3AF" : "#1F2937", textDecoration: task.is_done ? "line-through" : "none" }}>
          {task.title}
        </span>

        {task.due_date && (
          <span style={{ fontSize: "11px", color: isOverdue ? "#DC2626" : isToday ? "#6366F1" : "#9CA3AF", fontWeight: isOverdue || isToday ? 600 : 400, display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
            {isOverdue && <AlertCircle size={11} />}
            {isToday && <Flame size={11} />}
            {task.due_date.slice(5).replace("-", "/")}
          </span>
        )}

        <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: p.bg, color: p.color, flexShrink: 0, marginLeft: "4px" }}>
          {p.label}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div style={{ borderLeft: "1.5px dashed #E5E7EB", marginLeft: `${20 + depth * 20}px` }}>
          {task.children.map(child => (
            <TaskNode key={child.id} task={child} depth={depth + 1} onToggleDone={onToggleDone} onToggleOpen={onToggleOpen} openIds={openIds} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mini Calendar ─────────────────────────────── */
function MiniCalendar({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const [selected, setSelected] = useState(today.getDate());
  const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  // Mon-first: (firstDay + 6) % 7
  const startDay = (firstDay + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter(t => t.due_date === dateStr);
  };

  const dayTasks = getTasksForDay(selected);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{MONTHS[month]} {year}</span>
        <span style={{ fontSize: "11px", color: "#6B7280" }}>Bugun: {today.getDate()}-{MONTHS[month].slice(0, 3)}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#9CA3AF", padding: "4px 0" }}>{d}</div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dayT = getTasksForDay(day);
          const hasHigh = dayT.some(t => t.priority === "high");
          const isToday = day === today.getDate();
          const isSel = day === selected;
          return (
            <button key={idx} onClick={() => setSelected(day)} style={{ position: "relative", padding: "6px 2px", borderRadius: "8px", border: "none", cursor: "pointer", background: isSel ? "linear-gradient(135deg,#6366F1,#4F46E5)" : isToday ? "#EEF2FF" : "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <span style={{ fontSize: "12px", fontWeight: isToday || isSel ? 700 : 400, color: isSel ? "white" : isToday ? "#6366F1" : "#374151" }}>{day}</span>
              {dayT.length > 0 && !isSel && (
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: hasHigh ? "#EF4444" : "#6366F1" }} />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>{selected}-{MONTHS[month].slice(0, 3)} vazifalari</div>
          {dayTasks.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Vazifalar yo'q</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {dayTasks.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "8px", background: t.is_done ? "#F0FDF4" : "#FAFAFA", border: `1px solid ${t.is_done ? "#BBF7D0" : "#F3F4F6"}` }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: t.is_done ? "#10B981" : PRIORITY_COLOR[t.priority].color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: t.is_done ? "#6B7280" : "#374151", textDecoration: t.is_done ? "line-through" : "none" }}>{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────── */
export default function XodimDashboard() {
  const { user } = useAuth();
  const empId = user?.employee_id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [filterDone, setFilterDone] = useState<"all" | "pending" | "done">("all");
  const [kpiAvg, setKpiAvg] = useState<number | null>(null);
  const [usiScore, setUsiScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) { setLoading(false); return; }
    (async () => {
      try {
        const [t, kpi, myStats] = await Promise.all([
          tasksApi.list(empId, { root_only: true }),
          kpiApi.summary(empId).catch(() => null),
          dashboardApi.myStats().catch(() => null),
        ]);
        setTasks(t);
        setOpenIds(new Set(t.filter(x => x.children.length > 0).map(x => x.id)));
        if (kpi) setKpiAvg(kpi.kpi_avg);
        if (myStats) setUsiScore(myStats.usi_score);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, [empId]);

  const toggleDone = async (id: number) => {
    const task = findTask(tasks, id);
    if (!task) return;
    const updated = await tasksApi.update(id, { is_done: !task.is_done }).catch(() => null);
    if (updated) {
      setTasks(prev => updateTask(prev, id, updated));
    }
  };

  const toggleOpen = (id: number) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  function findTask(list: Task[], id: number): Task | null {
    for (const t of list) {
      if (t.id === id) return t;
      if (t.children.length) { const found = findTask(t.children, id); if (found) return found; }
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

  const countTasks = (list: Task[]): { total: number; done: number } => {
    let total = 0, done = 0;
    for (const t of list) {
      total++; if (t.is_done) done++;
      if (t.children.length) { const c = countTasks(t.children); total += c.total; done += c.done; }
    }
    return { total, done };
  };

  const { total, done } = countTasks(tasks);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const allTasks = flattenTasks(tasks);

  function flattenTasks(list: Task[]): Task[] {
    return list.flatMap(t => [t, ...flattenTasks(t.children)]);
  }

  const visibleTasks = filterDone === "all" ? tasks
    : filterDone === "done" ? tasks.filter(t => t.is_done)
    : tasks.filter(t => !t.is_done);

  const S = {
    card: { background: "#ffffff", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px" } as React.CSSProperties,
  };

  const today = new Date();
  const DAYS_UZ = ["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];
  const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Mening Panelim</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
          Bugun — {today.getDate()} {MONTHS_UZ[today.getMonth()]} {today.getFullYear()}, {DAYS_UZ[today.getDay()]}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {[
          { label: "Jami vazifalar", value: loading ? "—" : total, icon: Target, color: "#6366F1", bg: "#EEF2FF" },
          { label: "Bajarilgan", value: loading ? "—" : done, icon: CheckCircle2, color: "#10B981", bg: "#D1FAE5" },
          { label: "Qolgan", value: loading ? "—" : total - done, icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
          { label: "Samaradorlik", value: usiScore != null ? `${usiScore}%` : kpiAvg != null ? `${kpiAvg}%` : "—", icon: Star, color: "#00B8A0", bg: "#E8F8F6" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...S.card, padding: "16px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* TreeLog + Calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>

        {/* TreeLog */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Vazifalar (TreeLog)</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{done}/{total} vazifa bajarildi</div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {(["all", "pending", "done"] as const).map(f => (
                <button key={f} onClick={() => setFilterDone(f)} style={{ padding: "5px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: filterDone === f ? "#6366F1" : "#F3F4F6", color: filterDone === f ? "white" : "#6B7280" }}>
                  {f === "all" ? "Barchasi" : f === "pending" ? "Kutmoqda" : "Bajarilgan"}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>Umumiy progress</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6366F1" }}>{percent}%</span>
            </div>
            <div style={{ height: "6px", borderRadius: "10px", background: "#F3F4F6" }}>
              <div style={{ height: "6px", borderRadius: "10px", width: `${percent}%`, background: "linear-gradient(90deg,#6366F1,#8B5CF6)", transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>Yuklanmoqda...</div>
            ) : visibleTasks.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>Vazifalar yo'q</div>
            ) : (
              visibleTasks.map(task => (
                <TaskNode key={task.id} task={task} depth={0} onToggleDone={toggleDone} onToggleOpen={toggleOpen} openIds={openIds} />
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Calendar */}
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CalendarDays size={16} color="#6366F1" />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Katya Kalendar</span>
            </div>
            <MiniCalendar tasks={allTasks} />
          </div>

          {/* KPI mini */}
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <TrendingUp size={16} color="#00B8A0" />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Mening KPI</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <CircularProgress value={kpiAvg ?? 0} size={80} strokeWidth={6} color="auto" textSize="text-[16px]" />
            </div>
            {kpiAvg != null ? (
              <p style={{ fontSize: "12px", color: "#6B7280", textAlign: "center" }}>
                O'rtacha KPI: <b style={{ color: "#111827" }}>{kpiAvg}%</b>
              </p>
            ) : (
              <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>KPI ma'lumoti yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
