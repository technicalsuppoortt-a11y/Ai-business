import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import {
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  Search,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Calendar,
  Users,
  Check,
  Download,
  User,
  ShieldCheck,
  Mail,
  X
} from 'lucide-react';

function AnimatedCounter({ value, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function CustomFilterSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];
  const Icon = selectedOption.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  return (
    <div className="sa-custom-select-container" onClick={(e) => e.stopPropagation()}>
      <button 
        type="button"
        className={`sa-custom-select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ minWidth: 150 }}
      >
        <span className="sa-custom-select-trigger-content">
          {Icon && <Icon size={14} className="sa-custom-select-icon" />}
          <span>{selectedOption.label}</span>
        </span>
        <ChevronDown 
          size={14} 
          className="sa-custom-select-chevron" 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}
        />
      </button>

      {isOpen && (
        <div className="sa-custom-select-dropdown" style={{ minWidth: 170 }}>
          {options.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                className={`sa-custom-select-option ${opt.value === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {OptIcon && <OptIcon size={12} />}
                  <span>{opt.label}</span>
                </span>
                {opt.value === value && <Check size={12} className="sa-custom-select-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminSales({ allUsers }) {
  const { superAdminUserData: userData } = useAuth();
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Sale Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerType, setCustomerType] = useState('admin'); // 'admin' (Brand) or 'user' (Regular)
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  // Filters & Advanced Search States
  const [timeRange, setTimeRange] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'admin' | 'user'
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, typeFilter, searchQuery, minAmount, maxAmount]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(list);
    } catch (err) {
      console.error('Error fetching sales:', err);
      toast('خطأ في تحميل المبيعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return toast('يرجى تحديد العميل', 'error');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return toast('يرجى إدخال قيمة صحيحة', 'error');

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'sales'), {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.brandName || selectedCustomer.ownerName || selectedCustomer.email,
        customerEmail: selectedCustomer.email,
        customerType: selectedCustomer.role, // 'admin' or 'user'
        amountEGP: Number(amount),
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || 'superadmin'
      });
      toast('تم إضافة المبيعات بنجاح ✅', 'success');
      setIsAddModalOpen(false);
      setSelectedCustomer(null);
      setAmount('');
      setModalSearchQuery('');
      fetchSales();
    } catch (err) {
      console.error('Error adding sale:', err);
      toast('حدث خطأ أثناء إضافة المبيعات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Filter customers for the Add Modal
  const filteredCustomers = allUsers.filter(u => {
    if (u.role !== customerType) return false;
    if (modalSearchQuery) {
      const q = modalSearchQuery.toLowerCase();
      const name = (u.brandName || u.ownerName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  // Filtered Sales Logic
  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(s => {
      // 1. Time range
      if (timeRange !== 'all') {
        if (!s.createdAt?.seconds) return false;
        const date = new Date(s.createdAt.seconds * 1000);
        
        if (timeRange === 'today') {
          if (date.toDateString() !== now.toDateString()) return false;
        } else if (timeRange === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          if (date.toDateString() !== yesterday.toDateString()) return false;
        } else if (timeRange === 'last7') {
          const last7 = new Date();
          last7.setDate(now.getDate() - 7);
          if (date < last7) return false;
        } else if (timeRange === 'thisMonth') {
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // 2. Customer Type
      if (typeFilter !== 'all') {
        if (s.customerType !== typeFilter) return false;
      }

      // 3. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (s.customerName || '').toLowerCase();
        const email = (s.customerEmail || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }

      // 4. Min Amount
      if (minAmount && (s.amountEGP || 0) < Number(minAmount)) return false;

      // 5. Max Amount
      if (maxAmount && (s.amountEGP || 0) > Number(maxAmount)) return false;

      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // Stats calculation
  const totalSalesEGP = filteredSales.reduce((acc, curr) => acc + (curr.amountEGP || 0), 0);
  const totalTransactions = filteredSales.length;

  // Pagination Chunking
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);

  const handleResetFilters = () => {
    setTimeRange('all');
    setTypeFilter('all');
    setSearchQuery('');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Arabic compatibility
    csvContent += "تاريخ المعاملة,اسم العميل,البريد الإلكتروني,نوع العميل,القيمة (ج.م)\n";

    filteredSales.forEach((s) => {
      const date = formatDate(s.createdAt);
      const name = s.customerName || "—";
      const email = s.customerEmail || "—";
      const type = s.customerType === "admin" ? "براند" : "عميل عادي";
      const amount = s.amountEGP || 0;

      csvContent += `"${date}","${name}","${email}","${type}","${amount}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter option arrays
  const timeRangeOptions = [
    { value: "all", label: "كل الأوقات", icon: Calendar },
    { value: "today", label: "اليوم", icon: Calendar },
    { value: "yesterday", label: "أمس", icon: Calendar },
    { value: "last7", label: "آخر 7 أيام", icon: Calendar },
    { value: "thisMonth", label: "هذا الشهر", icon: Calendar }
  ];

  const typeFilterOptions = [
    { value: "all", label: "كل أنواع العملاء", icon: Users },
    { value: "admin", label: "براندات (أدمن)", icon: ShieldCheck },
    { value: "user", label: "عملاء عاديين", icon: User }
  ];

  const hasActiveFilters = timeRange !== 'all' || typeFilter !== 'all' || searchQuery !== '' || minAmount !== '' || maxAmount !== '';

  return (
    <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
      
      {/* Stats Row */}
      <div className="sa-stats sa-stats-two-columns">
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
          <div className="sa-stat-value">
            <AnimatedCounter value={totalSalesEGP} /> ج.م
          </div>
          <div className="sa-stat-label">إجمالي المبيعات</div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}>
            <FileText size={24} />
          </div>
          <div className="sa-stat-value">
            <AnimatedCounter value={totalTransactions} />
          </div>
          <div className="sa-stat-label">عدد المعاملات</div>
        </div>
      </div>

      <div className="sa-table-card">
        {/* Header section with title and actions */}
        <div className="sa-card-header" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 12 }}>
            <div className="sa-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={20} style={{ color: "var(--accent)" }} />
              <span>سجل المبيعات</span>
              <span className="sa-card-count">{filteredSales.length}</span>
            </div>

            <div className="sa-filter-group" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="sa-add-prod-btn" 
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>إضافة مبيعات</span>
              </button>

              <button
                type="button"
                className="sa-export-btn"
                onClick={handleExportCSV}
                title="تصدير المبيعات إلى CSV"
              >
                <Download size={16} />
                <span>تصدير CSV</span>
              </button>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  className="sa-reset-btn"
                  onClick={handleResetFilters}
                  title="إعادة تعيين الفلاتر"
                >
                  <RotateCcw size={14} />
                  <span>إعادة تعيين</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtering and Advanced Search Controls */}
          <div className="sa-filters-bar">
            <div className="sa-filters-left">
              {/* Time Range Filter */}
              <CustomFilterSelect
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
              />

              {/* Customer Type Filter */}
              <CustomFilterSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeFilterOptions}
              />
            </div>

            {/* Advanced Search Inputs */}
            <div className="sa-filters-right">
              <div className="sa-search-box" style={{ margin: 0 }}>
                <input
                  type="text"
                  placeholder="بحث باسم العميل أو البريد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingRight: 32 }}
                />
                <Search size={14} style={{ position: "absolute", right: 12, color: "var(--text3)" }} />
              </div>

              <div className="sa-amount-range-inputs">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="field-input"
                  style={{ height: 36, padding: '0 8px', fontSize: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>إلى</span>
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="field-input"
                  style={{ height: 36, padding: '0 8px', fontSize: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table Section */}
        <div className="sa-table-wrapper">
          {loading ? (
             <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
               <div className="sa-submit-spinner" style={{ margin: "20px auto" }} />
               <span>جاري التحميل...</span>
             </div>
          ) : (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>العميل</th>
                  <th>النوع</th>
                  <th>القيمة (ج.م)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map(sale => (
                  <tr key={sale.id} onClick={() => {
                    const customer = allUsers.find(u => u.id === sale.customerId);
                    setViewingProfile({ sale, customer: customer || sale });
                  }} style={{ cursor: 'pointer' }} className="sa-table-row-hover">
                    <td><span className="sa-date">{formatDate(sale.createdAt)}</span></td>
                    <td>
                      <div className="sa-brand-name">
                        <div className="sa-brand-avatar" style={{ background: sale.customerType === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                          {(sale.customerName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span>{sale.customerName || '—'}</span>
                           <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sale.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-role-badge ${sale.customerType === 'admin' ? 'sa-role-admin' : 'sa-role-user'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {sale.customerType === 'admin' ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>براند</span>
                          </>
                        ) : (
                          <>
                            <User size={12} />
                            <span>عميل عادي</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td><strong style={{ color: 'var(--green)' }}>{sale.amountEGP?.toLocaleString()}</strong></td>
                  </tr>
                ))}
                
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: "40px 0" }}>
                      <div className="sa-empty" style={{ background: "none", boxShadow: "none", padding: 0 }}>
                        <div className="sa-empty-icon" style={{ background: "none", fontSize: "inherit", padding: 0 }}>
                          <FolderOpen size={48} style={{ color: "var(--text3)", opacity: 0.6 }} />
                        </div>
                        <div style={{ marginTop: 12, color: "var(--text2)", fontWeight: 700 }}>
                          لا توجد مبيعات مسجلة تطابق خيارات البحث الحالية
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Sale Modal */}
      {isAddModalOpen && (
        <div className="sa-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="sa-modal-content sa-sale-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="sa-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <Plus size={16} style={{ color: "var(--accent)" }} />
                <span>إضافة مبيعات جديدة</span>
              </h2>
              <button className="btn btn-sm" onClick={() => setIsAddModalOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="sa-modal-body">
              <form onSubmit={handleAddSale}>
                <div className="sa-form-section">
                  <div className="sa-form-section-title">نوع العميل</div>
                  <div className="sa-role-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div 
                      className={`sa-role-option ${customerType === 'admin' ? 'active' : ''}`} 
                      onClick={() => { setCustomerType('admin'); setSelectedCustomer(null); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <ShieldCheck size={14} />
                      <span>براند</span>
                    </div>
                    <div 
                      className={`sa-role-option ${customerType === 'user' ? 'active' : ''}`} 
                      onClick={() => { setCustomerType('user'); setSelectedCustomer(null); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <User size={14} />
                      <span>عميل عادي</span>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">البحث عن عميل</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="field-input" 
                      placeholder="ابحث بالاسم أو البريد..." 
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      style={{ paddingRight: 36, width: '100%' }}
                    />
                    <Search size={14} style={{ position: 'absolute', right: 12, color: 'var(--text3)' }} />
                  </div>
                </div>

                <div className="sa-customers-list" style={{ maxHeight: 150, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {filteredCustomers.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>لا يوجد نتائج</div>
                  ) : (
                    filteredCustomers.map(u => (
                      <div 
                        key={u.id} 
                        onClick={() => setSelectedCustomer(u)}
                        style={{ 
                          padding: '10px 12px', 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          background: selectedCustomer?.id === u.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent'
                        }}
                      >
                         <div className="sa-brand-avatar" style={{ width: 30, height: 30, fontSize: 12, background: customerType === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                           {(u.brandName || u.ownerName || u.email || '?').charAt(0).toUpperCase()}
                         </div>
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontSize: 13, color: '#fff' }}>{u.brandName || u.ownerName || '—'}</span>
                           <span style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</span>
                         </div>
                         {selectedCustomer?.id === u.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </div>
                    ))
                  )}
                </div>

                <div className="field">
                  <label className="field-label">القيمة (بالجنيه المصري)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      className="field-input" 
                      placeholder="مثال: 5000" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      style={{ paddingRight: 36, width: '100%' }}
                    />
                    <DollarSign size={14} style={{ position: 'absolute', right: 12, color: 'var(--text3)' }} />
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                  <button type="submit" className="sa-submit-btn" disabled={isSubmitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Check size={16} />
                    <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ المبيعات'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      {viewingProfile && (
        <div className="sa-modal-overlay" onClick={() => setViewingProfile(null)}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="sa-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <User size={18} style={{ color: "var(--accent)" }} />
                <span>بروفايل العميل</span>
              </h2>
              <button className="btn btn-sm" onClick={() => setViewingProfile(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="sa-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Customer Info */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <div className="sa-brand-avatar" style={{ width: 60, height: 60, fontSize: 24, background: viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                  {(viewingProfile.customer?.brandName || viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {viewingProfile.customer?.brandName || viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '—'}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 14 }}>{viewingProfile.customer?.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`sa-role-badge ${viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin' ? 'sa-role-admin' : 'sa-role-user'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin' ? (
                        <>
                          <ShieldCheck size={12} />
                          <span>براند</span>
                        </>
                      ) : (
                        <>
                          <User size={12} />
                          <span>عميل عادي</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid for Transactions and Customers (if Brand) */}
              <div className="sa-grid" style={{ gridTemplateColumns: (viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin') ? '1fr 1fr' : '1fr', gap: 20 }}>
                
                {/* Transactions History */}
                <div className="sa-table-card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="sa-card-header" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                    <div className="sa-card-title" style={{ fontSize: 14 }}>المعاملات السابقة</div>
                  </div>
                  <div className="sa-table-wrapper" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    <table className="sa-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>التاريخ</th>
                          <th>القيمة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.filter(s => s.customerId === viewingProfile.customer?.id || s.customerEmail === viewingProfile.customer?.email).map(s => (
                          <tr key={s.id}>
                            <td>{formatDate(s.createdAt)}</td>
                            <td><strong style={{ color: 'var(--green)' }}>{s.amountEGP?.toLocaleString()} ج.م</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Their Customers (if Admin/Brand) */}
                {(viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin') && (
                  <div className="sa-table-card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="sa-card-header" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={14} style={{ color: 'var(--accent)' }} />
                      <div className="sa-card-title" style={{ fontSize: 14 }}>العملاء التابعين</div>
                    </div>
                    <div className="sa-table-wrapper" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <table className="sa-table" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>الاسم</th>
                            <th>البريد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.filter(u => u.role === 'user' && (u.createdBy === viewingProfile.customer?.id || u.brandName === viewingProfile.customer?.brandName)).map(u => (
                            <tr key={u.id}>
                              <td>{u.ownerName || '—'}</td>
                              <td>{u.email}</td>
                            </tr>
                          ))}
                          {allUsers.filter(u => u.role === 'user' && (u.createdBy === viewingProfile.customer?.id || u.brandName === viewingProfile.customer?.brandName)).length === 0 && (
                            <tr>
                              <td colSpan="2" style={{ padding: 20 }}>
                                <div className="sa-empty" style={{ background: "none", boxShadow: "none", padding: 0 }}>
                                  <div className="sa-empty-icon" style={{ background: "none", fontSize: "inherit", padding: 0 }}>
                                    <FolderOpen size={36} style={{ color: "var(--text3)", opacity: 0.6 }} />
                                  </div>
                                  <div style={{ marginTop: 8, color: "var(--text2)", fontSize: 12 }}>لا يوجد عملاء تابعين</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
