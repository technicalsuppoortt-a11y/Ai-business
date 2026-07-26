import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COL } from './contentDbService';

/**
 * 1. Niche Definitions & Catalogs for the UI
 */
const brandNichesDef = {
  id: 'master_niches_list',
  ecom: [
    { 
      id: 'fashion', label_en: 'Fashion & Apparel', label_ar: 'أزياء وملابس', icon: '👗',
      catalogs: [
        { id: 'cat_luxury', label_ar: 'فخامة كلاسيكية', label_en: 'Classic Luxury' },
        { id: 'cat_streetwear', label_ar: 'شبابي وشارع', label_en: 'Streetwear' },
        { id: 'cat_modest', label_ar: 'محتشم وأنيق', label_en: 'Modest & Elegant' },
        { id: 'cat_vintage', label_ar: 'فينتج وأنتيك', label_en: 'Vintage & Retro' },
        { id: 'cat_sporty', label_ar: 'رياضي وكاجوال', label_en: 'Sporty Casual' },
        { id: 'cat_sustainable', label_ar: 'مستدام وصديق للبيئة', label_en: 'Sustainable & Eco' },
        { id: 'cat_kidsfashion', label_ar: 'أزياء أطفال', label_en: 'Kids & Toddlers' }
      ]
    },
    { 
      id: 'electronics', label_en: 'Smart Electronics', label_ar: 'إلكترونيات ذكية', icon: '📱',
      catalogs: [
        { id: 'cat_smart', label_ar: 'أجهزة ذكية', label_en: 'Smart Devices' },
        { id: 'cat_gaming', label_ar: 'جيمنج واحتراف', label_en: 'Gaming & Pro' },
        { id: 'cat_accessories', label_ar: 'إكسسوارات', label_en: 'Accessories' },
        { id: 'cat_audio', label_ar: 'صوتيات وسماعات', label_en: 'Audio & Sound' },
        { id: 'cat_wearables', label_ar: 'ساعات وأجهزة قابلة للارتداء', label_en: 'Wearables & Smartwatches' },
        { id: 'cat_smarthome', label_ar: 'أجهزة منزلية ذكية', label_en: 'Smart Home Automation' }
      ]
    },
    { 
      id: 'beauty', label_en: 'Health & Beauty', label_ar: 'تجميل وعناية', icon: '💄',
      catalogs: [
        { id: 'cat_organic', label_ar: 'عضوي وطبيعي', label_en: 'Organic & Natural' },
        { id: 'cat_glamour', label_ar: 'مكياج وبريق', label_en: 'Glamour & Makeup' },
        { id: 'cat_skincare', label_ar: 'عناية بالبشرة', label_en: 'Skincare' },
        { id: 'cat_haircare', label_ar: 'عناية بالشعر', label_en: 'Haircare & Styling' },
        { id: 'cat_perfumes', label_ar: 'عطور وبخور', label_en: 'Fragrances & Perfumes' },
        { id: 'cat_spa', label_ar: 'سبا واستجمام', label_en: 'Spa & Wellness' }
      ]
    },
    { 
      id: 'sports', label_en: 'Fitness & Sports', label_ar: 'رياضة ولياقة', icon: '💪',
      catalogs: [
        { id: 'cat_gym', label_ar: 'كمال أجسام', label_en: 'Bodybuilding' },
        { id: 'cat_activewear', label_ar: 'ملابس رياضية', label_en: 'Activewear' },
        { id: 'cat_yoga', label_ar: 'يوجا ومرونة', label_en: 'Yoga & Flexibility' },
        { id: 'cat_outdoor', label_ar: 'مغامرات ورحلات خارجية', label_en: 'Outdoor & Hiking' },
        { id: 'cat_supplements', label_ar: 'مكملات وتغذية رياضية', label_en: 'Sports Supplements' },
        { id: 'cat_cycling', label_ar: 'دراجات وحركة', label_en: 'Cycling & Mobility' }
      ]
    },
    { 
      id: 'home', label_en: 'Home Decor', label_ar: 'أثاث وديكور', icon: '🏠',
      catalogs: [
        { id: 'cat_modern', label_ar: 'مودرن وعصري', label_en: 'Modern' },
        { id: 'cat_vintage', label_ar: 'كلاسيك وفينتج', label_en: 'Vintage & Classic' },
        { id: 'cat_minimal', label_ar: 'بساطة (Minimal)', label_en: 'Minimalist' },
        { id: 'cat_boho', label_ar: 'بوهيمي وطبيعي', label_en: 'Bohemian' },
        { id: 'cat_kitchen', label_ar: 'أدوات مطبخ وطهي', label_en: 'Kitchenware & Dining' },
        { id: 'cat_lighting', label_ar: 'إضاءة وديكور نوري', label_en: 'Lighting & Ambiance' }
      ]
    },
    { 
      id: 'pets', label_en: 'Pet Supplies', label_ar: 'حيوانات أليفة', icon: '🐾',
      catalogs: [
        { id: 'cat_cats', label_ar: 'للقطط', label_en: 'Cats' },
        { id: 'cat_dogs', label_ar: 'للكلاب', label_en: 'Dogs' },
        { id: 'cat_birds', label_ar: 'للطيور', label_en: 'Birds' },
        { id: 'cat_aquarium', label_ar: 'أسماك وأحواض', label_en: 'Aquarium & Fish' },
        { id: 'cat_grooming', label_ar: 'عناية ونظافة أليفة', label_en: 'Pet Grooming & Care' }
      ]
    }
  ],
  digital: [
    { 
      id: 'templates', label_en: 'Templates & Design', label_ar: 'قوالب وتصاميم', icon: '🎨',
      catalogs: [
        { id: 'cat_uiux', label_ar: 'واجهات (UI/UX)', label_en: 'UI/UX Kits' },
        { id: 'cat_social', label_ar: 'سوشيال ميديا', label_en: 'Social Media Kits' },
        { id: 'cat_presentations', label_ar: 'عروض تقديمية', label_en: 'Presentations' },
        { id: 'cat_notion', label_ar: 'قوالب نوشن وإنتاجية', label_en: 'Notion & Productivity' },
        { id: 'cat_branding', label_ar: 'قوالب هوية تجارية', label_en: 'Branding Templates' },
        { id: 'cat_3d', label_ar: 'عناصر 3D ومجسمات', label_en: '3D Assets & Icons' }
      ]
    },
    { 
      id: 'courses', label_en: 'Online Courses', label_ar: 'كورسات تعليمية', icon: '🎓',
      catalogs: [
        { id: 'cat_tech', label_ar: 'برمجة وتقنية', label_en: 'Tech & Code' },
        { id: 'cat_business', label_ar: 'بزنس وإدارة', label_en: 'Business & Mgmt' },
        { id: 'cat_creative', label_ar: 'فنون وإبداع', label_en: 'Creative Arts' },
        { id: 'cat_marketing', label_ar: 'تسويق ونمو', label_en: 'Growth Marketing' },
        { id: 'cat_personal', label_ar: 'تطوير قيادي وشخصي', label_en: 'Leadership & Self Development' },
        { id: 'cat_finance', label_ar: 'استثمار ومالية', label_en: 'Trading & Finance' }
      ]
    },
    { 
      id: 'saas', label_en: 'Software & AI Tools', label_ar: 'برمجيات وأدوات', icon: '💻',
      catalogs: [
        { id: 'cat_ai', label_ar: 'ذكاء اصطناعي', label_en: 'AI Tools' },
        { id: 'cat_productivity', label_ar: 'إنتاجية وإدارة مهام', label_en: 'Productivity' },
        { id: 'cat_analytics', label_ar: 'تحليل بيانات', label_en: 'Analytics' },
        { id: 'cat_automation', label_ar: 'أتمتة وسير عمل', label_en: 'Automation & Workflow' },
        { id: 'cat_dev', label_ar: 'أدوات مطورين', label_en: 'Developer Tools' },
        { id: 'cat_security', label_ar: 'حماية وأمن معلومات', label_en: 'Security & Privacy' }
      ]
    },
    { 
      id: 'ebooks', label_en: 'E-Books & Guides', label_ar: 'كتب إلكترونية وأدلة', icon: '📚',
      catalogs: [
        { id: 'cat_fiction', label_ar: 'روايات وقصص', label_en: 'Fiction & Novels' },
        { id: 'cat_selfhelp', label_ar: 'تطوير ذات', label_en: 'Self Help' },
        { id: 'cat_guides', label_ar: 'أدلة عملية', label_en: 'How-To Guides' },
        { id: 'cat_business_books', label_ar: 'أعمال وريادة', label_en: 'Business & Entrepreneurship' },
        { id: 'cat_health_books', label_ar: 'صحة وتغذية', label_en: 'Health & Wellness' },
        { id: 'cat_tech_books', label_ar: 'تقنية ومستقبل', label_en: 'Tech & Innovation' }
      ]
    },
    { 
      id: 'subscriptions', label_en: 'Memberships & Communities', label_ar: 'اشتراكات ومجتمعات', icon: '👥',
      catalogs: [
        { id: 'cat_exclusive', label_ar: 'مجتمعات النخبة', label_en: 'Exclusive Elite' },
        { id: 'cat_networking', label_ar: 'تشبيك مهني', label_en: 'Professional Networking' },
        { id: 'cat_creators', label_ar: 'صناع المحتوى', label_en: 'Creators Hub' },
        { id: 'cat_alpha', label_ar: 'مجموعات آلفا وتداول', label_en: 'Alpha Trading Groups' },
        { id: 'cat_mastermind', label_ar: 'ماسترميند ورؤساء تنفيذييون', label_en: 'Mastermind Circles' }
      ]
    },
    { 
      id: 'assets', label_en: 'Stock Assets & Graphics', label_ar: 'ملحقات وموارد رقمية', icon: '📦',
      catalogs: [
        { id: 'cat_vectors', label_ar: 'فيكتور ورسوم', label_en: 'Vectors & Illustrations' },
        { id: 'cat_fonts', label_ar: 'خطوط وتايبوجرافي', label_en: 'Fonts & Typography' },
        { id: 'cat_audio', label_ar: 'صوتيات ومؤثرات', label_en: 'Audio & SFX' },
        { id: 'cat_mockups', label_ar: 'موك أب ومجسمات', label_en: 'Product Mockups' },
        { id: 'cat_textures', label_ar: 'خلفيات وتكستشر', label_en: 'Textures & Overlays' }
      ]
    }
  ],
  services: [
    {
      id: 'marketing', label_en: 'Digital Marketing', label_ar: 'تسويق رقمي', icon: '📈',
      catalogs: [
        { id: 'cat_ads', label_ar: 'إعلانات ممولة', label_en: 'Paid Ads' },
        { id: 'cat_seo', label_ar: 'تحسين محركات البحث', label_en: 'SEO & Organic' },
        { id: 'cat_content', label_ar: 'صناعة محتوى', label_en: 'Content Marketing' },
        { id: 'cat_influencer', label_ar: 'تسويق بالمؤثرين', label_en: 'Influencer Marketing' },
        { id: 'cat_branding_agency', label_ar: 'بناء هويات تجارية', label_en: 'Brand Identity Agency' },
        { id: 'cat_email', label_ar: 'تسويق بالإيميل وأتمتة', label_en: 'Email Marketing & CRM' }
      ]
    },
    {
      id: 'media', label_en: 'Media Production', label_ar: 'إنتاج إعلامي', icon: '🎬',
      catalogs: [
        { id: 'cat_video', label_ar: 'تصوير ومونتاج', label_en: 'Video Production' },
        { id: 'cat_photography', label_ar: 'تصوير فوتوغرافي', label_en: 'Photography' },
        { id: 'cat_animation', label_ar: 'موشن جرافيك', label_en: 'Animation & Motion' },
        { id: 'cat_podcasting', label_ar: 'إنتاج بودكاست', label_en: 'Podcast Production' },
        { id: 'cat_vfx', label_ar: 'خدع بصرية وVFX', label_en: 'VFX & Compositing' }
      ]
    },
    {
      id: 'consulting', label_en: 'Consulting', label_ar: 'استشارات', icon: '💼',
      catalogs: [
        { id: 'cat_strategy', label_ar: 'استراتيجية وأعمال', label_en: 'Business Strategy' },
        { id: 'cat_finance', label_ar: 'مالية واستثمار', label_en: 'Finance & Tax' },
        { id: 'cat_hr', label_ar: 'موارد بشرية', label_en: 'HR & Talent' },
        { id: 'cat_legal', label_ar: 'استشارات قانونية', label_en: 'Legal & Compliance' },
        { id: 'cat_tech_consulting', label_ar: 'تحول رقمي وحوسبة', label_en: 'Tech & Cloud Transformation' }
      ]
    }
  ]
};

