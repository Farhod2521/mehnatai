"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, Download, ChevronLeft, ChevronRight } from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import StatusBadge from "@/components/StatusBadge";
import { employees, EmployeeStatus } from "@/lib/mockData";

const ITEMS_PER_PAGE = 8;
const departments = ["Hammasi", "IT bo'limi", "HR bo'limi", "Sotuv bo'limi", "Marketing"];
const statuses: (EmployeeStatus | "Hammasi")[] = ["Hammasi", "YUQORI", "O'RTA", "RIVOJLANISH KERAK"];

const S = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  } as React.CSSProperties,
  th: {
    textAlign: "left" as const,
    padding: "12px 20px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9CA3AF",
    letterSpacing: "0.5px",
    background: "#FAFAFA",
    borderBottom: "1px solid #E5E7EB",
  },
  td: {
    padding: "14px 20px",
    fontSize: "13.5px",
    color: "#374151",
  },
};

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("Hammasi");
  const [status, setStatus] = useState<EmployeeStatus | "Hammasi">("Hammasi");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "score">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...employees];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q));
    }
    if (dept !== "Hammasi") list = list.filter(e => e.department === dept);
    if (status !== "Hammasi") list = list.filter(e => e.status === status);
    list.sort((a, b) => {
      if (sortBy === "score") return sortDir === "asc" ? a.score - b.score : b.score - a.score;
      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    return list;
  }, [search, dept, status, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (field: "name" | "score") => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Xodimlar ro'yxati</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            Kompaniyaning jami {employees.length} ta faol xodimi mavjud
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowFilters(s => !s)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px", border: "1px solid #E5E7EB",
              background: showFilters ? "#F0F2F5" : "#fff", color: "#6B7280",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            <Filter size={14} /> Filtrlar
          </button>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px", border: "1px solid #E5E7EB",
              background: "#fff", color: "#6B7280", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
            onClick={() => toggleSort(sortBy === "name" ? "score" : "name")}
          >
            <ArrowUpDown size={14} /> Saralash
          </button>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #00B8A0, #009984)",
              color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
            }}
          >
            <Download size={14} /> Hisobot (PDF)
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div style={{ ...S.card, padding: "16px" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Xodimlarni qidirish (ism, lavozim)..."
            style={{
              width: "100%", paddingLeft: "36px", paddingRight: "16px",
              paddingTop: "10px", paddingBottom: "10px",
              fontSize: "13.5px", borderRadius: "10px",
              border: "1px solid #E5E7EB", background: "#F5F7FA",
              color: "#111827", outline: "none",
            }}
          />
        </div>

        {showFilters && (
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Bo'lim", value: dept, options: departments, onChange: (v: string) => { setDept(v); setPage(1); } },
              { label: "Status", value: status, options: statuses, onChange: (v: string) => { setStatus(v as EmployeeStatus | "Hammasi"); setPage(1); } },
            ].map(({ label, value, options, onChange }) => (
              <div key={label}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "5px" }}>{label}</div>
                <select
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  style={{
                    padding: "7px 12px", fontSize: "13px", borderRadius: "8px",
                    border: "1px solid #E5E7EB", color: "#374151", background: "#fff", outline: "none",
                  }}
                >
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>
                <button onClick={() => toggleSort("name")} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "11px", fontWeight: 700 }}>
                  XODIM <ArrowUpDown size={11} />
                </button>
              </th>
              <th style={S.th}>LAVOZIMI</th>
              <th style={S.th}>BO'LIM</th>
              <th style={S.th}>STATUS</th>
              <th style={S.th}>
                <button onClick={() => toggleSort("score")} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "11px", fontWeight: 700 }}>
                  SAMARADORLIK <ArrowUpDown size={11} />
                </button>
              </th>
              <th style={S.th}>AMALLAR</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((emp, i) => (
              <tr
                key={emp.id}
                style={{
                  borderBottom: i < paginated.length - 1 ? "1px solid #F3F4F6" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #00B8A0, #009984)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "13px", fontWeight: 700,
                    }}>
                      {emp.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{emp.name}</div>
                      <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "1px" }}>{emp.experience} tajriba</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}>{emp.position}</td>
                <td style={S.td}>{emp.department}</td>
                <td style={S.td}>
                  <StatusBadge status={emp.status} />
                </td>
                <td style={S.td}>
                  <CircularProgress value={emp.score} size={44} strokeWidth={3.5} color="auto" textSize="text-[10px]" />
                </td>
                <td style={S.td}>
                  <Link
                    href={`/employees/${emp.id}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      fontSize: "13px", fontWeight: 600, color: "#00B8A0", textDecoration: "none",
                    }}
                  >
                    Ko'rish <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px", borderTop: "1px solid #F3F4F6",
        }}>
          <span style={{ fontSize: "12.5px", color: "#9CA3AF" }}>
            {filtered.length} ta natijadan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} ko'rsatilmoqda
          </span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={15} color="#6B7280" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: page === p ? "#00B8A0" : "transparent",
                  color: page === p ? "#fff" : "#6B7280",
                }}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span style={{ color: "#9CA3AF", fontSize: "13px" }}>...</span>
                <button onClick={() => setPage(totalPages)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#6B7280", fontSize: "13px" }}>
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={15} color="#6B7280" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
