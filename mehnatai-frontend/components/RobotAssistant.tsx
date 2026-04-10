"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import LottiePlayer from "./LottiePlayer";

const MESSAGES = [
  "Bugun 5 ta yangi baholash kerak! 📋",
  "Sardor Alievning KPI 95% ga yetdi! 🎉",
  "LSTM modeli yangi bashorat chiqardi ✨",
  "3 ta xodim diqqat talab qiladi ⚠️",
  "Oylik hisobot tayyor, yuklab oling! 📄",
  "Otabek Rasulovning KPI pasaymoqda 📉",
  "AI tahlil yangilandi, tekshiring! 🤖",
  "360° Feedback javobi keldi 💬",
];

type EdgeSide = "bottom-left" | "bottom-right" | "top-right" | "right-center" | "left-center";

const POSITIONS: Record<EdgeSide, {
  style: React.CSSProperties;
  from: React.CSSProperties;
}> = {
  "bottom-left": {
    style: { bottom: "24px", left: "220px" },
    from: { transform: "translateY(180px)", opacity: 0 },
  },
  "bottom-right": {
    style: { bottom: "24px", right: "24px" },
    from: { transform: "translateY(180px)", opacity: 0 },
  },
  "top-right": {
    style: { top: "80px", right: "24px" },
    from: { transform: "translateY(-160px)", opacity: 0 },
  },
  "right-center": {
    style: { top: "45%", right: "24px" },
    from: { transform: "translateX(180px)", opacity: 0 },
  },
  "left-center": {
    style: { top: "45%", left: "220px" },
    from: { transform: "translateX(-180px)", opacity: 0 },
  },
};

const EDGES = Object.keys(POSITIONS) as EdgeSide[];

type Phase = "hidden" | "in" | "visible" | "out";

export default function RobotAssistant() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [edge, setEdge] = useState<EdgeSide>("bottom-right");
  const [message, setMessage] = useState(MESSAGES[0]);
  const [showBubble, setShowBubble] = useState(false);
  const lastEdgeRef = useRef<EdgeSide | null>(null);

  const pickRandom = useCallback(() => {
    // Bir xil joyda ikki marta chiqmasin
    const available = EDGES.filter(e => e !== lastEdgeRef.current);
    const e = available[Math.floor(Math.random() * available.length)];
    const m = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    lastEdgeRef.current = e;
    setEdge(e);
    setMessage(m);
  }, []);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;
    let t5: ReturnType<typeof setTimeout>;

    const cycle = () => {
      // 1. Hidden pause (3-5s)
      const hiddenDur = 3000 + Math.random() * 2000;
      t1 = setTimeout(() => {
        pickRandom();
        setPhase("in");         // slide in (600ms)
        t2 = setTimeout(() => {
          setPhase("visible");
          setShowBubble(true);  // bubble appears
          t3 = setTimeout(() => {
            setShowBubble(false); // bubble fades
            t4 = setTimeout(() => {
              setPhase("out");  // slide out (500ms)
              t5 = setTimeout(() => {
                setPhase("hidden");
                cycle();        // restart
              }, 600);
            }, 400);
          }, 5000);             // visible 5 seconds
        }, 600);
      }, hiddenDur);
    };

    cycle();
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [pickRandom]);

  if (phase === "hidden") return null;

  const pos = POSITIONS[edge];

  // Transform calculation
  const isIn = phase === "in";
  const isOut = phase === "out";
  const entering = isIn ? pos.from : {};
  const leaving = isOut ? pos.from : {};
  const current = (isIn || isOut) ? (isIn ? entering : leaving) : { transform: "translate(0,0)", opacity: 1 };

  // Speech bubble tail direction (mostly robot is below bubble)
  const bubbleBelow = edge === "top-right";

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        ...pos.style,
        transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease",
        ...current,
        display: "flex",
        flexDirection: bubbleBelow ? "column-reverse" : "column",
        alignItems: "center",
        gap: "6px",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "10px 16px",
          maxWidth: "220px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          border: "1.5px solid #E5E7EB",
          fontSize: "13px",
          fontWeight: 600,
          color: "#111827",
          lineHeight: 1.4,
          textAlign: "center",
          position: "relative",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: showBubble ? 1 : 0,
          transform: showBubble ? "scale(1) translateY(0)" : "scale(0.85) translateY(6px)",
          transformOrigin: "bottom center",
        }}
      >
        {message}

        {/* Bubble tail — pointing down toward robot */}
        {!bubbleBelow && (
          <div style={{
            position: "absolute",
            bottom: "-9px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: "9px solid #fff",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.06))",
          }} />
        )}

        {/* Bubble tail — pointing up toward robot (when robot is above bubble) */}
        {bubbleBelow && (
          <div style={{
            position: "absolute",
            top: "-9px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "9px solid #fff",
            filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.06))",
          }} />
        )}
      </div>

      {/* Robot */}
      <div style={{ filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.25))" }}>
        <LottiePlayer
          src="https://lottie.host/8da20255-a500-4f19-a61e-b2f0611fbba1/5i2DRO7BHA.lottie"
          width={120}
          height={120}
        />
      </div>
    </div>
  );
}
