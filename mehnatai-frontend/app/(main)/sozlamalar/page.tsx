"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Shield, Users, Database, Zap, Copy, Check } from "lucide-react";
import { authApi, type UserMe } from "@/lib/api";

const sections = [
  { id: "profil", label: "Profil Sozlamalari", icon: Users },
  { id: "bildirishnoma", label: "Bildirishnomalar", icon: Bell },
  { id: "xavfsizlik", label: "Xavfsizlik", icon: Shield },
  { id: "kpi", label: "KPI Sozlamalari", icon: Database },
  { id: "ai", label: "AI Sozlamalari", icon: Zap },
];

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  rahbar: { label: "Rahbar", color: "#00B8A0", bg: "#E8F8F6" },
  hr:     { label: "HR Manager", color: "#A78BFA", bg: "#F3F0FF" },
  xodim:  { label: "Xodim", color: "#60A5FA", bg: "#EFF6FF" },
};

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
  inputDisabled: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "13.5px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#F3F4F6",
    color: "#6B7280",
    outline: "none",
    fontFamily: "inherit",
    cursor: "not-allowed",
  } as React.CSSProperties,
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7280",
    marginBottom: "6px",
    display: "block",
  } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #F3F4F6",
  } as React.CSSProperties,
};

function Toggle({ defaultChecked = true }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(v => !v)}
      style={{
        width: "44px", height: "24px", borderRadius: "20px", border: "none", cursor: "pointer",
        background: on ? "#00B8A0" : "#D1D5DB", position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: "3px", left: on ? "22px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10B981" : "#9CA3AF", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "4px 8px", borderRadius: "6px" }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Nusxalandi" : "Nusxalash"}
    </button>
  );
}

