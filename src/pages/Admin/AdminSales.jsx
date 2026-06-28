import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSales({ subUsers }) {
  const { adminUserData: userData } = useAuth();
  const toast = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Sale Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  // Time Range Filter
  const [timeRange, setTimeRange] = useState('all');

  const fetchSales = async () => {
    if (!userData?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'sales'),
        where('createdBy', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );
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
  }, [userData]);

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return toast('يرجى تحديد العميل', 'error');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return toast('يرجى إدخال قيمة صحيحة', 'error');

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'sales'), {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.ownerName || selectedCustomer.email,
        customerEmail: selectedCustomer.email,
        customerType: selectedCustomer.role, 
        amountEGP: Number(amount),
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || ''
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

  const filteredCustomers = subUsers.filter(u => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (u.ownerName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  const getFilteredSales = () => {
    if (timeRange === 'all') return sales;
    const now = new Date();
    return sales.filter(s => {
      if (!s.createdAt?.seconds) return false;
      const date = new Date(s.createdAt.seconds * 1000);
      
      if (timeRange === 'today') return date.toDateString() === now.toDateString();
      if (timeRange === 'yesterday') {
        const yest = new Date(); yest.setDate(now.getDate() - 1);
        return date.toDateString() === yest.toDateString();
      }
      if (timeRange === 'last7') {
        const last7 = new Date(); last7.setDate(now.getDate() - 7);
        return date >= last7;
      }
      if (timeRange === 'thisMonth') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = getFilteredSales();
  const totalSalesEGP = filteredSales.reduce((acc, curr) => acc + (curr.amountEGP || 0), 0);

  return (
    <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
      
      {/* Stats Row */}
      <div className="sa-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div className="sa-stat-card">
          <div className="sa-stat-icon">💰</div>
          <div className="sa-stat-value">{totalSalesEGP.toLocaleString()} ج.م</div>
          <div className="sa-stat-label">إجمالي المبيعات</div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon">📄</div>
          <div className="sa-stat-value">{filteredSales.length}</div>
          <div className="sa-stat-label">عدد المعاملات</div>
        </div>
      </div>

      <div className="sa-table-card">
        <div className="sa-card-header">
          <div className="sa-card-title">
            💰 سجل مبيعات البراند
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
                  <th>القيمة (ج.م)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id} onClick={() => {
                    const customer = subUsers.find(u => u.id === sale.customerId);
                    setViewingProfile({ sale, customer: customer || sale });
                  }} style={{ cursor: 'pointer' }} className="sa-table-row-hover">
                    <td><span className="sa-date">{formatDate(sale.createdAt)}</span></td>
                    <td>
                      <div className="sa-brand-name">
                        <div className="sa-brand-avatar" style={{ background: 'var(--green)' }}>
                          {(sale.customerName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span>{sale.customerName || '—'}</span>
                           <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sale.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td><strong style={{ color: 'var(--green)' }}>{sale.amountEGP?.toLocaleString()}</strong></td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)' }}>لا توجد مبيعات مسجلة</td>
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
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>➕ إضافة مبيعات جديدة</h2>
              <button className="btn btn-sm" onClick={() => setIsAddModalOpen(false)}>إغلاق</button>
            </div>
            <div className="sa-modal-body">
              <form onSubmit={handleAddSale}>
                <div className="field">
                  <label className="field-label">البحث عن عميل</label>
                  <input type="text" className="field-input" placeholder="ابحث بالاسم أو البريد..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                <div className="sa-customers-list" style={{ maxHeight: 150, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {filteredCustomers.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>لا يوجد نتائج</div>
                  ) : (
                    filteredCustomers.map(u => (
                      <div key={u.id} onClick={() => setSelectedCustomer(u)} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: selectedCustomer?.id === u.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent' }}>
                         <div className="sa-brand-avatar" style={{ width: 30, height: 30, fontSize: 12, background: 'var(--green)' }}>
                           {(u.ownerName || u.email || '?').charAt(0).toUpperCase()}
                         </div>
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontSize: 13, color: '#fff' }}>{u.ownerName || '—'}</span>
                           <span style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</span>
                         </div>
                         {selectedCustomer?.id === u.id && <span style={{ color: 'var(--accent)' }}>✓</span>}
                      </div>
                    ))
                  )}
                </div>

                <div className="field">
                  <label className="field-label">القيمة (بالجنيه المصري)</label>
                  <input type="number" className="field-input" placeholder="مثال: 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
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
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                <div className="sa-brand-avatar" style={{ width: 60, height: 60, fontSize: 24, background: 'var(--green)' }}>
                  {(viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {viewingProfile.customer?.ownerName || viewingProfile.customer?.customerName || '—'}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 14 }}>{viewingProfile.customer?.email}</div>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
