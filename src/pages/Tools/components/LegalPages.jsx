import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function LegalPages({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  // Inputs
  const [brandName, setBrandName] = useState(state.brandName || '');
  const [contactEmail, setContactEmail] = useState(state.contactEmail || '');
  const [websiteUrl, setWebsiteUrl] = useState(state.websiteUrl || '');
  const [country, setCountry] = useState(state.country || (lang === 'en' ? 'USA' : 'مصر'));
  
  const [activeTab, setActiveTab] = useState('privacy'); // privacy, terms, refund

  const generatePrivacyPolicy = () => {
    if (lang === 'en') {
      return `
Privacy Policy for ${brandName || '[Brand Name]'}

Last Updated: ${new Date().toLocaleDateString('en-US')}

1. Introduction
At ${brandName || '[Brand Name]'}, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect the information you provide through our website ${websiteUrl || '[Website URL]'}.

2. Information We Collect
We may collect the following data when you use our services:
- Name, email, and phone number.
- Payment information (processed via secure gateways, we do not store this).
- Usage data and browsing preferences (such as Cookies).

3. How We Use Your Information?
We use the collected data for the following purposes:
- Providing and improving our services.
- Processing payments and orders.
- Communicating with you regarding updates and offers.
- Improving the user experience on the site.

4. Data Sharing
We do not sell or rent your personal information to any third party. We may share some data only with trusted service providers (like shipping companies or payment gateways) to complete your order.

5. Your Rights
You have the right to request access to, correct, or delete your personal data at any time by contacting us.

6. Contact Us
If you have any questions about this policy, you can contact us via:
Email: ${contactEmail || '[Email Address]'}
Country: ${country || '[Country]'}
      `.trim();
    }
    return `
سياسة الخصوصية لـ ${brandName || '[اسم البراند]'}

تاريخ آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}

1. مقدمة
نحن في ${brandName || '[اسم البراند]'} نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع واستخدام وحماية المعلومات التي تقدمها لنا عبر موقعنا ${websiteUrl || '[رابط الموقع]'}.

2. المعلومات التي نجمعها
قد نقوم بجمع البيانات التالية عند استخدامك لخدماتنا:
- الاسم، البريد الإلكتروني، ورقم الهاتف.
- معلومات الدفع (تتم معالجتها عبر بوابات دفع آمنة ولا نحتفظ بها).
- بيانات الاستخدام وتفضيلات التصفح (مثل ملفات تعريف الارتباط Cookies).

3. كيف نستخدم معلوماتك؟
نستخدم البيانات التي نجمعها للأغراض التالية:
- تقديم خدماتنا وتطويرها.
- معالجة المدفوعات والطلبات.
- التواصل معك بخصوص التحديثات والعروض.
- تحسين تجربة المستخدم على الموقع.

4. مشاركة البيانات
لا نقوم ببيع أو تأجير معلوماتك الشخصية لأي طرف ثالث. قد نشارك بعض البيانات فقط مع مزودي الخدمات الموثوقين (مثل شركات الشحن أو بوابات الدفع) لإتمام طلبك.

5. حقوقك
يحق لك طلب الوصول إلى بياناتك الشخصية، أو تصحيحها، أو حذفها في أي وقت عبر التواصل معنا.

6. اتصل بنا
إذا كان لديك أي أسئلة حول هذه السياسة، يمكنك التواصل معنا عبر:
البريد الإلكتروني: ${contactEmail || '[البريد الإلكتروني]'}
الدولة: ${country || '[الدولة]'}
    `.trim();
  };

  const generateTerms = () => {
    if (lang === 'en') {
      return `
Terms and Conditions for ${brandName || '[Brand Name]'}

1. Acceptance of Terms
By accessing ${websiteUrl || '[Website URL]'} or using our services, you agree to be bound by these terms and conditions. If you do not agree to any part, please do not use the site.

2. Use of Services
- You must be 18 years or older to use our paid services.
- It is prohibited to use our services for any illegal or unauthorized purposes.

3. Intellectual Property Rights
All content on this site (text, images, logos) is the property of ${brandName || '[Brand Name]'} and protected by intellectual property laws. It may not be copied or reused without written permission.

4. Pricing and Payment
- We reserve the right to modify our product or service prices at any time without prior notice.
- All payments are final and subject to our refund policy.

5. Disclaimer
We provide our services "as is". We do not guarantee that the services will be error-free or uninterrupted, and we will not be liable for any indirect damages resulting from the use of the site.

6. Governing Law
These terms are governed by the laws of ${country || '[Country]'}, and any disputes shall be settled in the competent courts there.

Contact: ${contactEmail || '[Email Address]'}
      `.trim();
    }
    return `
الشروط والأحكام لـ ${brandName || '[اسم البراند]'}

1. الموافقة على الشروط
بدخولك إلى موقع ${websiteUrl || '[رابط الموقع]'} أو استخدام خدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام الموقع.

2. استخدام الخدمات
- يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا المدفوعة.
- يمنع استخدام خدماتنا لأي أغراض غير قانونية أو غير مصرح بها.

3. حقوق الملكية الفكرية
جميع المحتويات الموجودة على هذا الموقع (نصوص، صور، شعارات) هي ملك لـ ${brandName || '[اسم البراند]'} ومحمية بموجب قوانين حماية الملكية الفكرية. لا يجوز نسخها أو إعادة استخدامها بدون إذن كتابي.

4. الأسعار والدفع
- نحتفظ بالحق في تعديل أسعار منتجاتنا أو خدماتنا في أي وقت دون إشعار مسبق.
- جميع المدفوعات نهائية وتخضع لسياسة الاسترجاع الخاصة بنا.

5. إخلاء المسؤولية
نقدم خدماتنا "كما هي". لا نضمن أن تكون الخدمات خالية من الأخطاء أو الانقطاعات المستمرة، ولن نكون مسؤولين عن أي أضرار غير مباشرة تنتج عن استخدام الموقع.

6. القانون المطبق
تخضع هذه الشروط لقوانين دولة ${country || '[الدولة]'}، ويتم تسوية أي نزاعات في المحاكم المختصة هناك.

للتواصل: ${contactEmail || '[البريد الإلكتروني]'}
    `.trim();
  };

  const generateRefundPolicy = () => {
    if (lang === 'en') {
      return `
Refund Policy for ${brandName || '[Brand Name]'}

Your satisfaction is our priority. If you are not completely satisfied with your purchase, we are here to help.

Digital Products and Services:
Due to the nature of digital products (which can be downloaded immediately) and consulting services, all sales are considered final and refunds cannot be issued except in the following cases:
1. The agreed service/product was not delivered.
2. A fundamental technical flaw prevents you from using the product, and our support team fails to resolve it within 72 hours.

Physical Products (if applicable):
- You have the right to request a return within 14 days from the date of receipt.
- The product must be in its original, unused condition and in its original packaging.
- The customer bears the return shipping cost, unless the product is defective or sent by mistake.

How to Request a Refund:
To submit a return request, please contact us via email at ${contactEmail || '[Email Address]'} with your order number and reason for return. Our team will respond to you within 48 hours.
      `.trim();
    }
    return `
سياسة الاسترجاع لـ ${brandName || '[اسم البراند]'}

رضاكم هو أولويتنا. إذا لم تكن راضياً تماماً عن مشترياتك، فنحن هنا للمساعدة.

المنتجات الرقمية والخدمات:
نظراً لطبيعة المنتجات الرقمية (التي يمكن تحميلها فوراً) والخدمات الاستشارية، فإن جميع المبيعات تعتبر نهائية ولا يمكن استرجاع المبالغ المدفوعة إلا في الحالات التالية:
1. لم يتم تسليم الخدمة/المنتج المتفق عليه.
2. وجود خلل تقني جذري يمنعك من استخدام المنتج، وفشل فريق الدعم لدينا في حله خلال 72 ساعة.

المنتجات الملموسة (إن وجدت):
- يحق لك طلب إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام.
- يجب أن يكون المنتج في حالته الأصلية وغير مستخدم وفي تغليفه الأصلي.
- يتحمل العميل تكلفة الشحن للإرجاع، إلا إذا كان المنتج معيباً أو تم إرساله بالخطأ.

كيفية طلب الاسترجاع:
لتقديم طلب استرجاع، يرجى التواصل معنا عبر البريد الإلكتروني ${contactEmail || '[البريد الإلكتروني]'} مع ذكر رقم الطلب وسبب الإرجاع. سيقوم فريقنا بالرد عليك خلال 48 ساعة.
    `.trim();
  };

  const getContent = () => {
    switch(activeTab) {
      case 'privacy': return generatePrivacyPolicy();
      case 'terms': return generateTerms();
      case 'refund': return generateRefundPolicy();
      default: return '';
    }
  };

  const currentContent = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    alert(lang === 'en' ? 'Text copied successfully!' : 'تم نسخ النص بنجاح!');
  };

  return (
    <ToolDashboardLayout
      id="legal-pages"
      title={lang === 'en' ? 'Legal Pages Generator' : 'مولد الصفحات القانونية'}
      subtitle={lang === 'en' ? 'Generate privacy policy, terms & conditions, and refund policy for your site with one click to protect your business legally.' : 'قم بتوليد سياسة الخصوصية، الشروط والأحكام، وسياسة الاسترجاع الخاصة بموقعك بضغطة زر لحماية عملك قانونياً.'}
      stepNumber={stepNumber}
      accentColor="#8B5CF6"
      timeEstimate="10 - 15"
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Brand / Company Name' : 'اسم البراند / الشركة'}
            </label>
            <input 
              type="text" 
              className="td-input"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder={lang === 'en' ? "e.g. UpKlick" : "مثال: UpKlick"}
              style={{ borderColor: brandName ? '#8B5CF6' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Website URL' : 'رابط الموقع (Domain)'}
            </label>
            <input 
              type="text" 
              className="td-input"
              dir="ltr"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ textAlign: 'left' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Support Email' : 'إيميل الدعم الفني'}
            </label>
            <input 
              type="email" 
              className="td-input"
              dir="ltr"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@example.com"
              style={{ textAlign: 'left' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Country (For Governing Law)' : 'الدولة (للقوانين المطبقة)'}
            </label>
            <input 
              type="text" 
              className="td-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={lang === 'en' ? "e.g. USA, UK, UAE" : "مثال: مصر، السعودية، الإمارات"}
            />
          </div>
        </div>

        {/* ═══════════════ GENERATED DOCUMENTS ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          
          {/* Document Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
            {[
              { id: 'privacy', label_ar: 'الخصوصية', label_en: 'Privacy Policy' },
              { id: 'terms', label_ar: 'الشروط والأحكام', label_en: 'Terms & Conditions' },
              { id: 'refund', label_ar: 'الاسترجاع', label_en: 'Refund Policy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#8B5CF6' : '#8B96A8',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {lang === 'en' ? tab.label_en : tab.label_ar}
              </button>
            ))}
          </div>

          {/* Output Display */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={handleCopy}
              style={{ position: 'absolute', top: 0, left: lang === 'en' ? 'auto' : 0, right: lang === 'en' ? 0 : 'auto', background: '#8B5CF6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10 }}
            >
              📋 {lang === 'en' ? 'Copy' : 'نسخ'}
            </button>
            <div className="td-raw-output" style={{ margin: 0, flex: 1, borderTop: '3px solid #8B5CF6' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '12px', color: '#E8EDF5', lineHeight: '1.8', direction: lang === 'en' ? 'ltr' : 'rtl', textAlign: lang === 'en' ? 'left' : 'right' }}>
                {currentContent}
              </pre>
            </div>
          </div>
          
        </div>

      </div>

    </ToolDashboardLayout>
  );
}
