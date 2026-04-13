"use client";

import { Bell, HelpCircle, Search, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface HeaderProps {
  placeholder?: string;
}

export default function Header({ placeholder = "Ma'lumotlarni qidirish..." }: HeaderProps) {
  const { logout, user, role } = useAuth();
  const router = useRouter();

  const displayName = user
    ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}`
    : role === "hr" ? "HR Menejer" : "Rahbariyat";
  const displayRole = role === "hr" ? "HR Menejer" : "Administrator";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarGradient = role === "hr"
    ? "linear-gradient(135deg, #6366F1, #4F46E5)"
    : "linear-gradient(135deg, #00B8A0, #009984)";
  const avatarShadow = role === "hr"
    ? "0 2px 8px rgba(99,102,241,0.3)"
    : "0 2px 8px rgba(0,184,160,0.3)";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          style={{
            width: "100%",
            paddingLeft: "36px",
            paddingRight: "16px",
            paddingTop: "9px",
            paddingBottom: "9px",
            fontSize: "13.5px",
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            background: "#F5F7FA",
            color: "#111827",
            outline: "none",
          }}
        />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "16px" }}>
        <button
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "none",
            background: "#F5F7FA",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={18} color="#6B7280" />
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#EF4444",
              border: "1.5px solid white",
            }}
          />
        </button>

        <button
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "none",
            background: "#F5F7FA",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HelpCircle size={18} color="#6B7280" />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginLeft: "6px",
            paddingLeft: "12px",
            borderLeft: "1px solid #E5E7EB",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{displayName}</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{displayRole}</div>
          </div>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: avatarGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              boxShadow: avatarShadow,
            }}
          >
            {avatarLetter}
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            title="Chiqish"
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              border: "1.5px solid #E5E7EB", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#FECACA";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
            }}
          >
            <LogOut size={16} color="#9CA3AF" />
          </button>
        </div>
      </div>
    </header>
  );
}
