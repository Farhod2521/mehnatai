"use client";

import { Download, FileText, Filter, Calendar, BarChart2, Star } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const monthlyData = [
  { oy: "Yan", yuqori: 82, orta: 48, past: 18 },
  { oy: "Fev", yuqori: 85, orta: 45, past: 20 },
  { oy: "Mar", yuqori: 80, orta: 52, past: 16 },
  { oy: "Apr", yuqori: 88, orta: 44, past: 16 },
  { oy: "May", yuqori: 89, orta: 46, past: 23 },
];

const reports = [
  { name: "Oylik Samaradorlik Hisoboti — May 2024", size: "2.4 MB", date: "01 Iyn, 2024" },
  { name: "Choraklik Baholash Natijalar — Q1 2024", size: "1.8 MB", date: "01 Apr, 2024" },
  { name: "K-Means Klaster Tahlili — 2024", size: "3.1 MB", date: "15 Mar, 2024" },
  { name: "AI Bashorat Hisoboti — Fevral 2024", size: "1.2 MB", date: "01 Mar, 2024" },
  { name: "360 Daraja Feedback Xulosasi — Q4 2023", size: "2.7 MB", date: "15 Yan, 2024" },
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

const statCards = [
  { label: "Jami hisobotlar", value: "48", sub: "Bu yil", icon: FileText, color: "#00B8A0", bg: "#E8F8F6" },
  { label: "PDF yuklashlar", value: "312", sub: "Bu oy", icon: Download, color: "#6366F1", bg: "#EEF2FF" },
  { label: "Avtomatik hisobotlar", value: "24", sub: "Oylik", icon: BarChart2, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "O'rtacha reyting", value: "4.7★", sub: "Foydalanuvchi", icon: Star, color: "#10B981", bg: "#D1FAE5" },
];

export default function HisobotlarPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Hisobotlar</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>PDF eksport va analitik hisobotlar</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "10px 20px", borderRadius: "10px", border: "none",
          background: "linear-gradient(135deg, #00B8A0, #009984)",
          color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
        }}>
          <Download size={14} /> Yangi Hisobot Yaratish
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px" }}>{label}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Oylik Xodimlar Status Taqsimoti</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Yuqori / O'rta / Rivojlanish kerak</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[{ label: "Filtr", icon: Filter }, { label: "2024", icon: Calendar }].map(({ label, icon: Icon }) => (
              <button key={label} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px", borderRadius: "8px", border: "1px solid #E5E7EB",
                background: "#fff", color: "#6B7280", fontSize: "12.5px", fontWeight: 500, cursor: "pointer",
              }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barSize={22} barGap={4} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="oy" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} />
            <Legend formatter={v => <span style={{ fontSize: "12px", color: "#6B7280" }}>{v}</span>} />
            <Bar dataKey="yuqori" fill="#00B8A0" radius={[4, 4, 0, 0]} name="Yuqori" />
            <Bar dataKey="orta" fill="#F59E0B" radius={[4, 4, 0, 0]} name="O'rta" />
            <Bar dataKey="past" fill="#EF4444" radius={[4, 4, 0, 0]} name="Rivojlanish Kerak" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reports list */}
      <div style={{ ...S.card, padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Saqlangan Hisobotlar</div>
        </div>
        {reports.map((rep, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < reports.length - 1 ? "1px solid #F3F4F6" : "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={18} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#111827" }}>{rep.name}</div>
                <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "2px" }}>{rep.size} • {rep.date}</div>
              </div>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 14px", borderRadius: "8px", border: "none",
              background: "#E8F8F6", color: "#00B8A0", fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
            }}>
              <Download size={13} /> Yuklash
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
