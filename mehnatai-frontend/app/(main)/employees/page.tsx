"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import StatusBadge from "@/components/StatusBadge";
import { employeesApi, type Employee } from "@/lib/api";

const ITEMS_PER_PAGE = 8;

const STATUS_MAP: Record<string, string> = {
  yuqori: "YUQORI",
  orta: "O'RTA",
  rivojlanish: "RIVOJLANISH KERAK",
};

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
  td: { padding: "14px 20px", fontSize: "13.5px", color: "#374151" },
};

function Skeleton() {
  return (
    <tr>
      {Array(6).fill(0).map((_, i) => (
        <td key={i} style={S.td}>
          <div style={{
            height: 20, borderRadius: 6,
            background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeesApi.list({
        page,
        page_size: ITEMS_PER_PAGE,
        search: search || undefined,
        department: dept || undefined,
        status: status || undefined,
      });
      setEmployees(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, dept, status]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees, search]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Xodimlar ro'yxati</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            Jami {total} ta faol xodim
          </p>
        </div>
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
      </div>

      {/* Search + filters */}
      <div style={{ ...S.card, padding: "16px" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
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
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "5px" }}>BO'LIM</div>
              <select
                value={dept}
                onChange={e => { setDept(e.target.value); setPage(1); }}
                style={{ padding: "7px 12px", fontSize: "13px", borderRadius: "8px", border: "1px solid #E5E7EB", color: "#374151", background: "#fff", outline: "none" }}
              >
                <option value="">Hammasi</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sotuv">Sotuv</option>
                <option value="Marketing">Marketing</option>
                <option value="Moliya">Moliya</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "5px" }}>STATUS</div>
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
                style={{ padding: "7px 12px", fontSize: "13px", borderRadius: "8px", border: "1px solid #E5E7EB", color: "#374151", background: "#fff", outline: "none" }}
              >
                <option value="">Hammasi</option>
                <option value="yuqori">YUQORI</option>
                <option value="orta">O'RTA</option>
                <option value="rivojlanish">RIVOJLANISH KERAK</option>
              </select>
            </div>
            <button
              onClick={() => { setDept(""); setStatus(""); setSearch(""); setPage(1); }}
              style={{ alignSelf: "flex-end", padding: "7px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#EF4444", fontSize: "13px", cursor: "pointer" }}
            >
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}><div style={{ display: "flex", alignItems: "center", gap: 4 }}>XODIM <ArrowUpDown size={11} /></div></th>
              <th style={S.th}>LAVOZIMI</th>
              <th style={S.th}>BO'LIM</th>
              <th style={S.th}>STATUS</th>
              <th style={S.th}>SAMARADORLIK</th>
              <th style={S.th}>AMALLAR</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(ITEMS_PER_PAGE).fill(0).map((_, i) => <Skeleton key={i} />)
              : employees.map((emp, i) => (
                  <tr
                    key={emp.id}
                    style={{ borderBottom: i < employees.length - 1 ? "1px solid #F3F4F6" : "none" }}
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
                          {emp.avatar_initials}
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "1px" }}>
                            {emp.experience_years} yil tajriba
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>{emp.position}</td>
                    <td style={S.td}>{emp.department}</td>
                    <td style={S.td}>
                      <StatusBadge status={STATUS_MAP[emp.status] as "YUQORI" | "O'RTA" | "RIVOJLANISH KERAK"} />
                    </td>
                    <td style={S.td}>
                      <CircularProgress value={emp.usi_score} size={44} strokeWidth={3.5} color="auto" textSize="text-[10px]" />
                    </td>
                    <td style={S.td}>
                      <Link
                        href={`/employees/${emp.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#00B8A0", textDecoration: "none" }}
                      >
                        Ko'rish <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && employees.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
            Xodimlar topilmadi
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: "12.5px", color: "#9CA3AF" }}>
            {total} ta natijadan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} ko'rsatilmoqda
          </span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={15} color="#6B7280" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: "32px", height: "32px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", background: page === p ? "#00B8A0" : "transparent", color: page === p ? "#fff" : "#6B7280" }}>
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span style={{ color: "#9CA3AF", fontSize: "13px" }}>...</span>
                <button onClick={() => setPage(totalPages)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#6B7280", fontSize: "13px" }}>{totalPages}</button>
              </>
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={15} color="#6B7280" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
