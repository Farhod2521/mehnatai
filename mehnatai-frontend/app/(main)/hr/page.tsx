"use client";

import { useEffect, useState } from "react";
import {
  Users, TrendingUp, Award, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  UserCheck, ClipboardList, Star, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import CircularProgress from "@/components/CircularProgress";
import Link from "next/link";
import {
  dashboardApi, employeesApi, tasksApi,
  type DashboardStats, type TopPerformer, type Employee, type Task,
} from "@/lib/api";

/* ─── helpers ─────────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  yuqori:      { color: "#10B981", bg: "#D1FAE5", label: "Yuqori" },
  orta:        { color: "#F59E0B", bg: "#FEF3C7", label: "O'rta" },
  rivojlanish: { color: "#EF4444", bg: "#FEE2E2", label: "Rivojlanish" },
};

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

/* ─── main component ───────────────────────────────────────────── */
export default function HrDashboard() {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [top, setTop]             = useState<TopPerformer[]>([]);
  const [atRisk, setAtRisk]       = useState<Employee[]>([]);
  const [deptData, setDeptData]   = useState<{ name: string; count: number }[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);

  // HR task state
  const [hrTasks, setHrTasks]     = useState<Task[]>([]);
  const [approving, setApproving] = useState<number | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ employee_id: "", title: "", priority: "medium", due_date: "" });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, risk, all, pending] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.topPerformers(5),
          employeesApi.list({ status: "rivojlanish", page_size: 5 }),
          employeesApi.list({ page_size: 100 }),
          tasksApi.hrPending(),
        ]);
        setStats(s);
        setTop(t);
        setAtRisk(risk.items);
        setAllEmployees(all.items);
        setHrTasks(pending);

        const deptMap: Record<string, number> = {};
        for (const emp of all.items) {
          deptMap[emp.department] = (deptMap[emp.department] ?? 0) + 1;
        }
        setDeptData(
          Object.entries(deptMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }))
        );
      } catch {
        // keep nulls
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── stat cards ─────────────────────────────────────────────── */
  const cards = stats
    ? [
        {
          title: "Jami Xodimlar",
          value: String(stats.employees.total),
          sub: `${stats.employees.yuqori} yuqori samarali`,
          up: true,
          color: "#6366F1", bg: "#EEF2FF",
          icon: Users,
        },
        {
          title: "O'rtacha USI",
          value: `${stats.avg_usi}%`,
          sub: stats.avg_usi >= 70 ? "Maqsaddan yuqori" : "Maqsaddan past",
          up: stats.avg_usi >= 70,
          color: "#10B981", bg: "#D1FAE5",
          icon: TrendingUp,
        },
        {
          title: "Jami Baholashlar",
          value: String(stats.evaluations_total),
          sub: "Barcha turdagi",
          up: true,
          color: "#F59E0B", bg: "#FEF3C7",
          icon: ClipboardList,
        },
        {
          title: "Rivojlanish Kerak",
          value: String(stats.employees.rivojlanish),
          sub: `${stats.employees.orta} o'rta darajali`,
          up: false,
          color: "#EF4444", bg: "#FEE2E2",
          icon: AlertTriangle,
        },
      ]
    : null;

  /* ─── performance pie data ───────────────────────────────────── */
  const pieData = stats
    ? [
        { name: "Yuqori",      value: stats.employees.yuqori },
        { name: "O'rta",       value: stats.employees.orta },
        { name: "Rivojlanish", value: stats.employees.rivojlanish },
      ]
    : [];

  const approveTask = async (id: number) => {
    setApproving(id);
    try {
      await tasksApi.approve(id);
      setHrTasks(prev => prev.filter(t => t.id !== id));
    } catch { /* ignore */ } finally {
      setApproving(null);
    }
  };

  const submitAssign = async () => {
    if (!assignForm.employee_id || !assignForm.title.trim()) return;
    setAssigning(true);
    try {
      await tasksApi.create({
        employee_id: Number(assignForm.employee_id),
        title: assignForm.title.trim(),
        priority: assignForm.priority,
        due_date: assignForm.due_date || undefined,
      });
      setAssignForm({ employee_id: "", title: "", priority: "medium", due_date: "" });
      setShowAssign(false);
    } catch { /* ignore */ } finally {
      setAssigning(false);
    }
  };

  const empById = (id: number) => allEmployees.find(e => e.id === id);

  const S = {
    card: {
      background: "#fff", borderRadius: "16px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px",
    } as React.CSSProperties,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>HR Dashboard</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            Xodimlar boshqaruvi va samaradorlik umumiy ko'rinishi
          </p>
        </div>
        <Link
          href="/employees"
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "10px",
            background: "linear-gradient(135deg,#6366F1,#4F46E5)",
            color: "white", fontSize: "13px", fontWeight: 600,
            textDecoration: "none", boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          <Users size={14} /> Xodimlar ro'yxati
        </Link>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton w={44} h={44} /> <Skeleton h={32} /> <Skeleton w="60%" h={14} />
              </div>
            ))
          : cards?.map(({ title, value, sub, up, color, bg, icon: Icon }) => (
              <div key={title} style={{ ...S.card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: up ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: 2 }}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: 5 }}>{title}</div>
                  <div style={{ fontSize: "12px", fontWeight: 500, color: up ? "#10B981" : "#EF4444", marginTop: 3 }}>{sub}</div>
                </div>
              </div>
            ))
        }
      </div>

      {/* ── Middle Row ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
        {/* Department Bar Chart */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Bo'limlar bo'yicha xodimlar
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 16 }}>
            Har bir bo'limdagi xodimlar soni
          </div>
          {loading ? (
            <Skeleton h={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                  formatter={(v) => [v, "Xodim"]}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Performance Pie */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Samaradorlik taqsimoti
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 12 }}>
            Xodimlar toifalari
          </div>
          {loading ? (
            <Skeleton h={180} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                    formatter={(v, name) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {pieData.map((item, i) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i] }} />
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                      {item.value} ta
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* At-Risk Employees */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                E'tibor talab qiluvchi
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>
                Rivojlanish kerak bo'lgan xodimlar
              </div>
            </div>
            <Link href="/employees?status=rivojlanish" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6366F1", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              Hammasi <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} h={52} />)}
            </div>
          ) : atRisk.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <UserCheck size={32} color="#10B981" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                Barcha xodimlar maqsadda!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {atRisk.map(emp => (
                <Link
                  key={emp.id}
                  href={`/employees/${emp.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#FFF9F9", border: "1px solid #FEE2E2", textDecoration: "none" }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#EF4444,#DC2626)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: 700,
                  }}>
                    {emp.avatar_initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emp.first_name} {emp.last_name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{emp.position} · {emp.department}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
                      {emp.usi_score}%
                    </span>
                    <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: 5, background: "#FEE2E2", color: "#EF4444", fontWeight: 600 }}>
                      Rivojlanish
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Top Xodimlar</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>
                Eng yuqori USI ko'rsatkichlari
              </div>
            </div>
            <Link href="/employees" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6366F1", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
              Hammasi <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={44} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {top.map((emp, i) => (
                <Link
                  key={emp.id}
                  href={`/employees/${emp.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#F9FAFB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700,
                    color: i === 0 ? "#92400E" : "#6B7280",
                  }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: 700,
                  }}>
                    {emp.avatar_initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emp.full_name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                      {emp.department}
                    </div>
                  </div>
                  <CircularProgress
                    value={emp.usi_score} size={42} strokeWidth={3.5}
                    color="auto" textSize="text-[10px]"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── HR Task Management ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Pending HR approval */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>HR Tekshiruv</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>
                Tasdiqlashni kutayotgan vazifalar
              </div>
            </div>
            {hrTasks.length > 0 && (
              <span style={{ fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "8px", background: "#FEF3C7", color: "#92400E" }}>
                {hrTasks.length} ta
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <Skeleton key={i} h={56} />)}
            </div>
          ) : hrTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <UserCheck size={32} color="#10B981" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Tekshiruv kutayotgan vazifa yo'q</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "340px", overflowY: "auto" }}>
              {hrTasks.map(task => {
                const emp = empById(task.employee_id);
                const today = new Date().toISOString().slice(0, 10);
                const overdue = !!task.due_date && task.due_date < today;
                return (
                  <div key={task.id} style={{ padding: "12px", borderRadius: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{task.title}</div>
                        <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "3px" }}>
                          {emp ? `${emp.first_name} ${emp.last_name} · ${emp.position}` : `Xodim #${task.employee_id}`}
                        </div>
                      </div>
                      {task.due_date && (
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", background: overdue ? "#FEE2E2" : "#F3F4F6", color: overdue ? "#DC2626" : "#6B7280", flexShrink: 0 }}>
                          {task.due_date}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => approveTask(task.id)}
                      disabled={approving === task.id}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "none", background: approving === task.id ? "#E5E7EB" : "linear-gradient(135deg,#10B981,#059669)", color: "white", fontSize: "12.5px", fontWeight: 700, cursor: approving === task.id ? "not-allowed" : "pointer" }}
                    >
                      {approving === task.id ? "Tasdiqlanmoqda..." : "✓ Tasdiqlash"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assign task */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Vazifa berish</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>Xodimga yangi topshiriq qo'shish</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Employee select */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Xodim</label>
              <select
                value={assignForm.employee_id}
                onChange={e => setAssignForm(f => ({ ...f, employee_id: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", background: "white", color: "#111827" }}
              >
                <option value="">— Xodimni tanlang —</option>
                {allEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vazifa nomi</label>
              <input
                type="text"
                value={assignForm.title}
                onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Vazifa nomini yozing..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Priority */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ustuvorlik</label>
                <select
                  value={assignForm.priority}
                  onChange={e => setAssignForm(f => ({ ...f, priority: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", background: "white" }}
                >
                  <option value="high">Yuqori</option>
                  <option value="medium">O'rta</option>
                  <option value="low">Past</option>
                </select>
              </div>

              {/* Due date */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Muddat</label>
                <input
                  type="date"
                  value={assignForm.due_date}
                  onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button
              onClick={submitAssign}
              disabled={assigning || !assignForm.employee_id || !assignForm.title.trim()}
              style={{ padding: "11px", borderRadius: "10px", border: "none", background: assigning || !assignForm.employee_id || !assignForm.title.trim() ? "#E5E7EB" : "linear-gradient(135deg,#6366F1,#4F46E5)", color: assigning || !assignForm.employee_id || !assignForm.title.trim() ? "#9CA3AF" : "white", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              {assigning ? "Berilmoqda..." : "Vazifa berish"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats Row ─────────────────────────────────────── */}
      <div style={S.card}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: 16 }}>
          HR Umumiy Ko'rsatkichlar
        </div>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} h={60} />)}
          </div>
        ) : stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Yuqori samarali", value: `${stats.employees.yuqori} ta`, icon: Star, color: "#10B981", bg: "#D1FAE5" },
              { label: "O'rta darajali",  value: `${stats.employees.orta} ta`,   icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
              { label: "Vazifa bajarish", value: `${stats.tasks.completion_rate}%`, icon: UserCheck, color: "#6366F1", bg: "#EEF2FF" },
              { label: "Baholash soni",   value: `${stats.evaluations_total} ta`, icon: Award, color: "#8B5CF6", bg: "#F5F3FF" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: bg }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{value}</div>
                  <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: 1 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
