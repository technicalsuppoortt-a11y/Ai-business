import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  RotateCcw,
  Globe,
  Mail,
  Building,
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Sliders,
  Scale,
  Lock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  PenTool
} from 'lucide-react';
import './LegalPages.css';

// Glassmorphic Searchable & Editable Dropdown for Country Selection
function SearchableCountryDropdown({ value, onChange, options, label, icon: Icon, placeholder, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomInputMode, setIsCustomInputMode] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = options.find(o => String(o.value) === String(value)) || { value, label: value };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setIsCustomInputMode(false);
  };

  return (
    <div className="lp-dropdown-container" ref={dropdownRef}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="lp-label" style={{ margin: 0 }}>
            {Icon && <Icon size={14} color="#8B5CF6" />}
            <span>{label}</span>
          </label>
          <button 
            type="button"
            onClick={() => setIsCustomInputMode(!isCustomInputMode)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#8B5CF6', 
              fontSize: '11px', 
              fontWeight: 800, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isCustomInputMode ? (
              <>
                <ChevronDown size={12} />
                <span>{lang === 'en' ? 'Select from list' : 'اختر من القائمة'}</span>
              </>
            ) : (
              <>
                <PenTool size={11} />
                <span>{lang === 'en' ? '+ Write custom country' : '+ كتابة دولة مخصصة'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {isCustomInputMode ? (
        <input 
          type="text"
          className="lp-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={lang === 'en' ? 'Type country name manually...' : 'اكتب اسم الدولة يدوياً...'}
          autoFocus
        />
      ) : (
        <div 
          className={`lp-dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption?.label || value || placeholder}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} color="var(--text2, #94A3B8)" />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && !isCustomInputMode && (
          <motion.div 
            className="lp-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {/* Advanced Search Bar inside Dropdown Menu */}
            <div className="lp-search-box">
              <Search size={14} color="var(--text2, #94A3B8)" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search country (e.g. Egypt, Saudi, USA)...' : 'بحث عن دولة (مثال: مصر، السعودية، الإمارات)...'}
              />
            </div>

            {/* Custom option when user types a search query */}
            {searchQuery.trim() && (
              <div 
                className="lp-dropdown-option custom-add-option"
                onClick={() => handleSelect(searchQuery.trim())}
              >
                <span style={{ color: '#8B5CF6', fontWeight: 800 }}>
                  ✨ {lang === 'en' ? `Use typed: "${searchQuery}"` : `استخدام الدولة المدخلة: "${searchQuery}"`}
                </span>
                <Check size={14} color="#8B5CF6" />
              </div>
            )}

            {filteredOptions.length === 0 && !searchQuery.trim() ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text2, #94A3B8)', fontSize: '12px' }}>
                {lang === 'en' ? 'No countries found.' : 'لم يتم العثور على دول.'}
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={String(opt.value)}
                  className={`lp-dropdown-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span>{opt.label}</span>
                  {String(opt.value) === String(value) && <Check size={14} color="#8B5CF6" />}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LegalPages({ stepNumber }) {
  const { state } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // Inputs
  const [brandName, setBrandName] = useState(state.brandName || '');
  const [contactEmail, setContactEmail] = useState(state.contactEmail || '');
  const [websiteUrl, setWebsiteUrl] = useState(state.websiteUrl || '');
  const [country, setCountry] = useState(state.country || (lang === 'en' ? 'USA' : 'مصر'));
  const [validationError, setValidationError] = useState('');
  
  const [activeTab, setActiveTab] = useState('privacy'); // privacy, terms, refund

  // Pre-configured popular country options
  const countryOptions = [
    { value: lang === 'en' ? 'Egypt' : 'مصر', label: lang === 'en' ? 'Egypt (مصر)' : 'مصر (Egypt)' },
    { value: lang === 'en' ? 'Saudi Arabia' : 'المملكة العربية السعودية', label: lang === 'en' ? 'Saudi Arabia (السعودية)' : 'المملكة العربية السعودية (Saudi Arabia)' },
    { value: lang === 'en' ? 'United Arab Emirates' : 'الإمارات العربية المتحدة', label: lang === 'en' ? 'United Arab Emirates (الإمارات)' : 'الإمارات العربية المتحدة (UAE)' },
    { value: lang === 'en' ? 'Kuwait' : 'الكويت', label: lang === 'en' ? 'Kuwait (الكويت)' : 'الكويت (Kuwait)' },
    { value: lang === 'en' ? 'Qatar' : 'قطر', label: lang === 'en' ? 'Qatar (قطر)' : 'قطر (Qatar)' },
    { value: lang === 'en' ? 'Bahrain' : 'البحرين', label: lang === 'en' ? 'Bahrain (البحرين)' : 'البحرين (Bahrain)' },
    { value: lang === 'en' ? 'Oman' : 'سلطنة عمان', label: lang === 'en' ? 'Oman (عمان)' : 'سلطنة عمان (Oman)' },
    { value: lang === 'en' ? 'Jordan' : 'الأردن', label: lang === 'en' ? 'Jordan (الأردن)' : 'الأردن (Jordan)' },
    { value: lang === 'en' ? 'Morocco' : 'المغرب', label: lang === 'en' ? 'Morocco (المغرب)' : 'المغرب (Morocco)' },
    { value: lang === 'en' ? 'Algeria' : 'الجزائر', label: lang === 'en' ? 'Algeria (الجزائر)' : 'الجزائر (Algeria)' },
    { value: lang === 'en' ? 'Tunisia' : 'تونس', label: lang === 'en' ? 'Tunisia (تونس)' : 'تونس (Tunisia)' },
    { value: lang === 'en' ? 'Iraq' : 'العراق', label: lang === 'en' ? 'Iraq (العراق)' : 'العراق (Iraq)' },
    { value: lang === 'en' ? 'Lebanon' : 'لبنان', label: lang === 'en' ? 'Lebanon (لبنان)' : 'لبنان (Lebanon)' },
    { value: lang === 'en' ? 'United States' : 'الولايات المتحدة الأمريكية', label: lang === 'en' ? 'United States (USA)' : 'الولايات المتحدة الأمريكية (USA)' },
    { value: lang === 'en' ? 'United Kingdom' : 'المملكة المتحدة', label: lang === 'en' ? 'United Kingdom (UK)' : 'المملكة المتحدة (UK)' },
    { value: lang === 'en' ? 'Canada' : 'كندا', label: lang === 'en' ? 'Canada (كندا)' : 'كندا (Canada)' },
    { value: lang === 'en' ? 'Germany' : 'ألمانيا', label: lang === 'en' ? 'Germany (ألمانيا)' : 'ألمانيا (Germany)' },
    { value: lang === 'en' ? 'France' : 'فرنسا', label: lang === 'en' ? 'France (فرنسا)' : 'فرنسا (France)' },
    { value: lang === 'en' ? 'Turkey' : 'تركيا', label: lang === 'en' ? 'Turkey (تركيا)' : 'تركيا (Turkey)' },
    { value: lang === 'en' ? 'Spain' : 'إسبانيا', label: lang === 'en' ? 'Spain (إسبانيا)' : 'إسبانيا (Spain)' }
  ];

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
    if (!brandName.trim() || !contactEmail.trim() || !websiteUrl.trim()) {
      setValidationError(
        lang === 'en' 
          ? 'Notice: Some fields (Brand Name, Email, or Website) are empty. Please fill them out to generate custom terms.' 
          : 'تنبيه: بعض الحقول (اسم البراند، البريد الإلكتروني أو رابط الموقع) فارغة. يرجى استكمالها لتخصيص الوثيقة.'
      );
      toast(
        lang === 'en' ? 'Please complete the brand details for customized terms.' : 'يرجى استكمال بيانات البراند لتخصيص الشروط.', 
        'warning'
      );
    } else {
      setValidationError('');
    }

    navigator.clipboard.writeText(currentContent);
    toast(lang === 'en' ? 'Document copied to clipboard! ✅' : 'تم نسخ الوثيقة القانونية إلى الحافظة! ✅', 'success');
  };

  const tabsList = [
    { id: 'privacy', label_ar: 'سياسة الخصوصية', label_en: 'Privacy Policy', IconComp: Shield },
    { id: 'terms', label_ar: 'الشروط والأحكام', label_en: 'Terms & Conditions', IconComp: FileText },
    { id: 'refund', label_ar: 'سياسة الاسترجاع', label_en: 'Refund Policy', IconComp: RotateCcw }
  ];

  return (
    <ToolDashboardLayout
      id="legal-pages"
      title={lang === 'en' ? 'Legal Pages Generator' : 'مولد الصفحات القانونية'}
      subtitle={lang === 'en' ? 'Generate privacy policy, terms & conditions, and refund policy for your site with one click to protect your business legally.' : 'قم بتوليد سياسة الخصوصية، الشروط والأحكام، وسياسة الاسترجاع الخاصة بموقعك بضغطة زر لحماية عملك قانونياً.'}
      stepNumber={stepNumber}
      accentColor="#8B5CF6"
      timeEstimate="10 - 15"
    >
      <div className="lp-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="lp-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="lp-panel">
            <div className="lp-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={20} />
              </div>
              <div>
                <h3 className="lp-panel-title">
                  <span>{lang === 'en' ? 'Business Legal Details' : 'البيانات القانونية للمشروع'}</span>
                </h3>
                <p className="lp-panel-subtitle">
                  {lang === 'en' ? 'Provide your company parameters to generate dynamic legal documents.' : 'أدخل بيانات شركتك لتخصيص وثائق الخصوصية والشروط تلقائياً.'}
                </p>
              </div>
            </div>

            {/* Validation Warning Alert */}
            <AnimatePresence>
              {validationError && (
                <motion.div 
                  className="lp-validation-alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertTriangle size={18} flexShrink={0} />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="lp-form-group">
              <label className="lp-label">
                <Building size={14} color="#8B5CF6" />
                <span>{lang === 'en' ? 'Brand / Company Name' : 'اسم البراند / الشركة'}</span>
                <span className="lp-label-accent">*</span>
              </label>
              <input 
                type="text" 
                className={`lp-input ${validationError && !brandName ? 'error' : ''}`}
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  if (e.target.value.trim()) setValidationError('');
                }}
                placeholder={lang === 'en' ? "e.g. UpKlick Ltd." : "مثال: شركة أب كليك"}
              />
            </div>

            <div className="lp-form-group">
              <label className="lp-label">
                <Globe size={14} color="#8B5CF6" />
                <span>{lang === 'en' ? 'Website Domain URL' : 'رابط الموقع (Domain)'}</span>
                <span className="lp-label-accent">*</span>
              </label>
              <input 
                type="text" 
                className={`lp-input ${validationError && !websiteUrl ? 'error' : ''}`}
                dir="ltr"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  if (e.target.value.trim()) setValidationError('');
                }}
                placeholder="https://example.com"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            <div className="lp-form-group">
              <label className="lp-label">
                <Mail size={14} color="#8B5CF6" />
                <span>{lang === 'en' ? 'Support Contact Email' : 'إيميل الدعم الفني والقانوني'}</span>
                <span className="lp-label-accent">*</span>
              </label>
              <input 
                type="email" 
                className={`lp-input ${validationError && !contactEmail ? 'error' : ''}`}
                dir="ltr"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  if (e.target.value.trim()) setValidationError('');
                }}
                placeholder="support@example.com"
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            <div className="lp-form-group" style={{ marginBottom: 0 }}>
              <SearchableCountryDropdown 
                label={lang === 'en' ? 'Country (For Governing Law)' : 'الدولة (للقوانين والنزاعات المطبقة)'}
                icon={Lock}
                value={country}
                onChange={setCountry}
                options={countryOptions}
                placeholder={lang === 'en' ? 'Select or Search Governing Jurisdiction...' : 'اختر أو ابحث عن الدولة المطبقة لقوانين المتجر...'}
                lang={lang}
              />
            </div>
          </div>

          {/* ═══════════════ GENERATED DOCUMENTS PANEL ═══════════════ */}
          <div className="lp-panel">
            <div className="lp-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="lp-panel-title">
                    <span>{lang === 'en' ? 'Generated Legal Documents' : 'الوثائق القانونية المولدة'}</span>
                  </h3>
                  <p className="lp-panel-subtitle">
                    {lang === 'en' ? 'Ready to copy & paste into your website footer.' : 'جاهزة للنسخ المباشر واللصق في تذييل موقعك.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleCopy}
                className="lp-copy-header-btn"
                title={lang === 'en' ? 'Copy Document' : 'نسخ الوثيقة'}
              >
                <Copy size={14} />
                <span>{lang === 'en' ? 'Copy Document' : 'نسخ الوثيقة'}</span>
              </button>
            </div>

            {/* Document Segmented Tabs with Framer Motion Highlight */}
            <div className="lp-doc-tabs">
              {tabsList.map(tab => {
                const IconComponent = tab.IconComp;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`lp-doc-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeLegalTabHighlight" 
                        className="lp-doc-tab-bg" 
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <IconComponent size={15} style={{ zIndex: 1 }} />
                    <span style={{ zIndex: 1 }}>{lang === 'en' ? tab.label_en : tab.label_ar}</span>
                  </button>
                );
              })}
            </div>

            {/* Output Text Viewer */}
            <div className="lp-output-container">
              <AnimatePresence mode="wait">
                <motion.pre 
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    direction: lang === 'en' ? 'ltr' : 'rtl', 
                    textAlign: lang === 'en' ? 'left' : 'right' 
                  }}
                >
                  {currentContent}
                </motion.pre>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}
