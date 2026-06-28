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
        { id: 'cat_modest', label_ar: 'محتشم وأنيق', label_en: 'Modest & Elegant' }
      ]
    },
    { 
      id: 'electronics', label_en: 'Smart Electronics', label_ar: 'إلكترونيات ذكية', icon: '📱',
      catalogs: [
        { id: 'cat_smart', label_ar: 'أجهزة ذكية', label_en: 'Smart Devices' },
        { id: 'cat_gaming', label_ar: 'جيمنج واحتراف', label_en: 'Gaming & Pro' },
        { id: 'cat_accessories', label_ar: 'إكسسوارات', label_en: 'Accessories' }
      ]
    },
    { 
      id: 'beauty', label_en: 'Health & Beauty', label_ar: 'تجميل وعناية', icon: '💄',
      catalogs: [
        { id: 'cat_organic', label_ar: 'عضوي وطبيعي', label_en: 'Organic & Natural' },
        { id: 'cat_glamour', label_ar: 'مكياج وبريق', label_en: 'Glamour & Makeup' },
        { id: 'cat_skincare', label_ar: 'عناية بالبشرة', label_en: 'Skincare' }
      ]
    },
    { 
      id: 'sports', label_en: 'Fitness & Sports', label_ar: 'رياضة ولياقة', icon: '💪',
      catalogs: [
        { id: 'cat_gym', label_ar: 'كمال أجسام', label_en: 'Bodybuilding' },
        { id: 'cat_activewear', label_ar: 'ملابس رياضية', label_en: 'Activewear' },
        { id: 'cat_yoga', label_ar: 'يوجا ومرونة', label_en: 'Yoga & Flexibility' }
      ]
    },
    { 
      id: 'home', label_en: 'Home Decor', label_ar: 'أثاث وديكور', icon: '🏠',
      catalogs: [
        { id: 'cat_modern', label_ar: 'مودرن وعصري', label_en: 'Modern' },
        { id: 'cat_vintage', label_ar: 'كلاسيك وفينتج', label_en: 'Vintage & Classic' },
        { id: 'cat_minimal', label_ar: 'بساطة (Minimal)', label_en: 'Minimalist' }
      ]
    },
    { 
      id: 'pets', label_en: 'Pet Supplies', label_ar: 'حيوانات أليفة', icon: '🐾',
      catalogs: [
        { id: 'cat_cats', label_ar: 'للقطط', label_en: 'Cats' },
        { id: 'cat_dogs', label_ar: 'للكلاب', label_en: 'Dogs' },
        { id: 'cat_birds', label_ar: 'للطيور', label_en: 'Birds' }
      ]
    }
  ],
  digital: [
    { 
      id: 'templates', label_en: 'Templates & Design', label_ar: 'قوالب وتصاميم', icon: '🎨',
      catalogs: [
        { id: 'cat_uiux', label_ar: 'واجهات (UI/UX)', label_en: 'UI/UX' },
        { id: 'cat_social', label_ar: 'سوشيال ميديا', label_en: 'Social Media' },
        { id: 'cat_presentations', label_ar: 'عروض تقديمية', label_en: 'Presentations' }
      ]
    },
    { 
      id: 'courses', label_en: 'Online Courses', label_ar: 'كورسات تعليمية', icon: '🎓',
      catalogs: [
        { id: 'cat_tech', label_ar: 'برمجة وتقنية', label_en: 'Tech & Code' },
        { id: 'cat_business', label_ar: 'بزنس وإدارة', label_en: 'Business & Mgmt' },
        { id: 'cat_creative', label_ar: 'فنون وإبداع', label_en: 'Creative Arts' }
      ]
    },
    { 
      id: 'saas', label_en: 'Software & AI Tools', label_ar: 'برمجيات وأدوات', icon: '💻',
      catalogs: [
        { id: 'cat_ai', label_ar: 'ذكاء اصطناعي', label_en: 'AI Tools' },
        { id: 'cat_productivity', label_ar: 'إنتاجية وإدارة مهام', label_en: 'Productivity' },
        { id: 'cat_analytics', label_ar: 'تحليل بيانات', label_en: 'Analytics' }
      ]
    },
    { 
      id: 'ebooks', label_en: 'E-Books & Guides', label_ar: 'كتب إلكترونية وأدلة', icon: '📚',
      catalogs: [
        { id: 'cat_fiction', label_ar: 'روايات وقصص', label_en: 'Fiction' },
        { id: 'cat_selfhelp', label_ar: 'تطوير ذات', label_en: 'Self Help' },
        { id: 'cat_guides', label_ar: 'أدلة عملية', label_en: 'How-To Guides' }
      ]
    },
    { 
      id: 'subscriptions', label_en: 'Memberships & Communities', label_ar: 'اشتراكات ومجتمعات', icon: '👥',
      catalogs: [
        { id: 'cat_exclusive', label_ar: 'مجتمعات النخبة', label_en: 'Exclusive Elite' },
        { id: 'cat_networking', label_ar: 'تشبيك مهني', label_en: 'Professional Networking' },
        { id: 'cat_creators', label_ar: 'صناع المحتوى', label_en: 'Creators Hub' }
      ]
    },
    { 
      id: 'assets', label_en: 'Stock Assets & Graphics', label_ar: 'ملحقات وموارد رقمية', icon: '📦',
      catalogs: [
        { id: 'cat_vectors', label_ar: 'فيكتور ورسوم', label_en: 'Vectors' },
        { id: 'cat_fonts', label_ar: 'خطوط وتايبوجرافي', label_en: 'Fonts' },
        { id: 'cat_audio', label_ar: 'صوتيات ومؤثرات', label_en: 'Audio & SFX' }
      ]
    }
  ],
  services: [
    {
      id: 'marketing', label_en: 'Digital Marketing', label_ar: 'تسويق رقمي', icon: '📈',
      catalogs: [
        { id: 'cat_ads', label_ar: 'إعلانات ممولة', label_en: 'Paid Ads' },
        { id: 'cat_seo', label_ar: 'تحسين محركات البحث', label_en: 'SEO' },
        { id: 'cat_content', label_ar: 'صناعة محتوى', label_en: 'Content Marketing' }
      ]
    },
    {
      id: 'media', label_en: 'Media Production', label_ar: 'إنتاج إعلامي', icon: '🎬',
      catalogs: [
        { id: 'cat_video', label_ar: 'تصوير ومونتاج', label_en: 'Video Production' },
        { id: 'cat_photography', label_ar: 'تصوير فوتوغرافي', label_en: 'Photography' },
        { id: 'cat_animation', label_ar: 'موشن جرافيك', label_en: 'Animation' }
      ]
    },
    {
      id: 'consulting', label_en: 'Consulting', label_ar: 'استشارات', icon: '💼',
      catalogs: [
        { id: 'cat_strategy', label_ar: 'استراتيجية وأعمال', label_en: 'Business Strategy' },
        { id: 'cat_finance', label_ar: 'مالية واستثمار', label_en: 'Finance' },
        { id: 'cat_hr', label_ar: 'موارد بشرية', label_en: 'HR & Talent' }
      ]
    }
  ]
};

