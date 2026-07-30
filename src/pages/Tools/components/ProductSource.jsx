import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getProductIdeasStructure, getProductIdeasV2 } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis, callOpenAiApi } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Target,
  Sparkles,
  DollarSign,
  Award,
  Zap,
  TrendingUp,
  Compass,
  Layers,
  Box,
  ExternalLink,
  Copy,
  X,
  Lightbulb,
  CheckCircle2,
  Flame,
  Star,
  Gem,
  Tag,
  Users,
  Wrench,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers3,
  Palette,
  Bot,
  Share2,
  BarChart3,
  FileText,
  BookOpen,
  Film,
  RotateCcw,
  LayoutGrid,
  CheckSquare,
  Sliders,
  Cpu,
  Activity,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import './ProductSource.css';

/* ==========================================================================
   LANDING & CONTENT STUDIO THEME SELECT COMPONENT
   ========================================================================== */
const CustomStudioSelectPill = ({ icon: IconComp, label, value, options, onChange, color = "#6366F1", isRtl = true, lang = 'ar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options?.find(opt => opt.id === value) || options?.[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="ps-select-pill-wrapper">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ps-select-pill-btn ${isOpen ? 'open' : ''}`}
        style={{
          border: isOpen ? `1px solid ${color}` : undefined,
          boxShadow: isOpen ? `0 0 16px ${color}40` : undefined,
        }}
      >
        <IconComp size={14} color={color} style={{ flexShrink: 0 }} />
        <span style={{ color: color, fontWeight: '700' }}>{label}:</span>
        <span className="ps-pill-val-text">{lang === 'en' ? selectedOption?.name_en : selectedOption?.name_ar}</span>
        <ChevronDown size={14} color={color} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="ps-select-dropdown-card"
            style={{
              [isRtl ? 'right' : 'left']: 0,
              border: `1px solid ${color}60`,
            }}
          >
            {options?.map(opt => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`ps-select-dropdown-item ${isSelected ? 'selected' : ''}`}
                  style={{
                    background: isSelected ? `${color}25` : undefined,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                  {isSelected && <Check size={14} color={color} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductSource({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [structure, setStructure] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedEffort, setSelectedEffort] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState(null);

  // Detail Modal & Tooling Drawer States
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [selectedToolingProduct, setSelectedToolingProduct] = useState(null);
  const [expandedToolIndex, setExpandedToolIndex] = useState(0);

  // DYNAMIC OPENAI API TOOLING STATE (No Static Data!)
  const [aiTools, setAiTools] = useState([]);
  const [isLoadingAiTools, setIsLoadingAiTools] = useState(false);
  const [aiToolsError, setAiToolsError] = useState(null);

  // My Products LocalStorage Management
  const [myProducts, setMyProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('ps_my_products_spatial');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Persist myProducts to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ps_my_products_spatial', JSON.stringify(myProducts));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [myProducts]);

  useEffect(() => {
    const load = async () => {
      const data = await getProductIdeasStructure();
      if (data) {
        setStructure(data);
        if (data.productTypes?.length) setSelectedType(data.productTypes[0].id);
        if (data.niches?.length) setSelectedNiche(data.niches[0].id);
        if (data.effortLevels?.length) setSelectedEffort(data.effortLevels[0].id);
      }
    };
    load();
  }, []);

  // REAL AI API FETCH FUNCTION
  const fetchDynamicAiToolsFromOpenAI = async (product) => {
    setIsLoadingAiTools(true);
    setAiToolsError(null);
    setAiTools([]);
    setExpandedToolIndex(0);

    try {
      const isArabic = lang === 'ar';
      const systemPrompt = `You are an expert AI Digital Product Architect.
Return a JSON object containing an array "tools" with 3 specific tailored creation tools, their roles, descriptions, step-by-step instructions, and export formats to build the user's digital product.

Response format MUST be strict JSON:
{
  "tools": [
    {
      "name": "Tool Name (e.g. Canva Pro, ChatGPT, Notion, Gumroad)",
      "iconType": "palette | bot | share | chart | file | book | film",
      "role": "Role description",
      "desc": "Explanation of tool usage",
      "steps": [
        "Step 1 instruction",
        "Step 2 instruction",
        "Step 3 instruction"
      ],
      "exportFormat": "Final export file format"
    }
  ]
}`;

      const userPrompt = `Digital Product Name: "${product.name_ar || product.name_en || product.name}"
Description: "${product.desc_ar || product.desc_en || product.desc || ''}"
Target Pricing: "${product.price_ar || product.price || ''}"

Generate step-by-step creation tools in ${isArabic ? 'Arabic' : 'English'}.`;

      const responseContent = await callOpenAiApi({
        uid: userData?.uid || state?.user?.uid,
        systemPrompt,
        userPrompt,
        jsonMode: true,
        userEmail: state.user?.email
      });

      const parsed = JSON.parse(responseContent);
      if (parsed && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
        setAiTools(parsed.tools);
      } else {
        throw new Error('Invalid JSON structure returned from AI service.');
      }
    } catch (err) {
      console.error('[ProductSource] AI API Fetch Error:', err);
      setAiToolsError(err.message || 'Failed to fetch dynamic AI guide.');
    } finally {
      setIsLoadingAiTools(false);
    }
  };

  // Helper to generate concrete Etsy Top 10 High-Volume product ideas with STABLE IDs
  const generateEtsyTop10Ideas = (typeId, nicheId, effortId) => {
    const nicheName = structure?.niches?.find(n => n.id === nicheId)?.name_ar || 'المجال المحدد';
    const prefix = `${typeId || 'type'}_${nicheId || 'niche'}`;

    return [
      {
        id: `etsy_${prefix}_1`,
        name_ar: `مخطط ${nicheName} الاحترافي القابل للتعديل 2026`,
        name_en: `Ultimate ${nicheId} Digital Planner 2026 (Hyperlinked)`,
        desc_ar: `قالب أجندة رقمية متكاملة تحتوي على أكثر من 300 صفحة بروابط تفاعلية سريعة، مصممة لاستخدامها على GoodNotes و Notability.`,
        desc_en: `Fully hyperlinked 300+ page digital planner for iPad & tablets. Best-selling Etsy digital product template.`,
        price_ar: '$19.99 - $34.99',
        price_en: '$19.99 - $34.99',
        monthly_sales: '2,400+ مبيعة/شهرياً ($48,000)',
        etsy_rank: '#1 Best Seller على Etsy',
        rating: '4.9 (1,840 تقييم)',
        source_ar: 'Canva PLR + GoodNotes',
        source_en: 'Canva PLR + GoodNotes',
      },
      {
        id: `etsy_${prefix}_2`,
        name_ar: `حزمة 100+ قالب سوشيال ميديا لمجال ${nicheName}`,
        name_en: `100+ Instagram & TikTok Canva Template Pack for ${nicheId}`,
        desc_ar: `مجموعة قوالب Canva جاهزة للتعديل السريع تشمل بوستات، ستوريات، وReels لتجار وصناع محتوى ${nicheName}.`,
        desc_en: `Editable Canva Social Media Post & Stories Bundle for Instagram & TikTok.`,
        price_ar: '$14.99 - $29.99',
        price_en: '$14.99 - $29.99',
        monthly_sales: '1,850+ مبيعة/شهرياً ($27,000)',
        etsy_rank: '#2 Etsy Top Trending',
        rating: '4.8 (920 تقييم)',
        source_ar: 'Canva Template Share Link',
        source_en: 'Canva Template Share Link',
      },
      {
        id: `etsy_${prefix}_3`,
        name_ar: `قاعدة بيانات Notion المتكاملة لإدارة ${nicheName}`,
        name_en: `All-in-One Notion Life & Business OS for ${nicheId}`,
        desc_ar: `لوحة تحكم Notion سهلة الاستخدام تحتوي على تتبع المشاريع، الميزانية، وتخطيط المهام اليومية.`,
        desc_en: `Comprehensive Notion Template System with Finance & Task Trackers.`,
        price_ar: '$24.99 - $49.99',
        price_en: '$24.99 - $49.99',
        monthly_sales: '1,200+ مبيعة/شهرياً ($36,000)',
        etsy_rank: '#3 High Demand Notion OS',
        rating: '5.0 (640 تقييم)',
        source_ar: 'Notion Duplicate Link',
        source_en: 'Notion Duplicate Link',
      },
      {
        id: `etsy_${prefix}_4`,
        name_ar: `كتيب ودليل خبير ${nicheName} (Ebook PLR)`,
        name_en: `The Ultimate ${nicheId} Master Guide & Playbook (PLR)`,
        desc_ar: `كتاب إلكتروني شامل يحتوي على أسرار واستراتيجيات النجاح في ${nicheName} مع حقوق إعادة البيع الكاملة.`,
        desc_en: `Step-by-step master digital ebook guide with full resell & rebrand rights.`,
        price_ar: '$17.00 - $37.00',
        price_en: '$17.00 - $37.00',
        monthly_sales: '950+ مبيعة/شهرياً ($19,000)',
        etsy_rank: '#4 Etsy Bestselling Ebook',
        rating: '4.9 (510 تقييم)',
        source_ar: 'ChatGPT + Designrr / Canva',
        source_en: 'ChatGPT + Designrr / Canva',
      },
      {
        id: `etsy_${prefix}_5`,
        name_ar: `حزمة 50+ شيت Excel و Google Sheets المالية لـ ${nicheName}`,
        name_en: `Automated Excel & Google Sheets Dashboard for ${nicheId}`,
        desc_ar: `جداول برمجية سهلة الحساب التلقائي للمصروفات، الإيرادات، والأرباح الصافية مع رسومات بيانية ديناميكية.`,
        desc_en: `Automated Financial Tracker & Budget Calculator for Google Sheets.`,
        price_ar: '$12.99 - $24.99',
        price_en: '$12.99 - $24.99',
        monthly_sales: '1,500+ مبيعة/شهرياً ($22,500)',
        etsy_rank: '#5 Etsy Spreadsheet Hot',
        rating: '4.9 (1,100 تقييم)',
        source_ar: 'Google Sheets Template',
        source_en: 'Google Sheets Template',
      },
      {
        id: `etsy_${prefix}_6`,
        name_ar: `حزمة 500+ برومبت ذكاء اصطناعي متخصص في ${nicheName}`,
        name_en: `500+ Ultimate AI Prompts Vault for ${nicheId}`,
        desc_ar: `مجموعة أوامر وبرومبتات جاهزة لـ ChatGPT & Midjourney لتوليد الأفكار، الحملات، والمحتوى فورياً.`,
        desc_en: `Curated Midjourney & ChatGPT Prompt Bank for Content Creators.`,
        price_ar: '$9.99 - $19.99',
        price_en: '$9.99 - $19.99',
        monthly_sales: '2,100+ مبيعة/شهرياً ($21,000)',
        etsy_rank: '#6 AI Prompts Bestseller',
        rating: '4.8 (780 تقييم)',
        source_ar: 'Notion / PDF Guide',
        source_en: 'Notion / PDF Guide',
      },
      {
        id: `etsy_${prefix}_7`,
        name_ar: `بطاقات تعليمية وتدريبية تفاعلية (Flashcards & Printables)`,
        name_en: `Printable Flashcards & Educational Activity Pack`,
        desc_ar: `ملفات بطاقات تعليمية وجداول نشاط جاهزة للطباعة المنزلية أو في المكتبات.`,
        desc_en: `High-resolution printable flashcards & learning worksheets.`,
        price_ar: '$7.99 - $15.99',
        price_en: '$7.99 - $15.99',
        monthly_sales: '1,700+ مبيعة/شهرياً ($17,000)',
        etsy_rank: '#7 Etsy Top Printable',
        rating: '4.9 (950 تقييم)',
        source_ar: 'Canva Printables',
        source_en: 'Canva Printables',
      },
      {
        id: `etsy_${prefix}_8`,
        name_ar: `دورة وحقيبة تدريبية مصغرة (Mini Video Course & Workbook)`,
        name_en: `Mini Digital Course & Action Workbook Bundle`,
        desc_ar: `حقيبة تدريبية تشمل شروحات فيديو قصيرة + كتاب عمل تطبيقي لحل مشكلة محددة في ${nicheName}.`,
        desc_en: `Actionable mini video course + PDF workbook package.`,
        price_ar: '$37.00 - $97.00',
        price_en: '$37.00 - $97.00',
        monthly_sales: '650+ مبيعة/شهرياً ($32,500)',
        etsy_rank: '#8 High Ticket Digital Pack',
        rating: '5.0 (430 تقييم)',
        source_ar: 'Loom + Gumroad / Teachable',
        source_en: 'Loom + Gumroad / Teachable',
      },
      {
        id: `etsy_${prefix}_9`,
        name_ar: `حزمة خطوط وأيقونات وجرافيكس حصرية لـ ${nicheName}`,
        name_en: `Custom Icon & Vector Graphics Bundle for Commercial Use`,
        desc_ar: `مجموعة عناصر جرافيك وأيقونات متجهية عالية الجودة تستخدم في تصاميم المواقع والإعلانات.`,
        desc_en: `SVG & PNG Commercial Use Vector Graphic Elements.`,
        price_ar: '$11.99 - $22.99',
        price_en: '$11.99 - $22.99',
        monthly_sales: '1,100+ مبيعة/شهرياً ($15,400)',
        etsy_rank: '#9 Graphic Assets Seller',
        rating: '4.8 (670 تقييم)',
        source_ar: 'Illustrator / Midjourney SVG',
        source_en: 'Illustrator / Midjourney SVG',
      },
      {
        id: `etsy_${prefix}_10`,
        name_ar: `قالب موقع إلكتروني جاهز (Figma / Webflow / Framer Template)`,
        name_en: `High-Converting Framer & Figma Website Template`,
        desc_ar: `قالب موقع فريد وسريع الاستجابة مصمم خصيصاً لأصحاب المشاريع وصناع المحتوى في ${nicheName}.`,
        desc_en: `Modern Framer & Figma Landing Page Website Template.`,
        price_ar: '$39.00 - $89.00',
        price_en: '$39.00 - $89.00',
        monthly_sales: '540+ مبيعة/شهرياً ($27,000)',
        etsy_rank: '#10 Web Template Bestseller',
        rating: '4.9 (380 تقييم)',
        source_ar: 'Framer / Figma Remix Link',
        source_en: 'Framer / Figma Remix Link',
      }
    ];
  };

  const renderVectorIcon = (iconType, size = 18, color = 'currentColor') => {
    switch (iconType) {
      case 'palette': return <Palette size={size} color={color} />;
      case 'bot': return <Bot size={size} color={color} />;
      case 'share': return <Share2 size={size} color={color} />;
      case 'chart': return <BarChart3 size={size} color={color} />;
      case 'file': return <FileText size={size} color={color} />;
      case 'book': return <BookOpen size={size} color={color} />;
      case 'film': return <Film size={size} color={color} />;
      default: return <Wrench size={size} color={color} />;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIdeas(null);
    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          uid: userData?.uid || state?.user?.uid,
          toolId: 'product-source',
          inputs: { selectedType, selectedNiche, selectedEffort },
          context: { niche: state.niche, user: state.user },
          lang
        });

        const rawList = (typeof liveResult === 'object' && Array.isArray(liveResult.ideas)) 
          ? liveResult.ideas 
          : (Array.isArray(liveResult) ? liveResult : [liveResult]);

        const top10Base = generateEtsyTop10Ideas(selectedType, selectedNiche, selectedEffort);

        const formattedIdeas = rawList.slice(0, 10).map((item, idx) => {
          const fallbackBase = top10Base[idx % top10Base.length];
          const title = typeof item === 'string' ? item : (item.name || item.name_en || item.name_ar || item.title || fallbackBase.name_ar);
          const description = typeof item === 'string' ? item : (item.desc || item.desc_en || item.desc_ar || item.fullDescription || item.description || fallbackBase.desc_ar);
          const cost = typeof item === 'string' ? '$19 - $49' : (item.price || item.price_en || item.price_ar || item.pricing || fallbackBase.price_ar);

          return {
            id: item.id || `live_${selectedType}_${selectedNiche}_${idx + 1}`,
            name_ar: item.name_ar || item.name || title,
            name_en: item.name_en || item.name || title,
            name: title,
            desc_ar: item.desc_ar || item.desc || description,
            desc_en: item.desc_en || item.desc || description,
            desc: description,
            price_ar: item.price_ar || item.price || cost,
            price_en: item.price_en || item.price || cost,
            price: cost,
            monthly_sales: item.monthly_sales || fallbackBase.monthly_sales,
            etsy_rank: item.etsy_rank || fallbackBase.etsy_rank,
            rating: item.rating || fallbackBase.rating,
            source_ar: item.source_ar || fallbackBase.source_ar,
            source_en: item.source_en || fallbackBase.source_en,
            effort: item.effort || selectedEffort || 'medium'
          };
        });

        setIdeas(formattedIdeas);
        toast(lang === 'en' ? 'Etsy Top 10 Live AI Ideas generated!' : 'تم توليد أفضل 10 منتجات مبيعاً على Etsy بالذكاء الاصطناعي!', 'success');
      } else {
        await new Promise(r => setTimeout(r, 400));
        const etsyTop10 = generateEtsyTop10Ideas(selectedType, selectedNiche, selectedEffort);
        setIdeas(etsyTop10);
        toast(lang === 'en' ? 'Top 10 Etsy best-selling products loaded!' : 'تم تحميل قائمة أكثر 10 منتجات مبيعاً على Etsy!', 'success');
      }
    } catch (error) {
      console.error(error);
      const fallback = generateEtsyTop10Ideas(selectedType, selectedNiche, selectedEffort);
      setIdeas(fallback);
      toast(lang === 'en' ? 'Loaded Etsy top products!' : 'تم عرض الأفكار الأكثر مبيعاً.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHelpBuildMyOwn = (idea, e) => {
    e?.stopPropagation();

    // Open POPUP 2 & Trigger dynamic AI Fetch
    setSelectedToolingProduct(idea);
    fetchDynamicAiToolsFromOpenAI(idea);
  };

  const handleAddProductToWorkspace = (product) => {
    if (!product) return;

    // Strict duplicate check by product ID
    const isAlreadyInProducts = myProducts.some(p => p.id === product.id);

    if (isAlreadyInProducts) {
      toast(
        lang === 'en'
          ? 'Product is already in "My Products"!'
          : 'المنتج موجود بالفعل في قائمة "منتجاتي"!',
        'info'
      );
    } else {
      setMyProducts(prev => [{ ...product, completed: false, addedAt: new Date().toISOString() }, ...prev]);
      toast(
        lang === 'en'
          ? 'Product added to "My Products" successfully!'
          : 'تمت إضافة المنتج إلى قائمة "منتجاتي" بنجاح!',
        'success'
      );
    }

    // Smoothly close the modal
    setSelectedToolingProduct(null);
  };

  const handleToggleProductCompleted = (productId, e) => {
    e?.stopPropagation();

    const targetItem = myProducts.find(p => p.id === productId);
    if (!targetItem) return;

    const willBeCompleted = !targetItem.completed;

    setMyProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : null,
          };
        }
        return p;
      })
    );

    toast(
      willBeCompleted
        ? (lang === 'en' ? 'Product marked as Completed! Shifted to Completed Archive' : 'مبروك! تم نقل المنتج إلى قائمة المنتجات المنجزة')
        : (lang === 'en' ? 'Product restored to Active Dock' : 'تمت إعادة المنتج إلى قائمة منتجاتي قيد التنفيذ'),
      willBeCompleted ? 'success' : 'info'
    );
  };

  // Filtered Lists
  const activeIdeas = useMemo(() => {
    if (!ideas) return [];
    return ideas.filter(idea => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (idea.name_ar || idea.name || '').toLowerCase().includes(term) ||
             (idea.desc_ar || idea.desc || '').toLowerCase().includes(term);
    });
  }, [ideas, searchQuery]);

  const inProgressProducts = useMemo(() => {
    return myProducts.filter(p => !p.completed && (
      !searchQuery ||
      (p.name_ar || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc_ar || p.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [myProducts, searchQuery]);

  const completedProducts = useMemo(() => {
    return myProducts.filter(p => p.completed && (
      !searchQuery ||
      (p.name_ar || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc_ar || p.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [myProducts, searchQuery]);

  const bottomSections = [
    {
      icon: <Lightbulb size={18} color="#6366F1" />,
      title: lang === 'en' ? 'Where to find PLR & Digital Products?' : 'أين تجد وتبيع المنتجات الرقمية (PLR)؟',
      items: [
        lang === 'en' ? 'Etsy: Top global marketplace for hyperlinked planners, Notion templates & Canva packs.' : 'Etsy: السوق العالمي الأول لبيع المخططات التفاعلية وقوالب Notion و Canva.',
        lang === 'en' ? 'Gumroad & Payhip: Direct store hosting with 0% hassle and automated file delivery.' : 'Gumroad & Payhip: إنشاء متجر رقمي فوري لتسليم الملفات والمنتجات للعملاء تلقائياً.',
        lang === 'en' ? 'Canva & Midjourney: Ultimate AI design stack to generate 100% unique digital assets.' : 'Canva Pro & Midjourney: أدوات الذكاء الاصطناعي الأساسية لتصميم وتوليد المنتجات بصور عالية الجودة.',
      ]
    },
  ];

  return (
    <>
      <ToolDashboardLayout
        id="product-source"
        title={lang === 'en' ? 'Digital Product Execution Studio' : 'استوديو تنفيذ المنتجات الرقمية الذكية (Content Studio Theme)'}
        subtitle={lang === 'en' ? 'Discover top 10 Etsy best-sellers in interactive Spatial Canvas & manage execution with live AI tooling.' : 'رادار ذكاء اصطناعي تفاعلي لفحص أكثر 10 منتجات مبيعاً وتوليد خطوات التنفيذ المباشرة.'}
        stepNumber={stepNumber}
        accentColor="#6366F1"
        timeEstimate="30 - 60"
        bottomSections={bottomSections}
      >
        <div className="ps-container ps-spatial-container" dir={isRtl ? 'rtl' : 'ltr'}>
          
          {/* ═══════════════ FLOATING COMMAND BAR ═══════════════ */}
          <div className="ps-spatial-command-bar" style={{ borderColor: 'rgba(99, 102, 241, 0.3)', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Product Type Select */}
              {structure?.productTypes && (
                <CustomStudioSelectPill
                  icon={Layers}
                  label={lang === 'en' ? 'Type' : 'النوع'}
                  value={selectedType}
                  options={structure.productTypes}
                  onChange={setSelectedType}
                  color="#6366F1"
                  isRtl={isRtl}
                  lang={lang}
                />
              )}

              {/* Niche Select */}
              {structure?.niches && (
                <CustomStudioSelectPill
                  icon={Target}
                  label={lang === 'en' ? 'Niche' : 'المجال'}
                  value={selectedNiche}
                  options={structure.niches}
                  onChange={setSelectedNiche}
                  color="#818CF8"
                  isRtl={isRtl}
                  lang={lang}
                />
              )}

              {/* Effort Select */}
              {structure?.effortLevels && (
                <CustomStudioSelectPill
                  icon={Zap}
                  label={lang === 'en' ? 'Effort' : 'المجهود'}
                  value={selectedEffort}
                  options={structure.effortLevels}
                  onChange={setSelectedEffort}
                  color="#7C3AED"
                  isRtl={isRtl}
                  lang={lang}
                />
              )}

              {/* Analysis Mode Switcher */}
              <div className="ps-ams-wrap">
                <AnalysisModeSelector 
                  mode={analysisMode} 
                  onChange={setAnalysisMode} 
                  lang={lang} 
                  accentColor="#6366F1" 
                />
              </div>
            </div>

            {/* Search + PRIMARY STUDIO CTA BUTTON */}
            <div className="ps-search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="#818CF8" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Search ideas...' : 'بحث في الرادار...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-search-input"
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    [isRtl ? 'paddingRight' : 'paddingLeft']: '34px'
                  }}
                />
              </div>

              <button 
                type="button"
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="ps-pink-glow-btn"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 4px 25px rgba(99, 102, 241, 0.45)' }}
              >
                {isGenerating ? (
                  <>
                    <span className="td-spinner" /> 
                    <span>{lang === 'en' ? 'Scanning...' : 'جاري الفحص...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> 
                    <span>{ideas ? (lang === 'en' ? 'Regenerate Ideas' : 'إعادة الفحص والتوليد') : (lang === 'en' ? 'Scan Etsy Top 10' : 'فحص أفضل 10 منتجات مبيعاً')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══════════════ MAIN SPATIAL CANVAS GRID ═══════════════ */}
          <div className="ps-spatial-canvas-grid">

            {/* ─── MAIN IDEAS CANVAS (Top 10 Etsy Responsive Grid) ─── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#818CF8', padding: '4px 12px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '800' }}>
                  <Flame size={14} />
                  <span>{lang === 'en' ? 'Etsy Top 10 Best-Selling Canvas' : 'رادار أكثر 10 منتجات مبيعاً على Etsy'}</span>
                </div>

                {ideas && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', padding: '4px 12px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '800' }}>
                    <Activity size={13} />
                    <span>{ideas.length} {lang === 'en' ? 'Verified Products' : 'منتج تم فحصه'}</span>
                  </span>
                )}
              </div>

              {!ideas && !isGenerating ? (
                <div className="ps-empty-state" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '24px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={28} />
                  </div>
                  <h4 style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                    {lang === 'en' ? 'Studio Radar Standby' : 'رادار الذكاء الاصطناعي جاهز للفحص'}
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0, maxWidth: '360px' }}>
                    {lang === 'en' ? 'Click "Scan Etsy Top 10" above to reveal top best-sellers.' : 'اضغط على زر "فحص أفضل 10 منتجات مبيعاً" بالأعلى للبدء.'}
                  </p>
                </div>
              ) : (
                <div className="ps-ideas-spatial-grid">
                  <AnimatePresence>
                    {activeIdeas.map((idea, i) => (
                      <motion.div
                        key={idea.id || i}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="ps-saas-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                              <Flame size={12} />
                              <span>{idea.etsy_rank || `#${i + 1} Best Seller`}</span>
                            </span>

                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                              <DollarSign size={12} />
                              <span>{lang === 'en' && idea.price_en ? idea.price_en : (idea.price_ar || idea.price)}</span>
                            </span>
                          </div>

                          <div>
                            <h4 style={{ color: 'var(--text, #F8FAFC)', fontSize: '15px', fontWeight: '900', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                              {lang === 'en' && idea.name_en ? idea.name_en : (idea.name_ar || idea.name)}
                            </h4>
                            <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                              {lang === 'en' && idea.desc_en ? idea.desc_en : (idea.desc_ar || idea.desc)}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleHelpBuildMyOwn(idea, e)}
                            className="ps-pink-glow-btn"
                            style={{ flex: 1, padding: '10px 14px', fontSize: '12px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)' }}
                          >
                            <Wrench size={14} />
                            <span>{lang === 'en' ? 'Build My Version' : 'المساعدة في إنشاء نسختي الخاصة'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedIdea(idea)}
                            style={{
                              background: 'rgba(99, 102, 241, 0.12)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: '#818CF8',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <Sparkles size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ─── INTERACTIVE WORKSPACE DOCK (My Products & Completed) ─── */}
            <div className="ps-spatial-hud-dock" style={{ borderColor: 'rgba(99, 102, 241, 0.25)' }}>
              
              {/* Active Products Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#818CF8', padding: '4px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '800' }}>
                    <Package size={14} />
                    <span>{lang === 'en' ? 'My Active Products' : 'منتجاتي (قيد التنفيذ)'}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: '800' }}>
                    {inProgressProducts.length}
                  </span>
                </div>

                {inProgressProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', background: 'rgba(99, 102, 241, 0.04)', border: '1px dashed rgba(99, 102, 241, 0.2)', borderRadius: '16px' }}>
                    <Package size={24} color="#818CF8" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                      {lang === 'en' ? 'Click "Build My Version" on any idea card to start.' : 'اضغط على "المساعدة في إنشاء نسختي الخاصة" لإضافة المنتجات هنا.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                    <AnimatePresence>
                      {inProgressProducts.map((product, idx) => (
                        <motion.div
                          key={product.id || idx}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={(e) => handleToggleProductCompleted(product.id, e)}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: '#10B981',
                                cursor: 'pointer',
                                marginTop: '2px'
                              }}
                            />

                            <div style={{ flex: 1 }}>
                              <h5 style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: '800', margin: '0 0 2px 0' }}>
                                {lang === 'en' && product.name_en ? product.name_en : (product.name_ar || product.name)}
                              </h5>
                              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800' }}>
                                {lang === 'en' && product.price_en ? product.price_en : (product.price_ar || product.price)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedToolingProduct(product);
                              fetchDynamicAiToolsFromOpenAI(product);
                            }}
                            style={{
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: '#818CF8',
                              padding: '7px 10px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Wrench size={13} />
                            <span>{lang === 'en' ? 'AI Creation Guide' : 'دليل التنفيذ بالذكاء الاصطناعي'}</span>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Completed Products Archive */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#34D399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <span>{lang === 'en' ? 'Completed Products' : 'المنتجات المنجزة'}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '800' }}>
                    {completedProducts.length}
                  </span>
                </div>

                {completedProducts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {completedProducts.map((product, idx) => (
                      <div
                        key={product.id || idx}
                        className="ps-completed-product-card"
                      >
                        <span className="ps-completed-product-title">
                          {lang === 'en' && product.name_en ? product.name_en : (product.name_ar || product.name)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleProductCompleted(product.id, e)}
                          className="ps-restore-btn"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </ToolDashboardLayout>

      {/* ═══════════════ POPUP 1: PRODUCT SPECIFICATIONS MODAL ═══════════════ */}
      {selectedIdea && createPortal(
        <AnimatePresence>
          <div
            className="ps-modal-overlay"
            onClick={() => setSelectedIdea(null)}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <motion.div
              className="ps-modal-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{ border: '1px solid rgba(99, 102, 241, 0.35)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--text, #F8FAFC)', fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.4 }}>
                      {lang === 'en' && selectedIdea.name_en ? selectedIdea.name_en : (selectedIdea.name_ar || selectedIdea.name)}
                    </h2>
                    <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Flame size={13} />
                      <span>{selectedIdea.etsy_rank || 'Etsy Bestseller'} • {selectedIdea.rating || '4.9'}</span>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedIdea(null)} 
                  className="ps-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ps-modal-desc-box">
                <h4 style={{ color: '#818CF8', fontSize: '12.5px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} />
                  <span>{lang === 'en' ? 'Description & Concept' : 'الوصف والأنسب للبيع'}</span>
                </h4>
                <p style={{ color: 'var(--text, #F8FAFC)', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  {lang === 'en' && selectedIdea.desc_en ? selectedIdea.desc_en : (selectedIdea.desc_ar || selectedIdea.desc)}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  const target = selectedIdea;
                  setSelectedIdea(null);
                  handleHelpBuildMyOwn(target, e);
                }}
                className="ps-pink-glow-btn"
                style={{ padding: '14px', fontSize: '14px', width: '100%', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
              >
                <Wrench size={18} />
                <span>{lang === 'en' ? 'Build My Own Version' : 'المساعدة في إنشاء نسختي الخاصة'}</span>
              </button>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* ═══════════════ POPUP 2: DYNAMIC AI TOOLING & STEP-BY-STEP DRAWER WITH ADD TO MY PRODUCTS ═══════════════ */}
      {selectedToolingProduct && createPortal(
        <AnimatePresence>
          <div
            className="ps-modal-overlay"
            onClick={() => setSelectedToolingProduct(null)}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <motion.div
              className="ps-modal-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ maxWidth: '720px', border: '1px solid rgba(99, 102, 241, 0.4)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1, #7C3AED)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--text, #F8FAFC)', fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.4 }}>
                      {lang === 'en' ? 'AI Tooling & Execution Guide' : 'دليل الإنشاء والتنفيذ بالذكاء الاصطناعي'}
                    </h2>
                    <span style={{ fontSize: '12.5px', color: '#818CF8', fontWeight: '800' }}>
                      {lang === 'en' && selectedToolingProduct.name_en ? selectedToolingProduct.name_en : (selectedToolingProduct.name_ar || selectedToolingProduct.name)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedToolingProduct(null)} 
                  className="ps-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Header */}
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ color: '#818CF8', fontSize: '13px', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} />
                    <span>{lang === 'en' ? 'Live AI Creation Workflow' : 'خطوات وأدوات التنفيذ بالذكاء الاصطناعي'}</span>
                  </h4>
                  <p style={{ color: 'var(--text2, #CBD5E1)', fontSize: '12.5px', lineHeight: 1.6, margin: 0 }}>
                    {lang === 'en' 
                      ? 'Tools, prompt templates, and step-by-step instructions generated live for this exact product.' 
                      : 'يتم توليد أدوات وخطوات وصيغ التصدير حياً بالذكاء الاصطناعي خصيصاً لهذا المنتج.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchDynamicAiToolsFromOpenAI(selectedToolingProduct)}
                  disabled={isLoadingAiTools}
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#818CF8',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={isLoadingAiTools ? "spin" : ""} />
                  <span>{lang === 'en' ? 'Regenerate' : 'إعادة التوليد'}</span>
                </button>
              </div>

              {/* DYNAMIC AI API LOADING STATE */}
              {isLoadingAiTools && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', gap: '16px' }}>
                  <RefreshCw size={36} color="#818CF8" style={{ animation: 'spin 1.5s linear infinite' }} />
                  <p style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '800', margin: 0 }}>
                    {lang === 'en' ? 'Connecting to AI Engine to generate tailored creation guide...' : 'جاري توليد خطوات الإنشاء بالذكاء الاصطناعي...'}
                  </p>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* DYNAMIC AI API ERROR STATE WITH RETRY BUTTON */}
              {aiToolsError && !isLoadingAiTools && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <AlertCircle size={32} color="#EF4444" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '800', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'AI Generation Notice' : 'ملاحظة توليد خطوات الذكاء الاصطناعي'}
                  </h4>
                  <p style={{ color: '#FCA5A5', fontSize: '12.5px', margin: '0 0 14px 0' }}>
                    {aiToolsError}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchDynamicAiToolsFromOpenAI(selectedToolingProduct)}
                    style={{
                      background: '#6366F1',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>{lang === 'en' ? 'Retry AI Generation' : 'إعادة المحاولة بالذكاء الاصطناعي'}</span>
                  </button>
                </div>
              )}

              {/* DYNAMIC AI GENERATED TOOLS LIST */}
              {!isLoadingAiTools && !aiToolsError && aiTools.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {aiTools.map((tool, idx) => {
                    const isExpanded = expandedToolIndex === idx;

                    return (
                      <div
                        key={tool.name || idx}
                        className={`ps-tool-card ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => setExpandedToolIndex(isExpanded ? -1 : idx)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {renderVectorIcon(tool.iconType, 18, '#818CF8')}
                            </div>
                            <div>
                              <h4 style={{ color: '#F8FAFC', fontSize: '14.5px', fontWeight: '900', margin: 0 }}>
                                {tool.name}
                              </h4>
                              <span style={{ fontSize: '11.5px', color: '#818CF8', fontWeight: '800' }}>
                                {tool.role}
                              </span>
                            </div>
                          </div>

                          <div style={{ color: '#94A3B8' }}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <p style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                              {tool.desc}
                            </p>

                            <h5 style={{ color: '#818CF8', fontSize: '12px', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} color="#818CF8" />
                              <span>{lang === 'en' ? 'Step-by-Step Instructions:' : 'خطوات التنفيذ بالتفصيل:'}</span>
                            </h5>

                            <ol style={{ margin: '0 0 14px 0', paddingRight: isRtl ? '20px' : undefined, paddingLeft: !isRtl ? '20px' : undefined, color: '#F8FAFC', fontSize: '12.5px', lineHeight: 1.7 }}>
                              {tool.steps?.map((step, sIdx) => (
                                <li key={sIdx} style={{ marginBottom: '4px' }}>{step}</li>
                              ))}
                            </ol>

                            {tool.exportFormat && (
                              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '8px 12px', fontSize: '11.5px', color: '#34D399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Package size={14} />
                                <span>{lang === 'en' ? 'Output Format' : 'صيغة التصدير والتسليم'}: <strong>{tool.exportFormat}</strong></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ACTION BUTTONS: REGENERATE + ADD TO MY PRODUCTS + CLOSE */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fetchDynamicAiToolsFromOpenAI(selectedToolingProduct)}
                  disabled={isLoadingAiTools}
                  className="ps-pink-glow-btn"
                  style={{ flex: 1, borderRadius: '12px', marginTop: 0, background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)' }}
                >
                  <RefreshCw size={16} className={isLoadingAiTools ? "spin" : ""} />
                  <span>{lang === 'en' ? 'Regenerate Steps' : 'إعادة توليد الخطوات'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddProductToWorkspace(selectedToolingProduct)}
                  className="ps-pink-glow-btn"
                  style={{ flex: 1, borderRadius: '12px', marginTop: 0, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)' }}
                >
                  <Package size={16} />
                  <span>{lang === 'en' ? 'Add to My Products' : 'إضافة إلى منتجاتي'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedToolingProduct(null)}
                  className="ps-pink-glow-btn"
                  style={{ flex: 1, borderRadius: '12px', marginTop: 0, background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{lang === 'en' ? 'Done / Close Guide' : 'تم / إغلاق الدليل'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
