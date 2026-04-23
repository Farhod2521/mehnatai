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

function StatBig({ n, suffix, label, active }: { n: number; suffix: string; label: string; active: boolean }) {
  const v = useCountUp(n, active);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(40px,4.5vw,58px)", fontWeight: 900, color: "#00B894", lineHeight: 1, fontFamily: "'Inter',sans-serif" }}>
        {v}{suffix}
      </div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#9DB5AE", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "8px" }}>{label}</div>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "5px 14px", borderRadius: "999px",
      background: `${color}14`, border: `1px solid ${color}28`,
      fontSize: "11px", fontWeight: 700, color, letterSpacing: "0.5px",
    }}>{children}</span>
  );
}

const NAV_LINKS = [
  { label: "Platforma", href: "#platforma" },
  { label: "AI Algoritmlar", href: "#algoritmlar" },
  { label: "Haqida", href: "#haqida" },
  { label: "Bog'lanish", href: "#boglanish" },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useInView(0.3);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navSolid = scrollY > 40;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setFormSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setFormSending(false);
    setFormSent(true);
  }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#F5F8F7", color: "#111827", overflowX: "hidden" }}>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        background: navSolid ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: navSolid ? "1px solid #E5EDE9" : "1px solid transparent",
        transition: "all 0.3s",
        boxShadow: navSolid ? "0 2px 16px rgba(0,184,148,0.07)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg,#00B894,#009975)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,184,148,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
          </div>
          <div>
            <span style={{ fontSize: "17px", fontWeight: 800, color: "#0D3D30", letterSpacing: "-0.3px" }}>MehnatAI</span>
            <span style={{ display: "block", fontSize: "7px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "2.5px" }}>DIGITAL INTELLIGENCE</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontSize: "13.5px", fontWeight: 500, color: "#6B8A82", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00B894")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B8A82")}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "9px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 600,
            color: "#4A7A6D", textDecoration: "none",
            border: "1px solid #D4EAE4", background: "transparent", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#EDF8F5"; (e.currentTarget as HTMLAnchorElement).style.color = "#00B894"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#4A7A6D"; }}
          >Kirish</Link>
          <a href="#boglanish" style={{
            padding: "10px 22px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700,
            color: "white", textDecoration: "none",
            background: "linear-gradient(135deg,#00B894,#009975)",
            boxShadow: "0 4px 16px rgba(0,184,148,0.3)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(0,184,148,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,184,148,0.3)"; }}
          >Boshlash →</a>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: "68px", background: "linear-gradient(160deg, #EAF5F1 0%, #F5F8F7 50%, #EEF3F8 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#D4EDE620 1px,transparent 1px),linear-gradient(90deg,#D4EDE620 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "-80px", left: "10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,184,148,0.1) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "0", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "80px 48px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0,184,148,0.1)", border: "1px solid rgba(0,184,148,0.22)", marginBottom: "28px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00B894", boxShadow: "0 0 8px #00B894", display: "inline-block", flexShrink: 0, animation: "blink 2s ease-in-out infinite" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#00B894", letterSpacing: "0.8px" }}>O'ZBEKISTONDAGI BIRINCHI HR-AI · v1.0</span>
              </div>

              <h1 style={{ fontSize: "clamp(38px,4.2vw,60px)", fontWeight: 900, lineHeight: 1.06, color: "#0D1F1A", letterSpacing: "-1.5px", marginBottom: "22px" }}>
                Xodimlar<br />samaradorligini<br />
                <span style={{ background: "linear-gradient(90deg,#00B894,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI bilan baholang
                </span>
              </h1>

              <p style={{ fontSize: "16px", color: "#5A7A72", lineHeight: 1.8, marginBottom: "36px", maxWidth: "440px" }}>
                LSTM neyron tarmog'i, K-Means klasterlash va mBERT NLP algoritmlar yordamida xodimlarning ish sifatini ob'ektiv va real vaqtda baholang.
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "40px" }}>
                {[
                  { l: "KPI Avtomatik", c: "#00B894" },
                  { l: "360° Feedback", c: "#60A5FA" },
                  { l: "LSTM Bashorat", c: "#A78BFA" },
                  { l: "AI Tavsiya", c: "#34D399" },
                ].map(({ l, c }) => <Pill key={l} color={c}>{l}</Pill>)}
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <a href="#boglanish" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 32px", borderRadius: "12px",
                  background: "linear-gradient(135deg,#00B894,#009975)",
                  color: "white", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                  boxShadow: "0 8px 28px rgba(0,184,148,0.35)", transition: "all 0.25s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 14px 40px rgba(0,184,148,0.45)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(0,184,148,0.35)"; }}
                >
                  Bog'lanish
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <Link href="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 28px", borderRadius: "12px",
                  background: "white", color: "#4A7A6D",
                  fontWeight: 600, fontSize: "15px", textDecoration: "none",
                  border: "1.5px solid #D4EAE4", transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#00B894"; (e.currentTarget as HTMLAnchorElement).style.color = "#00B894"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#D4EAE4"; (e.currentTarget as HTMLAnchorElement).style.color = "#4A7A6D"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polygon points="10,8 16,12 10,16" fill="currentColor"/></svg>
                  Tizimga kirish
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #D4EAE4" }}>
                <div style={{ display: "flex" }}>
                  {["#00B894","#60A5FA","#A78BFA","#F59E0B","#EF4444"].map((c, i) => (
                    <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: "2px solid white", marginLeft: i === 0 ? 0 : "-8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                      {["AF","SK","OR","NM","SA"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#2D5046" }}>500+ xodim tahlil qilindi</div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "3px", alignItems: "center" }}>
                    {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: "#F59E0B", fontSize: "11px" }}>★</span>)}
                    <span style={{ fontSize: "11px", color: "#9DB5AE", marginLeft: "5px" }}>12+ kompaniya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(circle,rgba(0,184,148,0.08) 0%,transparent 70%)", filter: "blur(20px)", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, borderRadius: "20px", background: "white", border: "1.5px solid #E5EDE9", boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,184,148,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "#F8FAF9", borderBottom: "1px solid #EBF2EE", display: "flex", alignItems: "center", gap: "6px" }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />)}
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ padding: "3px 16px", borderRadius: "6px", background: "#EBF2EE", fontSize: "10px", color: "#9DB5AE" }}>testyarat.uz/dashboard</div>
                  </div>
                </div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "#F8FAF9" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                    {[
                      { label: "Xodimlar", val: "248", color: "#00B894", icon: "👥" },
                      { label: "O'rtacha USI", val: "76%", color: "#60A5FA", icon: "📈" },
                      { label: "Yuqori", val: "89", color: "#34D399", icon: "⭐" },
                      { label: "Rivojlanish", val: "23", color: "#F87171", icon: "⚠️" },
                    ].map(({ label, val, color, icon }) => (
                      <div key={label} style={{ padding: "12px 10px", borderRadius: "12px", background: "white", border: "1px solid #EBF2EE", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div style={{ fontSize: "16px", marginBottom: "5px" }}>{icon}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: "9px", color: "#9DB5AE", marginTop: "3px", fontWeight: 500 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: "8px" }}>
                    <div style={{ padding: "14px", borderRadius: "12px", background: "white", border: "1px solid #EBF2EE" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#9DB5AE", marginBottom: "12px" }}>KPI Dinamikasi — 2024</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "56px" }}>
                        {[55, 62, 58, 70, 75, 80].map((h, i) => (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                            <div style={{ width: "100%", height: `${h}%`, borderRadius: "4px 4px 0 0", background: i === 5 ? "linear-gradient(180deg,#00B894,#009975)" : "#EBF2EE" }} />
                            <span style={{ fontSize: "7px", color: "#B0C9C2" }}>{["Y","F","M","A","M","I"][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "12px", borderRadius: "12px", background: "white", border: "1px solid #EBF2EE" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, color: "#B0C9C2", marginBottom: "10px" }}>BO'LIMLAR</div>
                      {[["IT", 85, "#00B894"], ["HR", 74, "#60A5FA"], ["Sotuv", 68, "#A78BFA"]].map(([n, v, c]) => (
                        <div key={n as string} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#9DB5AE", marginBottom: "3px" }}>
                            <span>{n}</span><span style={{ color: c as string, fontWeight: 700 }}>{v}%</span>
                          </div>
                          <div style={{ height: "4px", borderRadius: "999px", background: "#EBF2EE" }}>
                            <div style={{ height: "4px", borderRadius: "999px", width: `${v}%`, background: c as string }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderRadius: "12px", background: "white", border: "1px solid #EBF2EE", overflow: "hidden" }}>
                    <div style={{ padding: "9px 14px", borderBottom: "1px solid #EBF2EE", fontSize: "9px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "1.5px" }}>TOP XODIMLAR</div>
                    {[
                      { n: "Sardor Aliev", r: "Head of Sales", s: 95, c: "#34D399" },
                      { n: "Azizbek Fayzullaev", r: "Senior Dev", s: 92, c: "#00B894" },
                      { n: "Nigora Mansurova", r: "Marketing Lead", s: 85, c: "#60A5FA" },
                    ].map(({ n, r, s, c }) => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderBottom: "1px solid #F4F8F6" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {n.split(" ").map(x => x[0]).join("")}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "#2D5046" }}>{n}</div>
                          <div style={{ fontSize: "9px", color: "#9DB5AE" }}>{r}</div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: c }}>{s}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ position: "absolute", bottom: "-20px", left: "-28px", zIndex: 2, padding: "14px 16px", borderRadius: "16px", background: "white", border: "1.5px solid #D4EAE4", boxShadow: "0 8px 32px rgba(0,184,148,0.15)", maxWidth: "210px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#00B894,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#00B894" }}>LSTM Bashorat</div>
                    <div style={{ fontSize: "9px", color: "#9DB5AE" }}>3 oylik prognoz</div>
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "#5A7A72", lineHeight: 1.5 }}>Azizbek: +12% o'sish bashorat qilinmoqda.</p>
              </div>

              <div style={{ position: "absolute", top: "-14px", right: "-16px", zIndex: 2, padding: "10px 14px", borderRadius: "14px", background: "white", border: "1.5px solid #E8F0EE", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#A78BFA" }}>K-Means</div>
                    <div style={{ fontSize: "9px", color: "#9DB5AE" }}>3 guruh aniqlandi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PLATFORMA ═══════════ */}
      <section id="platforma" style={{ padding: "100px 48px", background: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(248,113,113,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Pill color="#F87171">MUAMMO TAVSIFI</Pill>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#0D1F1A", letterSpacing: "-0.8px", marginTop: "18px", marginBottom: "12px" }}>
              An'anaviy usullar nima uchun<br /><span style={{ color: "#F87171" }}>ishlamaydi</span>?
            </h2>
            <p style={{ fontSize: "15px", color: "#7A9E94", maxWidth: "460px", margin: "0 auto", lineHeight: 1.7 }}>
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
              <div key={num} style={{ padding: "24px 18px", borderRadius: "18px", background: "#FFF5F5", border: "1.5px solid #FEE2E2", transition: "all 0.25s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(248,113,113,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#FCA5A5", letterSpacing: "2px", marginBottom: "12px" }}>{num}</div>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1F2937", marginBottom: "8px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <span style={{ fontSize: "12px", color: "#00B894", fontWeight: 700, letterSpacing: "1.5px" }}>YECHIM ↓</span>
            <div style={{ width: "1px", height: "36px", background: "linear-gradient(180deg,#00B894,transparent)", margin: "6px auto 0" }} />
          </div>
        </div>
      </section>

      {/* ═══════════ AI ALGORITMLAR ═══════════ */}
      <section id="algoritmlar" style={{ padding: "100px 48px", background: "#F5F8F7" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <Pill color="#00B894">USI FORMULA</Pill>
            <h2 style={{ fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 800, color: "#0D1F1A", letterSpacing: "-0.8px", margin: "18px 0 14px", lineHeight: 1.2 }}>
              Ko'p manbali ob'ektiv<br />baholash metodologiyasi
            </h2>
            <p style={{ fontSize: "15px", color: "#5A7A72", lineHeight: 1.8, marginBottom: "30px" }}>
              4 ta mustaqil manbadan olingan ma'lumotlarni birlashtirib, Umumiy Samaradorlik Indeksini (USI) aniq hisoblang.
            </p>
            <div style={{ borderRadius: "16px", background: "white", border: "1.5px solid #D4EAE4", padding: "22px 24px", marginBottom: "22px", boxShadow: "0 2px 8px rgba(0,184,148,0.06)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "2px", marginBottom: "14px" }}>FORMULA</div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: 2, color: "#1F2937" }}>
                <span style={{ color: "#00B894", fontWeight: 700 }}>USI</span> ={" "}
                <span style={{ color: "#F59E0B" }}>KPI_avto</span> × <span style={{ color: "#F59E0B" }}>0.25</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#60A5FA" }}>Rahbar_baho</span> × <span style={{ color: "#60A5FA" }}>0.30</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#A78BFA" }}>360_feedback</span> × <span style={{ color: "#A78BFA" }}>0.25</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;+ <span style={{ color: "#34D399" }}>Mijoz_feedback</span> × <span style={{ color: "#34D399" }}>0.20</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { r: "80–100%", l: "YUQORI", c: "#16A34A", bg: "#F0FDF4", b: "#BBF7D0" },
                { r: "60–79%", l: "O'RTA", c: "#D97706", bg: "#FFFBEB", b: "#FDE68A" },
                { r: "0–59%", l: "RIVOJLANISH KERAK", c: "#DC2626", bg: "#FEF2F2", b: "#FECACA" },
              ].map(x => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", borderRadius: "12px", background: x.bg, border: `1px solid ${x.b}` }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: x.c, minWidth: "72px" }}>{x.r}</span>
                  <span style={{ width: "1px", height: "14px", background: x.b }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: x.c, letterSpacing: "0.8px" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "white", border: "1.5px solid #E5EDE9", borderRadius: "20px", padding: "28px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "2px", marginBottom: "20px" }}>BAHOLASH OG'IRLIKLARI</div>
              {[
                { l: "Rahbar Baholash", w: 30, c: "#60A5FA" },
                { l: "KPI Avtomatik", w: 25, c: "#F59E0B" },
                { l: "360° Peer Feedback", w: 25, c: "#A78BFA" },
                { l: "Mijoz Feedback", w: 20, c: "#34D399" },
              ].map(({ l, w, c }) => (
                <div key={l} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                    <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{l}</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: c }}>×{(w / 100).toFixed(2)}</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", background: "#F0F5F3" }}>
                    <div style={{ height: "6px", borderRadius: "999px", width: `${w * 3.2}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#F0FBF8", border: "1.5px solid #D1FAE5", borderRadius: "16px", padding: "20px 22px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(0,184,148,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#00B894", marginBottom: "5px" }}>Real natija</div>
                  <div style={{ fontSize: "13px", color: "#5A7A72", lineHeight: 1.6 }}>
                    USI joriy qilinganidan so'ng samaradorlik <span style={{ color: "#00B894", fontWeight: 700 }}>3× oshdi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section style={{ padding: "100px 48px", background: "white", position: "relative", overflow: "hidden" }} ref={statsRef.ref}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg,#F0FBF8 0%,white 50%,#EEF3F8 100%)", zIndex: 0 }} />
        <div style={{ position: "relative", maxWidth: "1100px", margin: "0 auto", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#0D1F1A", letterSpacing: "-0.8px", marginBottom: "10px" }}>
              Raqamlarda <span style={{ color: "#00B894" }}>ishonchimiz</span>
            </h2>
            <p style={{ fontSize: "15px", color: "#7A9E94" }}>Real kompaniyalar bilan sinab ko'rilgan</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #E5EDE9", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {[
              { n: 500, s: "+", l: "Xodimlar tahlili" },
              { n: 12, s: "+", l: "Yirik kompaniyalar" },
              { n: 89, s: "%", l: "AI aniqlik darajasi" },
              { n: 3, s: "×", l: "Samaradorlik o'sishi" },
            ].map(({ n, s, l }) => (
              <div key={l} style={{ padding: "48px 20px", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", borderRight: "1.5px solid #E5EDE9" }}>
                <StatBig n={n} suffix={s} label={l} active={statsRef.visible} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: "20px", background: "white", border: "1.5px solid #E5EDE9", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "2px", marginBottom: "20px" }}>MODEL ANIQLIGI TAQQOSLOVI</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { l: "LSTM Bashorat modeli", a: 89, c: "#A78BFA" },
                { l: "K-Means Klasterlash (Silhouette)", a: 84, c: "#00B894" },
                { l: "mBERT NLP Sentiment (F1-score)", a: 82, c: "#60A5FA" },
              ].map(({ l, a, c }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#5A7A72", minWidth: "260px" }}>{l}</span>
                  <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "#F0F5F3" }}>
                    <div style={{ height: "6px", borderRadius: "999px", width: statsRef.visible ? `${a}%` : "0%", background: c, transition: "width 1.2s ease" }} />
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: c, minWidth: "40px", textAlign: "right" }}>{a}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HAQIDA ═══════════ */}
      <section id="haqida" style={{ padding: "100px 48px", background: "#F5F8F7" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Pill color="#60A5FA">ROLLAR TIZIMI</Pill>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#0D1F1A", letterSpacing: "-0.8px", margin: "18px 0" }}>
              Har bir rol uchun maxsus panel
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {[
              { icon: "👔", role: "Rahbar", sub: "Director / Manager", color: "#00B894", login: "rahbar / 123",
                powers: ["Barcha xodimlar monitoring", "KPI trend grafiklari", "AI bashorat hisobotlari", "Bo'lim taqqoslash", "PDF eksport", "Yangi baholash yaratish"] },
              { icon: "💻", role: "Xodim", sub: "Employee", color: "#60A5FA", login: "xodim / 123",
                powers: ["O'z KPI ko'rsatkichlari", "Vazifalar TreeLog", "Kalendar", "AI rivojlanish tavsiyalari", "Baholash tarixi", "Kompetensiyalar radar"] },
              { icon: "📊", role: "HR Manager", sub: "Human Resources", color: "#A78BFA", login: "Tez kunda",
                powers: ["Xodimlar ma'lumotlar bazasi", "360° feedback boshqaruvi", "K-Means klaster tahlili", "Lavozim tarixi", "Hisobotlar va statistika", "Onboarding boshqaruvi"] },
            ].map(({ icon, role, sub, color, login, powers }) => (
              <div key={role} style={{ borderRadius: "22px", border: "1.5px solid #E5EDE9", background: "white", padding: "32px", transition: "all 0.25s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = color; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 48px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5EDE9"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              >
                <div style={{ fontSize: "42px", marginBottom: "14px" }}>{icon}</div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0D1F1A", marginBottom: "4px" }}>{role}</h3>
                <div style={{ fontSize: "12px", color: "#9DB5AE", marginBottom: "20px" }}>{sub}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "22px" }}>
                  {powers.map(p => (
                    <div key={p} style={{ display: "flex", gap: "9px", alignItems: "center", fontSize: "13px", color: "#5A7A72" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {p}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "11px 16px", borderRadius: "12px", background: "#F5F8F7", border: "1.5px solid #E5EDE9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#9DB5AE" }}>Demo kirish:</span>
                  <span style={{ fontSize: "12.5px", fontFamily: "monospace", fontWeight: 700, color }}>{login}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BOG'LANISH ═══════════ */}
      <section id="boglanish" style={{ padding: "100px 48px", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <Pill color="#00B894">BOG'LANISH</Pill>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#0D1F1A", letterSpacing: "-0.8px", marginTop: "18px", marginBottom: "12px" }}>
              Biz bilan <span style={{ color: "#00B894" }}>bog'laning</span>
            </h2>
            <p style={{ fontSize: "15px", color: "#7A9E94", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
              Demo so'rov yuboring — 24 soat ichida javob beramiz
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>

            {/* Chap: Manzil + info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Xarita */}
              <div style={{ borderRadius: "20px", overflow: "hidden", border: "1.5px solid #E5EDE9", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", height: "260px", position: "relative", background: "#EAF5F1" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d191997.24865869396!2d69.13617!3d41.2994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5bofc835576!2sToshkent%2C+O%27zbekiston!5e0!3m2!1suz!2s!4v1"
                  width="100%" height="100%" style={{ border: 0, display: "block" }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Kontakt kartalar */}
              {[
                { icon: "📍", label: "Manzil", value: "Toshkent shahri, Chilonzor tumani" },
                { icon: "📞", label: "Telefon", value: "+998 90 000 00 00" },
                { icon: "✉️", label: "Email", value: "info@testyarat.uz" },
                { icon: "🕐", label: "Ish vaqti", value: "Dush–Juma, 09:00 – 18:00" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderRadius: "14px", background: "#F5F8F7", border: "1.5px solid #E5EDE9" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0,184,148,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9DB5AE", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "14px", color: "#2D5046", fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* O'ng: Forma */}
            <div style={{ background: "#F5F8F7", borderRadius: "24px", border: "1.5px solid #E5EDE9", padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
              {formSent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#00B894,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 28px rgba(0,184,148,0.35)" }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0D1F1A", marginBottom: "10px" }}>So'rov yuborildi!</h3>
                  <p style={{ fontSize: "14px", color: "#7A9E94", lineHeight: 1.7 }}>Tez orada siz bilan bog'lanamiz.</p>
                  <button onClick={() => { setFormSent(false); setForm({ name: "", phone: "", address: "" }); }} style={{ marginTop: "24px", padding: "10px 24px", borderRadius: "10px", background: "transparent", border: "1.5px solid #D4EAE4", color: "#4A7A6D", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                    Yana yuborish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0D1F1A", marginBottom: "6px" }}>Demo so'rov</h3>
                    <p style={{ fontSize: "13px", color: "#9DB5AE" }}>Ma'lumotlaringizni qoldiring</p>
                  </div>

                  {[
                    { key: "name", label: "Ism Familya", placeholder: "Sardor Aliev", type: "text", icon: "👤" },
                    { key: "phone", label: "Telefon raqam", placeholder: "+998 90 123 45 67", type: "tel", icon: "📞" },
                    { key: "address", label: "Shahar / Manzil", placeholder: "Toshkent, Chilonzor", type: "text", icon: "📍" },
                  ].map(({ key, label, placeholder, type, icon }) => (
                    <div key={key}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#5A7A72", letterSpacing: "0.5px", display: "block", marginBottom: "7px" }}>{label}</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>{icon}</span>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          required={key !== "address"}
                          style={{
                            width: "100%", padding: "13px 16px 13px 42px",
                            borderRadius: "12px", border: "1.5px solid #D4EAE4",
                            background: "white", fontSize: "14px", color: "#1F2937",
                            outline: "none", transition: "border-color 0.2s",
                            boxSizing: "border-box",
                          }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#00B894")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#D4EAE4")}
                        />
                      </div>
                    </div>
                  ))}

                  <button type="submit" disabled={formSending} style={{
                    padding: "15px", borderRadius: "12px",
                    background: formSending ? "#9DB5AE" : "linear-gradient(135deg,#00B894,#009975)",
                    color: "white", fontWeight: 700, fontSize: "15px",
                    border: "none", cursor: formSending ? "not-allowed" : "pointer",
                    boxShadow: formSending ? "none" : "0 8px 24px rgba(0,184,148,0.35)",
                    transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    {formSending ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        Yuborish
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TECH STACK ═══════════ */}
      <section style={{ padding: "56px 48px", background: "#F5F8F7", borderTop: "1px solid #E5EDE9" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#B0C9C2", letterSpacing: "3px", marginBottom: "22px" }}>TEXNOLOGIYALAR STEKI</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {["FastAPI","PostgreSQL","Celery","Next.js + TypeScript","Redux Toolkit","React Query","LSTM/Keras","K-Means/sklearn","mBERT NLP","JWT Auth","Docker"].map(t => (
              <span key={t} style={{ padding: "7px 15px", borderRadius: "999px", background: "white", border: "1.5px solid #E5EDE9", fontSize: "12px", fontWeight: 600, color: "#6B8A82", transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = "#00B894"; (e.currentTarget as HTMLSpanElement).style.borderColor = "#00B89440"; (e.currentTarget as HTMLSpanElement).style.background = "#F0FBF8"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = "#6B8A82"; (e.currentTarget as HTMLSpanElement).style.borderColor = "#E5EDE9"; (e.currentTarget as HTMLSpanElement).style.background = "white"; }}
              >{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ borderTop: "1px solid #E5EDE9", padding: "36px 48px", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "linear-gradient(135deg,#00B894,#009975)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,184,148,0.25)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#0D1F1A" }}>MehnatAI</span>
            <span style={{ fontSize: "8px", fontWeight: 600, color: "#B0C9C2", letterSpacing: "2px" }}>v1.0 · 2025</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { label: "Platforma", href: "#platforma" },
              { label: "AI Algoritmlar", href: "#algoritmlar" },
              { label: "Haqida", href: "#haqida" },
              { label: "Bog'lanish", href: "#boglanish" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: "13px", color: "#9DB5AE", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00B894")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9DB5AE")}
              >{label}</a>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#B0C9C2" }}>© 2025 MehnatAI. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#F5F8F7; }
        ::-webkit-scrollbar-thumb { background:#C5DDD6; border-radius:999px; }
        ::-webkit-scrollbar-thumb:hover { background:#00B894; }
      `}</style>
    </div>
  );
}