export default function SozlamalarPage() {
  const [active, setActive] = useState("profil");
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleInfo = user ? (ROLE_LABELS[user.role] ?? ROLE_LABELS.xodim) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Sozlamalar</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>Tizim konfiguratsiyasi va sozlamalari</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", alignItems: "start" }}>
        {/* Left nav */}
        <div style={{ ...S.card, padding: "8px" }}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px", border: "none",
              background: active === id ? "#E8F8F6" : "transparent",
              color: active === id ? "#00B8A0" : "#6B7280",
              fontSize: "13px", fontWeight: active === id ? 600 : 500,
              cursor: "pointer", textAlign: "left", marginBottom: "2px", transition: "all 0.15s",
            }}>
              <Icon size={16} strokeWidth={active === id ? 2.2 : 1.8} />
              {label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ ...S.card, padding: "24px" }}>

          {active === "profil" && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Profil Sozlamalari</div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} style={{ height: 42, borderRadius: 10, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                  ))}
                </div>
              ) : user ? (
                <>
                  {/* Role badge */}
                  {roleInfo && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: roleInfo.bg, marginBottom: "20px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: roleInfo.color, display: "inline-block" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: roleInfo.color }}>{roleInfo.label}</span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {/* Login — o'zgartirib bo'lmaydi */}
                    <div>
                      <label style={S.label}>Login (telefon)</label>
                      <div style={{ position: "relative" }}>
                        <input value={user.username} readOnly style={S.inputDisabled} />
                        <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)" }}>
                          <CopyBtn text={user.username} />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label style={S.label}>Email</label>
                      <input defaultValue={user.email} style={S.input} type="email" />
                    </div>

                    {/* ID */}
                    <div>
                      <label style={S.label}>Foydalanuvchi ID</label>
                      <input value={`#${user.id}`} readOnly style={S.inputDisabled} />
                    </div>

                    {/* Role */}
                    <div>
                      <label style={S.label}>Rol</label>
                      <input value={roleInfo?.label ?? user.role} readOnly style={S.inputDisabled} />
                    </div>

                    {/* Status */}
                    <div>
                      <label style={S.label}>Holat</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #D1FAE5", background: "#F0FDF4" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                        <span style={{ fontSize: "13.5px", color: "#065F46", fontWeight: 600 }}>Faol</span>
                      </div>
                    </div>
                  </div>

                  {/* Info note */}
                  <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "12.5px", color: "#92400E" }}>
                    Login (telefon raqam) o'zgartirish uchun administrator bilan bog'laning.
                  </div>
                </>
              ) : (
                <div style={{ color: "#EF4444", fontSize: "13px" }}>Ma'lumot yuklanmadi</div>
              )}
            </>
          )}

          {active === "bildirishnoma" && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Bildirishnoma Sozlamalari</div>
              {[
                { label: "KPI pasayishi haqida xabar", desc: "KPI 20% dan ortiq pasayganda", on: true },
                { label: "Yangi baholash natijasi", desc: "Baholash yakunlanganda", on: true },
                { label: "AI anomaliya aniqlanganda", desc: "Tizim anomaliya topganda", on: true },
                { label: "Oylik hisobot tayyor", desc: "Har oyning 1-kuni", on: false },
                { label: "360 Feedback javobi", desc: "Hamkasb baholash keldanda", on: false },
              ].map(({ label, desc, on }, i) => (
                <div key={i} style={{ ...S.row, borderBottom: i < 4 ? "1px solid #F3F4F6" : "none" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#111827" }}>{label}</div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{desc}</div>
                  </div>
                  <Toggle defaultChecked={on} />
                </div>
              ))}
            </>
          )}

          {active === "xavfsizlik" && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Xavfsizlik Sozlamalari</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {["Joriy parol", "Yangi parol", "Parolni tasdiqlash"].map(lbl => (
                  <div key={lbl}>
                    <label style={S.label}>{lbl}</label>
                    <input type="password" placeholder="••••••••" style={S.input} />
                  </div>
                ))}
                <div style={{ padding: "16px", borderRadius: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Ikki faktorli autentifikatsiya (2FA)</div>
                  <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "4px" }}>Qo'shimcha xavfsizlik uchun 2FA ni yoqing</div>
                  <button style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "#E8F8F6", color: "#00B8A0", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    2FA ni yoqish
                  </button>
                </div>
              </div>
            </>
          )}

          {active === "kpi" && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>KPI Sozlamalari</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Vazifalar bajarish foizi maqsad", value: "90", unit: "%" },
                  { label: "Kod sifati maqsad", value: "85", unit: "%" },
                  { label: "Muddatga rioya maqsad", value: "85", unit: "%" },
                  { label: "Bug hal qilish vaqti", value: "24", unit: "soat" },
                  { label: "Test qoplama maqsad", value: "80", unit: "%" },
                  { label: "Qatnashish maqsad", value: "95", unit: "%" },
                ].map(({ label, value, unit }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <span style={{ fontSize: "13.5px", color: "#374151" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="number" defaultValue={value} style={{ width: "64px", padding: "6px 10px", fontSize: "14px", fontWeight: 700, textAlign: "center", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none", color: "#00B8A0", background: "#fff" }} />
                      <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: "28px" }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {active === "ai" && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>AI Model Sozlamalari</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "LSTM Bashorat oralig'i", options: ["3 oy", "6 oy", "12 oy"] },
                  { label: "K-Means klaster soni", options: ["K=3 (Tavsiya etilgan)", "K=4", "K=5"] },
                ].map(({ label, options }) => (
                  <div key={label}>
                    <label style={S.label}>{label}</label>
                    <select style={S.input}>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                {[
                  { label: "Avtomatik retraining", desc: "Har haftada model qayta o'qitiladi", on: true },
                  { label: "NLP Sentiment tahlili", desc: "Yangi feedback keldanda avtomatik tahlil", on: true },
                  { label: "Anomaliya bildirisnomasi", desc: "KPI keskin o'zgarganda xabar yuborish", on: false },
                ].map(({ label, desc, on }, i) => (
                  <div key={i} style={{ ...S.row, borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", paddingTop: "14px" }}>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#111827" }}>{label}</div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{desc}</div>
                    </div>
                    <Toggle defaultChecked={on} />
                  </div>
                ))}
              </div>
            </>
          )}

          {active !== "profil" && (
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #F3F4F6" }}>
              <button onClick={handleSave} style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "10px 22px", borderRadius: "10px", border: "none",
                background: saved ? "#10B981" : "linear-gradient(135deg, #00B8A0, #009984)",
                color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,184,160,0.3)", transition: "background 0.2s",
              }}>
                <Save size={15} />
                {saved ? "✓ Muvaffaqiyatli saqlandi!" : "Saqlash"}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
