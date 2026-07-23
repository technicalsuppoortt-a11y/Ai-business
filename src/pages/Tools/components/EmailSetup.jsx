import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Server,
  Key,
  Lock,
  AlertCircle,
  Check,
  Send,
  Cpu,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import './EmailSetup.css';

export default function EmailSetup({ stepNumber }) {
  const { state } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // Inputs
  const [domainName, setDomainName] = useState(state.websiteUrl ? state.websiteUrl.replace(/^https?:\/\//, '') : '');
  const [supportEmail, setSupportEmail] = useState(state.contactEmail || '');
  
  const handleCopyRecord = (recordName, recordVal) => {
    navigator.clipboard.writeText(recordVal);
    toast(
      lang === 'en' 
        ? `${recordName} value copied to clipboard! ✅` 
        : `تم نسخ قيمة ${recordName} إلى الحافظة! ✅`, 
      'success'
    );
  };

  const handleCopyAllRecords = () => {
    const allRecords = `Domain: ${domainName || 'yourdomain.com'}\n\n1. SPF Record (TXT)\nHost: @\nValue: v=spf1 include:spf.upklick.com ~all\n\n2. DKIM Record (CNAME)\nHost: upklick._domainkey\nValue: dkim.upklick.com\n\n3. DMARC Record (TXT)\nHost: _dmarc\nValue: v=DMARC1; p=none; rua=mailto:${supportEmail || 'admin@' + (domainName || 'yourdomain.com')}`;
    
    navigator.clipboard.writeText(allRecords);
    toast(lang === 'en' ? 'All DNS records copied to clipboard! ✅' : 'تم نسخ جميع سجلات الـ DNS إلى الحافظة! ✅', 'success');
  };

  const bottomSections = [
    {
      icon: <ShieldCheck size={18} color="#3B82F6" />,
      title: lang === 'en' ? 'Why do we need this?' : 'لماذا نحتاج هذا؟',
      items: [
        lang === 'en' ? 'To ensure your emails reach the Inbox and not the Spam folder.' : 'لكي يصل الإيميل الخاص بك إلى الـ Inbox وليس الـ Spam.',
        lang === 'en' ? 'You must prove to service providers (like Gmail) that you truly own the domain and use authorized servers.' : 'يجب أن تثبت لمزودي الخدمة (مثل Gmail) أنك المالك الحقيقي للدومين وتستخدم سيرفرات مصرحة.',
        lang === 'en' ? 'Authenticated messages increase your store\'s credibility and customer trust.' : 'الرسائل الموثقة تزيد من مصداقية متجرك وثقة العملاء.'
      ]
    },
    {
      icon: <CheckCircle2 size={18} color="#10B981" />,
      title: lang === 'en' ? 'Tips to ensure authentication' : 'نصائح لضمان التوثيق',
      items: [
        lang === 'en' ? 'Records may take 15 minutes to 24 hours to update across all internet servers (DNS Propagation).' : 'قد تستغرق السجلات من 15 دقيقة إلى 24 ساعة حتى تتحدث في جميع خوادم الإنترنت (DNS Propagation).',
        lang === 'en' ? 'Make sure there are no empty spaces when copying record values.' : 'تأكد من عدم وجود مسافات فارغة عند نسخ قيم السجلات.',
        lang === 'en' ? 'Use tools like Mail-Tester to make sure you get a 10/10 score before actually sending to customers.' : 'استخدم أدوات مثل Mail-Tester للتأكد من حصولك على تقييم 10/10 قبل الإرسال الفعلي للعملاء.'
      ]
    }
  ];

  const dnsRecords = [
    {
      id: 'spf',
      title_ar: '1. سجل SPF',
      title_en: '1. SPF Record',
      color: '#3B82F6',
      IconComp: Server,
      type: 'TXT',
      host: '@',
      value: 'v=spf1 include:spf.upklick.com ~all'
    },
    {
      id: 'dkim',
      title_ar: '2. سجل DKIM',
      title_en: '2. DKIM Record',
      color: '#8B5CF6',
      IconComp: Key,
      type: 'CNAME',
      host: 'upklick._domainkey',
      value: 'dkim.upklick.com'
    },
    {
      id: 'dmarc',
      title_ar: '3. سجل DMARC',
      title_en: '3. DMARC Record',
      color: '#F59E0B',
      IconComp: Lock,
      type: 'TXT',
      host: '_dmarc',
      value: `v=DMARC1; p=none; rua=mailto:${supportEmail || 'admin@' + (domainName || 'yourdomain.com')}`
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
      <div className="es-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="es-main-grid">
          
          {/* ═══════════════ INPUTS FORM & GUIDE ═══════════════ */}
          <div className="es-panel">
            <div className="es-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 className="es-panel-title">
                  <span>{lang === 'en' ? 'Domain Email Parameters' : 'بيانات إيميل المتجر والرابط'}</span>
                </h3>
                <p className="es-panel-subtitle">
                  {lang === 'en' ? 'Enter your custom domain and official sending address.' : 'أدخل اسم الدومين والإيميل الرسمي المراد تفعيل التوثيق لهما.'}
                </p>
              </div>
            </div>

            <div className="es-form-group">
              <label className="es-label">
                <Globe size={14} color="#F59E0B" />
                <span>{lang === 'en' ? 'Your Store Domain' : 'الدومين الخاص بك'}</span>
              </label>
              <input 
                type="text" 
                className="es-input"
                dir="ltr"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="example.com"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            <div className="es-form-group">
              <label className="es-label">
                <Send size={14} color="#F59E0B" />
                <span>{lang === 'en' ? 'Official Sending Email' : 'إيميل الإرسال الرسمي'}</span>
              </label>
              <input 
                type="email" 
                className="es-input"
                dir="ltr"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@example.com"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
            
            {/* How to Test Box */}
            <div className="es-guide-box">
              <h4>
                <CheckSquare size={16} color="#F59E0B" />
                <span>{lang === 'en' ? 'How to verify your settings?' : 'كيف تتأكد أن إعداداتك صحيحة؟'}</span>
              </h4>
              <ul className="es-guide-steps">
                <li>
                  <div className="es-guide-step-bullet">1</div>
                  <span>{lang === 'en' ? 'Wait 15 minutes to 24 hours for records to update.' : 'انتظر من 15 دقيقة إلى 24 ساعة لتتحدث السجلات عبر السيرفرات.'}</span>
                </li>
                <li>
                  <div className="es-guide-step-bullet">2</div>
                  <span>
                    {lang === 'en' ? 'Go to ' : 'اذهب لموقع '}
                    <a 
                      href="https://www.mail-tester.com/" 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>Mail-Tester.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </span>
                </li>
                <li>
                  <div className="es-guide-step-bullet">3</div>
                  <span>{lang === 'en' ? 'Copy the test email provided by the site.' : 'انسخ الإيميل المؤقت الذي يمنحه لك الموقع.'}</span>
                </li>
                <li>
                  <div className="es-guide-step-bullet">4</div>
                  <span>{lang === 'en' ? 'Send a test email from your official store email to it.' : 'أرسل إيميل تجريبي من إيميلك الرسمي إليه.'}</span>
                </li>
                <li>
                  <div className="es-guide-step-bullet">5</div>
                  <span>{lang === 'en' ? 'You should get a 10/10 score for 100% inbox delivery.' : 'يجب أن تحصل على تقييم 10/10 لضمان وصول الرسائل للإنبوكس.'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ═══════════════ REQUIRED DNS RECORDS ═══════════════ */}
          <div className="es-panel">
            <div className="es-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="es-panel-title">
                    <span>{lang === 'en' ? 'Required DNS Records' : 'سجلات DNS المطلوبة'}</span>
                  </h3>
                  <p className="es-panel-subtitle">
                    {lang === 'en' ? 'Add these records in your domain provider panel (Namecheap, Cloudflare, etc).' : 'انسخ السجلات التالية وأضفها في لوحة تحكم الدومين.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleCopyAllRecords}
                className="es-copy-mini-btn"
                style={{ padding: '8px 14px', borderRadius: '10px' }}
                title={lang === 'en' ? 'Copy All DNS Records' : 'نسخ جميع السجلات'}
              >
                <Copy size={13} />
                <span>{lang === 'en' ? 'Copy All' : 'نسخ الكل'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dnsRecords.map((rec, idx) => {
                const RecordIcon = rec.IconComp;
                return (
                  <motion.div 
                    key={rec.id}
                    className="es-record-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <div className="es-record-header">
                      <span className="es-record-title" style={{ color: rec.color }}>
                        <RecordIcon size={16} />
                        <span>{lang === 'en' ? rec.title_en : rec.title_ar}</span>
                      </span>

                      <span className="es-type-badge">
                        Type: {rec.type}
                      </span>
                    </div>

                    <div className="es-record-row">
                      <span className="es-record-key">
                        {lang === 'en' ? 'Name / Host:' : 'الاسم / المضيف:'}
                      </span>
                      <span className="es-record-val" style={{ fontWeight: 800 }}>
                        {rec.host}
                      </span>
                    </div>

                    <div className="es-record-row" style={{ justifyContent: 'space-between' }}>
                      <span className="es-record-key">
                        {lang === 'en' ? 'Record Value:' : 'قيمة السجل:'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
                        <span className="es-record-val accent">
                          {rec.value}
                        </span>
                        <button 
                          onClick={() => handleCopyRecord(rec.type, rec.value)}
                          className="es-copy-mini-btn"
                          title={lang === 'en' ? `Copy ${rec.type} value` : `نسخ قيمة ${rec.type}`}
                        >
                          <Copy size={12} />
                          <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}
