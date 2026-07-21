import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import Pagination from "../../components/common/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Receipt,
  Calendar,
  User,
  PlusCircle,
  Search,
  Download,
  RotateCcw,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Save,
  Mail,
  Shield,
  Eye,
  TrendingUp,
} from "lucide-react";

// Animated Counter Component
function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Custom Glassmorphic Select Component for Time Filters
function CustomSelect({ options, value, onChange, label, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="ad-custom-select-wrapper"
      ref={containerRef}
      style={{ minWidth: 160 }}
    >
      {label && <label className="ad-custom-select-label">{label}</label>}
      <button
        type="button"
        className={`ad-custom-select-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: "8px 12px", borderRadius: "10px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflow: "hidden",
          }}
        >
          {selectedOption?.icon ? (
            <selectedOption.icon
              size={15}
              style={{ color: "var(--accent)", flexShrink: 0 }}
            />
          ) : Icon ? (
            <Icon size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
          ) : null}
          <span className="ad-custom-select-value">
            {selectedOption ? selectedOption.label : ""}
          </span>
        </div>
        <ChevronDown
          size={15}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            color: isOpen ? "var(--accent)" : "var(--text2)",
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ad-custom-select-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  className={`ad-custom-select-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {OptionIcon && (
                      <OptionIcon
                        size={14}
                        style={{
                          color: isSelected ? "var(--accent)" : "var(--text3)",
                          transition: "color 0.2s",
                        }}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      size={13}
                      style={{ color: "var(--accent)" }}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminSales({ subUsers = [] }) {
  const { adminUserData: userData } = useAuth();
  const { state } = useApp();
  const toast = useToast();
  const isEn = state.language === "en";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [timeRange, setTimeRange] = useState("all");
  const [salesSearchQuery, setSalesSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Sale Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  const fetchSales = async () => {
    if (!userData?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "sales"),
        where("createdBy", "==", userData.uid),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSales(list);
    } catch (err) {
      console.error("Error fetching sales:", err);
      toast(
        isEn ? "Error loading sales data" : "خطأ في تحميل المبيعات",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [userData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, salesSearchQuery]);

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomer)
      return toast(
        isEn ? "Please select a customer" : "يرجى تحديد العميل",
        "error",
      );
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast(
        isEn ? "Please enter a valid amount" : "يرجى إدخال قيمة صحيحة",
        "error",
      );

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "sales"), {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.ownerName || selectedCustomer.email,
        customerEmail: selectedCustomer.email,
        customerType: selectedCustomer.role || "user",
        amountEGP: Number(amount),
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || "",
      });
      toast(
        isEn ? "Sale added successfully ✅" : "تم إضافة المبيعات بنجاح ✅",
        "success",
      );
      setIsAddModalOpen(false);
      setSelectedCustomer(null);
      setAmount("");
      setCustomerSearchQuery("");
      fetchSales();
    } catch (err) {
      console.error("Error adding sale:", err);
      toast(
        isEn ? "Error adding sale record" : "حدث خطأ أثناء إضافة المبيعات",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString(
      isEn ? "en-US" : "ar-EG",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const filteredCustomers = subUsers.filter((u) => {
    if (customerSearchQuery) {
      const q = customerSearchQuery.toLowerCase();
      const name = (u.ownerName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  const getFilteredSales = () => {
    let result = [...sales];

    // Filter by Time Range
    if (timeRange !== "all") {
      const now = new Date();
      result = result.filter((s) => {
        if (!s.createdAt?.seconds) return false;
        const date = new Date(s.createdAt.seconds * 1000);
        if (timeRange === "today")
          return date.toDateString() === now.toDateString();
        if (timeRange === "yesterday") {
          const yest = new Date();
          yest.setDate(now.getDate() - 1);
          return date.toDateString() === yest.toDateString();
        }
        if (timeRange === "last7") {
          const last7 = new Date();
          last7.setDate(now.getDate() - 7);
          return date >= last7;
        }
        if (timeRange === "thisMonth") {
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    // Filter by Search Query
    if (salesSearchQuery.trim()) {
      const q = salesSearchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const name = (s.customerName || "").toLowerCase();
        const email = (s.customerEmail || "").toLowerCase();
        const amt = String(s.amountEGP || "");
        return name.includes(q) || email.includes(q) || amt.includes(q);
      });
    }

    return result;
  };

  const filteredSales = getFilteredSales();
  const totalSalesEGP = filteredSales.reduce(
    (acc, curr) => acc + (curr.amountEGP || 0),
    0,
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const exportSalesCSV = () => {
    if (!filteredSales.length)
      return toast(
        isEn ? "No sales data to export" : "لا توجد بيانات للتصدير",
        "error",
      );
    const headers = [
      isEn ? "Date" : "التاريخ",
      isEn ? "Customer Name" : "اسم العميل",
      isEn ? "Email" : "البريد الإلكتروني",
      isEn ? "Amount (EGP)" : "القيمة (ج.م)",
    ];
    const rows = filteredSales.map((s) => [
      formatDate(s.createdAt),
      `"${s.customerName || ""}"`,
      `"${s.customerEmail || ""}"`,
      s.amountEGP || 0,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sales_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(
      isEn ? "Sales exported successfully ✅" : "تم تصدير المبيعات بنجاح ✅",
      "success",
    );
  };

  return (
    <motion.div
      className="ad-sales-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir={isEn ? "ltr" : "rtl"}
      style={{
        textAlign: isEn ? "left" : "right",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        paddingBottom: "32px",
      }}
    >
      {/* Stats Row - Professional Cards with Animated Counter */}
      <div className="ad-sales-stats-row">
        <div className="ad-stat-card green-card">
          <div className="ad-stat-icon-wrapper green">
            <DollarSign size={20} />
          </div>
          <div className="ad-stat-value">
            <AnimatedCounter value={totalSalesEGP} />{" "}
            <span style={{ fontSize: 13, color: "var(--green)" }}>
              {isEn ? "EGP" : "ج.م"}
            </span>
          </div>
          <div className="ad-stat-label">
            {isEn ? "Total Revenue" : "إجمالي المبيعات"}
          </div>
        </div>

        <div className="ad-stat-card blue-card">
          <div className="ad-stat-icon-wrapper blue">
            <Receipt size={20} />
          </div>
          <div className="ad-stat-value">
            <AnimatedCounter value={filteredSales.length} />
          </div>
          <div className="ad-stat-label">
            {isEn ? "Transactions Count" : "عدد المعاملات"}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="ad-table-card" style={{ overflow: "visible" }}>
        {/* Card Header Top Row: Title & Action Buttons */}
        <div
          className="ad-card-header"
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            borderBottom: "1px solid var(--line)",
            flexWrap: "wrap",
          }}
        >
          <div className="ad-card-title" style={{ fontSize: 16, fontWeight: 800 }}>
            <TrendingUp size={20} style={{ color: "var(--accent)" }} />
            <span>{isEn ? "Brand Sales Log" : "سجل مبيعات البراند"}</span>
            <span className="ad-card-count">{filteredSales.length}</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Export CSV Button */}
            <button
              className="btn btn-sm"
              onClick={exportSalesCSV}
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "var(--green)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Download size={15} />
              <span>{isEn ? "Export" : "تصدير"}</span>
            </button>

            {/* Add Sale Button */}
            <button
              className="btn btn-sm"
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, var(--accent), #2563eb)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
              }}
            >
              <PlusCircle size={16} />
              <span>{isEn ? "Add Sale" : "إضافة مبيعات"}</span>
            </button>
          </div>
        </div>

        {/* Dedicated Filter & Search Sub-Bar */}
        <div
          className="ad-filter-bar"
          style={{
            padding: "14px 24px",
            background: "rgba(15, 23, 42, 0.4)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Search Box - Fluid */}
          <div
            className="ad-search-box"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              flex: "1 1 260px",
              minWidth: 200,
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                [isEn ? "left" : "right"]: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text3)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder={isEn ? "Search sales..." : "بحث في المبيعات..."}
              value={salesSearchQuery}
              onChange={(e) => setSalesSearchQuery(e.target.value)}
              dir={isEn ? "ltr" : "rtl"}
              style={{
                width: "100%",
                padding: "9px 14px",
                paddingLeft: isEn ? 38 : 14,
                paddingRight: isEn ? 14 : 38,
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "rgba(15, 23, 42, 0.7)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
            />
            {salesSearchQuery && (
              <button
                type="button"
                onClick={() => setSalesSearchQuery("")}
                style={{
                  position: "absolute",
                  [isEn ? "right" : "left"]: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right Controls: Filter Dropdown & Reset Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <CustomSelect
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
              icon={Calendar}
              options={[
                {
                  value: "all",
                  label: isEn ? "All Time" : "كل الأوقات",
                  icon: Calendar,
                },
                {
                  value: "today",
                  label: isEn ? "Today" : "اليوم",
                  icon: Clock,
                },
                {
                  value: "yesterday",
                  label: isEn ? "Yesterday" : "أمس",
                  icon: Clock,
                },
                {
                  value: "last7",
                  label: isEn ? "Last 7 Days" : "آخر 7 أيام",
                  icon: Calendar,
                },
                {
                  value: "thisMonth",
                  label: isEn ? "This Month" : "هذا الشهر",
                  icon: Calendar,
                },
              ]}
            />

            {(timeRange !== "all" || salesSearchQuery) && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  setTimeRange("all");
                  setSalesSearchQuery("");
                }}
                title={isEn ? "Reset Filters" : "إعادة ضبط"}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "var(--red)",
                  padding: "9px 14px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Table Wrapper (Always RTL inside for parity, explicit horizontal scrolling) */}
        <div
          className="ad-table-wrapper"
          dir="rtl"
          style={{
            overflowX: "auto",
            width: "100%",
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loading ? (
            <div className="ad-empty" style={{ padding: "60px 20px" }}>
              <div
                className="ad-submit-spinner"
                style={{
                  width: 28,
                  height: 28,
                  margin: "0 auto 16px auto",
                  borderWidth: 3,
                }}
              />
              <div
                style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}
              >
                {isEn
                  ? "Loading sales records..."
                  : "جاري تحميل بيانات المبيعات..."}
              </div>
            </div>
          ) : (
            <table
              className="ad-table"
              dir="rtl"
              style={{ width: "100%", minWidth: 650 }}
            >
              <thead>
                <tr>
                  <th style={{ minWidth: 140, textAlign: "center" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <Calendar size={14} />
                      <span>{isEn ? "Date" : "التاريخ"}</span>
                    </div>
                  </th>
                  <th style={{ minWidth: 220, textAlign: "center" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <User size={14} />
                      <span>{isEn ? "Customer" : "العميل"}</span>
                    </div>
                  </th>
                  <th style={{ minWidth: 160, textAlign: "center" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <DollarSign size={14} />
                      <span>{isEn ? "Amount (EGP)" : "القيمة (ج.م)"}</span>
                    </div>
                  </th>
                  <th style={{ minWidth: 100, textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <SlidersHorizontal size={14} />
                      <span>{isEn ? "Actions" : "الإجراءات"}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="sa-table-row-hover">
                    <td style={{ textAlign: "center" }}>
                      <span
                        className="ad-date"
                        style={{ fontFamily: "var(--font)" }}
                      >
                        {formatDate(sale.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="ad-user-name" style={{ justifyContent: "center", margin: "0 auto" }}>
                        <div
                          className="ad-user-avatar"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--green), #059669)",
                          }}
                        >
                          {(sale.customerName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column", textAlign: "right" }}
                        >
                          <span style={{ fontWeight: 700, color: "#fff" }}>
                            {sale.customerName || "—"}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text3)",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            {sale.customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <strong style={{ color: "var(--green)", fontSize: 14 }}>
                        {sale.amountEGP?.toLocaleString()}{" "}
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text2)",
                            fontWeight: 500,
                          }}
                        >
                          {isEn ? "EGP" : "ج.م"}
                        </span>
                      </strong>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <motion.button
                        className="sa-action-btn view"
                        onClick={() => {
                          const customer = subUsers.find(
                            (u) => u.id === sale.customerId,
                          );
                          setViewingProfile({
                            sale,
                            customer: customer || sale,
                          });
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={isEn ? "View Profile" : "عرض البروفايل"}
                      >
                        <Eye size={15} />
                      </motion.button>
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      <div
                        className="ad-empty"
                        style={{ padding: "60px 20px" }}
                      >
                        <div className="ad-empty-icon">
                          <Receipt size={42} style={{ opacity: 0.4 }} />
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            marginTop: 10,
                            color: "var(--text)",
                          }}
                        >
                          {isEn
                            ? "No sales records found"
                            : "لا توجد مبيعات مسجلة"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text3)",
                            marginTop: 4,
                          }}
                        >
                          {isEn
                            ? "Try adjusting your search query or time filters"
                            : "عدّل خيارات البحث أو التصفية الزمانية"}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Sale Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            className="sa-modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              dir={isEn ? "ltr" : "rtl"}
              style={{ maxWidth: 500, textAlign: isEn ? "left" : "right" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="sa-modal-header">
                <h2
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <PlusCircle size={20} style={{ color: "var(--accent)" }} />
                  <span>{isEn ? "Add New Sale" : "إضافة مبيعات جديدة"}</span>
                </h2>
                <button
                  className="btn btn-sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="sa-modal-body">
                <form
                  className="ad-form-body"
                  onSubmit={handleAddSale}
                  style={{ padding: 0 }}
                >
                  <div className="field">
                    <label className="field-label">
                      {isEn ? "Search Customer" : "البحث عن عميل"}
                    </label>
                    <div className="ad-search-box" style={{ width: "100%" }}>
                      <Search size={14} />
                      <input
                        type="text"
                        className="field-input"
                        placeholder={
                          isEn
                            ? "Search by name or email..."
                            : "ابحث بالاسم أو البريد..."
                        }
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        dir={isEn ? "ltr" : "rtl"}
                        style={{
                          textAlign: isEn ? "left" : "right",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="sa-customers-list"
                    style={{
                      maxHeight: 160,
                      overflowY: "auto",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: 12,
                      margin: "12px 0 18px 0",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {filteredCustomers.length === 0 ? (
                      <div
                        style={{
                          padding: 16,
                          textAlign: "center",
                          color: "var(--text3)",
                          fontSize: 13,
                        }}
                      >
                        {isEn ? "No customer results found" : "لا يوجد نتائج"}
                      </div>
                    ) : (
                      filteredCustomers.map((u) => {
                        const isSelected = selectedCustomer?.id === u.id;
                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedCustomer(u)}
                            style={{
                              padding: "10px 14px",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              background: isSelected
                                ? "rgba(59, 130, 246, 0.15)"
                                : "transparent",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div
                              className="ad-user-avatar"
                              style={{
                                width: 32,
                                height: 32,
                                fontSize: 12,
                                background: "var(--accent)",
                              }}
                            >
                              {(u.ownerName || u.email || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                {u.ownerName || "—"}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--text3)",
                                  fontFamily: "var(--mono)",
                                }}
                              >
                                {u.email}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2
                                size={16}
                                style={{ color: "var(--accent)" }}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label">
                      {isEn ? "Amount (in EGP)" : "القيمة (بالجنيه المصري)"}
                    </label>
                    <input
                      type="number"
                      className="field-input"
                      placeholder={isEn ? "e.g. 5000" : "مثال: 5000"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      dir={isEn ? "ltr" : "rtl"}
                      style={{ textAlign: isEn ? "left" : "right" }}
                    />
                  </div>

                  <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                    <button
                      type="submit"
                      className="btn"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        background:
                          "linear-gradient(135deg, var(--accent), #2563eb)",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Save size={16} />
                      <span>
                        {isSubmitting
                          ? isEn
                            ? "Saving..."
                            : "جاري الحفظ..."
                          : isEn
                            ? "Save Sale Record"
                            : "حفظ المبيعات"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {viewingProfile && (
          <div
            className="sa-modal-overlay"
            onClick={() => setViewingProfile(null)}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              dir={isEn ? "ltr" : "rtl"}
              style={{ maxWidth: 700, textAlign: isEn ? "left" : "right" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="sa-modal-header">
                <h2
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <User size={20} style={{ color: "var(--accent)" }} />
                  <span>{isEn ? "Customer Profile" : "بروفايل العميل"}</span>
                </h2>
                <button
                  className="btn btn-sm"
                  onClick={() => setViewingProfile(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="sa-modal-body"
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--line)",
                    padding: 20,
                    borderRadius: 14,
                  }}
                >
                  <div
                    className="ad-user-avatar"
                    style={{
                      width: 56,
                      height: 56,
                      fontSize: 22,
                      background:
                        "linear-gradient(135deg, var(--green), #059669)",
                    }}
                  >
                    {(
                      viewingProfile.customer?.ownerName ||
                      viewingProfile.customer?.customerName ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {viewingProfile.customer?.ownerName ||
                        viewingProfile.customer?.customerName ||
                        "—"}
                    </div>
                    <div
                      style={{
                        color: "var(--text2)",
                        fontSize: 13,
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {viewingProfile.customer?.email}
                    </div>
                  </div>
                </div>

                <div
                  className="sa-table-card"
                  style={{
                    background: "rgba(15, 23, 42, 0.4)",
                    borderRadius: 14,
                  }}
                >
                  <div
                    className="sa-card-header"
                    style={{ padding: "12px 18px" }}
                  >
                    <div className="sa-card-title" style={{ fontSize: 14 }}>
                      <Receipt size={16} style={{ color: "var(--green)" }} />
                      <span>
                        {isEn ? "Previous Transactions" : "المعاملات السابقة"}
                      </span>
                    </div>
                  </div>
                  <div
                    className="sa-table-wrapper"
                    dir="rtl"
                    style={{ maxHeight: 280, overflowY: "auto" }}
                  >
                    <table
                      className="sa-table"
                      dir="rtl"
                      style={{ fontSize: 13, width: "100%" }}
                    >
                      <thead>
                        <tr>
                          <th style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <Calendar size={13} />
                              <span>{isEn ? "Date" : "التاريخ"}</span>
                            </div>
                          </th>
                          <th style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <DollarSign size={13} />
                              <span>{isEn ? "Amount" : "القيمة"}</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales
                          .filter(
                            (s) =>
                              s.customerId === viewingProfile.customer?.id ||
                              s.customerEmail ===
                                viewingProfile.customer?.email,
                          )
                          .map((s) => (
                            <tr key={s.id}>
                              <td style={{ textAlign: "center" }}>
                                <span className="ad-date">
                                  {formatDate(s.createdAt)}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <strong style={{ color: "var(--green)" }}>
                                  {s.amountEGP?.toLocaleString()}{" "}
                                  {isEn ? "EGP" : "ج.م"}
                                </strong>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
