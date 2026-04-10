interface StatusBadgeProps {
  status: "YUQORI" | "O'RTA" | "RIVOJLANISH KERAK";
}

const statusConfig = {
  "YUQORI": { bg: "#D1FAE5", color: "#065F46", label: "YUQORI" },
  "O'RTA": { bg: "#FEF3C7", color: "#92400E", label: "O'RTA" },
  "RIVOJLANISH KERAK": { bg: "#FEE2E2", color: "#991B1B", label: "RIVOJLANISH KERAK" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig["O'RTA"];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
