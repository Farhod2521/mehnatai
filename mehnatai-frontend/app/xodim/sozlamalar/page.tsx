"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { employeesApi, type Employee } from "@/lib/api";
import { User, Phone, Mail, Briefcase, Building2, Calendar, Clock, Copy, CheckCheck } from "lucide-react";

export default function XodimSozlamalarPage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.employee_id) { setLoading(false); return; }
    employeesApi.get(user.employee_id)
      .then(setEmployee)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.employee_id]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const initials = employee
    ? `${employee.first_name[0] ?? ""}${employee.last_name[0] ?? ""}`.toUpperCase()
    : user?.username?.[0]?.toUpperCase() ?? "?";

  const S = {
    card: {
      background: "#ffffff", borderRadius: "16px",
      border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden",
    } as React.CSSProperties,
    label: {
      fontSize: "11px", fontWeight: 700, color: "#9CA3AF",
      letterSpacing: "0.6px", textTransform: "uppercase" as const,
      marginBottom: "6px", display: "block",
    },
    value: { fontSize: "14px", fontWeight: 600, color: "#111827" },
    row: {
      display: "flex", alignItems: "flex-start", gap: "14px",
      padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
    } as React.CSSProperties,
    iconBox: (color: string) => ({
      width: "36px", height: "36px", borderRadius: "10px",
      background: color, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0, marginTop: "2px",
    } as React.CSSProperties),
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ fontSize: "14px", color: "#9CA3AF" }}>Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Mening Profilim</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>Shaxsiy ma'lumotlaringiz</p>
      </div>

      {/* Avatar card */}
      <div style={{ ...S.card, padding: "28px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #4F46E5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", fontWeight: 800, color: "white",
          boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
            {employee ? `${employee.first_name} ${employee.last_name}` : user?.username ?? "—"}
          </div>
          <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            {employee?.position ?? "—"}
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", background: "#EEF2FF", color: "#4F46E5" }}>
              Xodim
            </span>
            {employee?.department && (
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px", background: "#F3F4F6", color: "#6B7280" }}>
                {employee.department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info card */}
      <div style={S.card}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", fontSize: "13px", fontWeight: 700, color: "#374151" }}>
          Ish ma'lumotlari
        </div>

        {/* Login */}
        <div style={S.row}>
          <div style={S.iconBox("#EEF2FF")}>
            <Phone size={16} color="#6366F1" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Login (telefon raqam)</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={S.value}>{user?.username ?? "—"}</span>
              {user?.username && (
                <button onClick={() => copyText(user.username, "phone")} style={{ background: "none", border: "none", cursor: "pointer", color: copied === "phone" ? "#6366F1" : "#9CA3AF", display: "flex", padding: 0 }}>
                  {copied === "phone" ? <CheckCheck size={15} color="#6366F1" /> : <Copy size={15} />}
                </button>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Login o'zgartirish uchun administrator bilan bog'laning</p>
          </div>
        </div>

        {/* Email */}
        <div style={S.row}>
          <div style={S.iconBox("#ECFDF5")}>
            <Mail size={16} color="#10B981" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Email</span>
            <span style={S.value}>{employee?.email ?? user?.email ?? "—"}</span>
          </div>
        </div>

        {/* Position */}
        <div style={S.row}>
          <div style={S.iconBox("#FEF3C7")}>
            <Briefcase size={16} color="#D97706" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Lavozim</span>
            <span style={S.value}>{employee?.position ?? "—"}</span>
          </div>
        </div>

        {/* Department */}
        <div style={S.row}>
          <div style={S.iconBox("#F0FDF4")}>
            <Building2 size={16} color="#16A34A" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={S.label}>Bo'lim</span>
            <span style={S.value}>{employee?.department ?? "—"}</span>
          </div>
        </div>

        {/* Hired date */}
        {employee?.hired_date && (
          <div style={S.row}>
            <div style={S.iconBox("#EEF2FF")}>
              <Calendar size={16} color="#6366F1" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={S.label}>Ishga kirgan sana</span>
              <span style={S.value}>{employee.hired_date}</span>
            </div>
          </div>
        )}

        {/* Experience */}
        {employee?.experience_years !== undefined && (
          <div style={{ ...S.row, borderBottom: "none" }}>
            <div style={S.iconBox("#FEF3C7")}>
              <Clock size={16} color="#D97706" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={S.label}>Tajriba</span>
              <span style={S.value}>{employee.experience_years} yil</span>
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      {employee?.bio && (
        <div style={{ ...S.card, padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "10px" }}>
            Bio
          </div>
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>{employee.bio}</p>
        </div>
      )}
    </div>
  );
}
