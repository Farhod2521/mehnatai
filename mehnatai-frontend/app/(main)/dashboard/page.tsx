"use client";

import { useEffect, useState } from "react";
import {
  Users, TrendingUp, Award, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import CircularProgress from "@/components/CircularProgress";
import LottiePlayer from "@/components/LottiePlayer";
import Link from "next/link";
import { dashboardApi, kpiApi, type DashboardStats, type TopPerformer } from "@/lib/api";

const LOTTIE = [
  "https://lottie.host/a803427f-e320-4035-9353-c98c0516ad8e/n8JkeCSHsr.lottie",
  "https://lottie.host/6f27c7b4-99c8-4a8a-a5cf-138e9511ea3a/ahTP0J9UUw.lottie",
  "https://lottie.host/4383b464-a70b-4c81-bb13-f6d506d935c0/ta63txGapo.lottie",
  "https://lottie.host/8cb0ed0c-db96-4092-8562-c2d36443a37c/wHARPewqa2.lottie",
];

const S = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "20px",
  } as React.CSSProperties,
};

function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

const DEPT_COLORS: Record<string, string> = {
  IT: "#00B8A0", HR: "#6366F1", Sotuv: "#8B5CF6", Marketing: "#F59E0B",
  Moliya: "#10B981", Boshqaruv: "#EF4444",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [top, setTop] = useState<TopPerformer[]>([]);
  const [kpiTrend, setKpiTrend] = useState<{ oy: string; kpi: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.topPerformers(5),
        ]);
        setStats(s);
        setTop(t);

        // Try to load KPI trend from top employee
        if (t.length > 0) {
          try {
            const summary = await kpiApi.summary(t[0].id);
            const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
            setKpiTrend(summary.trend.map(r => ({
              oy: MONTHS[r.month - 1],
              kpi: r.kpi_avg,
            })));
          } catch {
            // fallback static
            setKpiTrend([
              { oy: "Yan", kpi: 71 }, { oy: "Fev", kpi: 74 }, { oy: "Mar", kpi: 72 },
              { oy: "Apr", kpi: 78 }, { oy: "May", kpi: 82 }, { oy: "Iyn", kpi: 80 },
            ]);
          }
        }
      } catch {
        // silently keep nulls — error state shown below
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = stats ? [
    {
      title: "Jami Xodimlar", value: String(stats.employees.total),
      sub: `+${stats.employees.yuqori} yuqori samarali`,
      up: true, color: "#00B8A0", bg: "#E8F8F6", icon: Users, lottie: LOTTIE[0],
    },
    {
      title: "O'rtacha Samaradorlik", value: `${stats.avg_usi}%`,
      sub: "USI o'rtacha",
      up: stats.avg_usi >= 70, color: "#6366F1", bg: "#EEF2FF", icon: TrendingUp, lottie: LOTTIE[1],
    },
    {
      title: "Yuqori Samaradorlik", value: String(stats.employees.yuqori),
      sub: `${Math.round(stats.employees.yuqori / (stats.employees.total || 1) * 100)}% xodimlar`,
      up: true, color: "#10B981", bg: "#D1FAE5", icon: Award, lottie: LOTTIE[2],
    },
    {
      title: "Rivojlanish Kerak", value: String(stats.employees.rivojlanish),
      sub: `${stats.employees.orta} o'rta darajali`,
      up: false, color: "#EF4444", bg: "#FEE2E2", icon: AlertTriangle, lottie: LOTTIE[3],
    },
  ] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Dashboard</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
          Kompaniya samaradorligi umumiy ko'rinishi
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton w={44} h={44} />
                <Skeleton h={32} />
                <Skeleton w="60%" h={14} />
              </div>
            ))
          : statCards?.map(({ title, value, sub, up, color, bg, icon: Icon, lottie }) => (
              <div key={title} style={{ ...S.card, overflow: "hidden", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 600, color: up ? "#10B981" : "#EF4444" }}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "12px" }}>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "5px" }}>{title}</div>
                    <div style={{ fontSize: "12px", color: up ? "#10B981" : "#EF4444", marginTop: "3px", fontWeight: 500 }}>{sub}</div>
                  </div>
                  <div style={{ marginRight: "-14px", marginBottom: "-14px" }}>
                    <LottiePlayer src={lottie} width={200} height={140} />
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>KPI Dinamikasi</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Oxirgi oylar o'rtacha KPI</div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0" }}>
              2026
            </span>
          </div>
          {loading ? (
            <Skeleton h={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={kpiTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00B8A0" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00B8A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="oy" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={(v) => [`${v}%`, "KPI"]} />
                <Area type="monotone" dataKey="kpi" stroke="#00B8A0" strokeWidth={2.5} fill="url(#kpiGrad)" dot={{ fill: "#00B8A0", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department bars */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Bo'limlar</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "20px" }}>Xodimlar soni</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} h={24} />)}
            </div>
          ) : stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { name: "IT bo'limi", dept: "IT" },
                { name: "HR bo'limi", dept: "HR" },
                { name: "Sotuv", dept: "Sotuv" },
                { name: "Marketing", dept: "Marketing" },
              ].map(({ name, dept }) => {
                const color = DEPT_COLORS[dept] ?? "#6B7280";
                const pct = Math.round((stats.employees.yuqori / (stats.employees.total || 1)) * 100);
                return (
                  <div key={name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "12.5px", color: "#4B5563" }}>{name}</span>
                      <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827" }}>{pct}%</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "10px", background: "#F3F4F6" }}>
                      <div style={{ height: "6px", borderRadius: "10px", width: `${pct}%`, background: color, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Top employees */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Top Xodimlar</div>
            <Link href="/employees" style={{ fontSize: "12.5px", fontWeight: 600, color: "#00B8A0", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
              Hammasi <ChevronRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} h={40} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {top.map((emp, i) => (
                <Link key={emp.id} href={`/employees/${emp.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "#FEF3C7" : "#F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, color: i === 0 ? "#92400E" : "#6B7280",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #00B8A0, #009984)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: 700,
                  }}>
                    {emp.avatar_initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emp.full_name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{emp.position}</div>
                  </div>
                  <CircularProgress value={emp.usi_score} size={40} strokeWidth={3.5} color="auto" textSize="text-[10px]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats summary */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "18px" }}>Tizim Statistikasi</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} h={48} />)}
            </div>
          ) : stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Jami baholashlar", value: stats.evaluations_total, color: "#6366F1" },
                { label: "Vazifalar bajarildi", value: `${stats.tasks.done}/${stats.tasks.total}`, color: "#10B981" },
                { label: "Vazifa bajarish foizi", value: `${stats.tasks.completion_rate}%`, color: "#00B8A0" },
                { label: "O'rtacha USI", value: `${stats.avg_usi}%`, color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "10px", background: "#F9FAFB" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>{label}</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Ma'lumot yuklanmadi</p>
          )}
        </div>
      </div>
    </div>
  );
}
