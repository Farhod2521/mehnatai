"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import CircularProgress from "@/components/CircularProgress";
import { useAuth } from "@/lib/auth";
import { kpiApi, type KpiRecord, type KpiSummary } from "@/lib/api";

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

export default function KpiPage() {
  const { user } = useAuth();
  const empId = user?.employee_id;

  const [records, setRecords] = useState<KpiRecord[]>([]);
  const [summary, setSummary] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) { setLoading(false); return; }
    (async () => {
      try {
        const [recs, sum] = await Promise.all([
          kpiApi.list(empId),
          kpiApi.summary(empId).catch(() => null),
        ]);
        setRecords(recs);
        setSummary(sum);
      } catch {
        // no data
      } finally {
        setLoading(false);
      }
    })();
  }, [empId]);

  const latest = records[0] ?? null;
  const overallKpi = latest?.kpi_avg ?? 0;
  const prevKpi = records[1]?.kpi_avg ?? overallKpi;
  const trend = overallKpi - prevKpi;

  const radarData = latest ? [
    { subject: "Sifat", A: latest.code_quality },
    { subject: "Tezlik", A: latest.deadline_adherence },
    { subject: "Jamoaviy", A: latest.team_participation },
    { subject: "Intizom", A: latest.documentation },
    { subject: "Innovatsiya", A: latest.new_technologies },
  ] : [
    { subject: "Sifat", A: 0 }, { subject: "Tezlik", A: 0 },
    { subject: "Jamoaviy", A: 0 }, { subject: "Intizom", A: 0 },
    { subject: "Innovatsiya", A: 0 },
  ];

  const historyData = summary
    ? summary.trend.map(r => ({ oy: MONTHS[r.month - 1], val: r.kpi_avg }))
    : [];

  const kpiItems = latest ? [
    { label: "Kod sifati (PR review ball)", target: 90, actual: latest.code_quality, unit: "%" },
    { label: "Muddatga rioya (tasks)", target: 85, actual: latest.deadline_adherence, unit: "%" },
    { label: "Bug-fix tezligi", target: 80, actual: latest.bug_fix_speed, unit: "%" },
    { label: "Hujjatlashtirish", target: 75, actual: latest.documentation, unit: "%" },
    { label: "Jamoaviy ishtirok", target: 85, actual: latest.team_participation, unit: "%" },
    { label: "Yangi texnologiyalar", target: 70, actual: latest.new_technologies, unit: "%" },
  ] : [];

  const S = {
    card: { background: "#ffffff", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px" } as React.CSSProperties,
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ height: 28, width: 300, borderRadius: 8, background: "#F3F4F6" }} />
      <div style={{ height: 220, borderRadius: 16, background: "#F3F4F6" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Mening KPI Ko'rsatkichlari</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
          {latest
            ? `${MONTHS[latest.month - 1]} ${latest.year} — joriy oy natijalari`
            : "KPI ma'lumotlari hali qo'shilmagan"}
        </p>
      </div>

      {!latest && (
        <div style={{ ...S.card, padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
          <TrendingUp size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px" }}>KPI yozuvlari topilmadi. Rahbar tomonidan qo'shiladi.</p>
        </div>
      )}

      {latest && (
        <>
          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: "16px" }}>
            <div style={{ ...S.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress value={overallKpi} size={100} strokeWidth={7} color="auto" textSize="text-[20px]" />
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginTop: "12px" }}>Umumiy KPI</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{MONTHS[latest.month - 1]} {latest.year}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px", fontSize: "12px", fontWeight: 600, color: trend >= 0 ? "#10B981" : "#EF4444" }}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% o'tgan oydan
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Kompetensiyalar</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>5 yo'nalish bo'yicha</div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#F3F4F6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Radar name="KPI" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>O'sish dinamikasi</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>Oxirgi {historyData.length} oy</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={historyData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="oy" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={v => [`${v}%`, "KPI"]} />
                  <Bar dataKey="val" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI detail */}
          <div style={S.card}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>Batafsil KPI Ko'rsatkichlari</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {kpiItems.map(item => {
                const over = item.actual >= item.target;
                const pct = Math.round((item.actual / item.target) * 100);
                return (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#374151" }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Maqsad: {item.target}{item.unit}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: over ? "#10B981" : "#EF4444" }}>
                          {over ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {item.actual}{item.unit}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: "8px", borderRadius: "10px", background: "#F3F4F6", position: "relative" }}>
                      <div style={{ position: "absolute", left: `${item.target}%`, top: "-3px", width: "2px", height: "14px", background: "#9CA3AF", borderRadius: "1px" }} />
                      <div style={{ height: "8px", borderRadius: "10px", width: `${Math.min(item.actual, 100)}%`, background: over ? "linear-gradient(90deg,#10B981,#059669)" : "linear-gradient(90deg,#EF4444,#DC2626)", transition: "width 0.4s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "3px" }}>
                      <span style={{ fontSize: "10.5px", color: over ? "#10B981" : "#EF4444", fontWeight: 600 }}>{pct}% maqsadga nisbatan</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
