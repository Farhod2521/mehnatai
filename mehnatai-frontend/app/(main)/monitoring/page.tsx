"use client";

import { Download, AlertTriangle, Zap } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis,
  PieChart, Pie,
} from "recharts";

const modelAccuracy = [
  { model: "Random Forest", accuracy: 78, f1: 76 },
  { model: "XGBoost", accuracy: 83, f1: 81 },
  { model: "LSTM (RNN)", accuracy: 89, f1: 87 },
];

const anomalyData = [
  { date: "01 May", value: 78 },
  { date: "05 May", value: 80 },
  { date: "09 May", value: 76 },
  { date: "12 May", value: 62, anomaly: true, label: "KPI Drop -18%" },
  { date: "15 May", value: 74 },
  { date: "18 May", value: 79 },
  { date: "22 May", value: 77 },
  { date: "25 May", value: 58, anomaly: true, label: "Late Arrivals Spike" },
  { date: "28 May", value: 73 },
  { date: "30 May", value: 76 },
];

const clusterData = [
  { x: 85, y: 80, group: "Yulduzlar", name: "Azizbek F.", r: 12 },
  { x: 90, y: 85, group: "Yulduzlar", name: "Sardor A.", r: 12 },
  { x: 78, y: 72, group: "Yulduzlar", name: "Nigora M.", r: 10 },
  { x: 82, y: 78, group: "Yulduzlar", name: "Alisher K.", r: 11 },
  { x: 65, y: 60, group: "O'rtachilar", name: "Shahlo K.", r: 10 },
  { x: 70, y: 65, group: "O'rtachilar", name: "Javohir M.", r: 9 },
  { x: 60, y: 68, group: "O'rtachilar", name: "Dilnoza Y.", r: 9 },
  { x: 72, y: 58, group: "O'rtachilar", name: "Malika N.", r: 8 },
  { x: 35, y: 40, group: "Rivojlanish Kerak", name: "Otabek R.", r: 11 },
  { x: 42, y: 35, group: "Rivojlanish Kerak", name: "Komil R.", r: 9 },
];

const sentimentData = [
  { name: "Ijobiy (Positive)", value: 62, color: "#00B8A0" },
  { name: "Neytral (Neutral)", value: 28, color: "#94A3B8" },
  { name: "Salbiy (Negative)", value: 10, color: "#FCA5A5" },
];

