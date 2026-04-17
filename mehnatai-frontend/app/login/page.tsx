"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");        // faqat raqamlar: "994252521"
  const [displayPhone, setDisplayPhone] = useState(""); // formatlangan: "99 425 25 21"
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const existing = document.querySelector('script[data-lottie-wc]');
    if (existing) return;
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js";
    s.type = "module";
    s.setAttribute("data-lottie-wc", "1");
    document.head.appendChild(s);
  }, []);

  // Telefon raqamni formatlash: 994252521 → 99 425 25 21
  const formatPhone = (digits: string) => {
    const d = digits.slice(0, 9);
    let out = "";
    if (d.length > 0) out += d.slice(0, 2);
    if (d.length > 2) out += " " + d.slice(2, 5);
    if (d.length > 5) out += " " + d.slice(5, 7);
    if (d.length > 7) out += " " + d.slice(7, 9);
    return out;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPhone(raw);
    setDisplayPhone(formatPhone(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError("Telefon raqamni to'liq kiriting (9 ta raqam)");
      return;
    }
    setError("");
    setLoading(true);
    const username = "+998" + phone;
    const result = await login(username, password);
    if (result.ok) {
      const role = localStorage.getItem("mehnatai_role");
      if (role === "rahbar") router.push("/dashboard");
      else if (role === "hr") router.push("/hr");
      else router.push("/xodim");
    } else {
      setError(result.error ?? "Login yoki parol noto'g'ri!");
      setLoading(false);
    }
  };

  return (
    <div className="root">

      {/* ═══════ LEFT ═══════ */}
      <div className="left">

        {/* Geometric shapes – scattered */}
        <div className="g g1" />
        <div className="g g2" />
        <div className="g g3" />
        <div className="g g4" />
        <div className="g g5" />
        <div className="g g6" />
        <div className="g g7" />
        <div className="g g8" />

        {/* Lottie */}
        <div className="lottie-box">
          <div dangerouslySetInnerHTML={{
            __html: `<dotlottie-wc
              src="https://lottie.host/706a437a-adfe-4d77-beb3-b3607746d6b2/kCkx99wfCl.lottie"
              style="width:420px;height:420px" autoplay loop>
            </dotlottie-wc>`
          }} />
        </div>

        {/* Bottom label */}
        <div className="left-label">
          <span className="live-dot" />
          MehnatAI · AI asosida HR tizimi
        </div>
      </div>

      {/* ═══════ RIGHT ═══════ */}
      <div className="right">

        {/* Subtle bg shapes on right too */}
        <div className="rg rg1" />
        <div className="rg rg2" />
        <div className="rg rg3" />

        <div className="card">

          {/* Mobile brand */}
          <div className="mob-brand">
            <div className="brand-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
              </svg>
            </div>
            <span>MehnatAI</span>
          </div>

          {/* Header */}
          <div className="head">
            <div className="head-top">
              <div className="head-ico">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
              </div>
              <span className="head-brand">MehnatAI</span>
            </div>
            <h1>Xush kelibsiz</h1>
            <p>Hisobingizga kiring</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form">

            {/* ── Telefon raqam ── */}
            <div className={`field ${focusedField === "u" ? "focused" : ""}`}>
              <label>Telefon raqam</label>
              <div className={`phone-wrap ${focusedField === "u" ? "focused" : ""}`}>
                {/* Chap: bayroq + prefix */}
                <div className="phone-prefix">
                  {/* O'zbekiston bayrog'i SVG */}
                  <span className="uz-flag">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <rect width="20" height="4.67" fill="#1EB6E8"/>
                      <rect y="4.67" width="20" height="4.66" fill="#FFFFFF"/>
                      <rect y="9.33" width="20" height="4.67" fill="#3BB54A"/>
                      <rect y="4.2" width="20" height="0.9" fill="#E8112D"/>
                      <rect y="8.9" width="20" height="0.9" fill="#E8112D"/>
                      {/* Yarim oy */}
                      <circle cx="4.2" cy="2.33" r="1.3" fill="white"/>
                      <circle cx="4.8" cy="2.33" r="1.0" fill="#1EB6E8"/>
                      {/* Yulduzlar */}
                      <circle cx="6.5" cy="1.3" r="0.35" fill="white"/>
                      <circle cx="7.2" cy="2.0" r="0.35" fill="white"/>
                      <circle cx="6.5" cy="2.7" r="0.35" fill="white"/>
                      <circle cx="7.5" cy="1.0" r="0.35" fill="white"/>
                      <circle cx="7.5" cy="3.0" r="0.35" fill="white"/>
                    </svg>
                  </span>
                  <span className="prefix-code">+998</span>
                  <div className="prefix-divider" />
                </div>

                {/* O'ng: raqam kiritish */}
                <input
                  className="phone-input"
                  type="tel"
                  inputMode="numeric"
                  value={displayPhone}
                  onChange={handlePhoneChange}
                  placeholder="99 123 45 67"
                  maxLength={12}
                  required
                  onFocus={() => setFocusedField("u")}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Hisob: nechta kiritilgan */}
                <span className="phone-counter">{phone.length}/9</span>
              </div>
            </div>

            <div className={`field ${focusedField === "p" ? "focused" : ""}`}>
              <label>Parol</label>
              <div className="irow">
                <svg className="iico" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  onFocus={() => setFocusedField("p")}
                  onBlur={() => setFocusedField(null)}
                />
                <button type="button" className="eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={`btn ${loading ? "busy" : ""}`}>
              {loading
                ? <><span className="spin" /><span>Tekshirilmoqda...</span></>
                : <><span>Kirish</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
              }
            </button>
          </form>


        </div>
      </div>

      {/* ═══════ STYLES ═══════ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .root {
          min-height: 100vh; display: flex;
          background: #F4F7F6;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ── LEFT ── */
        .left {
          display: none;
          position: relative;
          width: 50%; overflow: hidden;
          background: #EDF5F3;
          align-items: center; justify-content: center;
        }
        @media (min-width: 860px) { .left { display: flex; } }

        /* Geometric shapes */
        .g {
          position: absolute; pointer-events: none;
          border-radius: 18px;
        }

        /* Large filled – top-left */
        .g1 {
          width: 220px; height: 220px;
          background: linear-gradient(135deg, #00B894, #00D4AA);
          opacity: 0.18;
          top: -60px; left: -60px;
          transform: rotate(-20deg);
          border-radius: 28px;
        }
        /* Medium outlined – top-right */
        .g2 {
          width: 140px; height: 140px;
          border: 3px solid #00B894;
          opacity: 0.22;
          top: 30px; right: 30px;
          transform: rotate(18deg);
          background: transparent;
          border-radius: 22px;
        }
        /* Small filled – top-right corner */
        .g3 {
          width: 70px; height: 70px;
          background: #1B6B5A;
          opacity: 0.12;
          top: 80px; right: 80px;
          transform: rotate(35deg);
          border-radius: 14px;
        }
        /* Medium filled – left middle */
        .g4 {
          width: 100px; height: 100px;
          background: linear-gradient(135deg, #00B894, #007A63);
          opacity: 0.14;
          top: 38%; left: 4%;
          transform: rotate(-12deg);
          border-radius: 18px;
        }
        /* Large outlined – center-right */
        .g5 {
          width: 180px; height: 180px;
          border: 2.5px solid #00B894;
          opacity: 0.13;
          top: 35%; right: -30px;
          transform: rotate(25deg);
          background: transparent;
          border-radius: 26px;
        }
        /* Small dark – bottom-left */
        .g6 {
          width: 90px; height: 90px;
          background: #0D4A3A;
          opacity: 0.1;
          bottom: 60px; left: 30px;
          transform: rotate(-28deg);
          border-radius: 16px;
        }
        /* Medium outlined – bottom-center */
        .g7 {
          width: 130px; height: 130px;
          border: 2px solid #1B6B5A;
          opacity: 0.15;
          bottom: -30px; left: 35%;
          transform: rotate(14deg);
          background: transparent;
          border-radius: 20px;
        }
        /* Tiny filled – bottom-right */
        .g8 {
          width: 55px; height: 55px;
          background: #00B894;
          opacity: 0.2;
          bottom: 90px; right: 60px;
          transform: rotate(40deg);
          border-radius: 10px;
        }

        /* Lottie */
        .lottie-box {
          position: relative; z-index: 2;
          filter: drop-shadow(0 8px 32px rgba(0,184,148,0.15));
        }

        /* Bottom label */
        .left-label {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 2;
          display: flex; align-items: center; gap: 8px;
          padding: 7px 18px; border-radius: 100px;
          background: rgba(0,184,148,0.08);
          border: 1px solid rgba(0,184,148,0.2);
          font-size: 12px; color: #4A7A6D;
          white-space: nowrap;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00B894; flex-shrink: 0;
          box-shadow: 0 0 7px rgba(0,184,148,0.8);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.5; transform:scale(1.5); }
        }

        /* ── RIGHT ── */
        .right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          background: #ffffff;
          padding: 24px 20px;
          position: relative; overflow: hidden;
        }

        /* Subtle right-side bg shapes */
        .rg { position: absolute; pointer-events: none; border-radius: 50%; }
        .rg1 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,184,148,0.06) 0%, transparent 70%);
          top: -100px; right: -100px;
        }
        .rg2 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(0,184,148,0.05) 0%, transparent 70%);
          bottom: -60px; left: -60px;
        }
        .rg3 {
          width: 60px; height: 60px;
          background: #00B894; opacity: 0.06;
          top: 60px; right: 40px;
          border-radius: 12px;
          transform: rotate(20deg);
        }

        /* Card */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 400px;
          background: #ffffff;
          border: 1.5px solid #E8F0EE;
          border-radius: 24px;
          padding: 38px 34px;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.04),
            0 12px 40px rgba(0,184,148,0.08),
            0 1px 2px rgba(0,0,0,0.04);
        }

        /* Mobile brand */
        .mob-brand {
          display: flex; align-items: center; gap: 10px;
          font-size: 18px; font-weight: 800; color: #0D3D30;
          margin-bottom: 28px;
        }
        @media (min-width: 860px) { .mob-brand { display: none; } }
        .brand-ico {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #00B894, #009975);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,184,148,0.35);
        }

        /* Header */
        .head { margin-bottom: 28px; }
        .head-top {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 18px;
        }
        .head-ico {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #00B894, #009975);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(0,184,148,0.3);
          flex-shrink: 0;
        }
        .head-brand {
          font-size: 20px; font-weight: 800;
          color: #0D3D30; letter-spacing: -0.4px;
        }
        .head h1 {
          font-size: 24px; font-weight: 800;
          color: #0D3D30; letter-spacing: -0.5px;
        }
        .head p { font-size: 14px; color: #7A9E94; margin-top: 4px; }

        /* Form */
        .form { display: flex; flex-direction: column; gap: 16px; }

        .field label {
          display: block;
          font-size: 12px; font-weight: 700;
          color: #8AADA6; letter-spacing: 0.5px;
          text-transform: uppercase; margin-bottom: 7px;
          transition: color 0.2s;
        }
        .field.focused label { color: #00B894; }

        /* ── Telefon input ── */
        .phone-wrap {
          display: flex; align-items: center;
          background: #F6FAF9;
          border: 1.5px solid #DFF0EC;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .phone-wrap.focused {
          border-color: #00B894;
          background: #F0FBF8;
          box-shadow: 0 0 0 3px rgba(0,184,148,0.1);
        }

        .phone-prefix {
          display: flex; align-items: center; gap: 7px;
          padding: 0 12px 0 14px;
          background: #EDF8F5;
          border-right: 1.5px solid #DFF0EC;
          height: 48px; flex-shrink: 0;
          cursor: default; user-select: none;
        }
        .phone-wrap.focused .phone-prefix {
          background: #E4F5F0;
          border-right-color: #B8E8DC;
        }

        .uz-flag {
          display: flex; align-items: center;
          border-radius: 3px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          flex-shrink: 0;
        }

        .prefix-code {
          font-size: 14px; font-weight: 700;
          color: #00B894; letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .prefix-divider {
          width: 1px; height: 18px;
          background: #C8E8DF; margin-left: 2px;
        }

        .phone-input {
          flex: 1; min-width: 0;
          padding: 13px 40px 13px 14px;
          background: transparent;
          border: none; outline: none;
          color: #0D3D30;
          font-size: 15px; font-family: inherit; font-weight: 500;
          letter-spacing: 1px;
        }
        .phone-input::placeholder { color: #C0D8D2; letter-spacing: 0.5px; font-weight: 400; }

        .phone-counter {
          position: relative; right: 0;
          padding: 0 12px;
          font-size: 11px; font-weight: 600;
          color: #C0D8D2; white-space: nowrap; flex-shrink: 0;
          transition: color 0.2s;
        }
        .phone-wrap.focused .phone-counter { color: #7ABFB0; }

        /* ── Parol input ── */
        .irow { position: relative; display: flex; align-items: center; }
        .iico {
          position: absolute; left: 13px;
          color: #B8D4CE; pointer-events: none;
          transition: color 0.2s;
        }
        .field.focused .iico { color: #00B894; }

        .irow input {
          width: 100%;
          padding: 13px 42px 13px 40px;
          background: #F6FAF9;
          border: 1.5px solid #DFF0EC;
          border-radius: 12px;
          color: #0D3D30;
          font-size: 14px; font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .irow input::placeholder { color: #C0D8D2; }
        .field.focused .irow input {
          border-color: #00B894;
          background: #F0FBF8;
          box-shadow: 0 0 0 3px rgba(0,184,148,0.1);
        }

        .eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #B8D4CE; padding: 3px; border-radius: 6px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .eye:hover { color: #00B894; }

        /* Error */
        .err {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 14px; border-radius: 10px;
          background: #FEF2F2; border: 1px solid #FECACA;
          color: #DC2626; font-size: 13px; font-weight: 500;
        }

        /* Button */
        .btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px;
          border-radius: 13px;
          background: linear-gradient(135deg, #00B894 0%, #009975 100%);
          border: none; color: white;
          font-size: 15px; font-weight: 700; font-family: inherit;
          cursor: pointer; margin-top: 6px;
          box-shadow: 0 6px 20px rgba(0,184,148,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,184,148,0.45);
        }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn.busy {
          opacity: 0.7; cursor: not-allowed;
          transform: none !important; box-shadow: none !important;
        }

        .spin {
          width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Demo */
        .demo {
          margin-top: 18px;
          padding: 14px 16px; border-radius: 12px;
          background: #F4FCF9;
          border: 1px solid #D4EFE8;
        }
        .demo-ttl {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 600;
          color: #00B894; margin-bottom: 10px;
        }
        .demo-list { display: flex; flex-direction: column; gap: 7px; }
        .demo-row { display: flex; align-items: center; gap: 10px; }
        .demo-row code {
          font-size: 12.5px; color: #5A8A7E;
          font-family: 'SF Mono','Fira Code',monospace;
          background: rgba(0,184,148,0.07);
          padding: 2px 10px; border-radius: 6px;
        }

        .badge {
          font-size: 11px; font-weight: 600;
          padding: 2px 10px; border-radius: 20px; flex-shrink: 0;
        }
        .badge.teal  { background: #CCF2E9; color: #007A5E; }
        .badge.green { background: #D1FAE5; color: #065F46; }
      `}</style>
    </div>
  );
}