/**
 * MASSIVE 45-CATALOG DICTIONARY
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
    en_pref: ['Urban', 'Street', 'Neon', 'Vibe', 'Rogue', 'Hype', 'Core', 'Grit', 'Block', 'Raw'],
    en_suff: ['Wear', 'Culture', 'Drop', 'Fit', 'Thread', 'Squad', 'Base', 'Kicks', 'Cartel', 'Crew'],
    ar_pref: ['شارع', 'نبض', 'ستايل', 'فايبر', 'شباب', 'حركة', 'تريند', 'أوربان', 'بلوك', 'تمرد'],
    ar_suff: ['كول', 'فيت', 'كاجوال', 'الموضة', 'ستايل', 'حضري', 'اليوم', 'كرو', 'ستريت'],
    meaning_en: 'Modern youth streetwear', meaning_ar: 'ملابس شارع شبابية عصرية'
  },
  fashion_modest: {
    en_pref: ['Pure', 'Grace', 'Modest', 'Serene', 'Amina', 'Haya', 'Veil', 'Soft', 'Noor', 'Aya'],
    en_suff: ['Wear', 'Chic', 'Wardrobe', 'Line', 'Aura', 'Moda', 'Threads', 'Style', 'Abaya', 'Drape'],
    ar_pref: ['حياء', 'وقار', 'نقاء', 'ستر', 'عفة', 'حجاب', 'أصالة', 'رقي', 'نور', 'طهر'],
    ar_suff: ['المحتشم', 'للأزياء', 'أناقتي', 'الراقي', 'المخملي', 'المعاصر', 'حجابي', 'الهادئ', 'عباية'],
    meaning_en: 'Elegant modest apparel', meaning_ar: 'أزياء محتشمة وراقية'
  },

  // 2. ELECTRONICS
  electronics_smart: {
    en_pref: ['Tech', 'Smart', 'Nova', 'Cyber', 'Sync', 'Wired', 'Volt', 'Aero', 'Quantum', 'Nexus'],
    en_suff: ['Gear', 'Hub', 'Device', 'Tech', 'Sphere', 'Logic', 'Wave', 'Core', 'Link', 'Tron'],
    ar_pref: ['تقنية', 'ذكاء', 'نوفا', 'سيبر', 'تزامن', 'نبض', 'فولت', 'مدار', 'مستقبل'],
    ar_suff: ['الذكي', 'تك', 'للأجهزة', 'ديجيتال', 'لينك', 'الرقمي', 'سبارك', 'زون'],
    meaning_en: 'Smart technology and devices', meaning_ar: 'أجهزة وإلكترونيات ذكية'
  },
  electronics_gaming: {
    en_pref: ['Game', 'Play', 'Pixel', 'Titan', 'Rogue', 'Apex', 'Nitro', 'Stealth', 'Frag', 'Boss'],
    en_suff: ['Rig', 'Zone', 'Station', 'Gear', 'HQ', 'Force', 'Spawn', 'Level', 'Elite'],
    ar_pref: ['لعب', 'بيكسل', 'جيمر', 'تيتان', 'نيترو', 'أبيكس', 'أبطال', 'تحدي', 'نخبة'],
    ar_suff: ['زون', 'جيمنج', 'ستيشن', 'برو', 'بلاي', 'لاند', 'أرينا', 'الاحترافي'],
    meaning_en: 'Pro gaming gear and setups', meaning_ar: 'إلكترونيات ومعدات الألعاب'
  },
  electronics_accessories: {
    en_pref: ['Gadget', 'Add', 'Plus', 'Extra', 'Snap', 'Grip', 'Charge', 'Link', 'Fit', 'Wrap'],
    en_suff: ['Case', 'Mate', 'Access', 'Hub', 'Pack', 'Pod', 'Line', 'Drop', 'Guard'],
    ar_pref: ['جراب', 'ملحق', 'إضافة', 'شحن', 'مقبض', 'وصلة', 'جهاز', 'درع', 'طاقة'],
    ar_suff: ['بلس', 'الذكي', 'اكسسوار', 'ميت', 'برو', 'جريب', 'المحمول', 'سريع'],
    meaning_en: 'Mobile and tech accessories', meaning_ar: 'إكسسوارات الأجهزة المحمولة'
  },

  // 3. BEAUTY
  beauty_organic: {
    en_pref: ['Pure', 'Eco', 'Bio', 'Green', 'Flora', 'Herb', 'Natur', 'Earth', 'Leaf', 'Root'],
    en_suff: ['Essence', 'Care', 'Glow', 'Drop', 'Extract', 'Vibe', 'Nectar', 'Blend', 'Aura'],
    ar_pref: ['نقاء', 'طبيعة', 'عضوي', 'زهور', 'نبات', 'أرض', 'أوراق', 'جذور', 'رحيق'],
    ar_suff: ['الطبيعي', 'عناية', 'بيو', 'أورجانيك', 'النقي', 'الأخضر', 'قطرة', 'عصارة'],
    meaning_en: 'Organic and natural beauty', meaning_ar: 'تجميل طبيعي وعضوي'
  },
  beauty_glamour: {
    en_pref: ['Glam', 'Lumi', 'Glow', 'Shine', 'Diva', 'Lux', 'Radiant', 'Stellar', 'Vogue', 'Chic'],
    en_suff: ['Look', 'Face', 'Touch', 'Lush', 'Beauty', 'Make', 'Pop', 'Aura', 'Style'],
    ar_pref: ['بريق', 'تألق', 'لمعان', 'سحر', 'ديفا', 'فخامة', 'نجمة', 'جمال', 'إشراق'],
    ar_suff: ['لوك', 'بيوتي', 'تاتش', 'جلامور', 'المتألق', 'الساحر', 'ميك اب', 'روز'],
    meaning_en: 'Glamorous makeup and cosmetics', meaning_ar: 'مكياج وبريق التجميل'
  },
  beauty_skincare: {
    en_pref: ['Derma', 'Skin', 'Clear', 'Hydra', 'Silk', 'Youth', 'Fresh', 'Pore', 'Soft', 'Heal'],
    en_suff: ['Care', 'Lab', 'Routine', 'Clinique', 'Glow', 'Renew', 'Base', 'Cure', 'Tone'],
    ar_pref: ['بشرة', 'ديرما', 'نضارة', 'صفاء', 'حرير', 'شباب', 'انتعاش', 'صحة', 'علاج'],
    ar_suff: ['كير', 'لاب', 'روتين', 'كلينيك', 'الناعمة', 'المشرقة', 'الصافية', 'جلوري'],
    meaning_en: 'Professional skincare routines', meaning_ar: 'العناية الفائقة بالبشرة'
  },

  // 4. SPORTS
  sports_gym: {
    en_pref: ['Iron', 'Muscle', 'Titan', 'Lift', 'Steel', 'Bulk', 'Power', 'Force', 'Grit', 'Beast'],
    en_suff: ['Gym', 'Fitness', 'Core', 'Forge', 'Pump', 'House', 'Base', 'Gains', 'Rep'],
    ar_pref: ['حديد', 'عضلات', 'تيتان', 'رفع', 'صلب', 'قوة', 'وحش', 'بطل', 'عزم'],
    ar_suff: ['جيم', 'فيتنس', 'كور', 'هاوس', 'طاقة', 'بامب', 'أساس', 'الرياضي'],
    meaning_en: 'Hardcore bodybuilding gym', meaning_ar: 'صالة كمال أجسام وقوة'
  },
  sports_activewear: {
    en_pref: ['Fit', 'Active', 'Motion', 'Flex', 'Sprint', 'Aero', 'Endura', 'Swift', 'Pace', 'Vigor'],
    en_suff: ['Wear', 'Fit', 'Apparel', 'Gear', 'Line', 'Thread', 'Form', 'Style', 'Run'],
    ar_pref: ['لياقة', 'نشاط', 'حركة', 'مرونة', 'ركض', 'تحمل', 'سرعة', 'خطوة', 'حيوية'],
    ar_suff: ['فيت', 'أكتيف', 'جير', 'وير', 'سبورت', 'الملابس', 'سبرينت', 'ران'],
    meaning_en: 'Athletic and active clothing', meaning_ar: 'ملابس رياضية عملية'
  },
  sports_yoga: {
    en_pref: ['Zen', 'Aura', 'Peace', 'Mind', 'Flow', 'Lotus', 'Align', 'Soul', 'Calm', 'Breathe'],
    en_suff: ['Yoga', 'Space', 'Studio', 'Balance', 'Mat', 'Stretch', 'Vibe', 'Core', 'Sanctuary'],
    ar_pref: ['زين', 'هالة', 'سلام', 'تأمل', 'تدفق', 'لوتس', 'روح', 'هدوء', 'تنفس'],
    ar_suff: ['يوجا', 'استوديو', 'بالانس', 'سبيس', 'للتأمل', 'الروحي', 'مات', 'الداخلي'],
    meaning_en: 'Yoga and mindfulness studio', meaning_ar: 'يوجا وتأمل ومرونة'
  },

  // 5. HOME
  home_modern: {
    en_pref: ['Moda', 'Urban', 'Neo', 'Vivid', 'Smart', 'Chic', 'Trend', 'Lumi', 'Nova', 'Sleek'],
    en_suff: ['Home', 'Living', 'Space', 'Decor', 'Room', 'Haus', 'Nest', 'Base', 'Design'],
    ar_pref: ['عصري', 'حديث', 'نيو', 'أوربان', 'ذكي', 'أنيق', 'مودرن', 'مشرق', 'نوفا'],
    ar_suff: ['هوم', 'ديكور', 'سبيس', 'للمنزل', 'ديزاين', 'ليفينج', 'الحديث', 'الذكي'],
    meaning_en: 'Modern home decor', meaning_ar: 'أثاث وديكور عصري'
  },
  home_vintage: {
    en_pref: ['Retro', 'Vintage', 'Classic', 'Rustic', 'Timber', 'Old', 'Heritage', 'Antique', 'Craft', 'Cozy'],
    en_suff: ['Charm', 'Wood', 'Home', 'Finds', 'Attic', 'Era', 'Roots', 'Loom', 'Barn'],
    ar_pref: ['ريترو', 'فينتج', 'كلاسيك', 'خشبي', 'عتيق', 'تراث', 'أنتيك', 'حرفي', 'دافئ'],
    ar_suff: ['تشارم', 'هوم', 'زمان', 'روتس', 'الأصيل', 'ود', 'الفني', 'كرافت'],
    meaning_en: 'Classic and vintage furniture', meaning_ar: 'أثاث كلاسيكي وفينتج'
  },
  home_minimal: {
    en_pref: ['Pure', 'Bare', 'Less', 'Simple', 'Clear', 'Blank', 'Zen', 'Aura', 'Line', 'Mono'],
    en_suff: ['Space', 'Minimal', 'Form', 'Shape', 'Living', 'Room', 'Base', 'Nest', 'Concept'],
    ar_pref: ['نقاء', 'بساطة', 'أقل', 'صافي', 'فراغ', 'زين', 'خط', 'مونو', 'أورا'],
    ar_suff: ['سبيس', 'مينيمال', 'فورم', 'شيب', 'ليفينج', 'الهادئ', 'كونسبت', 'بيس'],
    meaning_en: 'Minimalist living spaces', meaning_ar: 'ديكورات بسيطة (مينيمال)'
  },

  // 6. PETS
  pets_cats: {
    en_pref: ['Meow', 'Purr', 'Kitty', 'Feline', 'Whisker', 'Paws', 'Fluff', 'Claw', 'Tail', 'Cat'],
    en_suff: ['Box', 'Care', 'Joy', 'Hub', 'Zone', 'Treats', 'Kingdom', 'Love', 'Nest'],
    ar_pref: ['مواء', 'قطتي', 'هرة', 'فروة', 'شوارب', 'مخلب', 'ذيل', 'بيسو', 'كتن'],
    ar_suff: ['بوكس', 'كير', 'جوي', 'زون', 'حب', 'المرح', 'المدللة', 'للقطط'],
    meaning_en: 'Cat supplies and care', meaning_ar: 'مستلزمات وعناية للقطط'
  },
  pets_dogs: {
    en_pref: ['Bark', 'Doggo', 'Puppy', 'Hound', 'Snout', 'Woof', 'Fetch', 'Tail', 'Bone', 'K9'],
    en_suff: ['Park', 'House', 'Pack', 'Treats', 'Joy', 'Run', 'Club', 'Care', 'Buddy'],
    ar_pref: ['نباح', 'كلبي', 'جرو', 'صديق', 'عظمة', 'لعب', 'ذيل', 'وفاء', 'كي ناين'],
    ar_suff: ['بارك', 'هاوس', 'باك', 'تريتس', 'كلوب', 'كير', 'بادي', 'للكلاب'],
    meaning_en: 'Dog supplies and treats', meaning_ar: 'مستلزمات للكلاب'
  },
  pets_birds: {
    en_pref: ['Feather', 'Wing', 'Beak', 'Tweet', 'Chirp', 'Sky', 'Avi', 'Nest', 'Fly', 'Plum'],
    en_suff: ['Haven', 'Cage', 'Song', 'House', 'Care', 'Joy', 'Hub', 'Perch', 'Supply'],
    ar_pref: ['ريش', 'جناح', 'منقار', 'تغريد', 'زقزقة', 'سماء', 'طير', 'عش', 'تحليق'],
    ar_suff: ['هافن', 'قفص', 'سونج', 'هاوس', 'كير', 'بيرد', 'للطيور', 'هب'],
    meaning_en: 'Bird supplies and cages', meaning_ar: 'أقفاص ومستلزمات طيور'
  },

  // 7. TEMPLATES
  templates_uiux: {
    en_pref: ['UI', 'UX', 'Figma', 'Wire', 'Mock', 'Pixel', 'Flow', 'Screen', 'Layout', 'Frame'],
    en_suff: ['Kit', 'Blocks', 'System', 'Base', 'Library', 'Grid', 'Draft', 'Design', 'Sync'],
    ar_pref: ['واجهة', 'تجربة', 'فيجما', 'بيكسل', 'شاشة', 'تخطيط', 'هيكل', 'إطار', 'مسار'],
    ar_suff: ['كت', 'بلوكس', 'سيستم', 'لاب', 'ديزاين', 'شبكة', 'تيمبليت', 'يو آي'],
    meaning_en: 'UI/UX design templates', meaning_ar: 'قوالب وتصاميم واجهات المستخدم'
  },
  templates_social: {
    en_pref: ['Social', 'Insta', 'Post', 'Feed', 'Story', 'Reel', 'Grid', 'Trend', 'Viral', 'Gram'],
    en_suff: ['Pack', 'Kit', 'Templates', 'Drop', 'Layouts', 'Designs', 'Boost', 'Studio', 'Flow'],
    ar_pref: ['سوشيال', 'بوست', 'قصة', 'فيد', 'ستوري', 'تريند', 'شبكة', 'منشور', 'فايرل'],
    ar_suff: ['باك', 'كت', 'تيمبليتس', 'ديزاين', 'ستوديو', 'فلتر', 'بوست', 'جريد'],
    meaning_en: 'Social media post templates', meaning_ar: 'قوالب سوشيال ميديا'
  },
  templates_presentations: {
    en_pref: ['Slide', 'Pitch', 'Deck', 'Show', 'Present', 'Board', 'Key', 'Brief', 'Graph', 'Info'],
    en_suff: ['Deck', 'Genius', 'Master', 'Kit', 'Templates', 'Pro', 'Craft', 'Logic', 'Base'],
    ar_pref: ['شريحة', 'عرض', 'تقديم', 'ملخص', 'رسم', 'معلومة', 'سلايد', 'بيتش', 'ديك'],
    ar_suff: ['ديك', 'جينيوس', 'ماستر', 'برو', 'للعروض', 'تيمبليتس', 'كرافت', 'سلايدز'],
    meaning_en: 'Presentation and pitch decks', meaning_ar: 'عروض تقديمية وبوربوينت'
  },

  // 8. COURSES
  courses_tech: {
    en_pref: ['Code', 'Tech', 'Dev', 'Byte', 'Logic', 'Syntax', 'Script', 'Build', 'Hacker', 'Cyber'],
    en_suff: ['Academy', 'Camp', 'School', 'Mastery', 'Lab', 'Course', 'Hub', 'Path', 'Class'],
    ar_pref: ['كود', 'تقنية', 'مطور', 'بايت', 'برمجة', 'سكربت', 'بناء', 'هاكر', 'سيبر'],
    ar_suff: ['أكاديمي', 'كامب', 'سكول', 'لاب', 'كورس', 'هب', 'مسار', 'تعليم'],
    meaning_en: 'Technology and coding courses', meaning_ar: 'كورسات برمجة وتقنية'
  },
  courses_business: {
    en_pref: ['Biz', 'Trade', 'Market', 'Lead', 'Scale', 'Profit', 'Manage', 'Wealth', 'CEO', 'Founder'],
    en_suff: ['Academy', 'School', 'Masterclass', 'Hub', 'Guide', 'Blueprint', 'Strategy', 'Edge', 'IQ'],
    ar_pref: ['بزنس', 'تجارة', 'سوق', 'قيادة', 'توسع', 'أرباح', 'إدارة', 'ثروة', 'مؤسس'],
    ar_suff: ['أكاديمي', 'سكول', 'ماستر', 'بلوبرينت', 'جايد', 'آي كيو', 'للأعمال', 'كورس'],
    meaning_en: 'Business and management classes', meaning_ar: 'دورات إدارة أعمال'
  },
  courses_creative: {
    en_pref: ['Art', 'Create', 'Design', 'Craft', 'Visual', 'Draw', 'Paint', 'Studio', 'Vision', 'Color'],
    en_suff: ['Academy', 'School', 'Mastery', 'Class', 'Workshop', 'Space', 'Hub', 'Mind', 'Spark'],
    ar_pref: ['فن', 'إبداع', 'تصميم', 'حرفة', 'رسم', 'ألوان', 'رؤية', 'ستوديو', 'خيال'],
    ar_suff: ['أكاديمي', 'سكول', 'وركشوب', 'كلاس', 'ماستر', 'للفنون', 'سبيس', 'سبارك'],
    meaning_en: 'Creative arts and design courses', meaning_ar: 'كورسات فنون وإبداع'
  },

  // 9. SAAS
  saas_ai: {
    en_pref: ['Neuro', 'AI', 'Cogni', 'Brain', 'Smart', 'Logic', 'Synapse', 'Nova', 'Bot', 'Auto'],
    en_suff: ['Mind', 'Core', 'Tech', 'Genius', 'Sync', 'Base', 'Flow', 'IQ', 'System'],
    ar_pref: ['عقل', 'ذكاء', 'إدراك', 'منطق', 'نوفا', 'روبوت', 'أتمتة', 'خوارزم', 'تفكير'],
    ar_suff: ['الآلي', 'كور', 'تك', 'جينيوس', 'سيستم', 'فلَو', 'الرقمي', 'آي كيو'],
    meaning_en: 'AI powered SaaS tool', meaning_ar: 'أداة ذكاء اصطناعي'
  },
  saas_productivity: {
    en_pref: ['Task', 'Flow', 'Focus', 'Done', 'Opti', 'Swift', 'Sync', 'Plan', 'Track', 'Do'],
    en_suff: ['Master', 'Hub', 'Space', 'Pad', 'HQ', 'Logic', 'Board', 'Base', 'Flow'],
    ar_pref: ['إنجاز', 'تركيز', 'مهام', 'تخطيط', 'تنظيم', 'سرعة', 'مسار', 'أوبتي', 'عمل'],
    ar_suff: ['برو', 'ماستر', 'هب', 'باد', 'بورد', 'تراك', 'الأعمال', 'السريع'],
    meaning_en: 'Productivity and task SaaS', meaning_ar: 'برمجيات إدارة المهام والإنتاجية'
  },
  saas_analytics: {
    en_pref: ['Data', 'Stat', 'Metric', 'Chart', 'Insight', 'Graph', 'Quant', 'Trend', 'Scale', 'Num'],
    en_suff: ['Sight', 'Base', 'Track', 'Vision', 'IQ', 'Logic', 'Core', 'Flow', 'Board'],
    ar_pref: ['بيانات', 'إحصاء', 'مؤشر', 'رؤية', 'رسم', 'رصد', 'تتبع', 'تريند', 'رقم'],
    ar_suff: ['سايت', 'تراك', 'فيجن', 'آي كيو', 'كور', 'العميق', 'للتحليل', 'الذكي'],
    meaning_en: 'Data analytics platform', meaning_ar: 'منصة تحليل بيانات'
  },

  // 10. EBOOKS
  ebooks_fiction: {
    en_pref: ['Story', 'Tale', 'Myth', 'Fable', 'Lore', 'Dream', 'Page', 'Ink', 'Word', 'Plot'],
    en_suff: ['Realm', 'Weaver', 'Craft', 'Books', 'Trove', 'Vault', 'Spin', 'Line', 'Bound'],
    ar_pref: ['قصة', 'حكاية', 'أسطورة', 'خيال', 'حلم', 'صفحة', 'حبر', 'كلمة', 'رواية'],
    ar_suff: ['ريلم', 'بوكس', 'كرافت', 'عالم', 'خزنة', 'الخيال', 'رويات', 'مقروء'],
    meaning_en: 'Fiction and story ebooks', meaning_ar: 'روايات وقصص خيالية'
  },
  ebooks_selfhelp: {
    en_pref: ['Grow', 'Mind', 'Self', 'Heal', 'Awake', 'Path', 'Guide', 'Step', 'Habit', 'Life'],
    en_suff: ['Books', 'Read', 'Shift', 'Journey', 'Way', 'Spark', 'Lift', 'Logic', 'Focus'],
    ar_pref: ['نمو', 'عقل', 'ذات', 'شفاء', 'وعي', 'مسار', 'دليل', 'خطوة', 'عادة'],
    ar_suff: ['ريد', 'بوكس', 'شفت', 'للذات', 'تطوير', 'لايف', 'أويك', 'سبارك'],
    meaning_en: 'Self-help and improvement', meaning_ar: 'كتب تطوير الذات'
  },
  ebooks_guides: {
    en_pref: ['How', 'Guide', 'Manual', 'Step', 'Rule', 'Hack', 'Tip', 'Pro', 'Skill', 'Learn'],
    en_suff: ['Book', 'Draft', 'Print', 'Read', 'Notes', 'Base', 'Vault', 'HQ', 'Logic'],
    ar_pref: ['كيف', 'دليل', 'كتيب', 'قاعدة', 'نصيحة', 'مهارة', 'تعلم', 'خطوة', 'أسرار'],
    ar_suff: ['بوك', 'جايد', 'نوتس', 'مانوال', 'برو', 'للمعرفة', 'عملي', 'ريد'],
    meaning_en: 'How-to guides and manuals', meaning_ar: 'أدلة وكتب عملية'
  },

  // 11. SUBSCRIPTIONS
  subscriptions_exclusive: {
    en_pref: ['Elite', 'Prime', 'Crown', 'Inner', 'Vip', 'Select', 'Core', 'Apex', 'Top', 'Secret'],
    en_suff: ['Club', 'Circle', 'Lounge', 'Guild', 'Society', 'Room', 'Access', 'Pass', 'Tier'],
    ar_pref: ['نخبة', 'برايم', 'تاج', 'في آي بي', 'صفوة', 'قمة', 'سر', 'خاص', 'أصيل'],
    ar_suff: ['كلوب', 'سيركل', 'لاونج', 'سوسايتي', 'روم', 'المغلق', 'النخبة', 'الخاص'],
    meaning_en: 'Exclusive elite membership', meaning_ar: 'اشتراك ومجتمع النخبة'
  },
  subscriptions_networking: {
    en_pref: ['Net', 'Link', 'Connect', 'Sync', 'Join', 'Meet', 'Ties', 'Bond', 'Bridge', 'Hub'],
    en_suff: ['Work', 'Space', 'Network', 'Circle', 'Group', 'Tribe', 'HQ', 'Lounge', 'Base'],
    ar_pref: ['شبكة', 'رابط', 'تواصل', 'لقاء', 'تعارف', 'جسور', 'تجمع', 'نادي', 'علاقات'],
    ar_suff: ['ورك', 'سبيس', 'نتورك', 'ترايب', 'لاونج', 'الأعمال', 'جروب', 'هب'],
    meaning_en: 'Professional networking group', meaning_ar: 'مجموعة تشبيك مهني'
  },
  subscriptions_creators: {
    en_pref: ['Create', 'Make', 'Art', 'Content', 'Vlog', 'Cast', 'Stream', 'Play', 'Craft', 'Idea'],
    en_suff: ['Tribe', 'Hub', 'Club', 'House', 'Camp', 'Crew', 'Studio', 'Lab', 'Guild'],
    ar_pref: ['إبداع', 'صناعة', 'محتوى', 'فلوج', 'بث', 'فن', 'أفكار', 'فنان', 'مبدع'],
    ar_suff: ['ترايب', 'هب', 'كلوب', 'هاوس', 'كرو', 'ستوديو', 'لاب', 'الصناع'],
    meaning_en: 'Content creators community', meaning_ar: 'مجتمع صناع المحتوى'
  },

  // 12. ASSETS
  assets_vectors: {
    en_pref: ['Vector', 'Shape', 'Line', 'Draw', 'Art', 'Curve', 'Path', 'SVG', 'Illu', 'Icon'],
    en_suff: ['Vault', 'Stock', 'Pack', 'Drop', 'Grid', 'Hub', 'Box', 'Supply', 'Core'],
    ar_pref: ['فيكتور', 'شكل', 'خط', 'رسم', 'فن', 'منحنى', 'مسار', 'أيقونة', 'شعار'],
    ar_suff: ['فولت', 'ستوك', 'باك', 'دروب', 'جريد', 'بوكس', 'سبلاي', 'هب'],
    meaning_en: 'Vector graphics and icons', meaning_ar: 'رسوم وفيكتورز رقمية'
  },
  assets_fonts: {
    en_pref: ['Font', 'Type', 'Glyph', 'Letter', 'Text', 'Word', 'Script', 'Serif', 'Sans', 'Print'],
    en_suff: ['Face', 'Foundry', 'Pack', 'Studio', 'Vault', 'Drop', 'Craft', 'Forge', 'House'],
    ar_pref: ['خط', 'حرف', 'نص', 'كلمة', 'تايب', 'طباعة', 'رقعة', 'نسخ', 'قلم'],
    ar_suff: ['فيس', 'ستوديو', 'باك', 'هاوس', 'فولت', 'كرافت', 'فونتس', 'الطباعة'],
    meaning_en: 'Typography and fonts', meaning_ar: 'خطوط وتايبوجرافي'
  },
  assets_audio: {
    en_pref: ['Audio', 'Sound', 'Beat', 'Wave', 'Tune', 'Sonic', 'Track', 'Vibe', 'Chord', 'Bass'],
    en_suff: ['Pack', 'Drop', 'Library', 'Vault', 'Sync', 'Lab', 'Studio', 'Mix', 'Core'],
    ar_pref: ['صوت', 'إيقاع', 'موجة', 'نغمة', 'تراك', 'وتر', 'بيس', 'تردد', 'صدى'],
    ar_suff: ['باك', 'لايبراري', 'فولت', 'لاب', 'ستوديو', 'ميكس', 'ساوند', 'كور'],
    meaning_en: 'Audio and sound effects', meaning_ar: 'مؤثرات صوتية وموسيقى'
  },

  // 13. MARKETING
  marketing_ads: {
    en_pref: ['Ad', 'Click', 'Lead', 'Scale', 'Reach', 'Target', 'Convert', 'ROI', 'Bid', 'Boost'],
    en_suff: ['Vantage', 'Logic', 'Flow', 'Max', 'Genius', 'Force', 'Ops', 'HQ', 'Lab'],
    ar_pref: ['إعلان', 'نقرة', 'وصول', 'استهداف', 'تحويل', 'عائد', 'مبيعات', 'حملة', 'نمو'],
    ar_suff: ['لوجيك', 'ماكس', 'جينيوس', 'لاب', 'فورس', 'التسويق', 'أوبس', 'بلس'],
    meaning_en: 'Paid advertising agency', meaning_ar: 'وكالة إعلانات ممولة'
  },
  marketing_seo: {
    en_pref: ['Search', 'Rank', 'SEO', 'Top', 'Keyword', 'Link', 'Traffic', 'Index', 'Find', 'Boost'],
    en_suff: ['Logic', 'Higher', 'Master', 'Hub', 'Ops', 'Core', 'Path', 'Flow', 'Genius'],
    ar_pref: ['بحث', 'رنك', 'ترافيك', 'قمة', 'كلمة', 'رابط', 'فهرس', 'زيارة', 'تصدر'],
    ar_suff: ['لوجيك', 'ماستر', 'أوبس', 'هب', 'اس اي او', 'كور', 'جايد', 'فايندر'],
    meaning_en: 'SEO and ranking agency', meaning_ar: 'وكالة تحسين محركات البحث'
  },
  marketing_content: {
    en_pref: ['Content', 'Word', 'Story', 'Copy', 'Brand', 'Draft', 'Idea', 'Voice', 'Script', 'Viral'],
    en_suff: ['Craft', 'Logic', 'Makers', 'Forge', 'Studio', 'Lab', 'Genius', 'Hub', 'Flow'],
    ar_pref: ['محتوى', 'كلمة', 'قصة', 'كوبي', 'براند', 'فكرة', 'صوت', 'نص', 'مقال'],
    ar_suff: ['كرافت', 'لوجيك', 'ميكرز', 'لاب', 'ستوديو', 'فلَو', 'كونتنت', 'كرييتف'],
    meaning_en: 'Content marketing agency', meaning_ar: 'تسويق وصناعة محتوى'
  },

  // 14. MEDIA
  media_video: {
    en_pref: ['Video', 'Reel', 'Clip', 'Lens', 'Frame', 'Cam', 'Edit', 'Cut', 'Shoot', 'Motion'],
    en_suff: ['Craft', 'Studio', 'Production', 'Lab', 'Works', 'Logic', 'House', 'Sync', 'Core'],
    ar_pref: ['فيديو', 'ريل', 'مقطع', 'عدسة', 'إطار', 'كاميرا', 'مونتاج', 'تصوير', 'لقطة'],
    ar_suff: ['كرافت', 'ستوديو', 'لاب', 'برودكشن', 'هاوس', 'موشن', 'وركس', 'عدسات'],
    meaning_en: 'Video production and editing', meaning_ar: 'إنتاج ومونتاج فيديو'
  },
  media_photography: {
    en_pref: ['Photo', 'Snap', 'Lens', 'Focus', 'Light', 'Aperture', 'Click', 'Flash', 'Capture', 'Pixel'],
    en_suff: ['Studio', 'Graphy', 'Lab', 'Works', 'Shot', 'Frame', 'Room', 'Core', 'Vibe'],
    ar_pref: ['صورة', 'سناب', 'عدسة', 'تركيز', 'ضوء', 'كليك', 'فلاش', 'لقطة', 'فوكس'],
    ar_suff: ['ستوديو', 'شوت', 'فريم', 'وركس', 'لاب', 'فوتو', 'للتصوير', 'روم'],
    meaning_en: 'Professional photography', meaning_ar: 'تصوير فوتوغرافي'
  },
  media_animation: {
    en_pref: ['Anima', 'Motion', 'Toon', 'Keyframe', 'Render', 'Draw', 'Move', 'VFX', 'CGI', 'Frame'],
    en_suff: ['Studio', 'Lab', 'Works', 'Logic', 'Craft', 'House', 'Box', 'Core', 'Flow'],
    ar_pref: ['موشن', 'أنيمي', 'تون', 'تحريك', 'رندر', 'رسم', 'تأثير', 'فريم', 'إطار'],
    ar_suff: ['ستوديو', 'لاب', 'لوجيك', 'كرافت', 'هاوس', 'وركس', 'جرافيك', 'فلَو'],
    meaning_en: 'Motion graphics and animation', meaning_ar: 'تحريك وموشن جرافيك'
  },

  // 15. CONSULTING
  consulting_strategy: {
    en_pref: ['Strat', 'Plan', 'Logic', 'Vision', 'Core', 'Apex', 'Guide', 'Path', 'Clear', 'Lead'],
    en_suff: ['Consulting', 'Partners', 'Group', 'Advisors', 'Logic', 'Mind', 'Edge', 'Firm', 'HQ'],
    ar_pref: ['خطة', 'استراتيجية', 'رؤية', 'جوهر', 'قمة', 'دليل', 'مسار', 'قيادة', 'توجيه'],
    ar_suff: ['بارتنرز', 'جروب', 'للاستشارات', 'لوجيك', 'أدفايزرز', 'مايند', 'الاستراتيجية', 'بزنس'],
    meaning_en: 'Business strategy consulting', meaning_ar: 'استشارات استراتيجية'
  },
  consulting_finance: {
    en_pref: ['Capital', 'Wealth', 'Fund', 'Asset', 'Equity', 'Profit', 'Yield', 'Scale', 'Value', 'Invest'],
    en_suff: ['Group', 'Partners', 'Advisors', 'Logic', 'Firm', 'Capital', 'Wealth', 'Trust', 'Core'],
    ar_pref: ['رأس مال', 'ثروة', 'أصل', 'ربح', 'توسع', 'قيمة', 'استثمار', 'نمو', 'مال'],
    ar_suff: ['كابيتال', 'بارتنرز', 'جروب', 'للاستشارات', 'ترست', 'فاليوم', 'كور', 'المالية'],
    meaning_en: 'Financial consulting', meaning_ar: 'استشارات مالية واستثمار'
  },
  consulting_hr: {
    en_pref: ['Talent', 'People', 'Team', 'Hire', 'Culture', 'Staff', 'Work', 'Lead', 'Skill', 'Human'],
    en_suff: ['Partners', 'Group', 'Logic', 'Ops', 'Force', 'Base', 'Hub', 'Advisors', 'Firm'],
    ar_pref: ['موهبة', 'أفراد', 'فريق', 'توظيف', 'ثقافة', 'عمل', 'قيادة', 'مهارة', 'كفاءة'],
    ar_suff: ['بارتنرز', 'أوبس', 'فورس', 'هب', 'جروب', 'تيم', 'للموارد', 'تراك'],
    meaning_en: 'HR and talent acquisition', meaning_ar: 'توظيف وموارد بشرية'
  },

  // FALLBACK
  generic: {
    en_pref: ['Pro', 'Max', 'Ultra', 'Core', 'Prime', 'Apex', 'Nova', 'Omni'],
    en_suff: ['Hub', 'Space', 'Forge', 'Base', 'Line', 'Mark', 'Point', 'Sync'],
    ar_pref: ['نخبة', 'قمة', 'محور', 'أساس', 'ريادة', 'مسار', 'أفق', 'رؤية'],
    ar_suff: ['برو', 'الحديث', 'المتطور', 'بلس', 'الرقمي', 'الأول', 'هب', 'تك'],
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
