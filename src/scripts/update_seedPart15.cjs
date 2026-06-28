const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../services/seedPart15_productIdeas.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const baseTopics = {[\s\S]*?};/,
  `const baseTopics = {
  marketing: [
    { ar: 'محتوى السوشيال ميديا', en: 'Social Media Content' },
    { ar: 'سلاسل البريد الإلكتروني', en: 'Email Sequences' },
    { ar: 'خطافات إعلانية (Ad Hooks)', en: 'Ad Hooks' },
    { ar: 'خرائط مسارات البيع (Funnels)', en: 'Sales Funnels' },
    { ar: 'أدلة تحسين محركات البحث (SEO)', en: 'SEO Guides' },
    { ar: 'تقويم المحتوى السنوي', en: 'Annual Content Calendar' },
    { ar: 'ملفات نصوص تسويقية (Swipe Files)', en: 'Swipe Files' },
    { ar: 'قوالب التواصل مع المؤثرين', en: 'Influencer Outreach Templates' },
    { ar: 'بيانات صحفية (PR)', en: 'Press Releases (PR)' },
    { ar: 'استراتيجيات زيادة التحويل', en: 'Conversion Optimization Strategies' },
    { ar: 'لوحات تحليل البيانات', en: 'Data Analytics Dashboards' },
    { ar: 'خطط إطلاق المنتجات', en: 'Product Launch Plans' },
    { ar: 'أدلة إدارة المجتمعات', en: 'Community Management Guides' },
    { ar: 'قوالب جذب العملاء (Lead Magnets)', en: 'Lead Magnet Templates' },
    { ar: 'تصميمات إعلانية جاهزة', en: 'Ready-made Ad Designs' }
  ],
  design: [
    { ar: 'حزم الشعارات الاحترافية', en: 'Professional Logo Packs' },
    { ar: 'أدلة الهوية البصرية', en: 'Brand Identity Guides' },
    { ar: 'قوالب منشورات انستجرام', en: 'Instagram Post Templates' },
    { ar: 'عروض تقديمية (Pitch Decks)', en: 'Pitch Decks' },
    { ar: 'مكتبات واجهات المستخدم (UI Kits)', en: 'UI Kits' },
    { ar: 'مجموعات الأيقونات', en: 'Icon Sets' },
    { ar: 'تنسيقات الخطوط الاحترافية', en: 'Professional Font Pairings' },
    { ar: 'قوالب العرض (Mockups)', en: 'Mockup Templates' },
    { ar: 'حزم الرسومات التوضيحية', en: 'Illustration Packs' },
    { ar: 'إعلانات البانر للمواقع', en: 'Website Banner Ads' },
    { ar: 'تصاميم بطاقات العمل', en: 'Business Card Designs' },
    { ar: 'قوالب النشرات البريدية', en: 'Newsletter Templates' },
    { ar: 'ثيمات Notion الجمالية', en: 'Aesthetic Notion Themes' },
    { ar: 'أغلفة الكتب الإلكترونية', en: 'eBook Covers' },
    { ar: 'فلاتر صور احترافية (Presets)', en: 'Professional Photo Presets' }
  ],
  coaching: [
    { ar: 'مخططات الأهداف', en: 'Goal Planners' },
    { ar: 'بطاقات التأكيدات الإيجابية', en: 'Positive Affirmation Cards' },
    { ar: 'جداول تتبع العادات', en: 'Habit Trackers' },
    { ar: 'حقائب الورش التدريبية', en: 'Workshop Toolkits' },
    { ar: 'نماذج استقبال العملاء', en: 'Client Onboarding Forms' },
    { ar: 'كتيبات تمارين تفاعلية (Workbooks)', en: 'Interactive Workbooks' },
    { ar: 'شرائح العروض التدريبية (Masterclass)', en: 'Masterclass Presentation Slides' },
    { ar: 'خطط العمل التنفيذية', en: 'Action Plans' },
    { ar: 'جداول المحاسبة الذاتية', en: 'Accountability Trackers' },
    { ar: 'يوميات تطوير العقلية', en: 'Mindset Journals' },
    { ar: 'أطر إدارة الوقت', en: 'Time Management Frameworks' },
    { ar: 'أدوات قياس التقدم', en: 'Progress Measurement Tools' },
    { ar: 'ألعاب كسر الجليد للتدريب', en: 'Training Icebreakers' },
    { ar: 'أسئلة التأمل الذاتي', en: 'Self-Reflection Prompts' },
    { ar: 'باقات الترحيب بالعملاء الجدد', en: 'Welcome Packets for New Clients' }
  ],
  ecom: [
    { ar: 'نصوص وصف المنتجات', en: 'Product Description Copy' },
    { ar: 'قوائم المنتجات الرابحة', en: 'Winning Product Lists' },
    { ar: 'ثيمات متاجر شوبيفاي', en: 'Shopify Store Themes' },
    { ar: 'إيميلات استرجاع السلة المتروكة', en: 'Abandoned Cart Email Sequences' },
    { ar: 'سياسات الاسترجاع والاستبدال', en: 'Return and Exchange Policies' },
    { ar: 'أدلة الموردين والمصانع', en: 'Supplier and Manufacturer Guides' },
    { ar: 'جداول تتبع المخزون', en: 'Inventory Tracking Spreadsheets' },
    { ar: 'بطاقات شكر للعملاء (Inserts)', en: 'Customer Thank You Cards (Inserts)' },
    { ar: 'نصوص خدمة العملاء للرد', en: 'Customer Service Response Scripts' },
    { ar: 'استراتيجيات البيع المتقاطع', en: 'Cross-Selling Strategies' },
    { ar: 'حاسبات تسعير المنتجات', en: 'Product Pricing Calculators' },
    { ar: 'أدلة تصوير المنتجات بالهاتف', en: 'Smartphone Product Photography Guides' },
    { ar: 'قوائم استهدافات الإعلانات', en: 'Ad Targeting Lists' },
    { ar: 'قوائم فحص متاجر تيك توك', en: 'TikTok Shop Checklists' },
    { ar: 'تقويم العروض الموسمية', en: 'Seasonal Promotion Calendars' }
  ],
  tech: [
    { ar: 'مكتبات الأكواد الجاهزة (Snippets)', en: 'Code Snippet Libraries' },
    { ar: 'هياكل المشاريع (Boilerplates)', en: 'Project Boilerplates' },
    { ar: 'أدوات سطر الأوامر (CLI)', en: 'Command Line Tools (CLI)' },
    { ar: 'ملازم سريعة (Cheat Sheets)', en: 'Quick Cheat Sheets' },
    { ar: 'حزم تأسيس مشاريع الـ SaaS', en: 'SaaS Starter Kits' },
    { ar: 'مخططات قواعد البيانات', en: 'Database Schemas' },
    { ar: 'قوالب توثيق الواجهات (API)', en: 'API Documentation Templates' },
    { ar: 'ملفات إعداد Docker', en: 'Docker Configuration Files' },
    { ar: 'مسارات عمل GitHub Actions', en: 'GitHub Actions Workflows' },
    { ar: 'معالجات الربط (Webhooks)', en: 'Webhook Handlers' },
    { ar: 'قوالب اختبار الأكواد', en: 'Code Testing Templates' },
    { ar: 'لوحات تحكم برمجية (Dashboards)', en: 'Admin Dashboards' },
    { ar: 'سكربتات النشر التلقائي', en: 'Automated Deployment Scripts' },
    { ar: 'قوائم مراجعة جودة الكود', en: 'Code Quality Checklists' },
    { ar: 'مخططات البنية التحتية (Architecture)', en: 'Infrastructure Architecture Diagrams' }
  ]
};`
);