/**
 * MASSIVE DICTIONARY FOR PROCEDURAL GENERATION
 */
const dict = {
  // 1. FASHION
  fashion_luxury: {
    en_pref: ['Aura', 'Lumina', 'Velvet', 'Silk', 'Crown', 'Elite', 'Opulent', 'Regal', 'Vogue', 'Noble', 'Grand'],
    en_suff: ['Style', 'Vogue', 'Edge', 'Drape', 'Elegance', 'Chic', 'Threads', 'Loom', 'Boutique', 'Label'],
    ar_pref: ['رونق', 'تألق', 'مخمل', 'ديباج', 'تاج', 'نخبة', 'فخر', 'أصيل', 'نبل', 'مقام'],
    ar_suff: ['الأناقة', 'الموضة', 'الحرير', 'الجمال', 'الحُلة', 'الرقي', 'الطراز', 'النسيج', 'كلاسيك'],
    meaning_en: 'Luxury and elegant fashion', meaning_ar: 'أزياء راقية وفخمة'
  },
  fashion_streetwear: {
    en_pref: ['Urban', 'Vibe', 'Hyper', 'Pulse', 'Raw', 'Shift', 'Volt', 'Flux', 'Apex', 'Core'],
    en_suff: ['Wear', 'Lab', 'Club', 'District', 'Cult', 'Craft', 'Supply', 'Studio', 'Co'],
    ar_pref: ['نبض', 'شارع', 'صخب', 'مدار', 'حركة', 'أفق', 'تيار', 'طاقة', 'صوت'],
    ar_suff: ['الشارع', 'الشبابي', 'كاجوال', 'ستريت', 'ستايل', 'مود', 'فيوز'],
    meaning_en: 'Modern streetwear and trendy apparel', meaning_ar: 'أزياء شبابية وعصرية'
  },
  fashion_modest: {
    en_pref: ['Grace', 'Pure', 'Serene', 'Modest', 'Silk', 'Noor', 'Safia', 'Hayat', 'Pearl'],
    en_suff: ['Couture', 'Wear', 'Collection', 'Drape', 'Style', 'Abaya', 'Modesty'],
    ar_pref: ['وقار', 'عفاف', 'حياء', 'نور', 'صفاء', 'حرير', 'لؤلؤة', 'سندس'],
    ar_suff: ['الوقار', 'الأناقة', 'الحجاب', 'العباية', 'الرداء', 'السمو'],
    meaning_en: 'Elegant modest fashion and abayas', meaning_ar: 'أزياء محتشمة وأنيقة'
  },
  // GENERIC FALLBACK FOR EXTENDED CATALOGS
  generic: {
    en_pref: ['Nova', 'Apex', 'Vortex', 'Nexus', 'Vertex', 'Prime', 'Pulse', 'Zenith', 'Omni', 'Crest', 'Quantum', 'Aura'],
    en_suff: ['Hub', 'Space', 'Forge', 'Base', 'Line', 'Mark', 'Point', 'Sync', 'Lab', 'Craft', 'Studio', 'Vault'],
    ar_pref: ['نخبة', 'قمة', 'محور', 'أساس', 'ريادة', 'مسار', 'أفق', 'رؤية', 'معدن', 'أصل', 'جوهر'],
    ar_suff: ['برو', 'الحديث', 'المتطور', 'بلس', 'الرقمي', 'الأول', 'هب', 'تك', 'استوديو', 'لاب'],
    meaning_en: 'Premium brand identity', meaning_ar: 'هوية علامة تجارية رائدة'
  }
};

