/**
 * toolGuides.js — دليل استخدام كل أداة
 * يحتوي على شرح + خطوات + مدخلات/مخرجات
 */
export const TOOL_GUIDES = {
  'niche-selection': {
    ar: {
      title: 'اختيار النيش (المجال)',
      description: 'هذه الأداة تساعدك على اختيار المجال المناسب لمشروعك بناءً على اهتماماتك وفرص السوق.',
      steps: ['اختر الفئة الرئيسية (AI، بزنس، تسويق)', 'اطلع على تحليل السوق والجمهور', 'اختر نيش فرعي دقيق', 'أكد اختيارك بالضغط على "تم الاختيار"'],
      hasInputs: false,
    },
    en: {
      title: 'Niche Selection',
      description: 'This tool helps you pick the right niche based on your interests and market opportunities.',
      steps: ['Choose a main category (AI, Business, Marketing)', 'Review market and audience analysis', 'Pick a specific sub-niche', 'Confirm by clicking "Done"'],
      hasInputs: false,
    }
  },
  'brand-naming': {
    ar: {
      title: 'اسم البراند',
      description: 'أداة توليد أسماء براند مميزة باستخدام الذكاء الاصطناعي.',
      steps: ['شاهد فيديو الشرح', 'اختر أسلوب الاسم (قصير، فاخر، عربي...)', 'اختر النيش الفرعي', 'اضغط "توليد" للحصول على أسماء', 'اعتمد الاسم المناسب'],
      hasInputs: true, inputs: ['أسلوب الاسم', 'النيش الفرعي'], outputs: ['قائمة أسماء مقترحة مع المعنى'],
    },
    en: {
      title: 'Brand Naming',
      description: 'AI-powered brand name generator.',
      steps: ['Watch the tutorial video', 'Choose naming style', 'Select sub-niche', 'Click "Generate"', 'Approve the best name'],
      hasInputs: true, inputs: ['Naming style', 'Sub-niche'], outputs: ['List of suggested names with meanings'],
    }
  },
  'visual-identity': {
    ar: {
      title: 'الهوية البصرية',
      description: 'اختر ألوان البراند وارفع اللوجو لترى كيف سيبدو على أرض الواقع.',
      steps: ['اختر باليت ألوان من المقترحات أو خصص يدوياً', 'ارفع اللوجو الخاص بك', 'شاهد المعاينة الحية على الموكاب', 'أكد اختيارك'],
      hasInputs: true, inputs: ['لون أساسي', 'لون ثانوي', 'صورة اللوجو'], outputs: ['معاينة حية للبراند'],
    },
    en: {
      title: 'Visual Identity',
      description: 'Choose brand colors and upload logo to preview your brand in action.',
      steps: ['Pick a color palette or customize manually', 'Upload your logo', 'Preview the live mockup', 'Confirm your choice'],
      hasInputs: true, inputs: ['Primary color', 'Secondary color', 'Logo image'], outputs: ['Live brand preview'],
    }
  },
  'website-construction': {
    ar: {
      title: 'بناء وتجهيز الموقع',
      description: 'دليل شامل لبناء موقعك خطوة بخطوة مع UpKlick.',
      steps: ['اختر طريقة البناء (قالب جاهز أو من الصفر)', 'اتبع خطوات التصميم والإعدادات', 'اضبط البنية التحتية (دومين، بيكسل، دفع)', 'أكد إتمام كل مرحلة'],
      hasInputs: false,
    },
    en: {
      title: 'Website Construction',
      description: 'Complete guide to build your website step by step with UpKlick.',
      steps: ['Choose build method (template or from scratch)', 'Follow design and settings steps', 'Set up infrastructure (domain, pixel, payment)', 'Confirm each phase'],
      hasInputs: false,
    }
  },
  'landing-page-content': {
    ar: {
      title: 'محتوى صفحة الهبوط',
      description: 'أداة ذكية لتوليد محتوى صفحة الهبوط بالكامل بناءً على النيش.',
      steps: ['اختر نوع المحتوى (Hero, مشاكل, حلول...)', 'اختر النيش والأسلوب', 'اضغط "توليد" للحصول على المحتوى', 'انسخ المحتوى واستخدمه في موقعك'],
      hasInputs: true, inputs: ['نوع القسم', 'النيش', 'الأسلوب'], outputs: ['نص تسويقي جاهز للنسخ'],
    },
    en: {
      title: 'Landing Page Content',
      description: 'Smart tool to generate full landing page content based on your niche.',
      steps: ['Choose content type (Hero, Problems, Solutions...)', 'Select niche and style', 'Click "Generate"', 'Copy and use in your website'],
      hasInputs: true, inputs: ['Section type', 'Niche', 'Style'], outputs: ['Ready-to-copy marketing text'],
    }
  },
  'legal-pages': {
    ar: {
      title: 'الصفحات القانونية',
      description: 'أنشئ صفحات قانونية احترافية (خصوصية، شروط، استرجاع) لموقعك.',
      steps: ['أدخل اسم الشركة والموقع والإيميل', 'اختر نوع الصفحة', 'اضغط "توليد"', 'انسخ النص وأضفه لموقعك'],
      hasInputs: true, inputs: ['اسم الشركة', 'رابط الموقع', 'إيميل التواصل'], outputs: ['صفحات قانونية كاملة'],
    },
    en: {
      title: 'Legal Pages',
      description: 'Generate professional legal pages (Privacy, Terms, Refund) for your site.',
      steps: ['Enter company name, site URL, and email', 'Choose page type', 'Click "Generate"', 'Copy and add to your site'],
      hasInputs: true, inputs: ['Company name', 'Site URL', 'Contact email'], outputs: ['Complete legal pages'],
    }
  },
  'social-integration': {
    ar: {
      title: 'ربط السوشيال ميديا',
      description: 'قائمة تحقق لربط حسابات التواصل الاجتماعي بموقعك.',
      steps: ['اربط حساب فيسبوك وانستجرام بـ UpKlick', 'أضف كود البيكسل للتتبع', 'أكد إتمام كل خطوة'],
      hasInputs: false,
    },
    en: {
      title: 'Social Integration',
      description: 'Checklist to connect social media accounts to your site.',
      steps: ['Connect Facebook & Instagram to UpKlick', 'Add Pixel tracking code', 'Confirm each step'],
      hasInputs: false,
    }
  },
  'email-setup': {
    ar: {
      title: 'إعداد الإيميل',
      description: 'أداة لتوليد سلاسل الإيميل التسويقية الاحترافية.',
      steps: ['اختر هدف السلسلة والجمهور والنبرة', 'اضغط "توليد"', 'انسخ الإيميلات وأضفها لنظام الأتمتة'],
      hasInputs: true, inputs: ['هدف السلسلة', 'الجمهور', 'النبرة'], outputs: ['سلسلة إيميلات كاملة'],
    },
    en: {
      title: 'Email Setup',
      description: 'Generate professional email marketing sequences.',
      steps: ['Choose sequence goal, audience, and tone', 'Click "Generate"', 'Copy emails to your automation system'],
      hasInputs: true, inputs: ['Sequence goal', 'Audience', 'Tone'], outputs: ['Complete email sequence'],
    }
  },
  'product-source': {
    ar: {
      title: 'مصدر المنتج',
      description: 'أداة لاكتشاف أفكار منتجات رقمية مربحة.',
      steps: ['اختر نوع المنتج والنيش ومستوى الجهد', 'اضغط "توليد"', 'استعرض الأفكار واختر الأنسب'],
      hasInputs: true, inputs: ['نوع المنتج', 'النيش', 'مستوى الجهد'], outputs: ['أفكار منتجات مع التفاصيل'],
    },
    en: {
      title: 'Product Source',
      description: 'Discover profitable digital product ideas.',
      steps: ['Choose product type, niche, and effort level', 'Click "Generate"', 'Review ideas and pick the best'],
      hasInputs: true, inputs: ['Product type', 'Niche', 'Effort level'], outputs: ['Product ideas with details'],
    }
  },
  'profit-calculator': {
    ar: {
      title: 'حاسبة الأرباح',
      description: 'حاسبة متقدمة لتوقع الأرباح وعائد الإعلانات (ROAS) قبل إنفاق أي مبلغ.',
      steps: ['أدخل سعر البيع وتكلفة المنتج', 'أدخل الميزانية اليومية وتكلفة النقرة ومعدل التحويل', 'اضغط "تحليل" للحصول على توصيات AI', 'راجع النتائج واضبط المتغيرات'],
      hasInputs: true, inputs: ['سعر البيع', 'تكلفة المنتج', 'الميزانية اليومية', 'CPC', 'CVR'], outputs: ['صافي الربح', 'ROAS', 'هامش الربح', 'تحليل AI'],
    },
    en: {
      title: 'Profit Calculator',
      description: 'Advanced calculator to predict profits and ROAS before spending.',
      steps: ['Enter sale price and product cost', 'Enter daily budget, CPC, and CVR', 'Click "Analyze" for AI insights', 'Review results and adjust variables'],
      hasInputs: true, inputs: ['Sale price', 'Product cost', 'Daily budget', 'CPC', 'CVR'], outputs: ['Net profit', 'ROAS', 'Profit margin', 'AI analysis'],
    }
  },
  'social-presence': {
    ar: {
      title: 'السوشيال ميديا',
      description: 'أداة لتوليد محتوى السوشيال ميديا (بايو، وصف، هاشتاقات) لكل منصة.',
      steps: ['اختر المنصة (انستجرام، تيك توك...)', 'اضغط "توليد"', 'انسخ المحتوى وأضفه لحساباتك'],
      hasInputs: true, inputs: ['المنصة المستهدفة'], outputs: ['بايو، وصف، هاشتاقات'],
    },
    en: {
      title: 'Social Presence',
      description: 'Generate social media content (bio, description, hashtags) per platform.',
      steps: ['Choose platform', 'Click "Generate"', 'Copy content to your accounts'],
      hasInputs: true, inputs: ['Target platform'], outputs: ['Bio, description, hashtags'],
    }
  },
  'content-factory': {
    ar: {
      title: 'مصنع المحتوى',
      description: 'أفكار محتوى جاهزة مخصصة للنيش الخاص بك.',
      steps: ['تأكد من اختيار النيش الفرعي أولاً', 'استعرض أفكار المحتوى المولدة', 'انسخ الأفكار واستخدمها في جدول المحتوى'],
      hasInputs: false,
    },
    en: {
      title: 'Content Factory',
      description: 'Ready content ideas tailored for your niche.',
      steps: ['Make sure you selected a sub-niche first', 'Browse generated content ideas', 'Copy ideas to your content calendar'],
      hasInputs: false,
    }
  },
  'email-automation': {
    ar: {
      title: 'أتمتة الإيميل',
      description: 'سلسلة ترحيب وأتمتة للتواصل مع العملاء الجدد.',
      steps: ['تأكد من اختيار النيش الفرعي أولاً', 'استعرض سلسلة الإيميلات المولدة', 'انسخ وأضف للنظام البريدي'],
      hasInputs: false,
    },
    en: {
      title: 'Email Automation',
      description: 'Welcome series and automation for new customers.',
      steps: ['Make sure you selected a sub-niche first', 'Browse generated email sequence', 'Copy and add to your email system'],
      hasInputs: false,
    }
  },
  'marketing-plan': {
    ar: {
      title: 'مخطط الحملات',
      description: 'مولد خطط تسويق ذكي مع الاستهداف والميزانية ونصوص الإعلانات.',
      steps: ['اختر السوق المستهدف والعملة', 'اختر الفئة العمرية والجنس', 'اضغط "توليد الخطة"', 'انسخ المحتوى واعتمد الميزانية'],
      hasInputs: true, inputs: ['السوق', 'العملة', 'العمر', 'الجنس'], outputs: ['ميزانية يومية', 'استهداف', 'نصوص إعلانية'],
    },
    en: {
      title: 'Campaign planner',
      description: 'Smart marketing plan generator with targeting, budget, and ad copy.',
      steps: ['Choose target market and currency', 'Select age range and gender', 'Click "Generate Plan"', 'Copy content and approve budget'],
      hasInputs: true, inputs: ['Market', 'Currency', 'Age', 'Gender'], outputs: ['Daily budget', 'Targeting', 'Ad copy'],
    }
  },
  'ad-creative': {
    ar: {
      title: 'أفكار الإعلانات',
      description: 'أفكار إبداعية لإعلاناتك مخصصة حسب النيش.',
      steps: ['تأكد من اختيار النيش الفرعي أولاً', 'استعرض أفكار الإعلانات المولدة', 'اختر الفكرة الأنسب وابدأ التنفيذ'],
      hasInputs: false,
    },
    en: {
      title: 'Ad Creative',
      description: 'Creative ad ideas tailored to your niche.',
      steps: ['Make sure you selected a sub-niche first', 'Browse generated ad ideas', 'Pick the best idea and start executing'],
      hasInputs: false,
    }
  },
  'campaign-launch': {
    ar: {
      title: 'إطلاق الحملة',
      description: 'الخطوة الأخيرة: اختر هدف الحملة وأطلق مشروعك للعالم.',
      steps: ['اختر هدف الحملة (Awareness, Traffic, Sales)', 'راجع تفاصيل الإعداد', 'اضغط زر PUBLISH للإطلاق'],
      hasInputs: false,
    },
    en: {
      title: 'Campaign Launch',
      description: 'Final step: choose campaign objective and launch your project.',
      steps: ['Choose campaign objective', 'Review setup details', 'Press PUBLISH to launch'],
      hasInputs: false,
    }
  },

  'smart-ai-assistant': {
    ar: {
      title: 'المساعد الذكي',
      description: 'مساعد AI متعدد المهام: إعلانات، محتوى، ردود مبيعات، وإيميلات بضغطة واحدة.',
      steps: ['اختر نوع المهمة', 'اختر النيش', 'اضغط "توليد"', 'انسخ النتيجة واستخدمها'],
      hasInputs: true, inputs: ['نوع المهمة', 'النيش'], outputs: ['محتوى مخصص جاهز للاستخدام'],
    },
    en: {
      title: 'AI Assistant',
      description: 'Multi-task AI assistant: ads, content, sales replies, and emails in one click.',
      steps: ['Choose task type', 'Select niche', 'Click "Generate"', 'Copy and use the result'],
      hasInputs: true, inputs: ['Task type', 'Niche'], outputs: ['Ready-to-use custom content'],
    }
  },
  'freelance-profile': {
    ar: {
      title: 'الملف المهني',
      description: 'حدد هويتك المهنية وولد بايو احترافي بالذكاء الاصطناعي.',
      steps: ['اختر مجال اهتمامك', 'حدد التخصص الدقيق', 'اختر المسمى الوظيفي', 'اضغط "توليد البايو"'],
      hasInputs: true, inputs: ['المجال', 'التخصص', 'المسمى'], outputs: ['بايو احترافي AR/EN'],
    },
    en: {
      title: 'Freelance Profile',
      description: 'Define your professional identity and generate a pro bio with AI.',
      steps: ['Choose your interest area', 'Pick a specific specialty', 'Select job title', 'Click "Generate Bio"'],
      hasInputs: true, inputs: ['Area', 'Specialty', 'Title'], outputs: ['Professional bio AR/EN'],
    }
  },
  'platform-radar': {
    ar: {
      title: 'رادار المنصات',
      description: 'كل منصات الفريلانس في العالم مصنفة حسب مستواك ومنطقتك.',
      steps: ['استعرض المنصات حسب التصنيف', 'اضغط على أي منصة لرؤية التفاصيل', 'سجل في المنصات المناسبة لك'],
      hasInputs: false,
    },
    en: {
      title: 'Platform Radar',
      description: 'All freelance platforms categorized by level and region.',
      steps: ['Browse platforms by category', 'Click any platform for details', 'Register on suitable platforms'],
      hasInputs: false,
    }
  },
  'freelance-pricing': {
    ar: {
      title: 'حاسبة التسعير',
      description: 'احسب سعرك الأدنى بناءً على هدفك المالي والوقت المتاح.',
      steps: ['أدخل هدف الدخل الشهري', 'حدد ساعات العمل المتاحة', 'اختر الدولة', 'راجع التسعير المقترح'],
      hasInputs: true, inputs: ['هدف الدخل', 'ساعات العمل', 'الدولة'], outputs: ['سعر الساعة', 'سعر المشروع', 'تحليل السوق'],
    },
    en: {
      title: 'Pricing Calculator',
      description: 'Calculate your minimum rate based on your financial goal and available time.',
      steps: ['Enter monthly income goal', 'Set available work hours', 'Choose country', 'Review suggested pricing'],
      hasInputs: true, inputs: ['Income goal', 'Work hours', 'Country'], outputs: ['Hourly rate', 'Project rate', 'Market analysis'],
    }
  },
  'skills-crafting': {
    ar: {
      title: 'صياغة المهارات',
      description: 'حول مهاراتك التقنية لعروض قيمة تبيع نفسها.',
      steps: ['اختر مجال مهاراتك', 'حدد المهارات المحددة', 'اضغط "توليد" لصياغة العروض', 'انسخ العروض لبروفايلك'],
      hasInputs: true, inputs: ['المجال', 'المهارات'], outputs: ['عروض قيمة مصاغة بأسلوب بيعي'],
    },
    en: {
      title: 'Skills Crafting',
      description: 'Turn your technical skills into value propositions that sell.',
      steps: ['Choose your skill area', 'Select specific skills', 'Click "Generate" for value props', 'Copy to your profile'],
      hasInputs: true, inputs: ['Area', 'Skills'], outputs: ['Sales-style value propositions'],
    }
  },
  'portfolio-builder': {
    ar: {
      title: 'معرض الأعمال',
      description: 'حول أي مشروع سابق لدراسة حالة احترافية.',
      steps: ['أدخل تفاصيل المشروع', 'اضغط "توليد دراسة الحالة"', 'انسخ النتيجة وأضفها لمعرض أعمالك'],
      hasInputs: true, inputs: ['اسم المشروع', 'الوصف', 'النتائج'], outputs: ['دراسة حالة كاملة'],
    },
    en: {
      title: 'Portfolio Builder',
      description: 'Turn any past project into a professional case study.',
      steps: ['Enter project details', 'Click "Generate Case Study"', 'Copy and add to your portfolio'],
      hasInputs: true, inputs: ['Project name', 'Description', 'Results'], outputs: ['Complete case study'],
    }
  },
  'proposal-sniper': {
    ar: {
      title: 'قناص العروض',
      description: 'الصق إعلان الوظيفة وسيحلله ويكتب عرضاً مخصصاً بصوتك.',
      steps: ['الصق نص إعلان الوظيفة', 'اضغط "تحليل وكتابة العرض"', 'راجع العرض المولد', 'انسخه وأرسله'],
      hasInputs: true, inputs: ['نص إعلان الوظيفة'], outputs: ['عرض مخصص جاهز للإرسال'],
    },
    en: {
      title: 'Proposal Sniper',
      description: 'Paste a job listing and get a custom proposal written in your voice.',
      steps: ['Paste the job listing text', 'Click "Analyze & Write"', 'Review the generated proposal', 'Copy and send'],
      hasInputs: true, inputs: ['Job listing text'], outputs: ['Custom proposal ready to send'],
    }
  },
  'interview-prep': {
    ar: {
      title: 'أسئلة المقابلات',
      description: 'أسئلة ذكية تضعك في موضع القيادة أثناء المكالمة مع العميل.',
      steps: ['اختر نوع العميل', 'اختر النيش', 'اضغط "توليد"', 'تدرب على الأسئلة قبل المكالمة'],
      hasInputs: true, inputs: ['نوع العميل', 'النيش'], outputs: ['أسئلة ذكية مع نصائح'],
    },
    en: {
      title: 'Interview Prep',
      description: 'Smart questions that put you in a leadership position during client calls.',
      steps: ['Choose client type', 'Select niche', 'Click "Generate"', 'Practice questions before the call'],
      hasInputs: true, inputs: ['Client type', 'Niche'], outputs: ['Smart questions with tips'],
    }
  },
  'sales-templates': {
    ar: {
      title: 'نماذج المبيعات',
      description: 'ردود جاهزة لكل موقف مع العملاء — انسخ وعدّل.',
      steps: ['اختر الموقف (اعتراض سعر، متابعة...)', 'اختر النبرة المناسبة', 'اضغط "توليد"', 'انسخ الرد واستخدمه'],
      hasInputs: true, inputs: ['نوع الموقف', 'النبرة'], outputs: ['رد جاهز مخصص'],
    },
    en: {
      title: 'Sales Templates',
      description: 'Ready replies for every client situation — copy and customize.',
      steps: ['Choose situation (price objection, follow-up...)', 'Select tone', 'Click "Generate"', 'Copy and use the reply'],
      hasInputs: true, inputs: ['Situation type', 'Tone'], outputs: ['Custom ready reply'],
    }
  },
};
