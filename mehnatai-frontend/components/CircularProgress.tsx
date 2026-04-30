"use client";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
  textSize?: string | number;
}

export default function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  color = "#00B8A0",
  bgColor = "#E5E7EB",
  showText = true,
  textSize = 10,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const displayValue = Number.isInteger(value) ? value : Number(value.toFixed(1));

  const getColor = () => {
    if (color !== "auto") return color;
    if (value >= 80) return "#10B981";
    if (value >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const strokeColor = color === "auto" ? getColor() : color;
  const resolvedTextSize = typeof textSize === "number"
    ? `${textSize}px`
    : textSize.startsWith("text-")
      ? undefined
      : textSize;

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span
          className={typeof textSize === "string" && textSize.startsWith("text-") ? textSize : undefined}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: strokeColor,
            fontSize: resolvedTextSize,
            fontWeight: 800,
            lineHeight: 1,
            textAlign: "center",
            letterSpacing: "-0.2px",
          }}
        >
          {displayValue}%
        </span>
      )}
    </div>
  );
}
