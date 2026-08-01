import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { runFullContentSeed, SEED_MODULES } from '../../services/seedRunner';
import {
  Settings,
  Database,
  RefreshCw,
  CheckCircle,
  Lightbulb,
  Check,
  Play,
  Square,
  CheckSquare
} from 'lucide-react';

export default function SuperAdminSettings() {
  const toast = useToast();
  const confirm = useConfirm();
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

    const isConfirmed = await confirm(`هل أنت متأكد من تحديث ${selectedModules.length} من أقسام قاعدة البيانات؟`);
    if (!isConfirmed) return;

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
      toast('تم تحديث الأقسام المختارة بنجاح!','success');
    } catch (error) {
      toast('حدث خطأ أثناء التحديث', 'error');
      console.error(error);
    } finally {
      setIsSeeding(false);
      setCurrentSeeding(null);
    }
  };

  const handleFullSeed = async () => {
    const isConfirmed = await confirm('هل أنت متأكد من رفع وتحديث كافة البيانات؟ (سيأخذ وقتاً طويلاً)');
    if (isConfirmed) {
      setIsSeeding(true);
      toast('جاري تحديث قاعدة البيانات الشاملة...', 'info');
      try {
        await runFullContentSeed();
        toast('تم تحديث قاعدة البيانات بنجاح!','success');
      } catch (error) {
        toast('حدث خطأ أثناء التحديث', 'error');
        console.error(error);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  return (
    <div className="sa-content" style={{ padding: 0 }}>
      <div className="sa-settings-container view-enter" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="sa-table-card" style={{ padding: '24px 32px' }}>
          <div className="sa-card-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
            <h2 className="sa-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
              <Settings size={24} style={{ color: 'var(--accent)' }} />
              <span>إعدادات النظام ومركز تحديث البيانات</span>
            </h2>
          </div>
          
          <div className="sa-setting-item" style={{ marginTop: '12px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={18} style={{ color: 'var(--accent)' }} />
                <span>مركز تحديث قاعدة البيانات (Selective Seeding)</span>
              </h3>
              <p style={{ color: '#8B96A8', fontSize: '13px', lineHeight: '1.6' }}>
                بدلاً من تحديث كل شيء، يمكنك الآن اختيار الأقسام التي قمت بتعديلها فقط لتوفير الوقت.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button 
                type="button"
                className="btn btn-sm btn-outline" 
                onClick={toggleAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {selectedModules.length === SEED_MODULES.length ? (
                  <>
                    <Square size={14} />
                    <span>إلغاء تحديد الكل</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={14} />
                    <span>تحديد الكل</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
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
                      background: isProcessing ? 'rgba(59, 130, 246, 0.1)' : (isSelected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)'),
                      border: `1px solid ${isProcessing ? '#3B82F6' : (isSelected ? '#10B981' : 'rgba(255,255,255,0.05)')}`,
                      cursor: isSeeding ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                    className="sa-stat-card"
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #10B981' : '2px solid var(--line)',
                      background: isSelected ? '#10B981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#fff' : '#c3cddb' }}>{mod.name_ar}</div>
                      <div style={{ fontSize: '10px', color: '#525F7A' }}>{mod.name_en}</div>
                    </div>
                    {isCompleted && (
                      <span style={{ color: '#10B981', display: 'flex', alignItems: 'center' }} title="اكتمل التحديث">
                        <CheckCircle size={16} />
                      </span>
                    )}
                    {isProcessing && (
                      <div className="sa-submit-spinner" style={{ width: '16px', height: '16px', borderTopColor: '#3B82F6', margin: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                  className="sa-add-prod-btn" 
                  onClick={handleSelectiveSeed}
                  disabled={isSeeding || selectedModules.length === 0}
                  style={{ 
                      padding: '12px 28px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 44
                  }}
              >
                  {isSeeding ? (
                    <>
                      <div className="sa-submit-spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
                      <span>جاري التحديث...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>تحديث الأقسام المختارة ({selectedModules.length})</span>
                    </>
                  )}
              </button>

              <button 
                  className="sa-export-btn" 
                  onClick={handleFullSeed}
                  disabled={isSeeding}
                  style={{ 
                      padding: '12px 24px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 44
                  }}
              >
                  <RefreshCw size={16} />
                  <span>تحديث شامل لكافة البيانات</span>
              </button>
            </div>
          </div>

          <div className="sa-divider" style={{ margin: '36px 0', borderTop: '1px solid var(--line)' }} />

          <div className="sa-info-alert" style={{ 
            background: 'rgba(59, 130, 246, 0.03)', 
            border: '1px solid rgba(59, 130, 246, 0.1)', 
            borderRight: '4px solid var(--accent)', 
            padding: '20px', 
            borderRadius: '12px' 
          }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Lightbulb size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#E8EDF5', lineHeight: '1.7', flex: 1 }}>
                      <strong>تلميح:</strong> إذا قمت بتعديل ملف واحد فقط (مثل ملف قوالب صفحات الهبوط)، حدد هذا القسم فقط واضغط على تحديث لتوفير الوقت والبيانات.
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
