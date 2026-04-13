"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { tasksApi, type Task } from "@/lib/api";

const P_COLOR: Record<string, string> = {
  high: "#EF4444", medium: "#F59E0B", low: "#6366F1",
};
const P_BG: Record<string, string> = {
  high: "#FEF2F2", medium: "#FFFBEB", low: "#EEF2FF",
};
const DAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

export default function KalendarPage() {
  const { user } = useAuth();
  const empId = user?.employee_id;

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [view, setView] = useState<"month" | "week">("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) { setLoading(false); return; }
    tasksApi.list(empId)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [empId]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = (firstDay + 6) % 7;
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getTasksForDay = (day: number) =>
    tasks.filter(t => t.due_date === getDateStr(day));

  const selectedTasks = getTasksForDay(selectedDay);
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Katya Kalendar</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>Vazifalar va uchrashuvlar jadvali</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>

        {/* Calendar */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={prevMonth} style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={16} color="#6B7280" />
              </button>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                {MONTHS_UZ[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={16} color="#6B7280" />
              </button>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["month", "week"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: view === v ? "#6366F1" : "#F3F4F6", color: view === v ? "white" : "#6B7280" }}>
                  {v === "month" ? "Oy" : "Hafta"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
              {DAYS_UZ.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", padding: "6px" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {cells.map((day, idx) => {
                if (!day) return <div key={idx} style={{ minHeight: "80px" }} />;
                const dayTasks = getTasksForDay(day);
                const isToday = isCurrentMonth && day === today.getDate();
                const isSel = day === selectedDay;
                return (
                  <div
                    key={idx} onClick={() => setSelectedDay(day)}
                    style={{ minHeight: "80px", padding: "6px", borderRadius: "10px", cursor: "pointer", background: isSel ? "#EEF2FF" : isToday ? "#F5F3FF" : "transparent", border: isSel ? "2px solid #6366F1" : isToday ? "1.5px solid #C7D2FE" : "1.5px solid transparent", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = isToday ? "#F5F3FF" : "transparent"; }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: isToday ? 800 : isSel ? 700 : 500, color: isSel ? "#6366F1" : isToday ? "#4F46E5" : "#374151", marginBottom: "4px" }}>
                      {day}
                      {isToday && <span style={{ fontSize: "9px", marginLeft: "3px", color: "#6366F1" }}>bugun</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {dayTasks.slice(0, 2).map(t => (
                        <div key={t.id} style={{ fontSize: "10px", padding: "2px 5px", borderRadius: "4px", background: P_BG[t.priority], color: P_COLOR[t.priority], fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.is_done ? "line-through" : "none", opacity: t.is_done ? 0.6 : 1 }}>
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div style={{ fontSize: "10px", color: "#9CA3AF", padding: "1px 5px" }}>+{dayTasks.length - 2} ta</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarDays size={16} color="#6366F1" />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                {selectedDay} {MONTHS_UZ[currentMonth]}
              </span>
              {isCurrentMonth && selectedDay === today.getDate() && (
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "#EEF2FF", color: "#6366F1", fontWeight: 600 }}>Bugun</span>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>{selectedTasks.length} ta vazifa</p>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "500px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: "13px" }}>Yuklanmoqda...</div>
            ) : selectedTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CalendarDays size={32} color="#E5E7EB" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Bu kun uchun vazifa yo'q</p>
              </div>
            ) : (
              selectedTasks.map(t => (
                <div key={t.id} style={{ padding: "12px", borderRadius: "10px", background: t.is_done ? "#F9FAFB" : P_BG[t.priority], border: `1px solid ${t.is_done ? "#E5E7EB" : P_COLOR[t.priority]}22`, opacity: t.is_done ? 0.7 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: t.is_done ? "#9CA3AF" : "#1F2937", textDecoration: t.is_done ? "line-through" : "none" }}>
                      {t.title}
                    </span>
                    {t.is_done && (
                      <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "5px", background: "#D1FAE5", color: "#065F46", fontWeight: 600 }}>Bajarildi</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "10.5px", padding: "1px 7px", borderRadius: "5px", background: "white", color: P_COLOR[t.priority], fontWeight: 600, border: `1px solid ${P_COLOR[t.priority]}33` }}>
                      {t.priority === "high" ? "Yuqori" : t.priority === "medium" ? "O'rta" : "Past"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6B7280" }}>
                      {t.status === "in_progress" ? "⚡ Jarayonda" : t.is_done ? "✓ Tugallangan" : "○ Kutmoqda"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
