"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ChevronLeft, Briefcase, CheckCircle, Download, Zap,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import CircularProgress from "@/components/CircularProgress";
import StatusBadge from "@/components/StatusBadge";
import { employees, kpiMetrics } from "@/lib/mockData";

const tabs = ["Umumiy", "KPI Ko'rsatkichlari", "Baholash", "Tarix", "AI Tavsiyalar"];

const competencies = [
  { subject: "SIFAT", value: 95 },
  { subject: "TEZLIK", value: 88 },
  { subject: "JAMOAVIY", value: 90 },
  { subject: "INTIZOM", value: 82 },
  { subject: "INNOVATSIYA", value: 75 },
];

const growthData = [
  { oy: "YAN", value: 70 },
  { oy: "FEV", value: 74 },
  { oy: "MAR", value: 76 },
  { oy: "APR", value: 79 },
  { oy: "MAY", value: 84 },
];

const recentEvals = [
  { date: "15 May, 2024", type: "Choraklik Baholash", by: "Farhod Ahmedov", score: 92, comment: "Kodni optimizatsiya qilishda juda yaxshi natija ko'rsatdi.", active: true },
  { date: "12 Aprel, 2024", type: "360 Daraja Feedback", by: "8 nafar hamkasb", extra: "Jamoaviy ruh: 4.8/5.0", active: false },
  { date: "05 Mart, 2024", type: "Loyiha Yakuni (E-Gov)", extra: "Muvaffaqiyatli", active: false },
];

const aiRecs = [
  { title: "Backend arxitektura ko'nikmalari", desc: "Murakkab arxitekturaviy vazifalarni topshirish salohiyatini yanada ochishga yordam beradi.", priority: "Yuqori", priorityColor: "#EF4444", priorityBg: "#FEE2E2" },
  { title: "Micro-learning tizimi", desc: "Samaradorlikni 15% ga oshirish uchun kunlik 20 daqiqalik o'rganish sessiyalarini joriy etish tavsiya etiladi.", priority: "O'rta", priorityColor: "#F59E0B", priorityBg: "#FEF3C7" },
  { title: "Mentorlik roli", desc: "Junior xodimlarga mentor bo'lish shaxsiy o'sishga ham, jamoaga ham ijobiy ta'sir ko'rsatadi.", priority: "Tavsiya", priorityColor: "#10B981", priorityBg: "#D1FAE5" },
];

