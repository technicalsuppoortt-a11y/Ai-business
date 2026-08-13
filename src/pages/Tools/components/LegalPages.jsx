import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import useToolCache from '../../../hooks/useToolCache';
import { useToast } from '../../../context/ToastContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  RotateCcw,
  RefreshCw,
  Globe,
  Mail,
  Building,
  Check,
  Copy,
  AlertTriangle,
  ChevronDown,
  Scale,
  Lock,
  BookOpen,
  Search,
  PenTool,
  Cookie,
  Download,
  Code,
  Sliders,
  X,
  Sparkles,
  Command,
  FileCheck
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="lp-label" style={{ margin: 0 }}>
            {Icon && <Icon size={13} color="#6366F1" strokeWidth={1.5} />}
            <span>{label}</span>
          </label>
          <button 
            type="button"
            onClick={() => setIsCustomInputMode(!isCustomInputMode)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#818CF8', 
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
                <span>{lang === 'en' ? '+ Custom country' : '+ كتابة دولة مخصصة'}</span>
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
            <ChevronDown size={14} color="#94A3B8" />
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
            <div className="lp-search-box">
              <Search size={13} color="#94A3B8" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search country (e.g. Egypt, Saudi, USA)...' : 'بحث عن دولة (مثال: مصر، السعودية، الإمارات)...'}
              />
            </div>

            {searchQuery.trim() && (
              <div 
                className="lp-dropdown-option custom-add-option"
                onClick={() => handleSelect(searchQuery.trim())}
              >
                <span style={{ color: '#6366F1', fontWeight: 800 }}>
                  ✨ {lang === 'en' ? `Use typed: "${searchQuery}"` : `استخدام الدولة المدخلة: "${searchQuery}"`}
                </span>
                <Check size={13} color="#6366F1" />
              </div>
            )}

            {filteredOptions.length === 0 && !searchQuery.trim() ? (
              <div style={{ padding: '10px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
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
                  {String(opt.value) === String(value) && <Check size={13} color="#6366F1" />}
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
  const { userData } = useAuth();
  const toastContext = useToast();
  const toast = useToast();

  const lang = state.language || 'ar';
  const isRtl = lang?.startsWith('ar');

  // Configurator Drawer Overlay State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Inputs
  const [brandName, setBrandName] = useState(state.brandName || '');
  const [contactEmail, setContactEmail] = useState(state.contactEmail || '');
  const [websiteUrl, setWebsiteUrl] = useState(state.websiteUrl || '');
  const [country, setCountry] = useState(state.country || (lang === 'en' ? 'USA' : 'مصر'));
  const [validationError, setValidationError] = useState('');
  
  const [activeTab, setActiveTab] = useState('privacy'); // privacy | terms | refund | cookie

  const { cachedData: cached, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'legal-pages');
  const isLoadedFromCloud = !isLoadingCache;
  const hydratedRef = useRef(false);

  // Hydrate from Cache
  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.brandName !== undefined) setBrandName(cached.brandName);
        if (cached.contactEmail !== undefined) setContactEmail(cached.contactEmail);
        if (cached.websiteUrl !== undefined) setWebsiteUrl(cached.websiteUrl);
        if (cached.country !== undefined) setCountry(cached.country);
        if (cached.activeTab !== undefined) setActiveTab(cached.activeTab);
      }
    }
  }, [isLoadedFromCloud, cached]);

  // Auto-Save to Cache
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ brandName, contactEmail, websiteUrl, country, activeTab });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [brandName, contactEmail, websiteUrl, country, activeTab, isLoadedFromCloud]);

  const handleResetSession = () => {
    setBrandName('');
    setContactEmail('');
    setWebsiteUrl('');
    setCountry(lang === 'en' ? 'USA' : 'مصر');
    setActiveTab('privacy');
    saveResult(null);
    toast(lang === 'en' ? 'Legal pages reset successfully!' : 'تم إعادة ضبط الوثائق القانونية!', 'info');
  };

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K) to open Inspector Drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Safe Copy helper
  const safeCopyToClipboard = (text, successMsgEn, successMsgAr) => {
    const copyPromise = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text)
      : new Promise((resolve, reject) => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            resolve();
          } catch (e) {
            reject(e);
          }
        });

    copyPromise.then(() => {
      toast(lang === 'en' ? successMsgEn : successMsgAr, 'success');
    }).catch(err => {
      console.error(err);
      toast(lang === 'en' ? 'Failed to copy to clipboard' : 'تعذر النسخ إلى الحافظة', 'error');
    });
  };

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

  const generateCookiePolicy = () => {
    if (lang === 'en') {
      return `
Cookie & GDPR Compliance Policy for ${brandName || '[Brand Name]'}

1. What are Cookies?
Cookies are small text files placed on your device to enhance your browsing experience on ${websiteUrl || '[Website URL]'}.

2. Types of Cookies We Use
- Essential Cookies: Necessary for site security and session login.
- Analytics Cookies: Helps us understand visitor behavior via Google Analytics.
- Marketing Cookies: Used to deliver relevant advertisements based on interest.

3. Managing Cookies
You can manage or disable cookie preferences directly in your browser settings at any time.

Contact: ${contactEmail || '[Email Address]'}
      `.trim();
    }
    return `
سياسة ملفات تعريف الارتباط (Cookies) والتوافق مع GDPR لـ ${brandName || '[اسم البراند]'}

1. ما هي ملفات تعريف الارتباط؟
ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك لتحسين تجربة التصفح عبر موقعنا ${websiteUrl || '[رابط الموقع]'}.

2. أنواع ملفات الكوكيز المستخدمة
- الكوكيز الأساسية: ضرورية لأمان الموقع وتسجيل الدخول.
- كوكيز التحليلات: تساعدنا في فهم سلوك الزوار عبر Google Analytics.
- كوكيز التسويق: تُستخدم لتقديم إعلانات موجهة تناسب اهتماماتك.

3. إدارة التفضيلات
يمكنك التحكم في تفضيلات وتعطيل الكوكيز في أي وقت مباشرة من إعدادات متصفحك.

للتواصل: ${contactEmail || '[البريد الإلكتروني]'}
    `.trim();
  };

  const getContent = () => {
    switch(activeTab) {
      case 'privacy': return generatePrivacyPolicy();
      case 'terms': return generateTerms();
      case 'refund': return generateRefundPolicy();
      case 'cookie': return generateCookiePolicy();
      default: return '';
    }
  };

  const currentContent = getContent();

  const handleCopy = () => {
    if (!brandName.trim() || !contactEmail.trim() || !websiteUrl.trim()) {
      setValidationError(
        lang === 'en' 
          ? 'Notice: Some fields (Brand Name, Email, or Website) are empty. Click "Edit Business Parameters" to customize.' 
          : 'تنبيه: بعض الحقول فارغة. اضغط على "تعديل بيانات المشروع" للتخصيص.'
      );
      toast(
        lang === 'en' ? 'Please complete brand details for customized terms.' : 'يرجى استكمال بيانات البراند لتخصيص الشروط.', 
        'warning'
      );
    } else {
      setValidationError('');
    }

    safeCopyToClipboard(currentContent, 'Legal document copied to clipboard! ✅', 'تم نسخ الوثيقة القانونية إلى الحافظة! ✅');
  };

  const downloadTxtFile = () => {
    const filename = `${(brandName || 'legal_document').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${activeTab}.txt`;
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(lang === 'en' ? 'Document TXT downloaded! ✅' : 'تم تحميل ملف الوثيقة النصي بنجاح! ✅', 'success');
  };

  const exportHtmlFile = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${brandName || 'Legal Document'} - ${activeTab.toUpperCase()}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.85; color: #0F172A; max-width: 800px; margin: 40px auto; padding: 24px; }
    h1 { color: #6366F1; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
  </style>
</head>
<body>
  <pre>${currentContent}</pre>
</body>
</html>
    `.trim();

    const filename = `${(brandName || 'legal_document').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${activeTab}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(lang === 'en' ? 'Document HTML exported! ✅' : 'تم تصدير ملف HTML بنجاح! ✅', 'success');
  };

  const tabsList = [
    { id: 'privacy', label_ar: 'سياسة الخصوصية', label_en: 'Privacy Policy', IconComp: Shield },
    { id: 'terms', label_ar: 'الشروط والأحكام', label_en: 'Terms & Conditions', IconComp: FileText },
    { id: 'refund', label_ar: 'سياسة الاسترجاع', label_en: 'Refund Policy', IconComp: RotateCcw },
    { id: 'cookie', label_ar: 'ملفات الكوكيز (Cookies)', label_en: 'Cookie Policy', IconComp: Cookie }
  ];

  const wordCount = currentContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentContent.length;

  
  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="legal-pages"
        title={lang === 'en' ? 'Full-Screen Legal Canvas Workspace' : 'منصة الشاشة الكاملة للوثائق القانونية'}
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#6366F1"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sleek Skeleton Loader */}
          <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="legal-pages"
      title={lang === 'en' ? 'Full-Screen Legal Canvas Workspace' : 'منصة الشاشة الكاملة للوثائق القانونية'}
      subtitle={lang === 'en' ? 'Full-width legal editor with floating parameters inspector overlay.' : 'استوديو شاشة كاملة لعرض وتخصيص كافة الوثائق القانونية لموقعك بمرونة فائقة.'}
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="10 - 15"
    >
      <div className="lp-canvas-container" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* 1. TOP FLOATING GLASS ACTION HEADER BAR */}
        <div className="lp-floating-header">
          {/* Left Side: Document Tab Selector Pills */}
          <div className="lp-doc-tabs-2030">
            {tabsList.map(tab => {
              const IconComponent = tab.IconComp;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`lp-doc-tab-btn-2030 ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeLegalCanvasTabHighlight" 
                      className="lp-doc-tab-bg-2030" 
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <IconComponent size={14} style={{ zIndex: 1 }} strokeWidth={1.5} />
                  <span style={{ zIndex: 1 }}>{lang === 'en' ? tab.label_en : tab.label_ar}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Primary Actions & Inspector Trigger */}
          <div className="lp-header-actions">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="lp-btn-inspector-trigger"
            >
              <Sliders size={14} strokeWidth={1.5} />
              <span>{lang === 'en' ? 'Edit Business Info' : 'تعديل بيانات المشروع'}</span>
              <span className="lp-shortcut-badge">⌘K</span>
            </button>

            <button 
              onClick={handleCopy}
              className="lp-btn-action-ghost"
              title={lang === 'en' ? 'Copy Document' : 'نسخ الوثيقة'}
            >
              <Copy size={13} />
              <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
            </button>

            <button 
              onClick={downloadTxtFile}
              className="lp-btn-action-ghost"
              title={lang === 'en' ? 'Download TXT' : 'تحميل TXT'}
            >
              <Download size={13} />
              <span>TXT</span>
            </button>

            <button 
              onClick={exportHtmlFile}
              className="lp-btn-action-ghost"
              title={lang === 'en' ? 'Export HTML' : 'تصدير HTML'}
            >
              <Code size={13} />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* 2. 100% VIEWPORT WIDTH DOCUMENT STUDIO CANVAS */}
        <div className="lp-full-canvas">
          <div className="lp-canvas-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="lp-canvas-badge">
                <Lock size={12} />
                <span>{lang === 'en' ? `Governing Law: ${country}` : `القانون المطبق: ${country}`}</span>
              </span>
              <span className="lp-canvas-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)', color: '#10B981' }}>
                <FileCheck size={12} />
                <span>{lang === 'en' ? 'Auto-Synced' : 'متوافق ومحدث'}</span>
              </span>
            </div>

            <div className="lp-canvas-stats">
              <span>{lang === 'en' ? `${wordCount} words` : `${wordCount} كلمة`}</span>
              <span>•</span>
              <span>{lang === 'en' ? `${charCount} characters` : `${charCount} حرف`}</span>
            </div>
          </div>

          <div className="lp-document-paper-card">
            <AnimatePresence mode="wait">
              <motion.pre 
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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

        {/* 3. FLOATING COMMAND & CONFIGURATOR SIDE-DRAWER (Z-INDEX OVERLAY) */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div 
              className="lp-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            >
              <motion.div 
                className="lp-drawer-panel"
                initial={{ x: isRtl ? -400 : 400 }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? -400 : 400 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lp-drawer-header">
                  <h3 className="lp-drawer-title">
                    <Sliders size={18} color="#6366F1" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Business Legal Parameters' : 'تعديل البيانات القانونية'}</span>
                  </h3>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {validationError && (
                  <div className="lp-validation-alert">
                    <AlertTriangle size={16} flexShrink={0} />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="lp-form-group">
                  <label className="lp-label">
                    <Building size={13} color="#6366F1" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Brand / Company Name' : 'اسم البراند / الشركة'}</span>
                    <span className="lp-label-accent">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="lp-input"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder={lang === 'en' ? "e.g. Nova Studio Ltd." : "مثال: شركة نوفا ستوديو"}
                  />
                </div>

                <div className="lp-form-group">
                  <label className="lp-label">
                    <Globe size={13} color="#6366F1" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Website Domain URL' : 'رابط الموقع (Domain)'}</span>
                    <span className="lp-label-accent">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="lp-input"
                    dir="ltr"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  />
                </div>

                <div className="lp-form-group">
                  <label className="lp-label">
                    <Mail size={13} color="#6366F1" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Support Contact Email' : 'إيميل الدعم الفني والقانوني'}</span>
                    <span className="lp-label-accent">*</span>
                  </label>
                  <input 
                    type="email" 
                    className="lp-input"
                    dir="ltr"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@example.com"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  />
                </div>

                <div className="lp-form-group">
                  <SearchableCountryDropdown 
                    label={lang === 'en' ? 'Country (Governing Law)' : 'الدولة (للقوانين والنزاعات المطبقة)'}
                    icon={Lock}
                    value={country}
                    onChange={setCountry}
                    options={countryOptions}
                    placeholder={lang === 'en' ? 'Select Jurisdiction...' : 'اختر الدولة المطبقة...'}
                    lang={lang}
                  />
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      toast(lang === 'en' ? 'Business parameters updated!' : 'تم تحديث البيانات والمعلومات القانونية بنجاح!', 'success');
                    }}
                    className="wc-btn wc-btn-primary"
                    style={{ width: '100%' }}
                  >
                    <span>{lang === 'en' ? 'Close & View Document' : 'إغلاق ومعاينة الوثائق'}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. STICKY MOBILE ACTION BAR PILL */}
        <div className="lp-mobile-sticky-bar-2030">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="wc-btn wc-btn-secondary"
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            <Sliders size={13} /> {lang === 'en' ? 'Edit Info' : 'تعديل البيانات'}
          </button>
          <button 
            onClick={handleCopy}
            className="wc-btn wc-btn-primary"
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            <Copy size={13} /> {lang === 'en' ? 'Copy Document' : 'نسخ الوثيقة'}
          </button>
        </div>
      </div>
    </ToolDashboardLayout>
  );
}
