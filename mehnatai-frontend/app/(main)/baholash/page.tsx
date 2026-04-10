"use client";

import { useState } from "react";
import { Plus, Star, ChevronRight } from "lucide-react";
import { employees } from "@/lib/mockData";

const evalTypes = [
  { type: "Choraklik Baholash", who: "Rahbar", when: "Har 3 oyda", weight: "30%", color: "#00B8A0", bg: "#E8F8F6" },
  { type: "360 Daraja Feedback", who: "8-12 hamkasb", when: "Yiliga 2 marta", weight: "25%", color: "#6366F1", bg: "#EEF2FF" },
  { type: "Mijoz Feedback", who: "Tashqi mijoz", when: "Loyiha tugaganda", weight: "20%", color: "#F59E0B", bg: "#FEF3C7" },
  { type: "KPI Avtomatik", who: "Tizim", when: "Har kuni", weight: "25%", color: "#10B981", bg: "#D1FAE5" },
];

const recentEvals = [
  { employee: "Azizbek Fayzullaev", type: "Choraklik Baholash", score: 92, date: "15 May, 2024", by: "Farhod Ahmedov" },
  { employee: "Sardor Aliev", type: "KPI Avtomatik", score: 95, date: "14 May, 2024", by: "Tizim" },
  { employee: "Alisher Karimov", type: "360 Daraja Feedback", score: 88, date: "12 Aprel, 2024", by: "8 hamkasb" },
  { employee: "Nigora Mansurova", type: "Mijoz Feedback", score: 82, date: "10 Aprel, 2024", by: "Mijoz" },
  { employee: "Javohir Meliboev", type: "Choraklik Baholash", score: 68, date: "05 Mart, 2024", by: "Rahbar" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: "1px" }}>
          <Star size={20} fill={n <= value ? "#F59E0B" : "none"} color={n <= value ? "#F59E0B" : "#D1D5DB"} />
        </button>
      ))}
    </div>
  );
}

const S = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "13.5px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#111827",
    outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7280",
    marginBottom: "6px",
    display: "block",
  } as React.CSSProperties,
};