const CustomDot = (props: { cx?: number; cy?: number; payload?: { anomaly?: boolean } }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (payload?.anomaly) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="#EF4444" opacity={0.15} />
        <circle cx={cx} cy={cy} r={5} fill="#EF4444" />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill="#00B8A0" />;
};

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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>AI Tahlil va Bashorat</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            Chuqur o'rganish va statistik modellar yordamida shakllantirilgan tahlillar
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "10px", background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#065F46" }}>Live Engine: ON</span>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px",
            borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #00B8A0, #009984)",
            color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
          }}>
            <Download size={14} /> PDF Hisobot
          </button>
        </div>
      </div>

      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "16px" }}>

        {/* Model accuracy */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Model Aniqligi Taqqoslovi</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Random Forest vs XGBoost vs LSTM</div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[{ label: "ACCURACY", color: "#00B8A0" }, { label: "F1 SCORE", color: "#F59E0B" }].map(({ label, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "16px", height: "3px", borderRadius: "2px", background: color }} />
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={modelAccuracy} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="model" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[70, 95]} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }} />
              <Line type="monotone" dataKey="accuracy" stroke="#00B8A0" strokeWidth={2.5} dot={{ fill: "#00B8A0", r: 5, strokeWidth: 0 }} name="Accuracy %" />
              <Line type="monotone" dataKey="f1" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 5, strokeWidth: 0 }} name="F1 Score %" />
            </LineChart>
          </ResponsiveContainer>
          {/* table */}
          <div style={{ marginTop: "16px", borderRadius: "10px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  {["Model", "Accuracy", "F1 Score", "Ishlatilishi"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { model: "Random Forest", acc: "78%", f1: "0.76", use: "Baseline", active: false },
                  { model: "XGBoost", acc: "83%", f1: "0.81", use: "Qo'shimcha tekshiruv", active: false },
                  { model: "LSTM (RNN)", acc: "89%", f1: "0.87", use: "Asosiy model", active: true },
                ].map((row, i) => (
                  <tr key={row.model} style={{ background: row.active ? "#E8F8F6" : "transparent", borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
                    <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: row.active ? 700 : 500, color: "#111827" }}>{row.model}</td>
                    <td style={{ padding: "10px 14px", fontSize: "13px", color: "#374151" }}>{row.acc}</td>
                    <td style={{ padding: "10px 14px", fontSize: "13px", color: "#374151" }}>{row.f1}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: row.active ? "#00B8A0" : "#6B7280" }}>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prediction card */}
        <div style={{ background: "#0C2340", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "9px", fontWeight: 800, padding: "5px 10px", borderRadius: "20px", background: "#00B8A0", color: "#fff", letterSpacing: "0.5px" }}>
              KEYINGI OY BASHORATI
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginTop: "16px", lineHeight: 1.3 }}>
              Samaradorlik o'sishi kutilmoqda
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "8px", lineHeight: 1.6 }}>
              Mavsumiy trendlar va joriy KPI o'sish sur'atiga asoslangan prognoz.
            </p>
          </div>
          <div>
            <div style={{ fontSize: "46px", fontWeight: 900, color: "#00B8A0", lineHeight: 1 }}>+12.4%</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", marginTop: "5px" }}>ISHLAB CHIQARISH O'SISHI</div>
            <div style={{
              marginTop: "16px", width: "72px", height: "72px", borderRadius: "50%",
              border: "4px solid #00B8A0", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>96%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Anomaliyalarni aniqlash</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Performance Deviations</div>
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Oxirgi 30 kunlik monitoring</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={anomalyData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 90]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{d.date}</div>
                      <div style={{ color: d.anomaly ? "#EF4444" : "#00B8A0" }}>KPI: {d.value}%</div>
                      {d.label && <div style={{ color: "#EF4444", fontWeight: 600 }}>{d.label}</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#00B8A0" strokeWidth={2} dot={<CustomDot />} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
          {[
            { date: "12 May, 2024", type: "KPI Drop -18%", dept: "Sotuv bo'limi", desc: "KPI 18% ga tushdi" },
            { date: "25 May, 2024", type: "Late Arrivals Spike", dept: "IT bo'limi", desc: "Kechikishlar soni oshdi" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", padding: "12px 14px", borderRadius: "10px", background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <AlertTriangle size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{a.type}</div>
                <div style={{ fontSize: "11.5px", color: "#6B7280" }}>{a.dept} — {a.date}</div>
                <div style={{ fontSize: "11.5px", color: "#92400E" }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* K-Means + NLP */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* K-Means */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>K-Means Clustering: Xodimlar Segmentatsiyasi</div>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", background: "#E8F8F6", color: "#00B8A0" }}>K=3</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[20, 100]}
                label={{ value: "TAJRIBA VA BILIM", position: "insideBottom", offset: -12, style: { fontSize: "9px", fill: "#9CA3AF" } }} />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[25, 95]}
                label={{ value: "SAMARADORLIK", angle: -90, position: "insideLeft", offset: 15, style: { fontSize: "9px", fill: "#9CA3AF" } }} />
              <ZAxis dataKey="r" range={[80, 150]} />
              <Tooltip content={({ payload }) => {
                if (payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ color: "#6B7280" }}>{d.group}</div>
                    </div>
                  );
                }
                return null;
              }} />
              {[
                { group: "Yulduzlar", color: "#00B8A0" },
                { group: "O'rtachilar", color: "#6366F1" },
                { group: "Rivojlanish Kerak", color: "#EF4444" },
              ].map(({ group, color }) => (
                <Scatter key={group} name={group} data={clusterData.filter(d => d.group === group)} fill={color} fillOpacity={0.85} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
            {[
              { label: "Yulduzlar", color: "#00B8A0" },
              { label: "O'rtachilar", color: "#6366F1" },
              { label: "Rivojlanish Kerak", color: "#EF4444" },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                <span style={{ fontSize: "11.5px", color: "#6B7280" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NLP Sentiment */}
        <div style={S.card}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
            NLP: Feedback Sentiment (Uzbek)
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: "12px" }}>
            <PieChart width={180} height={180}>
              <Pie
                data={sentimentData.map(d => ({ ...d, fill: d.color }))}
                cx={90} cy={90} innerRadius={55} outerRadius={80}
                dataKey="value" stroke="none"
              />
            </PieChart>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>864</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600 }}>IZOHLAR</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sentimentData.map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: "13px", color: "#374151" }}>{s.name}</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{s.value}%</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Model: Multilingual BERT</div>
            <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "2px" }}>F1 Score: 0.87 | Sinflar: Ijobiy / Neytral / Salbiy</div>
          </div>
        </div>
      </div>

      {/* AI Strategic */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "22px 24px", display: "flex", gap: "20px", alignItems: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#E8F8F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={22} color="#00B8A0" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>AI Strategik Tavsiya</div>
          <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.6 }}>
            Data-mining natijalariga ko'ra, <b>"Rivojlanish kerak"</b> guruhidagi xodimlarning 70% da texnik ko'nikmalar yetishmasligi kuzatilmoqda.{" "}
            <b>Xulosa:</b> Keyingi chorakda LSTM bashorati bo'yicha samaradorlikni 15% ga oshirish uchun "Micro-learning" tizimini joriy etish tavsiya etiladi.
          </div>
        </div>
        <button style={{
          flexShrink: 0, padding: "11px 20px", borderRadius: "12px", border: "none",
          background: "#0C2340", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>
          Harakat Rejasini Ko'rish
        </button>
      </div>
    </div>
  );
}
