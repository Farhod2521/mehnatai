"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, ClipboardCheck,
  Activity, FileBarChart, Settings, Plus,
  UserCog, BarChart3, ListTodo,
} from "lucide-react";

const RAHBAR_NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/employees",   label: "Xodimlar",    icon: Users },
  { href: "/vazifalar",   label: "Vazifalar",   icon: ListTodo },
  { href: "/baholash",    label: "Baholash",    icon: ClipboardCheck },
  { href: "/monitoring",  label: "Monitoring",  icon: Activity },
  { href: "/hisobotlar",  label: "Hisobotlar",  icon: FileBarChart },
  { href: "/sozlamalar",  label: "Sozlamalar",  icon: Settings },
];

const HR_NAV = [
  { href: "/hr",             label: "HR Dashboard",  icon: LayoutDashboard },
  { href: "/employees",      label: "Xodimlar",      icon: Users },
  { href: "/baholash",       label: "Baholash",      icon: ClipboardCheck },
  { href: "/hr/kpi",         label: "KPI Boshqaruv", icon: BarChart3 },
  { href: "/hr/vazifalar",   label: "Vazifalar",     icon: ListTodo },
  { href: "/hisobotlar",     label: "Hisobotlar",    icon: FileBarChart },
  { href: "/sozlamalar",     label: "Sozlamalar",    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = role === "hr" ? HR_NAV : RAHBAR_NAV;
  const isHr = role === "hr";

  const isActive = (href: string) =>
    pathname === href || (href.length > 1 && pathname.startsWith(href) && href !== "/dashboard" && href !== "/hr");

  const accentColor = isHr ? "#6366F1" : "#00B8A0";
  const accentBg    = isHr ? "#EEF2FF" : "#E8F8F6";
  const accentShadow = isHr
    ? "0 4px 10px rgba(99,102,241,0.3)"
    : "0 4px 10px rgba(0,184,160,0.3)";
  const btnGradient = isHr
    ? "linear-gradient(135deg, #6366F1, #4F46E5)"
    : "linear-gradient(135deg, #00B8A0, #009984)";
  const btnShadow = isHr
    ? "0 4px 12px rgba(99,102,241,0.35)"
    : "0 4px 12px rgba(0,184,160,0.35)";

  return (
    <aside
      style={{
        width: "210px",
        minWidth: "210px",
        background: "#ffffff",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: isHr
              ? "linear-gradient(135deg, #6366F1, #4F46E5)"
              : "linear-gradient(135deg, #00B8A0, #009984)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: accentShadow,
          }}>
            {isHr ? (
              <UserCog size={18} color="white" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#111827", letterSpacing: "-0.3px" }}>
              MehnatAI
            </div>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "1px" }}>
              {isHr ? "HR PANEL" : "DIGITAL INTELLIGENCE"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : href === "/hr" && !pathname.startsWith("/hr/")
            ? pathname === "/hr"
            : isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "2px",
                textDecoration: "none", fontSize: "13.5px",
                fontWeight: active ? 600 : 500,
                color: active ? accentColor : "#6B7280",
                background: active ? accentBg : "transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div style={{ padding: "16px" }}>
        <Link
          href={isHr ? "/baholash/yangi" : "/baholash/yangi"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "11px 0", borderRadius: "12px",
            background: btnGradient, color: "white",
            fontWeight: 600, fontSize: "13px",
            textDecoration: "none", boxShadow: btnShadow,
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          {isHr ? "Yangi Baholash" : "Yangi Baholash"}
        </Link>
      </div>
    </aside>
  );
}
