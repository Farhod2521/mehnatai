"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

interface HeaderProps {
  placeholder?: string;
}

export default function Header({ placeholder = "Ma'lumotlarni qidirish..." }: HeaderProps) {
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
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Rahbariyat</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Administrator</div>
          </div>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00B8A0, #009984)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              boxShadow: "0 2px 8px rgba(0,184,160,0.3)",
            }}
          >
            R
          </div>
        </div>
      </div>
    </header>
  );
}
