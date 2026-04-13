"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = target / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setV(target); clearInterval(t); }
      else setV(Math.floor(cur));
    }, 25);
    return () => clearInterval(t);
  }, [active, target]);
  return v;
}

/* ── Floating orb ─────────────────────────────────── */
function Orb({ x, y, size, color, blur }: { x: string; y: string; size: number; color: string; blur: number }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: size, height: size, borderRadius: "50%",
      background: color, filter: `blur(${blur}px)`,
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ── Glass card ──────────────────────────────────── */
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Stat counter ────────────────────────────────── */
function StatBig({ n, suffix, label, active }: { n: number; suffix: string; label: string; active: boolean }) {
  const v = useCountUp(n, active);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(48px,5vw,64px)", fontWeight: 900, color: "white", lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {v}{suffix}
      </div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "10px" }}>{label}</div>
    </div>
  );
}

/* ── Feature pill ────────────────────────────────── */
function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "5px 12px", borderRadius: "999px",
      background: `${color}18`, border: `1px solid ${color}30`,
      fontSize: "11.5px", fontWeight: 600, color,
    }}>{children}</span>
  );
}

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useInView(0.3);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navSolid = scrollY > 40;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#060d0a", color: "#f0f9f6", overflowX: "hidden" }}>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: navSolid ? "rgba(6,13,10,0.92)" : "transparent",
        backdropFilter: navSolid ? "blur(20px)" : "none",
        borderBottom: navSolid ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.4s",
      }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg,#00c49a,#009478)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,196,154,0.4)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
          </div>
          <div>
            <span style={{ fontSize: "17px", fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.3px" }}>MehnatAI</span>
            <span style={{ display: "block", fontSize: "7.5px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "3px" }}>DIGITAL INTELLIGENCE</span>
          </div>
        </div>

        {/* links */}
        <div style={{ display: "flex", gap: "32px" }}>
          {["Platforma","AI Algoritmlar","Narxlar","Haqida"].map(l => (
            <a key={l} href="#" style={{ fontSize: "13.5px", fontWeight: 500, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{l}</a>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "9px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 600,
            color: "rgba(255,255,255,0.75)", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s", background: "transparent",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)"; }}
          >Kirish</Link>
          <Link href="/login" style={{
            padding: "10px 22px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700,
            color: "#001f18", textDecoration: "none",
            background: "linear-gradient(135deg,#00c49a,#00e0b0)",
            boxShadow: "0 0 20px rgba(0,196,154,0.35)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 28px rgba(0,196,154,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 20px rgba(0,196,154,0.35)"; }}
          >Boshlash →</Link>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: "68px" }}>
        {/* mesh bg */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(0,196,154,0.18) 0%, transparent 60%)", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "64px 64px", zIndex: 0 }} />
        <Orb x="10%" y="20%" size={500} color="rgba(0,196,154,0.12)" blur={100} />
        <Orb x="60%" y="50%" size={400} color="rgba(44,70,120,0.14)" blur={100} />
        <Orb x="80%" y="5%" size={300} color="rgba(124,58,237,0.08)" blur={80} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "80px 40px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>

            {/* Left */}
            <div>
              {/* badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 16px", borderRadius: "999px", background: "rgba(0,196,154,0.1)", border: "1px solid rgba(0,196,154,0.25)", marginBottom: "28px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00c49a", boxShadow: "0 0 10px #00c49a", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#00c49a", letterSpacing: "1px" }}>O'ZBEKISTONDAGI BIRINCHI HR-AI • v1.0</span>
              </div>

              <h1 style={{
                fontSize: "clamp(40px,4.5vw,62px)", fontWeight: 900, lineHeight: 1.05,
                color: "white", letterSpacing: "-1.5px",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                marginBottom: "22px",
              }}>
                Xodimlar<br />
                samaradorligini<br />
                <span style={{ background: "linear-gradient(90deg,#00c49a,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI bilan baholang
                </span>
              </h1>

              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "36px", maxWidth: "440px" }}>
                LSTM neyron tarmog'i, K-Means klasterlash va mBERT NLP algoritmlar yordamida xodimlarning ish sifatini ob'ektiv, real vaqtda va aniq baholang.
              </p>

              {/* pills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "40px" }}>
                <Pill color="#00c49a">KPI Avtomatik</Pill>
                <Pill color="#60a5fa">360° Feedback</Pill>
                <Pill color="#a78bfa">LSTM Bashorat</Pill>
                <Pill color="#4ade80">AI Tavsiya</Pill>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Link href="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 32px", borderRadius: "12px",
                  background: "linear-gradient(135deg,#00c49a,#00e0b0)",
                  color: "#001f18", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(0,196,154,0.4)",
                  transition: "all 0.25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 48px rgba(0,196,154,0.55)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(0,196,154,0.4)"; }}
                >
                  Bepul boshlash
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 28px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)",
                  fontWeight: 600, fontSize: "15px", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>
                  Demo ko'rish
                </Link>
              </div>

              {/* trust */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex" }}>
                  {["#00c49a","#60a5fa","#a78bfa","#f59e0b","#ef4444"].map((c, i) => (
                    <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: "2px solid #060d0a", marginLeft: i === 0 ? 0 : "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white" }}>
                      {["AF","SK","OR","NM","SA"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>500+ xodim tahlil qilindi</div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "3px" }}>
                    {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: "#fbbf24", fontSize: "12px" }}>★</span>)}
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginLeft: "5px" }}>12+ kompaniya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Dashboard mockup */}
            <div style={{ position: "relative" }}>
              {/* glow behind */}
              <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(circle at 50% 50%, rgba(0,196,154,0.15) 0%, transparent 70%)", filter: "blur(30px)", zIndex: 0 }} />

              {/* Main window */}
              <div style={{
                position: "relative", zIndex: 1,
                borderRadius: "20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
                boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
              }}>
                {/* window header */}
                <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "6px" }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />)}
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ padding: "3px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>mehnatai.uz/dashboard</div>
                  </div>
                </div>

                {/* content */}
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* stat row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                    {[
                      { label: "Xodimlar", val: "248", color: "#00c49a", icon: "👥" },
                      { label: "O'rtacha USI", val: "76%", color: "#60a5fa", icon: "📈" },
                      { label: "Yuqori", val: "89", color: "#4ade80", icon: "⭐" },
                      { label: "Rivojlanish", val: "23", color: "#f87171", icon: "⚠️" },
                    ].map(({ label, val, color, icon }) => (
                      <div key={label} style={{ padding: "12px 10px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: "16px", marginBottom: "6px" }}>{icon}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "3px", fontWeight: 500 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* chart + list */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "8px" }}>
                    {/* bar chart */}
                    <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>KPI Dinamikasi — 2024</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "60px" }}>
                        {[55, 62, 58, 70, 75, 80].map((h, i) => (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                            <div style={{ width: "100%", height: `${h}%`, borderRadius: "4px 4px 0 0", background: i === 5 ? "linear-gradient(180deg,#00c49a,#009478)" : "rgba(255,255,255,0.1)" }} />
                            <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>{["Y","F","M","A","M","I"][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* departments */}
                    <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>BO'LIMLAR</div>
                      {[["IT", 85, "#00c49a"], ["HR", 74, "#60a5fa"], ["Sotuv", 68, "#a78bfa"]].map(([n, v, c]) => (
                        <div key={n as string} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "rgba(255,255,255,0.5)", marginBottom: "3px" }}>
                            <span>{n}</span><span style={{ color: c as string, fontWeight: 700 }}>{v}%</span>
                          </div>
                          <div style={{ height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }}>
                            <div style={{ height: "4px", borderRadius: "999px", width: `${v}%`, background: c as string }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* employee list */}
                  <div style={{ borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px" }}>TOP XODIMLAR</div>
                    {[
                      { n: "Sardor Aliev", r: "Head of Sales", s: 95, c: "#4ade80" },
                      { n: "Azizbek Fayzullaev", r: "Senior Dev", s: 92, c: "#00c49a" },
                      { n: "Nigora Mansurova", r: "Marketing Lead", s: 85, c: "#60a5fa" },
                    ].map(({ n, r, s, c }) => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#001f18", flexShrink: 0 }}>
                          {n.split(" ").map(x => x[0]).join("")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{r}</div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: c }}>{s}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* floating AI card */}
              <div style={{
                position: "absolute", bottom: "-24px", left: "-32px",
                zIndex: 2,
                padding: "14px 16px", borderRadius: "16px",
                background: "rgba(10,24,18,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,196,154,0.3)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                maxWidth: "220px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#00c49a,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#00c49a" }}>LSTM Bashorat</div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>3 oylik prognoz</div>
                  </div>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", display: "inline-block", flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Azizbek: +12% o'sish bashorat qilinmoqda. Tavsiya: Backend lead.
                </p>
              </div>

              {/* floating badge top right */}
              <div style={{
                position: "absolute", top: "-16px", right: "-20px", zIndex: 2,
                padding: "10px 14px", borderRadius: "14px",
                background: "rgba(10,24,18,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#a78bfa" }}>K-Means</div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>3 guruh aniqlandi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: scrollY > 50 ? 0 : 1, transition: "opacity 0.3s" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>SCROLL</span>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(180deg,rgba(0,196,154,0.6),transparent)" }} />
        </div>
      </section>

      {/* ═══════════════════ PROBLEM SECTION ═══════════════ */}
      <section style={{ position: "relative", padding: "120px 40px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #060d0a 0%, #0a1a14 50%, #060d0a 100%)" }} />
        <Orb x="70%" y="20%" size={400} color="rgba(239,68,68,0.06)" blur={80} />

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "70px" }}>
            <Pill color="#f87171">MUAMMO TAVSIFI</Pill>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: "white", letterSpacing: "-1px", fontFamily: "'Plus Jakarta Sans',sans-serif", marginTop: "20px", marginBottom: "14px" }}>
              An'anaviy usullar nima uchun<br /><span style={{ color: "#f87171" }}>ishlami</span>?
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Zamonaviy IT kompaniyalarida xodim baholash hali ham subyektiv va kechiktirilgan
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px" }}>
            {[
              { icon: "👤", title: "Subyektivlik", desc: "Rahbar shaxsiy munosabatiga asoslanib baho beradi", num: "01" },
              { icon: "📄", title: "Cheklangan ma'lumot", desc: "Faqat bir manbadan olingan fikr to'liq tasvirni bermaydi", num: "02" },
              { icon: "⏰", title: "Kechikish", desc: "Yillik baholash — muammolar juda kech aniqlanadi", num: "03" },
              { icon: "📊", title: "Bashorat yo'qligi", desc: "Kelajak ko'rsatkichlari hisobga olinmaydi", num: "04" },
              { icon: "🚫", title: "Tavsiya yo'q", desc: "Faqat baho beriladi, rivojlanish yo'li ko'rsatilmaydi", num: "05" },
            ].map(({ icon, title, desc, num }) => (
              <div key={num} style={{ padding: "24px 20px", borderRadius: "18px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(239,68,68,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(239,68,68,0.05)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(248,113,113,0.4)", letterSpacing: "2px", marginBottom: "14px" }}>{num}</div>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "8px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* arrow down */}
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>YECHIM →</span>
              <div style={{ width: "1px", height: "40px", background: "linear-gradient(180deg,rgba(0,196,154,0.5),transparent)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ USI FORMULA ═══════════════════ */}
      <section style={{ padding: "100px 40px", position: "relative", overflow: "hidden" }}>
        <Orb x="-10%" y="30%" size={500} color="rgba(0,196,154,0.08)" blur={100} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <Pill color="#00c49a">USI FORMULA</Pill>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, color: "white", letterSpacing: "-0.8px", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "20px 0 16px", lineHeight: 1.2 }}>
              Ko'p manbali ob'ektiv<br />baholash metodologiyasi
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: "32px" }}>
              4 ta mustaqil manbadan olingan ma'lumotlarni birlashtirib, Umumiy Samaradorlik Indeksini (USI) aniq hisoblang.
            </p>

            {/* formula block */}
            <div style={{ borderRadius: "16px", background: "rgba(0,196,154,0.05)", border: "1px solid rgba(0,196,154,0.15)", padding: "22px 24px", marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,196,154,0.5)", letterSpacing: "2px", marginBottom: "14px" }}>FORMULA</div>
              <div style={{ fontFamily: "monospace", fontSize: "clamp(11px,1.4vw,13px)", lineHeight: 2, color: "rgba(255,255,255,0.9)" }}>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>USI</span> = {" "}
                <span style={{ color: "#fbbf24" }}>KPI_avto</span> × <span style={{ color: "#fbbf24" }}>0.25</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#60a5fa" }}>Rahbar_baho</span> × <span style={{ color: "#60a5fa" }}>0.30</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#a78bfa" }}>360_feedback</span> × <span style={{ color: "#a78bfa" }}>0.25</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#34d399" }}>Mijoz_feedback</span> × <span style={{ color: "#34d399" }}>0.20</span>
              </div>
            </div>

            {/* result badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { r: "80–100%", l: "YUQORI", c: "#4ade80", b: "rgba(74,222,128,0.1)" },
                { r: "60–79%", l: "O'RTA", c: "#fbbf24", b: "rgba(251,191,36,0.1)" },
                { r: "0–59%", l: "RIVOJLANISH KERAK", c: "#f87171", b: "rgba(248,113,113,0.1)" },
              ].map(x => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", borderRadius: "12px", background: x.b, border: `1px solid ${x.c}20` }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: x.c, minWidth: "72px" }}>{x.r}</span>
                  <span style={{ width: "1px", height: "14px", background: `${x.c}30` }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: x.c, letterSpacing: "1px" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weight visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <GlassCard style={{ padding: "28px 24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "20px" }}>BAHOLASH OG'IRLIKLARI</div>
              {[
                { l: "Rahbar Baholash", w: 30, c: "#60a5fa" },
                { l: "KPI Avtomatik", w: 25, c: "#fbbf24" },
                { l: "360° Peer Feedback", w: 25, c: "#a78bfa" },
                { l: "Mijoz Feedback", w: 20, c: "#34d399" },
              ].map(({ l, w, c }) => (
                <div key={l} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{l}</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: c }}>×{(w / 100).toFixed(2)}</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "6px", borderRadius: "999px", width: `${w * 3.2}%`, background: c, boxShadow: `0 0 8px ${c}60` }} />
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* mini insight */}
            <GlassCard style={{ padding: "20px 22px", background: "rgba(0,196,154,0.06)", borderColor: "rgba(0,196,154,0.15)" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(0,196,154,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c49a" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#00c49a", marginBottom: "5px" }}>Real natija</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                    Kompaniyalarda USI joriy qilinganidan so'ng samaradorlik <span style={{ color: "#4ade80", fontWeight: 700 }}>3× oshdi</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════ AI ALGORITHMS ════════════════ */}
      <section style={{ padding: "100px 40px", position: "relative", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Orb x="80%" y="0%" size={400} color="rgba(124,58,237,0.08)" blur={100} />
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Pill color="#a78bfa">SUN'IY INTELLEKT ALGORITMLARI</Pill>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "white", letterSpacing: "-0.8px", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "20px 0 12px" }}>
              3 ta kuchli AI bir tizimda
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", maxWidth: "480px", margin: "0 auto" }}>
              Har bir algoritm turli rakursdan tahlil qilib, eng aniq natijani beradi
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {[
              {
                tag: "LSTM", label: "Neyron Tarmog'i", color: "#a78bfa",
                title: "3–6 Oylik Samaradorlik Bashorati",
                desc: "Long Short-Term Memory neyron tarmog'i xodimning kelgusi faoliyatini bashorat qiladi.",
                formula: "7 feature × 12 vaqt qadami",
                items: ["LSTM qatlam 1: 64 birlik, dropout=0.2", "LSTM qatlam 2: 32 birlik, dropout=0.2", "Chiqish: Adam (lr=0.001), MSE", "Haftalik avtomatik retraining"],
                accuracy: 89,
              },
              {
                tag: "K-MEANS", label: "Klasterlash", color: "#00c49a",
                title: "Xodimlar Avtomatik Segmentatsiyasi",
                desc: "K-Means algoritmi xodimlarni 3 guruhga ajratib, har biri uchun strategiya taklif qiladi.",
                formula: "K=3 · Silhouette ≈ 0.68",
                items: ["Yuqori guruh: rivojlanish strategiyasi", "O'rta guruh: qo'shimcha qo'llab-quvvatlash", "Past guruh: intensiv coaching", "Elbow Method + Silhouette Score"],
                accuracy: 84,
              },
              {
                tag: "mBERT NLP", label: "Sentiment Tahlil", color: "#60a5fa",
                title: "O'zbek Tilida Matn Tahlili",
                desc: "Multilingual BERT modeli feedback izohlarini avtomatik tahlil qilib, kayfiyatni aniqlaydi.",
                formula: "F1-score ≥ 0.82",
                items: ["3 sinf: Ijobiy / Neytral / Salbiy", "360° feedback izohlarini tahlil", "Mijoz feedback matnlarini aniqlash", "Salbiy trendlarni erta aniqlash"],
                accuracy: 82,
              },
            ].map(({ tag, label, color, title, desc, formula, items, accuracy }) => (
              <div key={tag} style={{ borderRadius: "22px", overflow: "hidden", border: `1px solid ${color}20`, background: "rgba(255,255,255,0.03)", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}20`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                {/* top stripe */}
                <div style={{ height: "4px", background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: `${color}15`, color, letterSpacing: "1.5px" }}>{tag}</span>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{label}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "28px", fontWeight: 900, color, lineHeight: 1 }}>{accuracy}%</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>ANIQLIK</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "10px", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.3 }}>{title}</h4>
                  <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: "14px" }}>{desc}</p>

                  <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", fontFamily: "monospace", fontSize: "11.5px", color, marginBottom: "16px" }}>
                    {formula}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}><path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES BENTO ═══════════════ */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Pill color="#4ade80">PLATFORMA IMKONIYATLARI</Pill>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "white", letterSpacing: "-0.8px", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "20px 0" }}>
              Bir tizimda — barcha vositalar
            </h2>
          </div>

          {/* bento grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "auto", gap: "16px" }}>
            {/* big card */}
            <div style={{ gridColumn: "1/3", borderRadius: "22px", background: "linear-gradient(135deg,rgba(0,196,154,0.12),rgba(0,196,154,0.04))", border: "1px solid rgba(0,196,154,0.2)", padding: "36px", display: "flex", gap: "40px", alignItems: "center", transition: "all 0.3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,196,154,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,196,154,0.2)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ flex: 1 }}>
                <Pill color="#00c49a">Asosiy</Pill>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "14px 0 10px" }}>Ko'p manbali KPI monitoring</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  Rahbar + hamkasb + mijoz feedbacklari bir tizimda. Kunlik va haftalik KPI kuzatuvi. IT xodimlar uchun maxsus metrikalar: kod sifati, bug-fix tezligi, test qoplama, muddatga rioya.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
                {["Kod sifati: 94%","Muddatga rioya: 88%","Test qoplama: 85%","360° Feedback: 4.9/5"].map(t => (
                  <div key={t} style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(0,196,154,0.1)", border: "1px solid rgba(0,196,154,0.2)", fontSize: "12.5px", fontWeight: 600, color: "#00c49a", whiteSpace: "nowrap" }}>{t}</div>
                ))}
              </div>
            </div>

            {/* tall right card */}
            <div style={{ gridRow: "1/3", borderRadius: "22px", background: "linear-gradient(160deg,rgba(124,58,237,0.12),rgba(124,58,237,0.04))", border: "1px solid rgba(124,58,237,0.2)", padding: "32px", transition: "all 0.3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.2)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <Pill color="#a78bfa">AI Powered</Pill>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "16px 0 10px" }}>Individuallashgan AI Tavsiyalar</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "24px" }}>
                Har bir xodim uchun maxsus rivojlanish rejasi, tavsiya qilingan kurslar va kuchli/zaif tomonlar tahlili.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { t: "Backend arxitektura", p: "Yuqori", c: "#f87171" },
                  { t: "Micro-learning sessiyalar", p: "O'rta", c: "#fbbf24" },
                  { t: "Mentorlik roli", p: "Tavsiya", c: "#4ade80" },
                ].map(({ t, p, c }) => (
                  <div key={t} style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{t}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: `${c}18`, color: c }}>{p}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "24px", padding: "16px", borderRadius: "14px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <div style={{ fontSize: "11px", color: "#a78bfa", fontWeight: 700, marginBottom: "6px" }}>LSTM Bashorat</div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "white" }}>+12% <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>3 oyda</span></div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Azizbek Fayzullaev</div>
              </div>
            </div>

            {[
              { title: "360° Anonim Feedback", desc: "Hamkasb, rahbar va mijoz baholashlari birlashadi. NLP orqali sentiment tahlil.", color: "#60a5fa", icon: "🔄" },
              { title: "Avtomatik PDF Hisobotlar", desc: "Filtrlangan ma'lumotlarni bir tugma bilan PDF eksport qilish imkoniyati.", color: "#fbbf24", icon: "📄" },
              { title: "RBAC Xavfsizlik", desc: "JWT autentifikatsiya, bcrypt hashing, HTTPS va rolga asoslangan huquqlar.", color: "#f87171", icon: "🔒" },
            ].map(({ title, desc, color, icon }) => (
              <div key={title} style={{ borderRadius: "22px", background: `${color}08`, border: `1px solid ${color}18`, padding: "28px", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}35`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.background = `${color}12`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}18`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.background = `${color}08`; }}
              >
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{icon}</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "8px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h4>
                <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ════════════════════════ */}
      <section style={{ padding: "100px 40px", position: "relative", overflow: "hidden" }} ref={statsRef.ref}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#001f18,#003328,#001430)" }} />
        <Orb x="10%" y="20%" size={500} color="rgba(0,196,154,0.12)" blur={100} />
        <Orb x="70%" y="60%" size={400} color="rgba(44,70,120,0.12)" blur={100} />
        <div style={{ position: "relative", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "white", letterSpacing: "-0.8px", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: "12px" }}>
              Raqamlarda <span style={{ color: "#00c49a" }}>ishonchimiz</span>
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>Real kompaniyalar bilan sinab ko'rilgan</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { n: 500, s: "+", l: "Xodimlar tahlili" },
              { n: 12, s: "+", l: "Yirik kompaniyalar" },
              { n: 89, s: "%", l: "AI aniqlik darajasi" },
              { n: 3, s: "×", l: "Samaradorlik o'sishi" },
            ].map(({ n, s, l }) => (
              <div key={l} style={{ padding: "48px 20px", background: "rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <StatBig n={n} suffix={s} label={l} active={statsRef.visible} />
              </div>
            ))}
          </div>

          {/* model accuracy */}
          <GlassCard style={{ marginTop: "24px", padding: "28px 32px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginBottom: "20px" }}>MODEL ANIQLIGI TAQQOSLOVI</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { l: "LSTM Bashorat modeli", a: 89, c: "#a78bfa" },
                { l: "K-Means Klasterlash (Silhouette)", a: 84, c: "#00c49a" },
                { l: "mBERT NLP Sentiment (F1-score)", a: 82, c: "#60a5fa" },
              ].map(({ l, a, c }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", minWidth: "260px" }}>{l}</span>
                  <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ height: "6px", borderRadius: "999px", width: statsRef.visible ? `${a}%` : "0%", background: c, boxShadow: `0 0 10px ${c}60`, transition: "width 1.2s ease" }} />
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: c, minWidth: "40px", textAlign: "right" }}>{a}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ ROLES ════════════════════════ */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Pill color="#60a5fa">ROLLAR TIZIMI</Pill>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "white", letterSpacing: "-0.8px", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: "20px 0" }}>
              Har bir rol uchun maxsus panel
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {[
              { icon: "👔", role: "Rahbar", sub: "Director / Manager", color: "#00c49a", login: "rahbar / 123",
                powers: ["Barcha xodimlar monitoring", "KPI trend grafiklari", "AI bashorat hisobotlari", "Bo'lim taqqoslash", "PDF eksport", "Yangi baholash yaratish"] },
              { icon: "💻", role: "Xodim", sub: "Employee", color: "#60a5fa", login: "xodim / 123",
                powers: ["O'z KPI ko'rsatkichlari", "Vazifalar TreeLog", "Katya Kalendar", "AI rivojlanish tavsiyalari", "Baholash tarixi", "Kompetensiyalar radar"] },
              { icon: "📊", role: "HR Manager", sub: "Human Resources", color: "#a78bfa", login: "Tez kunda",
                powers: ["Xodimlar ma'lumotlar bazasi", "360° feedback boshqaruvi", "K-Means klaster tahlili", "Lavozim tarixi", "Hisobotlar va statistika", "Onboarding boshqaruvi"] },
            ].map(({ icon, role, sub, color, login, powers }) => (
              <div key={role} style={{ borderRadius: "24px", border: `1px solid ${color}20`, background: `${color}06`, padding: "32px", transition: "all 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}20`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "44px", marginBottom: "16px" }}>{icon}</div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: "4px" }}>{role}</h3>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "22px" }}>{sub}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                  {powers.map(p => (
                    <div key={p} style={{ display: "flex", gap: "9px", alignItems: "center", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {p}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "11px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: `1px solid ${color}25`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Demo kirish:</span>
                  <span style={{ fontSize: "12.5px", fontFamily: "monospace", fontWeight: 700, color }}>{login}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TECH STACK ════════════════════ */}
      <section style={{ padding: "60px 40px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "3px", marginBottom: "24px" }}>TEXNOLOGIYALAR STEKI</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {["Django REST","PostgreSQL","Celery","React + TypeScript","Redux Toolkit","React Query","LSTM/Keras","K-Means/sklearn","mBERT NLP","JWT Auth","Docker","Next.js 16","Locust Tests","Playwright E2E"].map(t => (
              <span key={t} style={{ padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.45)", transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = "#00c49a"; (e.currentTarget as HTMLSpanElement).style.borderColor = "rgba(0,196,154,0.3)"; (e.currentTarget as HTMLSpanElement).style.background = "rgba(0,196,154,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLSpanElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLSpanElement).style.background = "rgba(255,255,255,0.05)"; }}
              >{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA FINAL ═════════════════════ */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ position: "relative", borderRadius: "32px", overflow: "hidden", padding: "80px 60px", textAlign: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg,#001f18,#003d31 40%,#001a30)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse,rgba(0,196,154,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Pill color="#00c49a">14 KUNLIK BEPUL SINOV</Pill>
              <h2 style={{ fontSize: "clamp(30px,5vw,54px)", fontWeight: 900, color: "white", lineHeight: 1.1, margin: "24px 0 16px", letterSpacing: "-1.5px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Biznesingizni<br /><span style={{ background: "linear-gradient(90deg,#00c49a,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>kelajak bilan bog'lang</span>
              </h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", maxWidth: "440px", margin: "0 auto 40px", lineHeight: 1.7 }}>
                Kredit karta talab qilinmaydi. Istalgan vaqt bekor qilish mumkin. Hoziroq boshlang.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/login" style={{ padding: "16px 40px", borderRadius: "14px", background: "linear-gradient(135deg,#00c49a,#00e0b0)", color: "#001f18", fontWeight: 700, fontSize: "15px", textDecoration: "none", boxShadow: "0 8px 32px rgba(0,196,154,0.5)", transition: "all 0.25s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 48px rgba(0,196,154,0.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(0,196,154,0.5)"; }}
                >Bepul sinab ko'rish →</Link>
                <Link href="/login" style={{ padding: "16px 36px", borderRadius: "14px", background: "rgba(255,255,255,0.08)", color: "white", fontWeight: 600, fontSize: "15px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; }}
                >Demo ko'rish</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#00c49a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(0,196,154,0.3)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>MehnatAI</span>
            <span style={{ fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>v1.0 · 2024</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Foydalanish shartlari","Maxfiylik siyosati","Bog'lanish","API Docs"].map(l => (
              <a key={l} href="#" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >{l}</a>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>© 2024 MehnatAI. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#060d0a}
        ::-webkit-scrollbar-thumb{background:#00c49a40;border-radius:999px}
      `}</style>
    </div>
  );
}
