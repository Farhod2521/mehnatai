"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle,
  Flame, ChevronRight, Loader2, RefreshCw,
  Paperclip, FileText, Download, ChevronDown,
} from "lucide-react";
import { tasksApi, taskReportsApi, type Task } from "@/lib/api";

const PRIORITY_MAP: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626", label: "Yuqori" },
  medium: { bg: "#FEF3C7", color: "#D97706", label: "O'rta" },
  low:    { bg: "#DCFCE7", color: "#16A34A", label: "Past" },
};

function Skeleton({ h = 80 }: { h?: number }) {
  return (
    <div style={{
      height: h, borderRadius: 16,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

function fmtBytes(b: number | null) {
  if (!b) return "";
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
}

function TaskCard({ task, onApprove, approving }: {
  task: Task;
  onApprove: (id: number) => Promise<void>;
  approving: boolean;
}) {
  const p = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !!task.due_date && task.due_date < today;
  const isToday = task.due_date === today;
  const [showReports, setShowReports] = useState(false);
  const reports = task.reports ?? [];

  return (
    <div style={{
      background: "white", borderRadius: "18px",
      border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
        {/* Status icon */}
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
          <Clock size={20} color="#D97706" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{task.title}</span>
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "20px", background: p.bg, color: p.color }}>{p.label}</span>
          </div>

          {task.description && (
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "10px", lineHeight: 1.5 }}>{task.description}</p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            {task.due_date && (
              <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", color: isOverdue ? "#DC2626" : isToday ? "#00B8A0" : "#9CA3AF", fontWeight: isOverdue || isToday ? 600 : 400 }}>
                {isOverdue && <AlertCircle size={12} />}
                {isToday && <Flame size={12} />}
                Muddat: {task.due_date}
              </span>
            )}
            <Link href={`/employees/${task.employee_id}`} style={{ fontSize: "12px", color: "#6366F1", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Xodimga o'tish <ChevronRight size={12} />
            </Link>
            {reports.length > 0 && (
              <button onClick={() => setShowReports(v => !v)} style={{ fontSize: "12px", color: "#00B8A0", fontWeight: 600, background: "#F0FDF9", border: "1px solid #99F6E4", borderRadius: "8px", padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <Paperclip size={11} /> {reports.length} ta fayl
                <ChevronDown size={11} style={{ transform: showReports ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
            )}
          </div>
        </div>

        {/* Approve button */}
        <button
          onClick={() => onApprove(task.id)}
          disabled={approving}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "12px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            border: "none", color: "white", fontSize: "13px", fontWeight: 700,
            cursor: approving ? "not-allowed" : "pointer", flexShrink: 0,
            opacity: approving ? 0.7 : 1, boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}
        >
          {approving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={15} />}
          Tasdiqlash
        </button>
      </div>

      {/* Reports panel */}
      {showReports && reports.length > 0 && (
        <div style={{ padding: "0 22px 18px 78px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", marginBottom: "4px", letterSpacing: "0.05em" }}>XODIM YUKLAGAN FAYLLAR</div>
          {reports.map(r => (
            <button key={r.id} onClick={() => taskReportsApi.download(r.id, r.original_name)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB", cursor: "pointer", width: "100%" }}>
              <FileText size={15} color="#6366F1" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{r.original_name}</span>
              {r.file_size && <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0 }}>{fmtBytes(r.file_size)}</span>}
              <Download size={13} color="#9CA3AF" style={{ flexShrink: 0 }} />
            </button>
          ))}
          {reports[0]?.comment && (
            <div style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic", padding: "10px 14px", background: "#F0FDF9", borderRadius: "10px", border: "1px solid #99F6E4", marginTop: "4px" }}>
              <span style={{ fontStyle: "normal", fontWeight: 600, color: "#00B8A0" }}>Izoh: </span>"{reports[0].comment}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HrVazifalarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.hrPending();
      setTasks(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleApprove = async (taskId: number) => {
    setApprovingId(taskId);
    try {
      await tasksApi.approve(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSuccessCount(c => c + 1);
    } catch {
      alert("Tasdiqlashda xatolik yuz berdi");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={18} color="white" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>Vazifalar Tasdiqlanishi</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>
            Xodimlar bajarildi deb belgilab, hisobot yuborgan vazifalar — HR tasdig'ini kutmoqda
          </p>
        </div>
        <button onClick={loadTasks} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px", background: "white", border: "1.5px solid #E5E7EB", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Tasdiqlash kutmoqda", value: tasks.length,              color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
          { label: "Bugun tasdiqlangan",  value: successCount,              color: "#10B981", bg: "#D1FAE5", icon: CheckCircle2 },
          { label: "Jami jarayon",        value: tasks.length + successCount, color: "#6366F1", bg: "#EEF2FF", icon: ClipboardList },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} style={{ background: "white", borderRadius: "16px", padding: "18px 20px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map(i => <Skeleton key={i} h={96} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ background: "white", borderRadius: "24px", padding: "80px 40px", textAlign: "center", border: "1px solid #E5E7EB" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={36} color="#10B981" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Barcha vazifalar tasdiqlangan!</h3>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Hozircha HR tasdig'ini kutayotgan vazifalar yo'q</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", padding: "0 4px" }}>
            {tasks.length} ta vazifa tasdiqlash kutmoqda
          </div>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onApprove={handleApprove} approving={approvingId === task.id} />
          ))}
        </div>
      )}
    </div>
  );
}
