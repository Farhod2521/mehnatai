"use client";

/**
 * BAHOLASH TIZIMI — Magistr ishi asosiy sahifasi
 *
 * Bu sahifa USI formulasiga kiradigan 4 ta baholash turini boshqaradi:
 *
 *  1. Choraklik Baholash (30%) — Rahbar xodimni 5 mezon bo'yicha 1–10 ball beradi
 *  2. 360° Feedback     (25%) — Hamkasblar anonim 1–5 yulduz beradi
 *  3. Mijoz Feedback    (20%) — Tashqi mijoz loyiha oxirida baholaydi
 *  4. KPI Avtomatik     (25%) — Tizim har oy texnik ko'rsatkichlarni hisoblaydi
 *
 *  USI = (KPI × 0.25) + (Rahbar × 0.30) + (360° × 0.25) + (Mijoz × 0.20)
 *
 *  Baholash → USI yangilanadi → K-Means clustering input bo'ladi → AI tavsiyalar
 */

import { memo, useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Star, ChevronRight, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { employeesApi, evaluationsApi, type Employee, type Evaluation } from "@/lib/api";

/* ─── Eval type config ───────────────────────────────────────────────────────── */
const EVAL_TYPES = [
  {
    key: "rahbar" as const,
    label: "Choraklik Baholash",
    who: "Rahbar baholaydi",
    when: "Har 3 oyda bir marta",
    weight: "30%",
    color: "#00B8A0", bg: "#E8F8F6",
    desc: "Texnik sifat, muddatga rioya, jamoaviy ish va boshqa 5 ta mezon bo'yicha 1–10 ball",
    lottie: "https://lottie.host/fa8dd28c-8d7f-4fea-bb70-9326722c738a/3ANm0EqgWc.lottie",
  },
  {
    key: "peer_360" as const,
    label: "360° Feedback",
    who: "8–12 hamkasb",
    when: "Yiliga 2 marta",
    weight: "25%",
    color: "#6366F1", bg: "#EEF2FF",
    desc: "Hamkasblar anonim ravishda jamoaviy muloqot, ishonchlilik va yordam berish qobiliyatini 1–5 yulduz bilan baholaydi",
    lottie: "https://lottie.host/68f19cfd-e60d-4bfc-9d67-d7a0f0b15160/rx9RVUk7kx.lottie",
  },
  {
    key: "mijoz" as const,
    label: "Mijoz Feedback",
    who: "Tashqi mijoz",
    when: "Loyiha tugaganda",
    weight: "20%",
    color: "#F59E0B", bg: "#FEF3C7",
    desc: "Mijoz xodim bilan ishlash jarayonidagi muloqot va natijani 1–10 ball bilan baholaydi",
    lottie: "https://lottie.host/d977baa5-4b4b-4ef3-b553-57438375b586/XuuPtmYx0P.lottie",
  },
  {
    key: "kpi" as const,
    label: "KPI Avtomatik",
    who: "Tizim (avtomatik)",
    when: "Har oy",
    weight: "25%",
    color: "#10B981", bg: "#D1FAE5",
    desc: "Kod sifati, bug-fix tezligi, hujjatlashtirish kabi 6 ta texnik metrika tizim tomonidan avtomatik hisoblanadi",
    lottie: "https://lottie.host/dd1d0219-9f16-4e71-8efc-b63124a510c9/ehnmhTRNYX.lottie",
  },
];

const EVAL_KEY_MAP: Record<string, "rahbar" | "peer_360" | "mijoz"> = {
  rahbar:   "rahbar",
  peer_360: "peer_360",
  mijoz:    "mijoz",
  kpi:      "rahbar",
};

const EVAL_LABEL: Record<string, string> = {
  rahbar:   "Choraklik Baholash",
  peer_360: "360° Feedback",
  mijoz:    "Mijoz Feedback",
};

const EVAL_COLOR: Record<string, { bg: string; color: string }> = {
  rahbar:   { bg: "#E8F8F6", color: "#00B8A0" },
  peer_360: { bg: "#EEF2FF", color: "#6366F1" },
  mijoz:    { bg: "#FEF3C7", color: "#F59E0B" },
};

const SENTIMENT_LABEL: Record<string, string> = { ijobiy: "Ijobiy", neytral: "Neytral", salbiy: "Salbiy" };
const SENTIMENT_COLOR: Record<string, string>  = { ijobiy: "#10B981", neytral: "#F59E0B", salbiy: "#EF4444" };

function scoreColor(s: number) {
  return s >= 8 ? "#10B981" : s >= 6 ? "#F59E0B" : "#EF4444";
}

/* ─── Lottie card ────────────────────────────────────────────────────────────── */
function loadLottie() {
  if (!document.querySelector('script[data-dlwc]')) {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js";
    s.type = "module"; s.setAttribute("data-dlwc", "1");
    document.head.appendChild(s);
  }
}

const EvalTypeCard = memo(function EvalTypeCard({
  label, who, when, weight, color, bg, lottie, desc, active, onClick,
}: Omit<typeof EVAL_TYPES[0], "key"> & { active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadLottie();
    if (ref.current && ref.current.childElementCount === 0) {
      const el = document.createElement("dotlottie-wc");
      el.setAttribute("src", lottie);
      el.setAttribute("style", "width:180px;height:180px");
      el.setAttribute("autoplay", ""); el.setAttribute("loop", "");
      ref.current.appendChild(el);
    }
  }, [lottie]);

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: "16px",
        border: `2px solid ${active ? color : "#E5E7EB"}`,
        boxShadow: active ? `0 4px 16px ${color}33` : "0 1px 4px rgba(0,0,0,0.06)",
        padding: "20px", minHeight: "220px", cursor: "pointer",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        overflow: "hidden", position: "relative", transition: "all 0.2s",
      }}
    >
      <div ref={ref} style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.9, pointerEvents: "none" }} />
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 12px", borderRadius: "20px", background: bg, alignSelf: "flex-start" }}>
        <span style={{ fontSize: "16px", fontWeight: 800, color }}>{weight}</span>
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>{label}</div>
        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Kim: {who}</div>
        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>Qachon: {when}</div>
        {active && <div style={{ fontSize: "11px", color, lineHeight: 1.4, fontStyle: "italic" }}>{desc}</div>}
      </div>
    </div>
  );
});

