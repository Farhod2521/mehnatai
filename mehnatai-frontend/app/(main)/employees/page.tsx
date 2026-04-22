"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import CircularProgress from "@/components/CircularProgress";
import StatusBadge from "@/components/StatusBadge";
import { employeesApi, type Employee, type EmployeeCreate } from "@/lib/api";

const ITEMS_PER_PAGE = 8;

const STATUS_MAP: Record<string, string> = {
  yuqori: "YUQORI",
  orta: "O'RTA",
  rivojlanish: "RIVOJLANISH KERAK",
};

const DEPARTMENTS = ["IT", "HR", "Sotuv", "Marketing", "Moliya", "Boshqaruv"];

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
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "13.5px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#111827",
    outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
  label: {
    fontSize: "11.5px",
    fontWeight: 600,
    color: "#6B7280",
    marginBottom: "5px",
    display: "block",
  } as React.CSSProperties,
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

const EMPTY_FORM: EmployeeCreate = {
  first_name: "", last_name: "", position: "",
  department: "IT", experience_years: 0,
  email: "", phone: "", hired_date: "", bio: "",
};

function AddEmployeeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<EmployeeCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof EmployeeCreate, val: string | number) =>
    setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.position) {
      setError("Ism, familiya va lavozim majburiy");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: EmployeeCreate = {
        ...form,
        email: form.email || undefined,
        phone: form.phone || undefined,
        hired_date: form.hired_date || undefined,
        bio: form.bio || undefined,
      };
      await employeesApi.create(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "560px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Yangi Xodim Qo'shish</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Ma'lumotlarni to'ldiring</div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={S.label}>Ism *</label>
              <input style={S.input} placeholder="Azizbek" value={form.first_name}
                onChange={e => set("first_name", e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Familiya *</label>
              <input style={S.input} placeholder="Fayzullaev" value={form.last_name}
                onChange={e => set("last_name", e.target.value)} />
            </div>
          </div>

          {/* Position + Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={S.label}>Lavozim *</label>
              <input style={S.input} placeholder="Senior Developer" value={form.position}
                onChange={e => set("position", e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Bo'lim *</label>
              <select style={S.input} value={form.department}
                onChange={e => set("department", e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Experience + Hired date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={S.label}>Tajriba (yil)</label>
              <input style={S.input} type="number" min={0} max={50} placeholder="3"
                value={form.experience_years || ""}
                onChange={e => set("experience_years", Number(e.target.value))} />
            </div>
            <div>
              <label style={S.label}>Ishga kirgan sana</label>
              <input style={S.input} type="date" value={form.hired_date || ""}
                onChange={e => set("hired_date", e.target.value)} />
            </div>
          </div>

          {/* Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" placeholder="azizbek@company.uz"
                value={form.email || ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Telefon</label>
              <input style={S.input} placeholder="+998 90 123 45 67"
                value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={S.label}>Qo'shimcha ma'lumot</label>
            <textarea
              style={{ ...S.input, resize: "none" as const, minHeight: "70px" }}
              placeholder="Xodim haqida qisqacha..."
              value={form.bio || ""}
              onChange={e => set("bio", e.target.value)}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#FEE2E2", color: "#DC2626", fontSize: "13px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: saving ? "#9CA3AF" : "linear-gradient(135deg,#00B8A0,#009984)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(0,184,160,0.3)" }}>
              {saving ? "Saqlanmoqda..." : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

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

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { fetchEmployees(); }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Xodimlar ro'yxati</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "3px" }}>
            Jami {total} ta faol xodim
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
            onClick={() => setShowAdd(true)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg,#00B8A0,#009984)", color: "#fff",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,184,160,0.3)",
            }}
          >
            <Plus size={14} /> Xodim qo'shish
          </button>
        </div>
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
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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