content = content.replace(
  /const audiences = {[\s\S]*?};/,
  `const audiences = {
  marketing: { ar: 'أصحاب المشاريع، المسوقين، ورواد الأعمال الرقمية الذين يبحثون عن مضاعفة مبيعاتهم.', en: 'Business owners, marketers, and digital entrepreneurs looking to double their sales.' },
  design: { ar: 'المصممين، وكالات الدعاية، وأصحاب المتاجر الذين يبحثون عن مظهر احترافي لعلاماتهم.', en: 'Designers, advertising agencies, and store owners looking for a professional look for their brands.' },
  coaching: { ar: 'المدربين، المستشارين، والأشخاص المهتمين بالتطوير الذاتي وتحقيق أهدافهم.', en: 'Coaches, consultants, and individuals interested in self-development and achieving their goals.' },
  ecom: { ar: 'أصحاب المتاجر الإلكترونية، تجار الدروبشيبينغ، والباحثين عن الاستقلال المالي.', en: 'E-commerce store owners, dropshippers, and those seeking financial independence.' },
  tech: { ar: 'المبرمجين، مؤسسي الـ SaaS، والشركات التقنية الناشئة لتقليل وقت التطوير.', en: 'Programmers, SaaS founders, and tech startups looking to reduce development time.' }
};`
);

