import { useState } from 'react';
import { Users, TrendingUp, Award, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SuperAdminEmployees({ employees, allUsers, onAdd, onEdit, onDelete, formatDate, totalSteps }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (selectedEmployee) {
    const employeeUsers = allUsers.filter(u => u.createdBy === selectedEmployee.id);
    const filteredUsers = employeeUsers.filter(u => {
      const q = searchQuery.toLowerCase();
      return (u.brandName?.toLowerCase().includes(q) || u.ownerName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    });
    
    return (
      <div className="sa-content" style={{ padding: 0 }}>
        {/* Stats for Employee */}
        <div className="sa-stats">
          <div className="sa-stat-card">
            <div className="sa-stat-info">
              <div className="sa-stat-value">{employeeUsers.length}</div>
              <div className="sa-stat-label">مستخدمين مضافين</div>
            </div>
            <div className="sa-stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
              <Users size={24} />
            </div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-info">
              <div className="sa-stat-value">
                {employeeUsers.length > 0 
                  ? Math.round(employeeUsers.reduce((acc, u) => acc + (u.appState?.completedSteps?.length || 0), 0) / (employeeUsers.length * totalSteps) * 100) 
                  : 0}%
              </div>
              <div className="sa-stat-label">متوسط إنجاز المضافين</div>
            </div>
            <div className="sa-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="sa-stat-card">
            <div className="sa-stat-info">
              <div className="sa-stat-value">
                {employeeUsers.filter(u => (u.appState?.completedSteps?.length || 0) >= totalSteps).length}
              </div>
              <div className="sa-stat-label">أتموا كافة المراحل</div>
            </div>
            <div className="sa-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)' }}>
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="sa-table-card">
          <div className="sa-card-header">
            <div className="sa-card-title">
              <button className="btn btn-sm" onClick={() => { setSelectedEmployee(null); setSearchQuery(''); }} style={{ marginLeft: 16 }}>
                &rarr; رجوع
              </button>
              👤 مستخدمين تمت إضافتهم بواسطة: <span style={{ color: 'var(--accent)' }}>{selectedEmployee.ownerName || selectedEmployee.email}</span>
            </div>
            <div className="sa-search-box">
              <input 
                type="text" 
                placeholder="بحث في مستخدمي الموظف..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', right: 12, color: 'var(--text3)' }} />
            </div>
          </div>
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>الاسم / البراند</th>
                  <th>البريد</th>
                  <th>الدور</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="sa-brand-name">
                        <div className="sa-brand-avatar" style={{ background: u.role === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                          {(u.brandName || u.ownerName || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        {u.brandName || u.ownerName || '—'}
                      </div>
                    </td>
                    <td><span className="sa-brand-email">{u.email}</span></td>
                    <td>
                      <span className={`sa-role-badge ${
                        u.role === 'superadmin' ? 'sa-role-superadmin' : 
                        u.role === 'admin' ? 'sa-role-admin' : 
                        'sa-role-user'
                      }`}>
                        {u.role === 'superadmin' ? '👤 موظف' : u.role === 'admin' ? '🛡 أدمن' : '👤 يوزر'}
                      </span>
                    </td>
                    <td><span className="sa-date">{formatDate(u.createdAt)}</span></td>
                  </tr>
                ))}
                {employeeUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="sa-empty">لم يقم هذا الموظف بإضافة أي مستخدمين بعد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-content">
      <div className="sa-table-card">
        <div className="sa-card-header">
          <div className="sa-card-title">
            👥 قائمة الموظفين (Super Admins)
            <span className="sa-card-count">{employees.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn" onClick={onAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> إضافة موظف
            </button>
            <div className="sa-search-box">
              <input 
                type="text" 
                placeholder="بحث عن موظف..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', right: 12, color: 'var(--text3)' }} />
            </div>
          </div>
        </div>
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>البريد الإلكتروني</th>
                <th>عدد المستخدمين المضافين</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(emp => {
                  const q = searchQuery.toLowerCase();
                  return (emp.ownerName?.toLowerCase().includes(q) || emp.email?.toLowerCase().includes(q));
                })
                .map(emp => {
                const addedCount = allUsers.filter(u => u.createdBy === emp.id).length;
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="sa-brand-name">
                        <div className="sa-brand-avatar" style={{ background: '#8B5CF6' }}>
                          {(emp.ownerName || emp.email || '?').charAt(0).toUpperCase()}
                        </div>
                        {emp.ownerName || '—'}
                      </div>
                    </td>
                    <td><span className="sa-brand-email">{emp.email}</span></td>
                    <td>
                      <button className="btn btn-xs" onClick={() => setSelectedEmployee(emp)}>
                        📊 {addedCount} مستخدم
                      </button>
                    </td>
                    <td><span className="sa-date">{formatDate(emp.createdAt)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-xs btn-outline sa-action-btn"
                          onClick={() => onEdit(emp)}
                          title="تعديل"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="sa-delete-btn btn-xs sa-action-btn"
                          onClick={() => onDelete(emp)}
                          title="حذف"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="5" className="sa-empty">لا يوجد موظفين حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginTop: 20, padding: 16, background: 'rgba(59,130,246,0.05)', borderRadius: 12, border: '1px dashed rgba(59,130,246,0.2)', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          يمكنك إضافة موظف جديد من خلال قسم البراندات باختيار دور "سوبر أدمن" في نموذج الإنشاء.
        </p>
      </div>
    </div>
  );
}
