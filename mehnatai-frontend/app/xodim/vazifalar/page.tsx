"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Circle, AlertCircle, Flame, Loader2, Clock,
  Paperclip, Upload, FileText, Download, X, ChevronDown, ChevronRight, CalendarDays,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { tasksApi, taskReportsApi, type Task } from "@/lib/api";

/* ─── Constants ──────────────────────────────────────────────────────────────── */
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

function Sk({ h = 90 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 16, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

function fmtSize(b: number) {
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
}

/* ─── Report / Fayl yuklash modali ──────────────────────────────────────────── */
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

  const addFiles = (fl: FileList | null) => {
    if (fl) setFiles(prev => [...prev, ...Array.from(fl)]);
  };

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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "520px", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#00B8A0,#009984)", padding: "22px 26px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "4px" }}>Hisobot yuborish</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", maxWidth: "360px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="white" />
          </button>
        </div>

        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          {/* Drag & Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("xodim-file-input")?.click()}
            style={{ border: `2px dashed ${dragging ? "#00B8A0" : "#D1D5DB"}`, borderRadius: "16px", padding: "28px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(0,184,160,0.04)" : "#FAFAFA", transition: "all 0.15s" }}
          >
            <input id="xodim-file-input" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
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
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: "#D1D5DB" }}>
                    <X size={13} />
                  </button>
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

/* ─── Task Card ──────────────────────────────────────────────────────────────── */
function TaskCard({ task, onMarkDone, onUpdate }: {
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

  const handleStart = async () => {
    if (task.status !== "pending") return;
    const updated = await tasksApi.update(task.id, { status: "in_progress" }).catch(() => null);
    if (updated) onUpdate(updated);
  };

  return (
    <div style={{ background: "white", borderRadius: "18px", border: `1.5px solid ${isOverdue ? "#FEE2E2" : task.status === "done" ? "#D1FAE5" : task.status === "hr_check" ? "#FEF3C7" : "#E5E7EB"}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Icon */}
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          {task.status === "done"        ? <CheckCircle2 size={22} color="#10B981" /> :
           task.status === "hr_check"    ? <Clock size={22} color="#D97706" /> :
           task.status === "in_progress" ? <Loader2 size={22} color="#1D4ED8" style={{ animation: "spin 2s linear infinite" }} /> :
                                           <Circle size={22} color="#D1D5DB" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: task.status === "done" ? "#9CA3AF" : "#111827", textDecoration: task.status === "done" ? "line-through" : "none" }}>
              {task.title}
            </span>
            <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 9px", borderRadius: "6px", background: s.bg, color: s.color }}>{s.label}</span>
            <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 9px", borderRadius: "6px", background: p.bg, color: p.color }}>{p.label}</span>
          </div>

          {task.description && (
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px", lineHeight: 1.5 }}>{task.description}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            {task.due_date && (
              <span style={{ fontSize: "12px", color: isOverdue ? "#DC2626" : "#6B7280", display: "flex", alignItems: "center", gap: "4px", fontWeight: isOverdue ? 600 : 400 }}>
                {isOverdue ? <AlertCircle size={11} /> : <CalendarDays size={11} />}
                {new Date(task.due_date).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })}
                {isOverdue && " — muddati o'tgan!"}
              </span>
            )}
            {task.reports && task.reports.length > 0 && (
              <button onClick={() => setExpanded(v => !v)} style={{ fontSize: "12px", color: "#6366F1", display: "flex", alignItems: "center", gap: "4px", background: "#EEF2FF", border: "none", borderRadius: "8px", padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>
                <Paperclip size={11} /> {task.reports.length} ta fayl
                {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
          {task.status === "pending" && (
            <button onClick={handleStart} style={{ padding: "8px 16px", borderRadius: "10px", background: "#EEF2FF", border: "none", fontSize: "13px", fontWeight: 600, color: "#4F46E5", cursor: "pointer", whiteSpace: "nowrap" }}>
              Boshlash
            </button>
          )}
          {canMarkDone && (
            <button onClick={onMarkDone} style={{ padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", fontSize: "13px", fontWeight: 700, color: "white", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(0,184,160,0.3)" }}>
              <CheckCircle2 size={14} /> Bajarildi
            </button>
          )}
          {task.status === "hr_check" && (
            <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600, padding: "8px 12px", background: "#FEF3C7", borderRadius: "10px", whiteSpace: "nowrap" }}>
              HR kutmoqda
            </span>
          )}
          {task.status === "done" && (
            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600, padding: "8px 12px", background: "#D1FAE5", borderRadius: "10px", whiteSpace: "nowrap" }}>
              Tasdiqlangan ✓
            </span>
          )}
        </div>
      </div>

      {/* Yuklangan fayllar */}
      {expanded && task.reports && task.reports.length > 0 && (
        <div style={{ padding: "0 20px 16px 56px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", marginBottom: "4px" }}>YUKLANGAN FAYLLAR</div>
          {task.reports.map(r => (
            <button key={r.id} onClick={() => taskReportsApi.download(r.id, r.original_name)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB", cursor: "pointer", width: "100%" }}>
              <FileText size={14} color="#6366F1" />
              <span style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{r.original_name}</span>
              {r.file_size && <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0 }}>{fmtSize(r.file_size)}</span>}
              <Download size={13} color="#9CA3AF" />
            </button>
          ))}
          {task.reports[0]?.comment && (
            <div style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic", padding: "8px 12px", background: "#F3F4F6", borderRadius: "8px", marginTop: "4px" }}>
              "{task.reports[0].comment}"
            </div>
          )}
        </div>
      )}

      {/* Subtasks */}
      {task.children && task.children.length > 0 && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "12px 20px", background: "#FAFAFA" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", marginBottom: "8px" }}>
            ICHKI TOPSHIRIQLAR ({task.children.length})
          </div>
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

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
type FilterKey = "" | "pending" | "in_progress" | "hr_check" | "done";

export default function XodimVazifalarPage() {
  const { user } = useAuth();
  const empId = user?.employee_id;

  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterTab, setFilterTab] = useState<FilterKey>("");
  const [reportTask, setReportTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    if (!empId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await tasksApi.list(empId, { root_only: true });
      setTasks(data);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  }, [empId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleUpdate = (updated: Task) =>
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));

  const handleSubmitted = (updated: Task) => {
    handleUpdate(updated);
    setReportTask(null);
  };

  const rootTasks = tasks.filter(t => !t.parent_id);
  const filtered  = filterTab ? rootTasks.filter(t => t.status === filterTab) : rootTasks;

  const stats = {
    total:      rootTasks.length,
    pending:    rootTasks.filter(t => t.status === "pending").length,
    inProgress: rootTasks.filter(t => t.status === "in_progress").length,
    hrCheck:    rootTasks.filter(t => t.status === "hr_check").length,
    done:       rootTasks.filter(t => t.is_done).length,
  };

  const TABS: { key: FilterKey; label: string }[] = [
    { key: "",          label: "Barchasi" },
    { key: "pending",   label: "Kutmoqda" },
    { key: "in_progress", label: "Jarayonda" },
    { key: "hr_check",  label: "HR tekshirmoqda" },
    { key: "done",      label: "Bajarilgan" },
  ];

  if (!empId) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
        Xodim profili topilmadi. HR bilan bog'laning.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {reportTask && (
        <ReportModal task={reportTask} onClose={() => setReportTask(null)} onSubmitted={handleSubmitted} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: 0 }}>Mening Vazifalarim</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>{rootTasks.length} ta vazifa</p>
        </div>
        <button onClick={loadTasks} style={{ padding: "9px 18px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
          Yangilash
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
        {[
          { label: "Jami",        value: stats.total,      color: "#6366F1", bg: "#EEF2FF" },
          { label: "Kutmoqda",    value: stats.pending,    color: "#6B7280", bg: "#F3F4F6" },
          { label: "Jarayonda",   value: stats.inProgress, color: "#1D4ED8", bg: "#DBEAFE" },
          { label: "HR kutmoqda", value: stats.hrCheck,    color: "#D97706", bg: "#FEF3C7" },
          { label: "Bajarildi",   value: stats.done,       color: "#10B981", bg: "#D1FAE5" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{label}</div>
            <div style={{ height: "3px", borderRadius: "3px", background: bg, marginTop: "8px" }} />
          </div>
        ))}
      </div>

      {/* HR pending banner */}
      {stats.hrCheck > 0 && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={16} color="#D97706" />
          <span style={{ fontSize: "13px", color: "#92400E", fontWeight: 500 }}>
            <b>{stats.hrCheck} ta vazifangiz</b> HR tasdiqlashini kutmoqda. Tasdiqlangandan so'ng "Bajarildi" bo'ladi.
          </span>
        </div>
      )}

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
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map(i => <Sk key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", border: "1px solid #E5E7EB" }}>
          <CheckCircle2 size={44} color="#E5E7EB" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Bu bo'limda vazifalar yo'q</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onMarkDone={() => setReportTask(task)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
