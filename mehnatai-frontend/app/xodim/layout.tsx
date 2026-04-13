"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  TrendingUp,
  LogOut,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/xodim", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/xodim/vazifalar", label: "Vazifalar", icon: CheckSquare },
  { href: "/xodim/kalendar", label: "Kalendar", icon: Calendar },
  { href: "/xodim/kpi", label: "Mening KPI", icon: TrendingUp },
];

function XodimSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside style={{
      width: "210px", minWidth: "210px",
      background: "#ffffff",
      borderRight: "1px solid #E5E7EB",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px rgba(99,102,241,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#111827", letterSpacing: "-0.3px" }}>MehnatAI</div>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "1px" }}>XODIM PANELI</div>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div style={{ padding: "0 12px 16px" }}>
        <div style={{
          padding: "12px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
          border: "1px solid #C7D2FE",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>Azizbek F.</div>
            <div style={{ fontSize: "11px", color: "#6366F1", fontWeight: 500 }}>Senior Developer</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "10px", marginBottom: "2px",
              textDecoration: "none", fontSize: "13.5px",
              fontWeight: active ? 600 : 500,
              color: active ? "#6366F1" : "#6B7280",
              background: active ? "#EEF2FF" : "transparent",
              transition: "all 0.15s",
            }}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px" }}>
        <button
          onClick={() => { logout(); router.push("/login"); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "11px 0", borderRadius: "12px", width: "100%",
            background: "transparent", border: "1.5px solid #E5E7EB",
            color: "#6B7280", fontWeight: 600, fontSize: "13px",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#FECACA";
            (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
            (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
          }}
        >
          <LogOut size={15} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

function XodimHeader() {
  return (
    <header style={{
      height: "60px",
      background: "#ffffff",
      borderBottom: "1px solid #E5E7EB",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
    }}>
      <div>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Salom, </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#6366F1" }}>Azizbek Fayzullaev</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          padding: "6px 14px", borderRadius: "20px",
          background: "#D1FAE5", color: "#065F46",
          fontSize: "12px", fontWeight: 600,
        }}>
          Samaradorlik: 92%
        </div>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #4F46E5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: "13px",
          cursor: "pointer",
        }}>
          AF
        </div>
      </div>
    </header>
  );
}

export default function XodimLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role === null) {
      router.push("/login");
    } else if (role === "rahbar") {
      router.push("/dashboard");
    }
  }, [role, router]);

  if (role !== "xodim") return null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F5F3FF" }}>
      <XodimSidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <XodimHeader />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
