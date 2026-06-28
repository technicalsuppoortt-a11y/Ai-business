import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { runFullContentSeed, SEED_MODULES } from '../../services/seedRunner';

export default function SuperAdminSettings() {
  const toast = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [currentSeeding, setCurrentSeeding] = useState(null);

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedModules.length === SEED_MODULES.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(SEED_MODULES.map(m => m.id));
    }
  };

  const handleSelectiveSeed = async () => {
    if (selectedModules.length === 0) {
      return toast('الرجاء اختيار قسم واحد على الأقل للتحديث', 'error');
    }

    if (!confirm(`هل أنت متأكد من تحديث ${selectedModules.length} من أقسام قاعدة البيانات؟`)) return;

    setIsSeeding(true);
    setCompletedModules([]);
    toast('جاري تحديث الأقسام المختارة...', 'info');

    try {
      for (const modId of selectedModules) {
        const module = SEED_MODULES.find(m => m.id === modId);
        if (module) {
          setCurrentSeeding(modId);
          await module.fn();
          setCompletedModules(prev => [...prev, modId]);
        }
      }
      toast('تم تحديث الأقسام المختارة بنجاح! ✓', 'success');
    } catch (error) {
      toast('حدث خطأ أثناء التحديث', 'error');
      console.error(error);
    } finally {
      setIsSeeding(false);
      setCurrentSeeding(null);
    }
  };

  const handleFullSeed = async () => {
    if (confirm('هل أنت متأكد من رفع وتحديث كافة البيانات؟ (سيأخذ وقتاً طويلاً)')) {
      setIsSeeding(true);
      toast('جاري تحديث قاعدة البيانات الشاملة...', 'info');
      try {
        await runFullContentSeed();
        toast('تم تحديث قاعدة البيانات بنجاح! ✓', 'success');
      } catch (error) {
        toast('حدث خطأ أثناء التحديث', 'error');
        console.error(error);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  return (
    <div className="sa-content">
      <div className="sa-settings-container view-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="sa-card">
        <h2 className="sa-section-title">⚙️ إعدادات النظام ومركز تحديث البيانات</h2>
        
        <div className="sa-setting-item" style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>🚀 مركز تحديث قاعدة البيانات (Selective Seeding)</h3>
            <p style={{ color: '#8B96A8', fontSize: '13px', lineHeight: '1.6' }}>
              بدلاً من تحديث كل شيء، يمكنك الآن اختيار الأقسام التي قمت بتعديلها فقط لتوفير الوقت.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button className="btn btn-sm" onClick={toggleAll} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              {selectedModules.length === SEED_MODULES.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '12px',
            marginBottom: '32px'
          }}>
            {SEED_MODULES.map(mod => {
              const isSelected = selectedModules.includes(mod.id);
              const isCompleted = completedModules.includes(mod.id);
              const isProcessing = currentSeeding === mod.id;

              return (
                <div 
                  key={mod.id}
                  onClick={() => !isSeeding && toggleModule(mod.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isProcessing ? 'rgba(59, 130, 246, 0.1)' : (isSelected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)'),
                    border: `1px solid ${isProcessing ? '#3B82F6' : (isSelected ? '#10B981' : 'rgba(255,255,255,0.05)')}`,
                    cursor: isSeeding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '2px solid #3B82F6',
                    background: isSelected ? '#3B82F6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px'
                  }}>
                    {isSelected && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#fff' : '#8B96A8' }}>{mod.name_ar}</div>
                    <div style={{ fontSize: '10px', color: '#525F7A' }}>{mod.name_en}</div>
                  </div>
                  {isCompleted && <span style={{ color: '#10B981', fontSize: '16px' }}>✅</span>}
                  {isProcessing && <div className="sa-submit-spinner" style={{ width: '16px', height: '16px', borderTopColor: '#3B82F6' }} />}
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
                className="sa-seed-btn-primary" 
                onClick={handleSelectiveSeed}
                disabled={isSeeding || selectedModules.length === 0}
                style={{ 
                    padding: '16px 48px',
                    fontSize: '15px'
                }}
            >
                {isSeeding ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="sa-submit-spinner" style={{ width: '18px', height: '18px' }} />
                    جاري التحديث...
                  </span>
                ) : (
                  <span>🚀 تحديث الأقسام المختارة ({selectedModules.length})</span>
                )}
            </button>

            <button 
                className="sa-seed-btn-secondary" 
                onClick={handleFullSeed}
                disabled={isSeeding}
                style={{ 
                    padding: '16px 32px',
                    fontSize: '13px'
                }}
            >
                🔄 تحديث شامل لكل شيء
            </button>
          </div>
        </div>

        <div className="sa-divider" style={{ margin: '40px 0' }} />

        <div className="sa-info-alert" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '24px' }}>💡</span>
                <div style={{ fontSize: '14px', color: '#E8EDF5', lineHeight: '1.7', flex: 1 }}>
                    <strong>نصيحة:</strong> إذا قمت بتعديل ملف واحد فقط (مثلاً ملف خطط التسويق)، قم باختيار "خطط التسويق" فقط واضغط على تحديث. سيستغرق الأمر ثوانٍ معدودة بدلاً من دقائق.
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
);
}