export default function BaholashPage() {
  const [tab, setTab] = useState<"list" | "form">("list");
  const [formType, setFormType] = useState("Choraklik Baholash");
  const [selectedEmp, setSelectedEmp] = useState("");
  const [scores, setScores] = useState({ texnik: "", muddat: "", jamoa: "", muammo: "", ozozligi: "" });
  const [stars, setStars] = useState({ jamoa: 0, muloqot: 0, ishonch: 0, yordam: 0, ruh: 0 });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTab("list"); }, 2000);
  };

  const scoreColor = (s: number) => s >= 80 ? "#10B981" : s >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Baholash Tizimi</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>Xodimlarni har tomonlama baholash</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setTab("list")}
            style={{
              padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
              border: "1px solid #E5E7EB",
              background: tab === "list" ? "#00B8A0" : "#fff",
              color: tab === "list" ? "#fff" : "#6B7280",
            }}
          >
            Baholashlar Ro'yxati
          </button>
          <button
            onClick={() => setTab("form")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              border: "none",
              background: tab === "form" ? "#00B8A0" : "linear-gradient(135deg, #00B8A0, #009984)",
              color: "#fff", boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
            }}
          >
            <Plus size={14} /> Yangi Baholash
          </button>
        </div>
      </div>

      {/* Type cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {evalTypes.map(et => (
          <div key={et.type} style={{ ...S.card, padding: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: et.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: et.color }}>{et.weight}</span>
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{et.type}</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>Kim: {et.who}</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Qachon: {et.when}</div>
          </div>
        ))}
      </div>

      {/* LIST TAB */}
      {tab === "list" && (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>So'nggi Baholashlar</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["XODIM", "BAHOLASH TURI", "BALL", "SANA", "BAHOLOVCHI", ""].map(h => (
                  <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEvals.map((ev, i) => (
                <tr key={i} style={{ borderBottom: i < recentEvals.length - 1 ? "1px solid #F3F4F6" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{ev.employee}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0" }}>
                      {ev.type}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: scoreColor(ev.score) }}>{ev.score}/100</span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6B7280" }}>{ev.date}</td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#374151" }}>{ev.by}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#00B8A0" }}>
                      Ko'rish <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM TAB */}
      {tab === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px" }}>

          {/* Left: Form */}
          <div style={{ ...S.card, padding: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Yangi Baholash Formasi</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={S.label}>Baholash turi</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} style={S.input}>
                  {evalTypes.map(e => <option key={e.type}>{e.type}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>Xodim tanlash</label>
                <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} style={S.input}>
                  <option value="">— Xodimni tanlang —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.position}</option>)}
                </select>
              </div>

              {formType === "Choraklik Baholash" && (
                <div>
                  <label style={{ ...S.label, marginBottom: "10px" }}>1–10 ball (Rahbar baholash)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "texnik", label: "Texnik Sifat" },
                      { key: "muddat", label: "Muddatga rioya" },
                      { key: "jamoa", label: "Jamoaviy ish" },
                      { key: "muammo", label: "Muammoni hal qilish" },
                      { key: "ozozligi", label: "O'z-o'zini rivojlantirish" },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                        <span style={{ fontSize: "13.5px", color: "#374151" }}>{label}</span>
                        <input
                          type="number" min={1} max={10}
                          value={scores[key as keyof typeof scores]}
                          onChange={e => setScores(s => ({ ...s, [key]: e.target.value }))}
                          placeholder="1–10"
                          style={{ width: "64px", padding: "6px 10px", fontSize: "14px", fontWeight: 700, textAlign: "center", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", outline: "none", color: "#00B8A0" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formType === "360 Daraja Feedback" && (
                <div>
                  <label style={{ ...S.label, marginBottom: "10px" }}>1–5 yulduz (Anonim baholash)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "jamoa", label: "Jamoaga hissa qo'shish" },
                      { key: "muloqot", label: "Muloqot qobiliyati" },
                      { key: "ishonch", label: "Ishonchlilik va mas'uliyat" },
                      { key: "yordam", label: "Yordam berishga tayyorlik" },
                      { key: "ruh", label: "Jamoaviy ruh" },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                        <span style={{ fontSize: "13.5px", color: "#374151" }}>{label}</span>
                        <StarRating value={stars[key as keyof typeof stars]} onChange={v => setStars(s => ({ ...s, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={S.label}>Izoh (ixtiyoriy)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Qo'shimcha izoh..."
                  style={{ ...S.input, resize: "none" as const }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedEmp}
                style={{
                  padding: "12px", borderRadius: "12px", border: "none",
                  background: submitted ? "#10B981" : "linear-gradient(135deg, #00B8A0, #009984)",
                  color: "#fff", fontSize: "14px", fontWeight: 700, cursor: selectedEmp ? "pointer" : "not-allowed",
                  opacity: !selectedEmp ? 0.6 : 1,
                  boxShadow: selectedEmp ? "0 4px 12px rgba(0,184,160,0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {submitted ? "✓ Baholash muvaffaqiyatli saqlandi!" : "Baholashni saqlash"}
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#0C2340", borderRadius: "16px", padding: "22px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "1px", marginBottom: "12px" }}>BAHOLASH FORMULASI</div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#fff", lineHeight: 1.8, background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: "10px" }}>
                USI = (KPI × 0.25)<br />
                + (Rahbar × 0.30)<br />
                + (360° × 0.25)<br />
                + (Mijoz × 0.20)
              </div>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { range: "80–100%", label: "YUQORI", color: "#10B981" },
                  { range: "60–79%", label: "O'RTA", color: "#F59E0B" },
                  { range: "0–59%", label: "RIVOJLANISH KERAK", color: "#EF4444" },
                ].map(({ range, label, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{range}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: `${color}22`, color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...S.card, padding: "18px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>Baholash Turlari</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {evalTypes.map(et => (
                  <div key={et.type}
                    onClick={() => setFormType(et.type)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                      background: formType === et.type ? et.bg : "#F9FAFB",
                      border: `1px solid ${formType === et.type ? et.color + "44" : "#E5E7EB"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{et.type}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: et.color }}>{et.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
