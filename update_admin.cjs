const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin/AdminDashboardPage.jsx', 'utf8');

const socialLinksCard = `               {/* Social Links Settings */}
               <div className="ad-table-card" style={{ gridColumn: '1 / -1', marginTop: 24 }}>
                  <div className="ad-card-header">
                     <div className="ad-card-title">🌐 منصات التواصل الاجتماعي</div>
                  </div>
                  <div className="ad-form-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                     <div className="field">
                        <label className="field-label">فيسبوك (Facebook)</label>
                        <input className="field-input" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} placeholder="رابط الصفحة..." dir="ltr" style={{ textAlign: 'left' }} />
                     </div>
                     <div className="field">
                        <label className="field-label">إنستجرام (Instagram)</label>
                        <input className="field-input" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                     </div>
                     <div className="field">
                        <label className="field-label">تيك توك (TikTok)</label>
                        <input className="field-input" value={socialLinks.tiktok} onChange={e => setSocialLinks({...socialLinks, tiktok: e.target.value})} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                     </div>
                     <div className="field">
                        <label className="field-label">إكس (Twitter/X)</label>
                        <input className="field-input" value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                     </div>
                     <div className="field">
                        <label className="field-label">لينكد إن (LinkedIn)</label>
                        <input className="field-input" value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                     </div>
                  </div>
               </div>
            </div>`;

const extraColors = `                         <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>لون القائمة الجانبية والكروت</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير خلفية القائمة الجانبية والصناديق (Cards).</div>
                         </div>
                      </div>
                      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                         <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>لون النصوص الأساسية (Text Color)</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير لون الكتابة والنصوص داخل المنصة.</div>
                         </div>
                      </div>
                      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                         <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>لون الفواصل والإطارات (Borders/Lines)</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير ألوان الخطوط الفاصلة وحواف الكروت.</div>
                         </div>
                      </div>`;

content = content.replace(/                         <div>\s*<div style={{ fontSize: 13, fontWeight: 700 }}>لون القائمة الجانبية والكروت<\/div>\s*<div style={{ fontSize: 10, color: 'var\(--text3\)' }}>يغير خلفية القائمة الجانبية والصناديق \(Cards\)\.<\/div>\s*<\/div>\s*<\/div>/g, extraColors);

content = content.replace(/               <\/div>\s*<\/div>\s*<div style={{ marginTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12 }}>/g, socialLinksCard + '\n\n            <div style={{ marginTop: 24, textAlign: \'center\', display: \'flex\', justifyContent: \'center\', gap: 12 }}>');

fs.writeFileSync('src/pages/Admin/AdminDashboardPage.jsx', content);
