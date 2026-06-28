import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminSales({ allUsers }) {
  const { superAdminUserData: userData } = useAuth();
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Sale Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerType, setCustomerType] = useState('admin'); // 'admin' (Brand) or 'user' (Regular)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  // Time Range Filter
  const [timeRange, setTimeRange] = useState('all');

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
      setSearchQuery('');
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
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (u.brandName || u.ownerName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  // Derived Filtered Sales
  const getFilteredSales = () => {
    if (timeRange === 'all') return sales;
    const now = new Date();
    return sales.filter(s => {
      if (!s.createdAt?.seconds) return false;
      const date = new Date(s.createdAt.seconds * 1000);
      
      if (timeRange === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (timeRange === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
      }
      if (timeRange === 'last7') {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        return date >= last7;
      }
      if (timeRange === 'thisMonth') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // Calculate stats
  const totalSalesEGP = filteredSales.reduce((acc, curr) => acc + (curr.amountEGP || 0), 0);
  const totalTransactions = filteredSales.length;

  return (
    <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
      
      {/* Stats Row */}
      <div className="sa-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
        <div className="sa-stat-card">
          <div className="sa-stat-icon">💰</div>
          <div className="sa-stat-value">{totalSalesEGP.toLocaleString()} ج.م</div>
          <div className="sa-stat-label">إجمالي المبيعات</div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon">📄</div>
          <div className="sa-stat-value">{totalTransactions}</div>
          <div className="sa-stat-label">عدد المعاملات</div>
        </div>
      </div>

      <div className="sa-table-card">
        <div className="sa-card-header">
          <div className="sa-card-title">
            💰 سجل المبيعات
            <span className="sa-card-count">{filteredSales.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="sa-filter-select">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="all">كل الأوقات</option>
                <option value="today">اليوم</option>
                <option value="yesterday">أمس</option>
                <option value="last7">آخر 7 أيام</option>
                <option value="thisMonth">هذا الشهر</option>
              </select>
            </div>
            <button className="btn" onClick={() => setIsAddModalOpen(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}>
              ➕ إضافة مبيعات
            </button>
          </div>
        </div>
        <div className="sa-table-wrapper">
          {loading ? (
             <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>جاري التحميل...</div>
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
                {filteredSales.map(sale => (
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
                      <span className={`sa-role-badge ${sale.customerType === 'admin' ? 'sa-role-admin' : 'sa-role-user'}`}>
                        {sale.customerType === 'admin' ? '🛡 براند' : '👤 عميل عادي'}
                      </span>
                    </td>
                    <td><strong style={{ color: 'var(--green)' }}>{sale.amountEGP?.toLocaleString()}</strong></td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)' }}>لا توجد مبيعات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Sale Modal */}
      {isAddModalOpen && (
        <div className="sa-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="sa-modal-content sa-sale-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>➕ إضافة مبيعات جديدة</h2>
              <button className="btn btn-sm" onClick={() => setIsAddModalOpen(false)}>إغلاق</button>
            </div>
            <div className="sa-modal-body">
              <form onSubmit={handleAddSale}>
                <div className="sa-form-section">
                  <div className="sa-form-section-title">نوع العميل</div>
                  <div className="sa-role-selector">
                    <div className={`sa-role-option ${customerType === 'admin' ? 'active' : ''}`} onClick={() => { setCustomerType('admin'); setSelectedCustomer(null); }}>🛡 براند</div>
                    <div className={`sa-role-option ${customerType === 'user' ? 'active' : ''}`} onClick={() => { setCustomerType('user'); setSelectedCustomer(null); }}>👤 عميل عادي</div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">البحث عن عميل</label>
                  <input 
                    type="text" 
                    className="field-input" 
                    placeholder="ابحث بالاسم أو البريد..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                         {selectedCustomer?.id === u.id && <span style={{ color: 'var(--accent)' }}>✓</span>}
                      </div>
                    ))
                  )}
                </div>

                <div className="field">
                  <label className="field-label">القيمة (بالجنيه المصري)</label>
                  <input 
                    type="number" 
                    className="field-input" 
                    placeholder="مثال: 5000" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                  <button type="submit" className="sa-submit-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ المبيعات'}
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
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>👤 بروفايل العميل</h2>
              <button className="btn btn-sm" onClick={() => setViewingProfile(null)}>إغلاق</button>
            </div>
            <div className="sa-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Customer Info */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <div className="sa-brand-avatar" style={{ width: 60, height: 60, fontSize: 24, background: viewingProfile.customer?.role === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                  {(viewingProfile.customer?.brandName || viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {viewingProfile.customer?.brandName || viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '—'}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 14 }}>{viewingProfile.customer?.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`sa-role-badge ${viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin' ? 'sa-role-admin' : 'sa-role-user'}`}>
                      {viewingProfile.customer?.role === 'admin' || viewingProfile.customer?.customerType === 'admin' ? '🛡 براند' : '👤 عميل عادي'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid for Transactions and Customers (if Brand) */}
              <div className="sa-grid" style={{ gridTemplateColumns: viewingProfile.customer?.role === 'admin' ? '1fr 1fr' : '1fr', gap: 20 }}>
                
                {/* Transactions History */}
                <div className="sa-table-card" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="sa-card-header" style={{ padding: '12px 16px' }}>
                    <div className="sa-card-title" style={{ fontSize: 14 }}>💰 المعاملات السابقة</div>
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
                    <div className="sa-card-header" style={{ padding: '12px 16px' }}>
                      <div className="sa-card-title" style={{ fontSize: 14 }}>👥 العملاء التابعين</div>
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
                            <tr><td colSpan="2" style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>لا يوجد عملاء تابعين</td></tr>
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
