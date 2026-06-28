import sys

with open('src/pages/Admin/AdminDashboardPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

social_html = """               </div>
               
               {/* Social Links Settings */}
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
            </div>"""

target = """               </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12 }}>"""

new_target = social_html + """

            <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12 }}>"""

if target in content:
    content = content.replace(target, new_target)
    with open('src/pages/Admin/AdminDashboardPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully.")
else:
    print("Target string not found.")