const historyItems = [
  { date: "Yanvar 2023", event: "Senior Dasturchi lavozimiga ko'tarildi", type: "promotion" },
  { date: "Mart 2022", event: "E-Gov loyihasiga qo'shildi", type: "project" },
  { date: "Iyun 2021", event: "MehnatAI kompaniyasiga qabul qilindi", type: "hired" },
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

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Umumiy");
  const employee = employees.find(e => e.id === id) || employees[6];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Back */}
      <Link href="/employees" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>
        <ChevronLeft size={16} /> Xodimlar ro'yxatiga qaytish
      </Link>

      {/* Profile header */}
      <div style={{ ...S.card, padding: "24px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "20px",
              background: "linear-gradient(135deg, #00B8A0, #009984)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "28px", fontWeight: 800,
              boxShadow: "0 8px 20px rgba(0,184,160,0.3)",
            }}>
              {employee.initials}
            </div>
            <div style={{
              position: "absolute", bottom: "-4px", right: "-4px",
              width: "24px", height: "24px", borderRadius: "50%",
              background: "#10B981", border: "2.5px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={12} color="white" fill="white" />
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>{employee.name}</h1>
              <StatusBadge status={employee.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}>
              <Briefcase size={13} color="#00B8A0" />
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#00B8A0" }}>{employee.position}</span>
              <span style={{ color: "#D1D5DB" }}>•</span>
              <span style={{ fontSize: "13.5px", color: "#00B8A0" }}>{employee.department}</span>
            </div>
            <div style={{ display: "flex", gap: "28px" }}>
              {[
                { label: "TAJRIBA", value: employee.experience },
                { label: "LOYIHALAR", value: `${employee.projects} ta` },
                { label: "FEEDBACK", value: `${employee.feedback}/5` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px" }}>{label}</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginTop: "3px" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score ring */}
          <div style={{
            width: "180px", borderRadius: "16px", padding: "20px",
            background: "#0C2340", display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: "10px", flexShrink: 0,
          }}>
            <CircularProgress value={employee.score} size={90} strokeWidth={7} color="#00B8A0" bgColor="rgba(255,255,255,0.1)" textSize="text-xl" />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
              {employee.name.split(" ")[0]} jamoaning eng faol a'zolaridan biri
            </p>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
              UMUMIY REYTING
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #F3F4F6" }}>
          {["Baholash", "Xabar", "Ogohlantirish", "Rag'batlantirish"].map(label => (
            <button key={label} style={{
              padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E7EB",
              background: "#F9FAFB", color: "#374151", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "4px", background: "#ffffff",
        borderRadius: "14px", border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "6px",
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "9px 10px", borderRadius: "10px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
              background: activeTab === tab ? "#00B8A0" : "transparent",
              color: activeTab === tab ? "#fff" : "#6B7280",
              transition: "all 0.15s", position: "relative",
            }}
          >
            {tab}
            {tab === "AI Tavsiyalar" && (
              <span style={{
                position: "absolute", top: "8px", right: "10px",
                width: "6px", height: "6px", borderRadius: "50%",
                background: activeTab === tab ? "rgba(255,255,255,0.7)" : "#00B8A0",
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ---- UMUMIY ---- */}
      {activeTab === "Umumiy" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {/* Radar */}
          <div style={S.card}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Kompetensiyalar</div>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={competencies} outerRadius={75}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9.5, fill: "#9CA3AF" }} />
                <Radar dataKey="value" stroke="#00B8A0" fill="#00B8A0" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: "#00B8A0", strokeWidth: 0 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>O'sish Dinamikasi</div>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0" }}>Oxirgi 5 oy</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={growthData} barSize={26} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="oy" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 90]} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} formatter={v => [`${v}%`, "Samaradorlik"]} />
                <Bar dataKey="value" fill="#00B8A0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Last evals */}
          <div style={S.card}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>Oxirgi Baholashlar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {recentEvals.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", paddingBottom: i < recentEvals.length - 1 ? "16px" : "0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: ev.active ? "#00B8A0" : "#E5E7EB", flexShrink: 0, marginTop: "3px" }} />
                    {i < recentEvals.length - 1 && <div style={{ width: "1.5px", flex: 1, background: "#E5E7EB", marginTop: "4px" }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{ev.date}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginTop: "2px" }}>{ev.type}</div>
                    {ev.by && <div style={{ fontSize: "11.5px", color: "#6B7280" }}>Baholovchi: <span style={{ color: "#6366F1" }}>{ev.by}</span></div>}
                    {ev.score && <div style={{ fontSize: "11.5px", color: "#6B7280" }}>Natija: <span style={{ color: "#00B8A0", fontWeight: 700 }}>{ev.score}/100</span></div>}
                    {ev.comment && <div style={{ fontSize: "11px", fontStyle: "italic", color: "#9CA3AF", marginTop: "2px" }}>"{ev.comment}"</div>}
                    {ev.extra && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0", fontWeight: 600, display: "inline-block", marginTop: "3px" }}>{ev.extra}</span>}
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", marginTop: "14px", padding: "9px", borderRadius: "10px", border: "none", background: "#F5F7FA", color: "#00B8A0", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Barcha tarixni ko'rish
            </button>
          </div>

          {/* AI banner */}
          <div style={{ gridColumn: "1 / -1", background: "#0C2340", borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(0,184,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={22} color="#00B8A0" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "1px", marginBottom: "6px" }}>SUN'IY INTELLEKT TAHLILI ••</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                AI tahlil: {employee.name.split(" ")[0]} so'nggi 3 oyda 12% o'sish ko'rsatdi...
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Uning texnik ko'nikmalari ayniqsa Backend arxitekturasi yo'nalishida sezilarli darajada yaxshilangan. Tavsiya: Keyingi chorakda unga murakkabroq arxitekturaviy vazifalarni topshirish uning salohiyatini yanada ochishga yordam beradi.
              </div>
            </div>
            <button style={{ flexShrink: 0, padding: "10px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              To'liq hisobotni yuklash
            </button>
          </div>
        </div>
      )}

      {/* ---- KPI ---- */}
      {activeTab === "KPI Ko'rsatkichlari" && (
        <div style={{ ...S.card }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>KPI Ko'rsatkichlari</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {kpiMetrics.map(kpi => {
              const pct = Math.min(100, Math.round((kpi.actual / kpi.target) * 100));
              const ok = pct >= 100;
              return (
                <div key={kpi.name} style={{ padding: "14px 16px", borderRadius: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{kpi.name}</span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Maqsad: <b>{kpi.target}{kpi.unit || "%"}</b></span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: ok ? "#10B981" : "#F59E0B" }}>
                        Haqiqiy: {kpi.actual}{kpi.unit || "%"}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: ok ? "#D1FAE5" : "#FEF3C7", color: ok ? "#065F46" : "#92400E" }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: "6px", borderRadius: "10px", background: "#E5E7EB" }}>
                    <div style={{ height: "6px", borderRadius: "10px", width: `${Math.min(pct, 100)}%`, background: ok ? "#10B981" : "#F59E0B", transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- BAHOLASH ---- */}
      {activeTab === "Baholash" && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Baholash Tarixi</div>
            <Link href="/baholash" style={{ padding: "9px 18px", borderRadius: "10px", background: "#00B8A0", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              + Yangi Baholash
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentEvals.map((ev, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{ev.type}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{ev.date}{ev.by ? ` • ${ev.by}` : ""}</div>
                </div>
                {ev.score
                  ? <span style={{ fontSize: "18px", fontWeight: 800, color: "#00B8A0" }}>{ev.score}/100</span>
                  : ev.extra
                  ? <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: "#D1FAE5", color: "#065F46" }}>{ev.extra}</span>
                  : null
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- TARIX ---- */}
      {activeTab === "Tarix" && (
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Faoliyat Tarixi</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {historyItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", paddingBottom: i < historyItems.length - 1 ? "20px" : "0" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#00B8A0", flexShrink: 0, border: "2.5px solid #E8F8F6" }} />
                  {i < historyItems.length - 1 && <div style={{ width: "2px", flex: 1, background: "#E5E7EB", marginTop: "4px" }} />}
                </div>
                <div style={{ paddingBottom: "4px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#9CA3AF" }}>{item.date}</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", marginTop: "3px" }}>{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- AI TAVSIYALAR ---- */}
      {activeTab === "AI Tavsiyalar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#0C2340", borderRadius: "16px", padding: "22px 24px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "1px", marginBottom: "10px" }}>AI STRATEGIK TAVSIYALAR</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: "8px" }}>
              Data-mining natijalariga ko'ra, "Rivojlanish kerak" guruhidagi xodimlarning 70% da texnik ko'nikmalar yetishmasligi kuzatilmoqda.
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              <b style={{ color: "rgba(255,255,255,0.85)" }}>Xulosa:</b> Keyingi chorakda LSTM bashorati bo'yicha samaradorlikni 15% ga oshirish uchun "Micro-learning" tizimini joriy etish tavsiya etiladi.
            </div>
          </div>
          {aiRecs.map((rec, i) => (
            <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{rec.title}</div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "5px", lineHeight: 1.5 }}>{rec.desc}</div>
              </div>
              <span style={{ flexShrink: 0, marginLeft: "16px", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: rec.priorityBg, color: rec.priorityColor }}>
                {rec.priority}
              </span>
            </div>
          ))}
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start",
            padding: "11px 20px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #00B8A0, #009984)",
            color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
          }}>
            <Download size={15} /> Harakat Rejasini Ko'rish
          </button>
        </div>
      )}
    </div>
  );
}
