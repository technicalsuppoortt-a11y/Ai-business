import React, { useState, useEffect } from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { Sparkles, Save, RotateCcw, Image as ImageIcon } from 'lucide-react';

export default function SuperAdminBranding() {
  const { brandName: globalName, logoUrl: globalLogo, updateBranding, resetBranding, DEFAULT_BRAND_NAME } = useSystemBranding();
  const toast = useToast();
  const confirm = useConfirm();

  const [nameInput, setNameInput] = useState(globalName || DEFAULT_BRAND_NAME);
  const [logoInput, setLogoInput] = useState(globalLogo || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync inputs if global context changes
  useEffect(() => {
    setNameInput(globalName || DEFAULT_BRAND_NAME);
    setLogoInput(globalLogo || '');
  }, [globalName, globalLogo, DEFAULT_BRAND_NAME]);

  const handleSave = async () => {
    if (!nameInput.trim()) {
      return toast('Brand name cannot be empty', 'error');
    }
    
    setIsSaving(true);
    try {
      await updateBranding(nameInput.trim(), logoInput.trim() || null);
      toast('Global branding updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving branding:', err);
      toast('Failed to save branding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const isConfirmed = await confirm('Are you sure you want to reset the global branding back to "AI Business"?');
    if (!isConfirmed) return;

    setIsSaving(true);
    try {
      await resetBranding();
      toast('Branding reset to defaults', 'success');
    } catch (err) {
      console.error('Error resetting branding:', err);
      toast('Failed to reset branding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sa-content" style={{ padding: 0 }}>
      <div className="sa-settings-container view-enter" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="sa-table-card" style={{ padding: '24px 32px' }}>
          
          <div className="sa-card-header" style={{ marginBottom: 28, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
            <h2 className="sa-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
              <span>Global Brand Settings (System-Wide)</span>
            </h2>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{ color: 'var(--text2)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Changes made here will dynamically update the Brand Name and Logo across the entire application for all users (Landing Page, User Dashboards, Login screens, Legal Pages). 
              <br/><strong>Note:</strong> The Super Admin Dashboard will always retain the original "AI Business" branding.
            </p>

            {/* BRAND NAME INPUT */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                Global Brand Name
              </label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. AI Brand Vision"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg1)',
                  color: '#fff',
                  fontSize: '15px'
                }}
              />
            </div>

            {/* LOGO URL INPUT & PREVIEW */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                Global Logo URL
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <input 
                  type="text" 
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg1)',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                />
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '12px', 
                  background: 'var(--bg1)', 
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {logoInput ? (
                    <img 
                      src={logoInput} 
                      alt="Logo Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <ImageIcon size={24} color="var(--text3)" style={{ display: logoInput ? 'none' : 'block' }} />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button 
                onClick={handleReset}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg3)',
                  color: 'var(--text1)',
                  border: '1px solid var(--line)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <RotateCcw size={18} />
                Reset to Defaults
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
