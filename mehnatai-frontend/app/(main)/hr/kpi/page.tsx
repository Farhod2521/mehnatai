"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3, Plus, Search, ChevronDown, X, Loader2,
  TrendingUp, TrendingDown, Minus, Save, Trash2,
} from "lucide-react";
import { employeesApi, kpiApi, type Employee, type KpiRecord } from "@/lib/api";

const MONTHS = [
  "Yanvar","Fevral","Mart","Aprel","May","Iyun",
  "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr",
];

const METRICS: { key: keyof KpiRecord; label: string; target: number }[] = [
  { key: "code_quality",       label: "Kod sifati",          target: 90 },
  { key: "deadline_adherence", label: "Muddatga rioya",      target: 85 },
  { key: "bug_fix_speed",      label: "Bug-fix tezligi",     target: 80 },
  { key: "documentation",      label: "Hujjatlashtirish",    target: 75 },
  { key: "team_participation", label: "Jamoaviy ishtirok",   target: 85 },
  { key: "new_technologies",   label: "Yangi texnologiyalar",target: 70 },
];

function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

function TrendIcon({ v }: { v: number }) {
  if (v > 2) return <TrendingUp size={13} color="#10B981" />;
  if (v < -2) return <TrendingDown size={13} color="#EF4444" />;
  return <Minus size={13} color="#9CA3AF" />;
}

