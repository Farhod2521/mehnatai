"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username.trim(), password);
    if (result.ok) {
      const stored = localStorage.getItem("mehnatai_role");
      if (stored === "rahbar") {
        router.push("/dashboard");
      } else if (stored === "hr") {
        router.push("/hr");
      } else {
        router.push("/xodim");
      }
    } else {
      setError(result.error ?? "Login yoki parol noto'g'ri!");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div style={{
        position: "absolute", top: "10%", left: "15%",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,184,160,0.15) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        margin: "0 16px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px",
            background: "linear-gradient(135deg, #00B8A0, #009984)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(0,184,160,0.4)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", margin: 0 }}>
            MehnatAI
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
            Xodimlar samaradorligi baholash tizimi
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>
            Tizimga kirish
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>
            Login va parolingizni kiriting
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                LOGIN
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="xodim yoki rahbar"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,184,160,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                PAROL
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,184,160,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "11px 14px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: loading
                  ? "rgba(0,184,160,0.5)"
                  : "linear-gradient(135deg, #00B8A0, #009984)",
                border: "none",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(0,184,160,0.4)",
                transition: "all 0.2s",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Tekshirilmoqda...
                </>
              ) : (
                "Kirish"
              )}
            </button>
          </form>

          {/* Hint */}
          <div style={{
            marginTop: "24px",
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(0,184,160,0.06)",
            border: "1px solid rgba(0,184,160,0.15)",
          }}>
            <p style={{ fontSize: "11.5px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "#00B8A0", fontWeight: 600 }}>Xodim:</span> xodim / 123<br />
              <span style={{ color: "#6366F1", fontWeight: 600 }}>Rahbar:</span> rahbar / 123
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
