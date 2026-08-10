const fs = require('fs');

const settingsFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Admin/components/AiSettingsPage.jsx';
let content = fs.readFileSync(settingsFile, 'utf8');

// We need to extract the ToolCard rendering into a function and then change the category rendering logic.

// Step 1: Locate the Render Only Active Category block
const oldRenderBlock = `            {/* Render Only Active Category */}
            {activeCategoryTab && groupedTools[activeCategoryTab] && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {groupedTools[activeCategoryTab].map(tool => (
                  <div key={tool.id} style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', color: 'var(--text)', borderBottom: '1px solid var(--line2)', paddingBottom: '8px' }}>
                      {tool.icon && React.createElement(tool.icon, { size: 16, style: { color: 'var(--orange)' } })}
                      {isRTL ? (tool.label_ar || tool.label_en) : (tool.label_en || tool.label_ar)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tool.liveAiFeatures.map((feat, index) => {
                        const showHeader = feat.groupHeader_ar && (index === 0 || tool.liveAiFeatures[index - 1].groupHeader_ar !== feat.groupHeader_ar);
                        return (
                          <React.Fragment key={feat.key}>
                            {showHeader && (
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--orange)', marginTop: index > 0 ? '8px' : '0', padding: '0 4px' }}>
                                {isRTL ? feat.groupHeader_ar : (feat.groupHeader_en || feat.groupHeader_ar)}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)' }}>
                              
                              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: 0, flex: 1 }}>
                                {isRTL ? (feat.label_ar || feat.label_en) : (feat.label_en || feat.label_ar)}
                              </label>
                              
                              <div style={{ position: 'relative', width: '80px' }}>
                                <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'left' : 'right']: '12px', fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', pointerEvents: 'none' }}>
                                  CR
                                </span>
                                <input 
                                  type="number" 
                                  value={settings[feat.key] || ''} 
                                  onChange={e => handleFieldChange(feat.key, e.target.value)} 
                                  style={{ 
                                    ...inputStyle, 
                                    padding: '8px', 
                                    [isRTL ? 'paddingLeft' : 'paddingRight']: '32px',
                                    textAlign: 'center',
                                    margin: 0
                                  }} 
                                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                                />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}`;

const newRenderBlock = `            {/* Render Only Active Category */}
            {activeCategoryTab && groupedTools[activeCategoryTab] && (() => {
              const renderToolCard = (tool) => (
                  <div key={tool.id} style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', color: 'var(--text)', borderBottom: '1px solid var(--line2)', paddingBottom: '8px' }}>
                      {tool.icon && React.createElement(tool.icon, { size: 16, style: { color: 'var(--orange)' } })}
                      {isRTL ? (tool.label_ar || tool.label_en) : (tool.label_en || tool.label_ar)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tool.liveAiFeatures && tool.liveAiFeatures.map((feat, index) => {
                        const showHeader = feat.groupHeader_ar && (index === 0 || tool.liveAiFeatures[index - 1].groupHeader_ar !== feat.groupHeader_ar);
                        return (
                          <React.Fragment key={feat.key}>
                            {showHeader && (
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--orange)', marginTop: index > 0 ? '8px' : '0', padding: '0 4px' }}>
                                {isRTL ? feat.groupHeader_ar : (feat.groupHeader_en || feat.groupHeader_ar)}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)' }}>
                              
                              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: 0, flex: 1 }}>
                                {isRTL ? (feat.label_ar || feat.label_en) : (feat.label_en || feat.label_ar)}
                              </label>
                              
                              <div style={{ position: 'relative', width: '80px' }}>
                                <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'left' : 'right']: '12px', fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', pointerEvents: 'none' }}>
                                  CR
                                </span>
                                <input 
                                  type="number" 
                                  value={settings[feat.key] || ''} 
                                  onChange={e => handleFieldChange(feat.key, e.target.value)} 
                                  style={{ 
                                    ...inputStyle, 
                                    padding: '8px', 
                                    [isRTL ? 'paddingLeft' : 'paddingRight']: '32px',
                                    textAlign: 'center',
                                    margin: 0
                                  }} 
                                  onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                                  onBlur={e => e.target.style.borderColor = 'var(--line2)'}
                                />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
              );

              // Special Two-Column Layout for Content & Marketing
              if (activeCategoryTab === 'المحتوى والتسويق' || activeCategoryTab === 'Content & Marketing') {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Column 1 (Left): Social Media */}
                    <div className="flex flex-col gap-6">
                      {groupedTools[activeCategoryTab].filter(t => t.id === 'social-media').map(renderToolCard)}
                    </div>
                    
                    {/* Column 2 (Right): Campaign Planner + Ad Creative */}
                    <div className="flex flex-col gap-6">
                      {groupedTools[activeCategoryTab].filter(t => t.id === 'marketing-plan' || t.id === 'ad-creative').map(renderToolCard)}
                      
                      {/* Catch-all for any other tool that might get added to this category in the future */}
                      {groupedTools[activeCategoryTab].filter(t => t.id !== 'social-media' && t.id !== 'marketing-plan' && t.id !== 'ad-creative').map(renderToolCard)}
                    </div>
                  </div>
                );
              }

              // Default Layout for other categories
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {groupedTools[activeCategoryTab].map(renderToolCard)}
                </div>
              );
            })()}`;

if (content.includes(oldRenderBlock)) {
  content = content.replace(oldRenderBlock, newRenderBlock);
  fs.writeFileSync(settingsFile, content);
  console.log("Layout successfully refactored.");
} else {
  console.log("Could not find the target code block to replace.");
}