/* ── Add/Edit KPI Modal ───────────────────────────────────────────────────── */
function KpiModal({
  employee, existing, onClose, onSaved,
}: {
  employee: Employee;
  existing?: KpiRecord;
  onClose: () => void;
  onSaved: (r: KpiRecord) => void;
}) {
  const now = new Date();
  const [month, setMonth] = useState(existing?.month ?? now.getMonth() + 1);
  const [year, setYear] = useState(existing?.year ?? now.getFullYear());
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    METRICS.forEach(m => {
      init[m.key] = existing ? (existing[m.key] as number) : 80;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const avg = Math.round(Object.values(values).reduce((a, b) => a + b, 0) / METRICS.length);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { employee_id: employee.id, month, year, ...values };
      const saved = existing
        ? await kpiApi.update(existing.id, values as Partial<KpiRecord>)
        : await kpiApi.create(payload as Parameters<typeof kpiApi.create>[0]);
      onSaved(saved);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>
              {existing ? "KPI Tahrirlash" : "KPI Qo'shish"}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
              {employee.first_name} {employee.last_name}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>{avg}%</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)", letterSpacing: "1px" }}>O'RTACHA</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer", display: "flex" }}>
              <X size={18} color="white" />
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {/* Month/Year */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Oy</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", background: "white", outline: "none" }}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Yil</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", background: "white", outline: "none" }}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {METRICS.map(m => {
              const v = values[m.key] ?? 80;
              const ok = v >= m.target;
              return (
                <div key={m.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{m.label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Maqsad: {m.target}%</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: ok ? "#10B981" : "#F59E0B", minWidth: "40px", textAlign: "right" }}>{v}%</span>
                    </div>
                  </div>
                  <input
                    type="range" min={0} max={100} value={v}
                    onChange={e => setValues(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: ok ? "#10B981" : "#F59E0B", cursor: "pointer", height: "6px" }}
                  />
                  <div style={{ height: "4px", borderRadius: "4px", background: "#F3F4F6", marginTop: "4px" }}>
                    <div style={{ height: "4px", borderRadius: "4px", width: `${v}%`, background: ok ? "linear-gradient(90deg,#10B981,#059669)" : "linear-gradient(90deg,#F59E0B,#D97706)", transition: "width 0.2s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginTop: "16px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#F3F4F6", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Bekor qilish
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.8 : 1 }}>
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function HrKpiPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpiMap, setKpiMap] = useState<Record<number, KpiRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [editKpi, setEditKpi] = useState<KpiRecord | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const emps = await employeesApi.list({ page_size: 100 });
      setEmployees(emps.items);
      const entries = await Promise.all(
        emps.items.map(async (e: Employee) => {
          const records = await kpiApi.list(e.id).catch(() => []);
          return [e.id, records] as [number, KpiRecord[]];
        })
      );
      setKpiMap(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.department} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = (emp: Employee, record: KpiRecord) => {
    setKpiMap(prev => {
      const existing = (prev[emp.id] ?? []).filter(r => r.id !== record.id);
      return { ...prev, [emp.id]: [record, ...existing] };
    });
  };

  const handleDelete = async (empId: number, kpiId: number) => {
    if (!confirm("Bu KPI yozuvini o'chirmoqchimisiz?")) return;
    try {
      await kpiApi.delete(kpiId);
      setKpiMap(prev => ({ ...prev, [empId]: (prev[empId] ?? []).filter(r => r.id !== kpiId) }));
    } catch {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {showModal && selectedEmp && (
        <KpiModal
          employee={selectedEmp}
          existing={editKpi}
          onClose={() => { setShowModal(false); setEditKpi(undefined); setSelectedEmp(null); }}
          onSaved={r => handleSaved(selectedEmp, r)}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={18} color="white" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>KPI Boshqaruvi</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>
            Barcha xodimlarning oylik KPI ko'rsatkichlarini boshqaring
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: "380px" }}>
        <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Xodim qidirish..."
          style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "12px", border: "1.5px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "white" }}
        />
      </div>

      {/* Employee KPI List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} h={80} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(emp => {
            const records = kpiMap[emp.id] ?? [];
            const latest = records[0];
            const prev = records[1];
            const trend = latest && prev ? latest.kpi_avg - prev.kpi_avg : 0;
            const isExpanded = expandedId === emp.id;

            return (
              <div key={emp.id} style={{ background: "white", borderRadius: "20px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                {/* Employee row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 22px", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "15px", flexShrink: 0 }}>
                    {emp.avatar_initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                      {emp.first_name} {emp.last_name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                      {emp.position} • {emp.department}
                    </div>
                  </div>

                  {latest ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: latest.kpi_avg >= 80 ? "#10B981" : latest.kpi_avg >= 65 ? "#F59E0B" : "#EF4444" }}>
                          {Math.round(latest.kpi_avg)}%
                        </div>
                        <div style={{ fontSize: "10px", color: "#9CA3AF" }}>
                          {MONTHS[latest.month - 1]} {latest.year}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: trend > 2 ? "#10B981" : trend < -2 ? "#EF4444" : "#9CA3AF" }}>
                        <TrendIcon v={trend} />
                        {trend !== 0 && <span>{trend > 0 ? "+" : ""}{Math.round(trend)}</span>}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#D1D5DB", fontStyle: "italic" }}>KPI yo'q</span>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEmp(emp);
                        setEditKpi(undefined);
                        setShowModal(true);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                    >
                      <Plus size={13} /> KPI
                    </button>
                    <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : emp.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: "4px", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded records */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #F3F4F6", padding: "16px 22px", background: "#FAFAFA" }}>
                    {records.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", padding: "12px" }}>
                        Hali KPI yozuvlari yo'q
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr repeat(6, 60px) 80px", gap: "8px", fontSize: "10px", fontWeight: 700, color: "#9CA3AF", padding: "0 8px", letterSpacing: "0.5px" }}>
                          <span>OY/YIL</span>
                          <span>O'RTACHA</span>
                          {METRICS.map(m => <span key={m.key} style={{ textAlign: "center" }}>{m.label.split(" ")[0].toUpperCase()}</span>)}
                          <span></span>
                        </div>
                        {records.map(r => (
                          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr repeat(6, 60px) 80px", gap: "8px", alignItems: "center", background: "white", borderRadius: "12px", padding: "12px 8px", border: "1px solid #E5E7EB" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                              {MONTHS[r.month - 1].slice(0, 3)} {r.year}
                            </span>
                            <div>
                              <span style={{ fontSize: "15px", fontWeight: 800, color: r.kpi_avg >= 80 ? "#10B981" : r.kpi_avg >= 65 ? "#F59E0B" : "#EF4444" }}>
                                {Math.round(r.kpi_avg)}%
                              </span>
                            </div>
                            {METRICS.map(m => (
                              <div key={m.key} style={{ textAlign: "center" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: (r[m.key] as number) >= m.target ? "#10B981" : "#F59E0B" }}>
                                  {r[m.key] as number}
                                </span>
                              </div>
                            ))}
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => { setSelectedEmp(emp); setEditKpi(r); setShowModal(true); }}
                                style={{ padding: "5px 10px", borderRadius: "8px", background: "#EEF2FF", border: "none", color: "#6366F1", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Tahrir
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id, r.id)}
                                style={{ padding: "5px 8px", borderRadius: "8px", background: "#FEE2E2", border: "none", color: "#DC2626", cursor: "pointer", display: "flex" }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
              <BarChart3 size={40} color="#E5E7EB" style={{ margin: "0 auto 12px" }} />
              <p>Xodim topilmadi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
