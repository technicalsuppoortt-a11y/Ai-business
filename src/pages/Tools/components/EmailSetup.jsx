import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function EmailSetup({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  // Inputs
  const [domainName, setDomainName] = useState(state.websiteUrl ? state.websiteUrl.replace(/^https?:\/\//, '') : '');
  const [supportEmail, setSupportEmail] = useState(state.contactEmail || '');
  
  const bottomSections = [
    {
      icon: '🛡️',
      title: lang === 'en' ? 'Why do we need this?' : 'لماذا نحتاج هذا؟',
      items: [
        lang === 'en' ? 'To ensure your emails reach the Inbox and not the Spam folder.' : 'لكي يصل الإيميل الخاص بك إلى الـ Inbox وليس الـ Spam.',
        lang === 'en' ? 'You must prove to service providers (like Gmail) that you truly own the domain and use authorized servers.' : 'يجب أن تثبت لمزودي الخدمة (مثل Gmail) أنك المالك الحقيقي للدومين وتستخدم سيرفرات مصرحة.',
        lang === 'en' ? 'Authenticated messages increase your store\'s credibility and customer trust.' : 'الرسائل الموثقة تزيد من مصداقية متجرك وثقة العملاء.'
      ]
    },
    {
      icon: '✅',
      title: lang === 'en' ? 'Tips to ensure authentication' : 'نصائح لضمان التوثيق',
      items: [
        lang === 'en' ? 'Records may take 15 minutes to 24 hours to update across all internet servers (DNS Propagation).' : 'قد تستغرق السجلات من 15 دقيقة إلى 24 ساعة حتى تتحدث في جميع خوادم الإنترنت (DNS Propagation).',
        lang === 'en' ? 'Make sure there are no empty spaces when copying record values.' : 'تأكد من عدم وجود مسافات فارغة عند نسخ قيم السجلات.',
        lang === 'en' ? 'Use tools like Mail-Tester to make sure you get a 10/10 score before actually sending to customers.' : 'استخدم أدوات مثل Mail-Tester للتأكد من حصولك على تقييم 10/10 قبل الإرسال الفعلي للعملاء.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="email-setup"
      title={lang === 'en' ? 'Email Setup & Authentication' : 'توثيق الإيميل (Email Setup)'}
      subtitle={lang === 'en' ? 'Connect your domain and add DNS authentication records to ensure store messages and invoices go straight to the inbox.' : 'اربط دومينك وأضف سجلات المصادقة (DNS) لضمان وصول رسائل المتجر والفواتير إلى الانبوكس مباشرة.'}
      stepNumber={stepNumber}
      accentColor="#F59E0B"
      timeEstimate="15 - 25"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Your Domain' : 'الدومين الخاص بك'}
            </label>
            <input 
              type="text" 
              className="td-input"
              dir="ltr"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="example.com"
              style={{ textAlign: 'left', borderColor: domainName ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Official Sending Email' : 'إيميل الإرسال الرسمي'}
            </label>
            <input 
              type="email" 
              className="td-input"
              dir="ltr"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@example.com"
              style={{ textAlign: 'left', borderColor: supportEmail ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>
          
          <div style={{ background: 'rgba(13, 18, 32, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>
               {lang === 'en' ? 'How to make sure your settings are correct?' : 'كيف تتأكد أن إعداداتك صحيحة؟'}
             </h4>
             <ol style={{ listStylePosition: 'inside', color: '#8B96A8', fontSize: '12px', lineHeight: '1.8', padding: 0, margin: 0, direction: lang === 'en' ? 'ltr' : 'rtl' }}>
               <li>{lang === 'en' ? 'Wait 15 minutes to 24 hours for records to update.' : 'انتظر من 15 دقيقة إلى 24 ساعة لتتحدث السجلات.'}</li>
               <li>{lang === 'en' ? 'Go to ' : 'اذهب لموقع '}<a href="https://www.mail-tester.com/" target="_blank" rel="noreferrer" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 'bold' }}>Mail-Tester.com</a>.</li>
               <li>{lang === 'en' ? 'Copy the email address provided by the site.' : 'انسخ الإيميل الذي يعطيه لك الموقع.'}</li>
               <li>{lang === 'en' ? 'Send a test email from your official email to it.' : 'أرسل إيميل تجريبي من إيميلك الرسمي إليه.'}</li>
               <li>{lang === 'en' ? 'You should get a 10/10 score.' : 'يجب أن تحصل على تقييم 10/10.'}</li>
             </ol>
          </div>
        </div>

        {/* ═══════════════ DNS RECORDS ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> {lang === 'en' ? 'Required DNS Records' : 'سجلات DNS المطلوبة'}
          </h3>
          <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.6', marginBottom: '24px' }}>
            {lang === 'en' ? 'Copy these records and add them in your domain control panel (e.g. Namecheap or Cloudflare).' : 'انسخ هذه السجلات وأضفها في لوحة تحكم الدومين الخاص بك (مثال: Namecheap أو Cloudflare).'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: lang === 'en' ? '4px' : 0, paddingLeft: lang === 'en' ? 0 : '4px' }} className="custom-scrollbar">
            
            {/* SPF Record */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                <span style={{ fontWeight: '900', color: '#3B82F6', fontSize: '14px' }}>{lang === 'en' ? '1. SPF Record' : '1. سجل SPF'}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#E8EDF5', fontWeight: 'bold' }}>Type: TXT</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Name / Host:</span>
                  <span style={{ fontFamily: 'monospace', color: '#fff' }}>@</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', alignItems: 'center', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Value:</span>
                  <span style={{ fontFamily: 'monospace', color: '#10B981', textAlign: lang === 'en' ? 'right' : 'left', wordBreak: 'break-all', marginLeft: '12px', direction: 'ltr' }}>v=spf1 include:spf.upklick.com ~all</span>
                </div>
              </div>
            </div>

            {/* DKIM Record */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                <span style={{ fontWeight: '900', color: '#8B5CF6', fontSize: '14px' }}>{lang === 'en' ? '2. DKIM Record' : '2. سجل DKIM'}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#E8EDF5', fontWeight: 'bold' }}>Type: CNAME</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Name / Host:</span>
                  <span style={{ fontFamily: 'monospace', color: '#fff' }}>upklick._domainkey</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', alignItems: 'center', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Value:</span>
                  <span style={{ fontFamily: 'monospace', color: '#10B981', textAlign: lang === 'en' ? 'right' : 'left', wordBreak: 'break-all', marginLeft: '12px', direction: 'ltr' }}>dkim.upklick.com</span>
                </div>
              </div>
            </div>

            {/* DMARC Record */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                <span style={{ fontWeight: '900', color: '#F59E0B', fontSize: '14px' }}>{lang === 'en' ? '3. DMARC Record' : '3. سجل DMARC'}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#E8EDF5', fontWeight: 'bold' }}>Type: TXT</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Name / Host:</span>
                  <span style={{ fontFamily: 'monospace', color: '#fff' }}>_dmarc</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', alignItems: 'center', flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <span style={{ color: '#8B96A8' }}>Value:</span>
                  <span style={{ fontFamily: 'monospace', color: '#10B981', textAlign: lang === 'en' ? 'right' : 'left', wordBreak: 'break-all', marginLeft: '12px', direction: 'ltr' }}>v=DMARC1; p=none; rua=mailto:{supportEmail || 'admin@' + (domainName || 'yourdomain.com')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}
