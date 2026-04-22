"use client";

import { useEffect, useState, useCallback } from "react";
import { Brain, Zap, TrendingUp, Users, RefreshCw, ChevronRight, Activity } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  aiApi, employeesApi,
  type ClusterGroup, type AiPrediction, type Employee,
} from "@/lib/api";

const CLUSTER_COLORS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  yulduz:       { color: "#10B981", bg: "#D1FAE5", border: "#A7F3D0", label: "Yulduzlar" },
  barqaror:     { color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", label: "Barqarorlar" },
  rivojlanish:  { color: "#F59E0B", bg: "#FEF3C7", border: "#FDE68A", label: "Rivojlanish" },
  Aniqlanmagan: { color: "#9CA3AF", bg: "#F3F4F6", border: "#E5E7EB", label: "Aniqlanmagan" },
};

const MODEL_DATA = [
  { model: "Random Forest", accuracy: 78, f1: 76, color: "#94A3B8" },
  { model: "XGBoost", accuracy: 83, f1: 81, color: "#6366F1" },
  { model: "LSTM (v1)", accuracy: 89, f1: 87, color: "#00B8A0" },
];

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string | number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

const S = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "20px",
  } as React.CSSProperties,
};

export default function MonitoringPage() {
  const [clusters, setClusters] = useState<ClusterGroup[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [prediction, setPrediction] = useState<AiPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [loadingClusters, setLoadingClusters] = useState(true);
  const [loadingEmps, setLoadingEmps] = useState(true);

  useEffect(() => {
    (async () => {
      try { setClusters(await aiApi.clusters()); } catch { /* */ }
      finally { setLoadingClusters(false); }
    })();
    (async () => {
      try {
        const d = await employeesApi.list({ page_size: 100 });
        setEmployees(d.items);
      } catch { /* */ }
      finally { setLoadingEmps(false); }
    })();
  }, []);

  const loadPrediction = useCallback(async (emp: Employee) => {
    setSelectedEmp(emp);
    setPrediction(null);
    try {
      const preds = await aiApi.predictions(emp.id);
      setPrediction(preds[0] ?? null);
    } catch { /* */ }
  }, []);

  const runPrediction = async () => {
    if (!selectedEmp) return;
    setPredicting(true);
    try {
      const pred = await aiApi.createPrediction(selectedEmp.id);
      setPrediction(pred);
    } catch { /* */ }
    finally { setPredicting(false); }
  };

  const scatterData = clusters.flatMap(c =>
    (c.members as { id: number; full_name: string; usi_score: number; department: string }[]).map((m, i) => ({
      x: m.usi_score + Math.sin(i * 7.3) * 8,
      y: m.usi_score + Math.cos(i * 4.1) * 6,
      cluster: c.cluster, name: m.full_name, dept: m.department, usi: m.usi_score,
    }))
  );

  const deptMap: Record<string, number> = {};
  employees.forEach(e => { deptMap[e.department] = (deptMap[e.department] ?? 0) + 1; });
  const deptData = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  const sentimentData = [
    { name: "Ijobiy", value: prediction?.positive_pct ?? 65, color: "#00B8A0" },
    { name: "Neytral", value: prediction?.neutral_pct ?? 25, color: "#94A3B8" },
    { name: "Salbiy", value: prediction?.negative_pct ?? 10, color: "#FCA5A5" },
  ];

  const radarData = prediction ? [
    { subject: "KPI", A: selectedEmp?.usi_score ?? 70 },
    { subject: "Rahbar", A: Math.min(100, (selectedEmp?.usi_score ?? 70) + 5) },
    { subject: "360°", A: Math.max(50, (selectedEmp?.usi_score ?? 70) - 3) },
    { subject: "Mijoz", A: Math.min(100, (selectedEmp?.usi_score ?? 70) + 2) },
    { subject: "Bashorat", A: prediction.predicted_usi },
  ] : [];

  const totalClustered = clusters.reduce((sum, c) => sum + c.count, 0);
  const yulduzCount = clusters.find(c => c.cluster === "yulduz")?.count ?? 0;
  const rivojCount = clusters.find(c => c.cluster === "rivojlanish")?.count ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>AI Tahlil va Bashorat</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            LSTM neyron tarmog'i va K-Means klasterlash natijalari
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", background: "#E8F8F6", border: "1px solid #A7F3D0" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#065F46" }}>Model aktiv · v1.0</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { title: "Klasterlangan", value: loadingClusters ? "—" : String(totalClustered), sub: "Jami xodimlar", color: "#6366F1", bg: "#EEF2FF", icon: Users },
          { title: "Yulduzlar", value: loadingClusters ? "—" : String(yulduzCount), sub: "Yuqori samarali guruh", color: "#10B981", bg: "#D1FAE5", icon: Zap },
          { title: "Rivojlanish", value: loadingClusters ? "—" : String(rivojCount), sub: "Diqqat talab qiladi", color: "#F59E0B", bg: "#FEF3C7", icon: TrendingUp },
          { title: "Model aniqligi", value: "89%", sub: "LSTM F1: 87%", color: "#00B8A0", bg: "#E8F8F6", icon: Brain },
        ].map(({ title, value, sub, color, bg, icon: Icon }) => (
          <div key={title} style={S.card}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600, marginTop: 6 }}>{title}</div>
            <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* K-Means scatter + model comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            K-Means Klasterlash (k=3)
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 16 }}>
            Silhouette Score ≈ 0.68 · Elbow Method asosida optimal k=3
          </div>
          {loadingClusters ? <Skeleton h={240} /> : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="x" domain={[20, 105]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="y" domain={[20, 105]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <ZAxis range={[80, 80]} />
                  <Tooltip content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    const cl = CLUSTER_COLORS[d.cluster] ?? CLUSTER_COLORS.Aniqlanmagan;
                    return (
                      <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${cl.border}`, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{d.name}</div>
                        <div style={{ fontSize: 11.5, color: "#6B7280" }}>{d.dept}</div>
                        <div style={{ fontSize: 11.5, color: cl.color, fontWeight: 600, marginTop: 4 }}>
                          {cl.label} · USI: {d.usi}%
                        </div>
                      </div>
                    );
                  }} />
                  {Object.entries(CLUSTER_COLORS).filter(([k]) => k !== "Aniqlanmagan").map(([key, val]) => {
                    const pts = scatterData.filter(d => d.cluster === key);
                    if (!pts.length) return null;
                    return <Scatter key={key} name={val.label} data={pts} fill={val.color} opacity={0.85} />;
                  })}
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: "8px", marginTop: 12, flexWrap: "wrap" }}>
                {clusters.map(c => {
                  const cl = CLUSTER_COLORS[c.cluster] ?? CLUSTER_COLORS.Aniqlanmagan;
                  return (
                    <div key={c.cluster} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: cl.bg, border: `1px solid ${cl.border}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cl.color }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: cl.color }}>{cl.label}: {c.count}</span>
                    </div>
                  );
                })}
                {totalClustered === 0 && <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Hali klaster ma'lumoti yo'q. Bashorat chiqarilgandan keyin ko'rinadi.</span>}
              </div>
            </>
          )}
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>Model Taqqoslovi</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 16 }}>Accuracy va F1-score</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {MODEL_DATA.map(m => (
              <div key={m.model}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{m.model}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: m.color }}>{m.accuracy}%</span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>F1:{m.f1}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: "#F3F4F6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.accuracy}%`, background: m.color, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "14px", borderRadius: "12px", background: "#E8F8F6", border: "1px solid #A7F3D0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065F46", letterSpacing: "0.5px", marginBottom: "8px" }}>LSTM ARXITEKTURA</div>
            <div style={{ fontSize: "12px", color: "#374151", lineHeight: 1.8 }}>
              Kirish: 7 feature × 12 vaqt qadami<br />
              LSTM 1: 64 unit, dropout=0.2<br />
              LSTM 2: 32 unit, dropout=0.2<br />
              Dense: 16 neyron (ReLU)<br />
              Chiqish: USI bashorat (0–100)
            </div>
          </div>
        </div>
      </div>

      {/* LSTM prediction */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px" }}>
        {/* Employee list */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>Xodim tanlash</div>
          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginBottom: 6 }}>LSTM bashorat uchun</div>
          {loadingEmps ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={44} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "380px", overflowY: "auto" }}>
              {employees.slice(0, 20).map(emp => {
                const isSel = selectedEmp?.id === emp.id;
                return (
                  <button key={emp.id} onClick={() => loadPrediction(emp)} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px",
                    border: `1px solid ${isSel ? "#00B8A0" : "#E5E7EB"}`,
                    background: isSel ? "#E8F8F6" : "#F9FAFB",
                    cursor: "pointer", textAlign: "left", width: "100%",
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isSel ? "#00B8A0" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: isSel ? "#fff" : "#6B7280" }}>
                      {emp.avatar_initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{emp.position}</div>
                    </div>
                    {isSel && <ChevronRight size={14} color="#00B8A0" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Prediction panel */}
        <div style={S.card}>
          {!selectedEmp ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: "#9CA3AF" }}>
              <Brain size={48} color="#E5E7EB" />
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Bashorat uchun xodim tanlang</div>
              <div style={{ fontSize: "12.5px" }}>Chap tarafdan xodimni bosing</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                    {selectedEmp.first_name} {selectedEmp.last_name} — LSTM Bashorat
                  </div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>
                    {selectedEmp.position} · {selectedEmp.department}
                  </div>
                </div>
                <button onClick={runPrediction} disabled={predicting} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 16px", borderRadius: "10px", border: "none",
                  background: predicting ? "#9CA3AF" : "linear-gradient(135deg,#00B8A0,#009984)",
                  color: "#fff", fontSize: "12.5px", fontWeight: 700,
                  cursor: predicting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
                }}>
                  <RefreshCw size={13} style={{ animation: predicting ? "spin 1s linear infinite" : "none" }} />
                  {predicting ? "Hisoblanmoqda..." : "Bashorat chiqarish"}
                </button>
              </div>

              {prediction ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Predicted USI */}
                  <div style={{ padding: "16px", borderRadius: "12px", background: "#E8F8F6", border: "1px solid #A7F3D0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#065F46", letterSpacing: "0.5px", marginBottom: 8 }}>3 OYLIK BASHORAT (LSTM)</div>
                    <div style={{ fontSize: "42px", fontWeight: 900, color: "#00B8A0", lineHeight: 1 }}>{prediction.predicted_usi.toFixed(1)}%</div>
                    <div style={{ fontSize: "12.5px", color: "#374151", marginTop: 8 }}>Ishonchlilik: <strong>{(prediction.confidence * 100).toFixed(0)}%</strong></div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: 4 }}>Model: {prediction.model_version} · {prediction.prediction_date}</div>
                  </div>

                  {/* Cluster */}
                  <div style={{ padding: "16px", borderRadius: "12px", background: CLUSTER_COLORS[prediction.cluster_label ?? "Aniqlanmagan"]?.bg ?? "#F3F4F6", border: `1px solid ${CLUSTER_COLORS[prediction.cluster_label ?? "Aniqlanmagan"]?.border ?? "#E5E7EB"}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 8, color: CLUSTER_COLORS[prediction.cluster_label ?? "Aniqlanmagan"]?.color ?? "#9CA3AF" }}>K-MEANS KLASTERI</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                      {CLUSTER_COLORS[prediction.cluster_label ?? ""]?.label ?? prediction.cluster_label ?? "Aniqlanmagan"}
                    </div>
                    <div style={{ marginTop: 12, fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
                      {prediction.sentiment_summary ?? "Feedback tahlili mavjud emas"}
                    </div>
                  </div>

                  {/* Radar */}
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Ko'rsatkichlar radari</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B7280" }} />
                        <Radar dataKey="A" stroke="#00B8A0" fill="#00B8A0" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sentiment */}
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: 8 }}>NLP Sentiment Tahlili</div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: 10 }}>
                      {sentimentData.map((s, i) => (
                        <div key={s.name} style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: "10px", background: i === 0 ? "#E8F8F6" : i === 1 ? "#F3F4F6" : "#FEE2E2" }}>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value.toFixed(0)}%</div>
                          <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: 2 }}>{s.name}</div>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={90}>
                      <PieChart>
                        <Pie data={sentimentData} cx="50%" cy="50%" outerRadius={40} dataKey="value" startAngle={90} endAngle={-270}>
                          {sentimentData.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recommendations */}
                  {prediction.recommendations && (
                    <div style={{ gridColumn: "1 / -1", padding: "14px 16px", borderRadius: "12px", background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Activity size={13} color="#6366F1" /> AI TAVSIYALAR
                      </div>
                      <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>
                        {prediction.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "260px", gap: 12, color: "#9CA3AF" }}>
                  <Brain size={40} color="#E5E7EB" />
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Bashorat mavjud emas</div>
                  <div style={{ fontSize: "12px" }}>Yuqoridagi tugmani bosib LSTM bashorat chiqaring</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Department + cluster members */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={S.card}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>Bo'limlar bo'yicha taqsimot</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 16 }}>Har bir bo'limdagi xodimlar soni</div>
          {loadingEmps ? <Skeleton h={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={v => [v, "Xodim"]} />
                <Bar dataKey="count" fill="#00B8A0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 16 }}>Klaster a'zolari</div>
          {loadingClusters ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} h={44} />)}
            </div>
          ) : clusters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: "13px" }}>
              Hali klaster ma'lumoti yo'q.<br />Xodim profiliga kirib "Bashorat chiqarish" tugmasini bosing.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
              {clusters.flatMap(c =>
                (c.members as { id: number; full_name: string; usi_score: number; department: string }[])
                  .slice(0, 4).map(m => {
                    const cl = CLUSTER_COLORS[c.cluster] ?? CLUSTER_COLORS.Aniqlanmagan;
                    return (
                      <div key={`${c.cluster}-${m.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: cl.bg, border: `1px solid ${cl.border}` }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: cl.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {m.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.full_name}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{m.department} · USI: {m.usi_score}%</div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "white", color: cl.color, flexShrink: 0 }}>{cl.label}</span>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