/* ─── Star rating ────────────────────────────────────────────────────────────── */
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

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function Sk({ h = 48 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 10, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

const S = {
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", fontSize: "13.5px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", outline: "none", fontFamily: "inherit", boxSizing: "border-box" } as React.CSSProperties,
  label: { fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: "6px", display: "block" } as React.CSSProperties,
};

/* ─── Combined eval row type ─────────────────────────────────────────────────── */
interface EvalRow extends Evaluation {
  employeeName: string;
  employeeId: number;
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function BaholashPage() {
  const [tab, setTab] = useState<"list" | "form">("list");
  const [activeType, setActiveType] = useState("rahbar");

  /* Evaluations list */
  const [evalRows, setEvalRows] = useState<EvalRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  /* Form state */
  const [formType, setFormType] = useState("rahbar");
  const [selectedEmp, setSelectedEmp] = useState("");
  const [scores, setScores] = useState({ texnik: "", muddat: "", jamoa: "", muammo: "", ozozligi: "" });
  const [stars, setStars]   = useState({ jamoa: 0, muloqot: 0, ishonch: 0, yordam: 0, ruh: 0 });
  const [overallScore, setOverallScore] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Load all employees + their evaluations */
  const loadData = useCallback(async () => {
    setListLoading(true);
    try {
      const emps = await employeesApi.list({ page_size: 100 });
      setEmployees(emps.items);

      const results = await Promise.all(
        emps.items.map(async (e: Employee) => {
          const evs = await evaluationsApi.list(e.id).catch(() => [] as Evaluation[]);
          return evs.map(ev => ({
            ...ev,
            employeeName: `${e.first_name} ${e.last_name}`,
            employeeId: e.id,
          }));
        })
      );

      const all: EvalRow[] = results
        .flat()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setEvalRows(all);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* Stats */
  const totalCount = evalRows.length;
  const avgScore = totalCount
    ? Math.round((evalRows.reduce((s, e) => s + e.overall_score, 0) / totalCount) * 10)
    : 0;
  const positiveCount = evalRows.filter(e => e.sentiment === "ijobiy").length;
  const thisMonth = evalRows.filter(e => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  /* Form submit */
  const handleSubmit = async () => {
    if (!selectedEmp) return;
    setSaving(true);
    try {
      const empId = Number(selectedEmp);
      const evalTypeKey = EVAL_KEY_MAP[formType] ?? "rahbar";

      let finalScore = 0;
      if (formType === "peer_360") {
        const vals = Object.values(stars);
        finalScore = vals.reduce((a, b) => a + b, 0) / vals.length * 2; // 1-5 → 1-10
      } else if (overallScore) {
        finalScore = Number(overallScore);
      } else {
        const vals = Object.values(scores).map(Number).filter(Boolean);
        finalScore = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
      }
      finalScore = Math.min(10, Math.max(1, Math.round(finalScore * 10) / 10));

      await evaluationsApi.create({
        employee_id: empId,
        eval_type: evalTypeKey,
        overall_score: finalScore,
        work_quality:  scores.texnik  ? Number(scores.texnik)  : undefined,
        punctuality:   scores.muddat  ? Number(scores.muddat)  : undefined,
        teamwork:      scores.jamoa   ? Number(scores.jamoa)   : undefined,
        comment: comment || undefined,
        is_anonymous: formType === "peer_360",
      });

      setSubmitted(true);
      await loadData();
      setTimeout(() => {
        setSubmitted(false);
        setTab("list");
        setSelectedEmp(""); setComment(""); setOverallScore("");
        setScores({ texnik: "", muddat: "", jamoa: "", muammo: "", ozozligi: "" });
        setStars({ jamoa: 0, muloqot: 0, ishonch: 0, yordam: 0, ruh: 0 });
      }, 1800);
    } catch { /* */ }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Baholash Tizimi</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            USI formulasiga kiritiladigan baholashlarni boshqaring
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setTab("list")} style={{ padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "1px solid #E5E7EB", background: tab === "list" ? "#00B8A0" : "#fff", color: tab === "list" ? "#fff" : "#6B7280" }}>
            Baholashlar Ro'yxati
          </button>
          <button onClick={() => setTab("form")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#00B8A0,#009984)", color: "#fff", boxShadow: "0 4px 12px rgba(0,184,160,0.3)" }}>
            <Plus size={14} /> Yangi Baholash
          </button>
        </div>
      </div>

      {/* ── USI tushuntiruvi (bir marta ko'rsatiladi) ── */}
      <div style={{ background: "linear-gradient(135deg, #001f18, #003d31)", borderRadius: "16px", padding: "20px 24px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "2px", marginBottom: "6px" }}>NIMA UCHUN BAHOLASH KERAK?</div>
          <div style={{ fontSize: "14px", color: "white", fontWeight: 600, lineHeight: 1.6 }}>
            Har bir baholash xodimning USI (Umumiy Samaradorlik Indeksi) formulasiga kiradi.
            USI ball K-Means algoritmiga beriladi va xodim <b style={{ color: "#00B8A0" }}>Yulduz / Barqaror / Rivojlanish</b> klasteriga tushadi.
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 20px", fontFamily: "monospace", fontSize: "13px", color: "white", lineHeight: 2, flexShrink: 0 }}>
          <span style={{ color: "#00B8A0" }}>USI</span> = KPI × <span style={{ color: "#10B981" }}>0.25</span><br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ Rahbar × <span style={{ color: "#10B981" }}>0.30</span><br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ 360° × <span style={{ color: "#10B981" }}>0.25</span><br />
          &nbsp;&nbsp;&nbsp;&nbsp;+ Mijoz × <span style={{ color: "#10B981" }}>0.20</span>
        </div>
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          {[
            { label: "Jami baholash", value: totalCount, color: "#00B8A0" },
            { label: "O'rtacha ball", value: `${avgScore}/100`, color: avgScore >= 75 ? "#10B981" : avgScore >= 55 ? "#F59E0B" : "#EF4444" },
            { label: "Bu oy", value: thisMonth, color: "#6366F1" },
            { label: "Ijobiy", value: positiveCount, color: "#10B981" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px 16px", textAlign: "center", minWidth: "70px" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4 ta baholash turi (kliklanadigan) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {EVAL_TYPES.map(({ key: etKey, ...et }) => (
          <EvalTypeCard
            key={etKey}
            {...et}
            active={activeType === etKey}
            onClick={() => {
              setActiveType(etKey);
              if (etKey !== "kpi") { setFormType(etKey); setTab("form"); }
            }}
          />
        ))}
      </div>
      {activeType === "kpi" && (
        <div style={{ background: "#FEF3C7", borderRadius: "12px", padding: "14px 18px", fontSize: "13px", color: "#92400E", display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp size={16} />
          <span><b>KPI Avtomatik</b> — bu baholash HR sahifasidagi "KPI Boshqaruvi" bo'limidan kiritiladi. U yerda har oy xodim uchun kod sifati, bug-fix tezligi kabi 6 ta metrini kiritasiz.</span>
          <Link href="/hr/kpi" style={{ fontWeight: 700, color: "#92400E", textDecoration: "underline", flexShrink: 0 }}>KPI sahifasiga o'tish →</Link>
        </div>
      )}

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>So'nggi Baholashlar</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                Bazadagi haqiqiy ma'lumotlar — {totalCount} ta baholash
              </div>
            </div>
            <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#F3F4F6", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              <RefreshCw size={13} /> Yangilash
            </button>
          </div>

          {listLoading ? (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1,2,3,4,5].map(i => <Sk key={i} />)}
            </div>
          ) : evalRows.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>Hali baholashlar yo'q</p>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                Yuqoridagi "Yangi Baholash" tugmasini bosib birinchi baholashni kiriting
              </p>
              <button onClick={() => setTab("form")} style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#00B8A0,#009984)", border: "none", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                <Plus size={13} style={{ display: "inline", marginRight: "6px" }} />
                Baholash qo'shish
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  {["XODIM", "BAHOLASH TURI", "BALL", "SENTIMENT", "SANA", ""].map(h => (
                    <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evalRows.slice(0, 30).map((ev, i) => {
                  const ec = EVAL_COLOR[ev.eval_type] ?? { bg: "#F3F4F6", color: "#6B7280" };
                  const scoreVal = Math.round(ev.overall_score * 10);
                  return (
                    <tr key={ev.id} style={{ borderBottom: i < Math.min(evalRows.length, 30) - 1 ? "1px solid #F3F4F6" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{ev.employeeName}</div>
                        {ev.is_anonymous && <div style={{ fontSize: "10px", color: "#9CA3AF" }}>Anonim</div>}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: ec.bg, color: ec.color }}>
                          {EVAL_LABEL[ev.eval_type] ?? ev.eval_type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: scoreColor(ev.overall_score) }}>
                          {scoreVal}/100
                        </span>
                        <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{ev.overall_score}/10 ball</div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {ev.sentiment ? (
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: SENTIMENT_COLOR[ev.sentiment] + "22", color: SENTIMENT_COLOR[ev.sentiment] }}>
                            {SENTIMENT_LABEL[ev.sentiment]}
                          </span>
                        ) : <span style={{ color: "#D1D5DB", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "12px", color: "#6B7280" }}>
                        {new Date(ev.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <Link href={`/employees/${ev.employeeId}`} style={{ display: "flex", alignItems: "center", gap: "3px", textDecoration: "none", fontSize: "13px", fontWeight: 600, color: "#00B8A0" }}>
                          Ko'rish <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── FORM TAB ── */}
      {tab === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px" }}>

          {/* Left: form */}
          <div style={{ ...S.card, padding: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Yangi Baholash</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Baholash turi */}
              <div>
                <label style={S.label}>Baholash turi</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {EVAL_TYPES.filter(e => e.key !== "kpi").map(et => (
                    <button key={et.key} onClick={() => setFormType(et.key)} style={{ padding: "10px 12px", borderRadius: "10px", border: `2px solid ${formType === et.key ? et.color : "#E5E7EB"}`, background: formType === et.key ? et.bg : "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: formType === et.key ? et.color : "#6B7280", transition: "all 0.15s" }}>
                      {et.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "8px", padding: "10px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "12px", color: "#6B7280" }}>
                  {EVAL_TYPES.find(e => e.key === formType)?.desc}
                </div>
              </div>

              {/* Xodim */}
              <div>
                <label style={S.label}>Xodim tanlash *</label>
                <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} style={S.input}>
                  <option value="">— Xodimni tanlang —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.position}</option>)}
                </select>
              </div>

              {/* Choraklik: 1-10 raqamli balllar */}
              {(formType === "rahbar" || formType === "mijoz") && (
                <div>
                  <label style={{ ...S.label, marginBottom: "10px" }}>
                    Mezonlar bo'yicha ball (1–10)
                    <span style={{ fontWeight: 400, color: "#9CA3AF", marginLeft: "8px" }}>— bo'sh qoldirsa umumiy ball ishlatiladi</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "texnik",   label: "Texnik sifat" },
                      { key: "muddat",   label: "Muddatga rioya" },
                      { key: "jamoa",    label: "Jamoaviy ish" },
                      { key: "muammo",   label: "Muammoni hal qilish" },
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
                  <div style={{ marginTop: "12px" }}>
                    <label style={S.label}>Yoki umumiy ball (1–10)</label>
                    <input type="number" min={1} max={10} value={overallScore} onChange={e => setOverallScore(e.target.value)} placeholder="1–10" style={{ ...S.input, width: "120px" }} />
                  </div>
                </div>
              )}

              {/* 360: yulduz */}
              {formType === "peer_360" && (
                <div>
                  <label style={{ ...S.label, marginBottom: "10px" }}>Yulduz baholash (1–5, anonim)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "jamoa",   label: "Jamoaga hissa qo'shish" },
                      { key: "muloqot", label: "Muloqot qobiliyati" },
                      { key: "ishonch", label: "Ishonchlilik va mas'uliyat" },
                      { key: "yordam",  label: "Yordam berishga tayyorlik" },
                      { key: "ruh",     label: "Jamoaviy ruh" },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                        <span style={{ fontSize: "13.5px", color: "#374151" }}>{label}</span>
                        <StarRating value={stars[key as keyof typeof stars]} onChange={v => setStars(s => ({ ...s, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Izoh */}
              <div>
                <label style={S.label}>
                  Izoh
                  <span style={{ fontWeight: 400, color: "#9CA3AF", marginLeft: "6px" }}>— AI sentiment tahlil qiladi</span>
                </label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Xodim haqida qo'shimcha fikr..." style={{ ...S.input, resize: "none" as const }} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedEmp || saving}
                style={{ padding: "13px", borderRadius: "12px", border: "none", background: submitted ? "#10B981" : "linear-gradient(135deg,#00B8A0,#009984)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: (selectedEmp && !saving) ? "pointer" : "not-allowed", opacity: !selectedEmp ? 0.6 : 1, boxShadow: selectedEmp ? "0 4px 12px rgba(0,184,160,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {submitted ? "✓ Baholash muvaffaqiyatli saqlandi!" : saving ? "Saqlanmoqda..." : "Baholashni saqlash → USI yangilanadi"}
              </button>
            </div>
          </div>

          {/* Right: info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* USI formula */}
            <div style={{ background: "#0C2340", borderRadius: "16px", padding: "22px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B8A0", letterSpacing: "1px", marginBottom: "12px" }}>BAHOLASH → USI → KLASTER</div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#fff", lineHeight: 2, background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: "10px", marginBottom: "14px" }}>
                USI = (KPI × <span style={{ color: "#10B981" }}>0.25</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ (Rahbar × <span style={{ color: "#10B981" }}>0.30</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ (360° × <span style={{ color: "#10B981" }}>0.25</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ (Mijoz × <span style={{ color: "#10B981" }}>0.20</span>)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { range: "USI ≥ 80", label: "Yulduz ⭐", color: "#10B981", desc: "K-Means: Yulduz klasteri" },
                  { range: "USI 60–79", label: "Barqaror", color: "#F59E0B", desc: "K-Means: Barqaror klasteri" },
                  { range: "USI < 60", label: "Rivojlanish", color: "#EF4444", desc: "K-Means: Rivojlanish klasteri" },
                ].map(({ range, label, color, desc }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{range}</div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{desc}</div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: `${color}22`, color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Baholash turlari selector */}
            <div style={{ ...S.card, padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>Baholash Turi Tanlash</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {EVAL_TYPES.filter(e => e.key !== "kpi").map(et => (
                  <div key={et.key} onClick={() => setFormType(et.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", cursor: "pointer", background: formType === et.key ? et.bg : "#F9FAFB", border: `1px solid ${formType === et.key ? et.color + "44" : "#E5E7EB"}`, transition: "all 0.15s" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{et.label}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{et.who}</div>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: et.color }}>{et.weight}</span>
                  </div>
                ))}
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#F0FDF4", border: "1px solid #D1FAE5" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#065F46" }}>KPI Avtomatik (25%)</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                    → <Link href="/hr/kpi" style={{ color: "#00B8A0", fontWeight: 600 }}>KPI Boshqaruvi</Link> sahifasida kiritiladi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