content = content.replace(
  /function generateIdea\(typeId, nicheId, effortId, topicAr, index\) {[\s\S]*?return {/,
  `function generateIdea(typeId, nicheId, effortId, topic, index) {
    let topicAr = topic.ar;
    let topicEn = topic.en;
    
    let prefixAr = ''; let prefixEn = '';
    let priceAr = ''; let priceEn = '';
    let effortDescAr = ''; let effortDescEn = '';
    
    if (effortId === 'easy') {
        prefixAr = ['كتيب: ', 'قائمة: ', 'ملف: ', 'حزمة بسيطة لـ '][index % 4];
        prefixEn = ['Booklet: ', 'Checklist: ', 'File: ', 'Simple Kit for '][index % 4];
        priceAr = ['9$ - 19$', '15$ - 29$', '7$ - 15$', '5$ - 12$'][index % 4];
        priceEn = priceAr;
        effortDescAr = 'مناسب جداً للمبتدئين ولا يتطلب خبرة تقنية أو مجهود كبير في التعديل.';
        effortDescEn = 'Perfect for beginners, requires no technical expertise or major editing effort.';
    } else if (effortId === 'medium') {
        prefixAr = ['نظام متكامل لـ ', 'أداة احترافية: ', 'حزمة متقدمة في ', 'دليل شامل لـ '][index % 4];
        prefixEn = ['Complete System for ', 'Pro Tool: ', 'Advanced Kit for ', 'Comprehensive Guide to '][index % 4];
        priceAr = ['29$ - 49$', '39$ - 79$', '19$ - 39$', '49$ - 99$'][index % 4];
        priceEn = priceAr;
        effortDescAr = 'يتطلب بعض الوقت للتخصيص والإعداد، ولكنه يقدم قيمة مضافة وعالية للمشتري.';
        effortDescEn = 'Requires some time for customization, but offers high added value to the buyer.';
    } else {
        prefixAr = ['برنامج تدريبي: ', 'نظام تشغيل كامل لـ ', 'خدمة استشارية: ', 'بنية تحتية لـ '][index % 4];
        prefixEn = ['Training Program: ', 'Full OS for ', 'Consulting Service: ', 'Infrastructure for '][index % 4];
        priceAr = ['97$ - 197$', '199$ - 399$', '149$ - 297$', '99$ - 249$'][index % 4];
        priceEn = priceAr;
        effortDescAr = 'يستهدف المحترفين ويتطلب مجهوداً عالياً في الإنشاء ووقتاً أطول في الإطلاق لضمان الجودة المثالية.';
        effortDescEn = 'Targeted at professionals, requires high effort in creation and longer launch time to ensure perfect quality.';
    }

    let nameAr = prefixAr + topicAr;
    let nameEn = prefixEn + topicEn;
    let sourceAr = ''; let sourceEn = '';
    let typeDescAr = ''; let typeDescEn = '';
    
    if (typeId === 'plr') {
        nameAr += ' (PLR)'; nameEn += ' (PLR)';
        sourceAr = 'أسواق PLR (مثل PLR.me أو Etsy) مع حقوق إعادة البيع';
        sourceEn = 'PLR Markets (like PLR.me or Etsy) with resell rights';
        typeDescAr = 'منتج جاهز بحقوق إعادة البيع (PLR/MRR)، يمكنك شراءه وتغيير الغلاف ووضع شعارك عليه ثم بيعه مباشرة والاحتفاظ بـ 100% من الأرباح.';
        typeDescEn = 'Ready-made product with resell rights (PLR/MRR). You can buy it, rebrand the cover, put your logo, and sell it directly keeping 100% of profits.';
    } else if (typeId === 'digital') {
        sourceAr = 'إنتاج ذاتي (صناعة المحتوى الخاص بك بالاستعانة بالذكاء الاصطناعي)';
        sourceEn = 'Self-Production (Create your own content using AI assistance)';
        typeDescAr = 'منتج رقمي فريد تقوم بصناعته بنفسك بناءً على خبرتك ومعرفتك ليعكس هويتك، مما يقلل المنافسة ويسمح بتسعير أعلى.';
        typeDescEn = 'A unique digital product you create yourself based on your expertise to reflect your identity, reducing competition and allowing higher pricing.';
    } else if (typeId === 'service') {
        nameAr = 'خدمة: ' + topicAr; nameEn = 'Service: ' + topicEn;
        priceAr = priceAr.replace('$', '$/شهر'); priceEn = priceEn.replace('$', '$/month');
        sourceAr = 'تقديم الخدمة للعملاء (مستقل / Upwork / وكالة خاصة)';
        sourceEn = 'Providing service to clients (Freelancer / Upwork / Private Agency)';
        typeDescAr = 'تحويل هذه الفكرة إلى خدمة مستمرة (Productized Service) أو باقة عمل واضحة المعالم تقدمها للعملاء بشكل شهري أو كـ مشروع.';
        typeDescEn = 'Transform this idea into a Productized Service or clear-cut package offered to clients monthly or per-project.';
    } else if (typeId === 'template') {
        nameAr = 'قالب ' + topicAr; nameEn = topicEn + ' Template';
        sourceAr = 'Canva / Notion / Figma'; sourceEn = 'Canva / Notion / Figma';
        typeDescAr = 'قالب جاهز للاستخدام والتعديل، يمكن للعملاء شراءه وتخصيصه بأنفسهم ليناسب أعمالهم دون الحاجة للبدء من الصفر.';
        typeDescEn = 'Ready-to-use template that clients can purchase and customize themselves to fit their business without starting from scratch.';
    }

    const audience = audiences[nicheId];

    return {`
);

content = content.replace(
  /name: name,\n\s*price: price,\n\s*source: source,\n\s*desc: `هذا المنتج يركز على تزويد العميل بـ "\${topicAr}" بأعلى جودة ممكنة. \${typeDesc} \${effortDesc}`,\n\s*audience: audience,/,
  `name_ar: nameAr,
        name_en: nameEn,
        price_ar: priceAr,
        price_en: priceEn,
        source_ar: sourceAr,
        source_en: sourceEn,
        desc_ar: \`هذا المنتج يركز على تزويد العميل بـ "\${topicAr}" بأعلى جودة ممكنة. \${typeDescAr} \${effortDescAr}\`,
        desc_en: \`This product focuses on providing the client with the highest quality "\${topicEn}". \${typeDescEn} \${effortDescEn}\`,
        audience_ar: audience.ar,
        audience_en: audience.en,`
);

content = content.replace(
  /features: \[[\s\S]*?\],/,
  `features_ar: [
            \`توفير الوقت والجهد على العميل عبر توفير \${topicAr} جاهز للاستخدام أو التطبيق.\`,
            \`تصميم وإعداد قابل للتخصيص ليتناسب مع احتياجات كل فرد.\`,
            \`يأتي مع تعليمات مبسطة أو دليل استخدام يضمن تحقيق أقصى استفادة.\`,
            typeId === 'service' ? 'دخل شهري متكرر وعلاقة مستمرة مع العميل.' : 'إمكانية تحقيق دخل سلبي (Passive Income) بمجرد رفع المنتج للبيع.'
        ],
        features_en: [
            \`Saving the client's time and effort by providing a ready-to-use \${topicEn}.\`,
            \`Customizable design and setup tailored to individual needs.\`,
            \`Comes with simplified instructions or a user guide ensuring maximum benefit.\`,
            typeId === 'service' ? 'Recurring monthly revenue and an ongoing client relationship.' : 'Potential to achieve passive income simply by listing the product for sale.'
        ],`
);

content = content.replace(
  /tips: \[[\s\S]*?\]/,
  `tips_ar: [
            \`أضف لمستك الشخصية وهوية علامتك التجارية حتى لو كان المنتج جاهزاً لزيادة الثقة.\`,
            \`قم بتسعير المنتج بناءً على "القيمة المضافة والنتائج" وليس فقط الجهد المبذول في إعداده.\`,
            \`استخدم وسائل التواصل (Instagram/TikTok) لعرض أجزاء مجانية من \${topicAr} كتشويق لجذب العملاء.\`
        ],
        tips_en: [
            \`Add your personal touch and brand identity, even to ready-made products, to build trust.\`,
            \`Price the product based on "added value and results", not just the effort put into making it.\`,
            \`Use social media (Instagram/TikTok) to showcase free snippets of \${topicEn} to attract clients.\`
        ]`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Modified seedPart15_productIdeas.js');
