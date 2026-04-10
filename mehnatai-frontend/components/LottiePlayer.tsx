"use client";

import { useEffect, useRef } from "react";

interface LottiePlayerProps {
  src: string;
  width?: number;
  height?: number;
}

export default function LottiePlayer({ src, width = 120, height = 120 }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Script yuklanmagan bo'lsa qo'shamiz
    const scriptId = "dotlottie-wc-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js";
      script.type = "module";
      document.head.appendChild(script);
    }

    // Web component elementini yaratib container'ga qo'shamiz
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    const el = document.createElement("dotlottie-wc");
    el.setAttribute("src", src);
    el.setAttribute("autoplay", "");
    el.setAttribute("loop", "");
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.display = "block";
    container.appendChild(el);
  }, [src, width, height]);

  return <div ref={containerRef} style={{ width, height, flexShrink: 0 }} />;
}
