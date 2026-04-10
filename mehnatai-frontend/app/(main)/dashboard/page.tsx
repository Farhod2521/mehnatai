"use client";

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

const kpiTrend = [
  { oy: "Yan", kpi: 71 },
  { oy: "Fev", kpi: 74 },
  { oy: "Mar", kpi: 72 },
  { oy: "Apr", kpi: 78 },
  { oy: "May", kpi: 82 },
  { oy: "Iyn", kpi: 80 },
];

const deptData = [
  { name: "IT bo'limi", value: 85, color: "#00B8A0" },
  { name: "HR bo'limi", value: 74, color: "#6366F1" },
  { name: "Sotuv", value: 68, color: "#8B5CF6" },
  { name: "Marketing", value: 79, color: "#F59E0B" },
];

const topEmployees = [
  { name: "Sardor Aliev", role: "Head of Sales", score: 95, id: "6" },
  { name: "Azizbek Fayzullaev", role: "Senior Developer", score: 92, id: "1" },
  { name: "Nigora Mansurova", role: "Marketing Lead", score: 85, id: "4" },
  { name: "Alisher Karimov", role: "Dasturchi", score: 84, id: "7" },
];

const activity = [
  { text: "Azizbek Fayzullaev — Choraklik baholash yakunlandi", time: "2 soat oldin", color: "#10B981" },
  { text: "Otabek Rasulov — KPI pasayish aniqlandi", time: "5 soat oldin", color: "#F59E0B" },
  { text: "3 ta yangi feedback keldi", time: "Bugun", color: "#6366F1" },
  { text: "Oylik hisobot tayyor", time: "Kecha", color: "#10B981" },
];

const statCards = [
  { title: "Jami Xodimlar", value: "248", sub: "+12 bu oy", up: true, color: "#00B8A0", bg: "#E8F8F6", icon: Users, lottie: "https://lottie.host/a803427f-e320-4035-9353-c98c0516ad8e/n8JkeCSHsr.lottie" },
  { title: "O'rtacha Samaradorlik", value: "76%", sub: "+4.2% o'tgan oy", up: true, color: "#6366F1", bg: "#EEF2FF", icon: TrendingUp, lottie: "https://lottie.host/6f27c7b4-99c8-4a8a-a5cf-138e9511ea3a/ahTP0J9UUw.lottie" },
  { title: "Yuqori Samaradorlik", value: "89", sub: "35.9% xodimlar", up: true, color: "#10B981", bg: "#D1FAE5", icon: Award, lottie: "https://lottie.host/4383b464-a70b-4c81-bb13-f6d506d935c0/ta63txGapo.lottie" },
  { title: "Rivojlanish Kerak", value: "23", sub: "-3 o'tgan oy", up: false, color: "#EF4444", bg: "#FEE2E2", icon: AlertTriangle, lottie: "https://lottie.host/8cb0ed0c-db96-4092-8562-c2d36443a37c/wHARPewqa2.lottie" },
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

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Title */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Dashboard</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
          Kompaniya samaradorligi umumiy ko'rinishi
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {statCards.map(({ title, value, sub, up, color, bg, icon: Icon, lottie }) => (
          <div key={title} style={{ ...S.card, overflow: "hidden", position: "relative" }}>
            {/* Top row: icon + trend arrow */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: 600, color: up ? "#10B981" : "#EF4444" }}>
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </span>
            </div>

            {/* Content: numbers left, lottie right */}
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
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        {/* KPI Area Chart */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>KPI Dinamikasi</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Oxirgi 6 oy o'rtacha KPI</div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0" }}>
              2024
            </span>
          </div>
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
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 90]} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(v) => [`${v}%`, "KPI"]}
              />
              <Area type="monotone" dataKey="kpi" stroke="#00B8A0" strokeWidth={2.5} fill="url(#kpiGrad)" dot={{ fill: "#00B8A0", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department bars */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Bo'limlar</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "20px" }}>O'rtacha USI foizi</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {deptData.map((d) => (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12.5px", color: "#4B5563" }}>{d.name}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827" }}>{d.value}%</span>
                </div>
                <div style={{ height: "6px", borderRadius: "10px", background: "#F3F4F6" }}>
                  <div style={{ height: "6px", borderRadius: "10px", width: `${d.value}%`, background: d.color, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {topEmployees.map((emp, i) => (
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
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {emp.name}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{emp.role}</div>
                </div>
                <CircularProgress value={emp.score} size={40} strokeWidth={3.5} color="auto" textSize="text-[10px]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "18px" }}>So'nggi Faoliyat</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {activity.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: i < activity.length - 1 ? "16px" : "0" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: "3px" }} />
                  {i < activity.length - 1 && (
                    <div style={{ width: "1.5px", flex: 1, background: "#E5E7EB", marginTop: "4px" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>{item.text}</div>
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "3px" }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