const generateForCatalog = (nicheId, catalogId, count = 60) => {
  const key = `${nicheId}_${catalogId.replace('cat_', '')}`;
  const source = dict[key] || dict.generic;
  const names = [];
  
  const generateRandomCombo = (prefixes, suffixes) => {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${p}${s}`;
  };

  // Generate unique names
  let safety = 0;
  while(names.length < count && safety < count * 10) {
    safety++;
    
    // Distribute 50% English, 50% Arabic (No Hybrid)
    const type = Math.random();
    let newName = '';
    let langType = '';
    
    if (type < 0.5) {
      newName = generateRandomCombo(source.en_pref, source.en_suff);
      langType = 'en';
    } else {
      newName = generateRandomCombo(source.ar_pref, source.ar_suff);
      if (!newName.includes(' ')) newName = generateRandomCombo(source.ar_pref, [' ']) + generateRandomCombo(source.ar_suff, ['']);
      langType = 'ar';
    }

    if (!names.find(n => n.name === newName)) {
      names.push({
        name: newName,
        meaning_en: source.meaning_en,
        meaning_ar: source.meaning_ar,
        type: langType
      });
    }
  }

  return names;
};

export async function seedCategorizedBrands() {
  console.log('🌱 Starting Brand Catalogs Seeding (Procedural Generation of 1000+ Names)...');
  
  try {
    // 1. Save the structure definitions (Niches and Catalogs)
    await setDoc(doc(db, COL.BRAND_NAMES, brandNichesDef.id), brandNichesDef);

    // 2. Generate and save massive lists for EVERY sub-niche
    // For each category (ecom, digital, services)
    for (const categoryKey of Object.keys(brandNichesDef)) {
      if (categoryKey === 'id') continue;
      
      const subNiches = brandNichesDef[categoryKey];
      for (const subNiche of subNiches) {
        
        const subNicheData = { catalogs: {} };
        
        // For each catalog in the subNiche
        for (const catalog of subNiche.catalogs) {
          // Generate ~60 names per catalog (pure Arabic or pure English)
          subNicheData.catalogs[catalog.id] = generateForCatalog(subNiche.id, catalog.id, 60);
        }

        const docId = `brands_${subNiche.id}`;
        await setDoc(doc(db, COL.BRAND_NAMES, docId), subNicheData);
      }
    }
    
    console.log(`✅ Successfully seeded massive Brand Names Database and Catalogs!`);
  } catch (error) {
    console.error('❌ Error seeding brand names:', error);
    throw error;
  }
}

export { brandNichesDef, generateForCatalog };
