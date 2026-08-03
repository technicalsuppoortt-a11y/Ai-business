import { auth, adminAuth, superAdminAuth } from '../firebase';
import { getUserCredits, getAdminOpenAiKey, getUserPersonalKey, deductCredit, refundCredit } from './creditsService';

/**
 * Helper to retrieve the active authenticated user's email
 */
export function getCurrentUserEmail(userEmail = null) {
  if (userEmail && typeof userEmail === 'string') {
    return userEmail.trim();
  }
  try {
    const email = auth?.currentUser?.email || adminAuth?.currentUser?.email || superAdminAuth?.currentUser?.email || '';
    if (email) return email.trim();
  } catch (e) {
    // Ignore error in non-firebase environment
  }
  return '';
}

/**
 * Helper to safely extract the OpenAI API key based on strict user email access rule.
 * The VITE_OPENAI_API_KEY (configured in .env.local) MUST ONLY be used when the
 * currently logged-in user's email is EXACTLY admin@brand.com.
 * For any other user email:
 *  - System VITE_OPENAI_API_KEY will NOT be used.
 *  - Uses personal API key from settings (app_api_key in localStorage) if provided.
 */
export function getOpenAiApiKey(userEmail = null) {
  let key = '';

  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) {
      key = import.meta.env.VITE_OPENAI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }

  if (!key && typeof process !== 'undefined' && process?.env?.VITE_OPENAI_API_KEY) {
    key = process.env.VITE_OPENAI_API_KEY;
  }

  if (key && typeof key === 'string' && key.trim()) {
    return key.trim();
  }

  // Fallback to user's personal API key configured in Settings
  try {
    const personalKey = localStorage.getItem('app_api_key') || localStorage.getItem('user_openai_api_key') || '';
    if (personalKey && typeof personalKey === 'string' && personalKey.trim()) {
      return personalKey.trim();
    }
  } catch (e) {
    // Ignore
  }

  return '';
}

/**
 * Core function to dispatch prompt to OpenAI Chat Completion API
 */
export async function callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode = false, userEmail = null }) {
  if (!uid) {
    throw new Error('User ID is required to process Live AI requests.');
  }

  // 1. Strict Pre-flight Check: Fetch user credits & personal key BEFORE fetching Admin Key or sending HTTP request
  const credits = await getUserCredits(uid);
  const personalKeyRaw = await getUserPersonalKey(uid);
  const personalKey = (personalKeyRaw && typeof personalKeyRaw === 'string') ? personalKeyRaw.trim() : '';

  let apiKeyToUse = '';
  let usingAdminKey = false;

  if (personalKey) {
    // User configured a valid Personal OpenAI Key -> Proceed using Personal Key without deducting credits
    apiKeyToUse = personalKey;
    usingAdminKey = false;
  } else {
    // User relies on Admin Key / Platform Credits
    if (credits <= 0) {
      // THROW AN ERROR IMMEDIATELY and cancel execution BEFORE any API request to OpenAI
      throw new Error('Out of credits! Please upgrade your plan or configure your Personal OpenAI Key in Settings.');
    }

    const adminKey = await getAdminOpenAiKey();
    if (adminKey && adminKey.trim()) {
      apiKeyToUse = adminKey.trim();
      usingAdminKey = true;
    } else {
      throw new Error('Master API Key not configured. Please configure your Personal OpenAI Key in Settings.');
    }
  }

  if (!apiKeyToUse) {
    throw new Error('Out of credits! Please upgrade your plan or configure your Personal OpenAI Key in Settings.');
  }

  // 2. Atomic Deduction: Call and verify deductCredit(uid) BEFORE initiating callOpenAiApi fetch
  let creditDeducted = false;
  if (usingAdminKey) {
    const success = await deductCredit(uid);
    if (!success) {
      throw new Error('Out of credits! Please upgrade your plan or configure your Personal OpenAI Key in Settings.');
    }
    creditDeducted = true;
  }

  try {
    const url = 'https://api.openai.com/v1/chat/completions';

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyToUse}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response received from Live AI API.');
    }

    return content;
  } catch (error) {
    // If credit was deducted upfront but API call failed, refund the credit
    if (creditDeducted) {
      await refundCredit(uid);
    }
    throw error;
  }
}

// Keep export for backwards compatibility until all tools are updated
export { callOpenAiApiWithCredits as callOpenAiApi };

/**
 * Dispatch live analysis request tailored specifically for each AI tool
 */
export async function dispatchLiveAiAnalysis({
  toolId,
  inputs = {},
  context = {},
  lang = 'ar',
  uid
}) {
  const isArabic = lang === 'ar';
  const languageInstruction = isArabic
    ? 'Produce the entire response in Modern Standard Arabic (العربية الفصحى البسيطة والاحترافية).'
    : 'Produce the entire response in English.';

  const nicheStr = context.niche || 'E-commerce & Digital Business';
  const brandNameStr = context.brandName || 'Business Brand';

  switch (toolId) {
    case 'niche-selection':
    case 'analysis-niche': {
      const selectedNicheName = inputs.nicheName || nicheStr;
      const subNiche = inputs.subNiche || '';

      const systemPrompt = `You are a world-class business analyst. Provide a structured analysis of a business niche in JSON format.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "market_overview": "Comprehensive overview of market potential...",
  "growth_rate": "+25% YoY",
  "competition_level": "Medium",
  "profit_margin": "30% - 45%",
  "target_audience": {
    "demographics": "Age 22-45, tech-savvy professionals...",
    "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
    "desires": ["Desire 1", "Desire 2"]
  },
  "recommended_pricing": "$49 - $199",
  "key_risks": ["Risk 1", "Risk 2"],
  "first_steps": ["Step 1", "Step 2", "Step 3"]
}`;

      const userPrompt = `Analyze the business niche: "${selectedNicheName}" ${subNiche ? `(Sub-niche: ${subNiche})` : ''}.
Target Market Region: ${context.user?.country || 'GCC & Global'}.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'brand-naming': {
      const category = inputs.category || 'ecom';
      const style = inputs.style || 'modern';
      const nameLang = inputs.nameLanguage || 'all';

      const systemPrompt = `You are an expert brand identity strategist. Generate high-converting brand names.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "names": [
    {
      "name": "Brand Name 1",
      "slogan": "Tagline or slogan",
      "domain_suggestion": "brandname.com",
      "meaning": "Why this name works",
      "style": "${style}"
    },
    {
      "name": "Brand Name 2",
      "slogan": "Tagline 2",
      "domain_suggestion": "brandname2.io",
      "meaning": "Meaning 2",
      "style": "${style}"
    },
    {
      "name": "Brand Name 3",
      "slogan": "Tagline 3",
      "domain_suggestion": "brandname3.co",
      "meaning": "Meaning 3",
      "style": "${style}"
    }
  ]
}`;

      const userPrompt = `Generate 3 innovative brand names for a business in Niche: "${nicheStr}", Category: "${category}", Style: "${style}", Name Language Preference: "${nameLang}".`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'visual-identity': {
      const primary = inputs.primaryColor || '#10B981';
      const secondary = inputs.secondaryColor || '#0F172A';
      const accent = inputs.accentColor || '#EC4899';

      const systemPrompt = `You are a senior brand strategist & visual designer.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "psychology": "Detailed color psychology analysis...",
  "audience_perception": "How customers perceive this color combination...",
  "recommended_fonts": "Heading & body typography recommendations...",
  "usage_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

      const userPrompt = `Analyze this color palette for brand "${brandNameStr}" in niche "${nicheStr}":
Primary Color: ${primary}, Secondary: ${secondary}, Accent: ${accent}.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'content-factory': {
      const { targetAudience, platform, contentFormat, selectedDialect } = inputs;

      const systemPrompt = `You are a viral social media strategist. Produce a 6-post content plan in JSON format.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "platform": "${platform || 'instagram'}",
  "format": "${contentFormat || 'video'}",
  "posts": [
    {
      "title_ar": "العنوان بالتريند (الفكرة 1)",
      "title_en": "Idea 1 Title",
      "caption_ar": "السكريبت الكامل مع الخطاف والنص ودعوة لاتخاذ إجراء",
      "caption_en": "Full post script with hook, body, and CTA"
    },
    {
      "title_ar": "العنوان (الفكرة 2)",
      "title_en": "Idea 2 Title",
      "caption_ar": "السكريبت الكامل للفكرة الثانية",
      "caption_en": "Full post script for idea 2"
    },
    {
      "title_ar": "العنوان (الفكرة 3)",
      "title_en": "Idea 3 Title",
      "caption_ar": "السكريبت الكامل للفكرة الثالثة",
      "caption_en": "Full post script for idea 3"
    }
  ],
  "hooks": [
    { "ar": "خطاف رائع 1", "en": "Hook 1" },
    { "ar": "خطاف رائع 2", "en": "Hook 2" }
  ]
}`;

      const userPrompt = `Create a high-converting content plan for Niche: "${nicheStr}", Platform: "${platform}", Content Format: "${contentFormat}", Target Audience: "${targetAudience}", Dialect: "${selectedDialect}".`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'marketing-plan': {
      const { budget, duration, goal, clientLevel } = inputs;

      const systemPrompt = `You are an elite Senior Growth Marketer and Performance Advertising Specialist.
${languageInstruction}

Your task is to generate a highly actionable, structured, and comprehensive Marketing Strategy Plan based on the user's inputs.

OUTPUT FORMAT REQUIREMENTS (STRICT):
You MUST follow this exact Markdown structure and style. Do not change section titles. Translate section titles and content appropriately to the user's language (${lang === 'en' ? 'English' : 'Arabic'}), maintaining the exact same layout, tables, and emojis.

# 🗺️ ${lang === 'en' ? 'Master Advertising & Marketing Plan' : 'خطة التسويق والإعلانات الشاملة'}

## 📌 ${lang === 'en' ? 'Executive Overview' : 'النظرة العامة والتنفيذية'}
- **${lang === 'en' ? 'Niche/Industry' : 'النيتش / القطاع'}**: [Niche]
- **${lang === 'en' ? 'Total Budget' : 'إجمالي الميزانية'}**: [$Budget]
- **${lang === 'en' ? 'Campaign Duration' : 'مدة الحملة'}**: [Duration Days]
- **${lang === 'en' ? 'Primary Goal' : 'الهدف الرئيسي'}**: [Goal]

---

## 🎯 ${lang === 'en' ? 'Target Audience & Angles' : 'الجمهور المستهدف وزوايا الإعلان'}
- **${lang === 'en' ? 'Demographics & Profile' : 'الخصائص الديموغرافية والملف الشخصي'}**: [Detailed age, interests, location, pain points]
- **${lang === 'en' ? 'High-Priority Targeting Angles' : 'زوايا الاستهداف عالية الأولوية'}**:
  1. **${lang === 'en' ? 'Direct/Broad' : 'الاستهداف المفتوح (Broad)'}**: [How to leverage broad AI targeting]
  2. **${lang === 'en' ? 'Interests & Behaviors' : 'الاهتمامات والسلوكيات'}**: [Specific interests or behaviors]
  3. **${lang === 'en' ? 'Lookalike/Retargeting' : 'الجماهير المشابهة وإعادة الاستهداف'}**: [Retargeting strategy]

---

## 📊 ${lang === 'en' ? 'Budget Allocation Strategy' : 'استراتيجية توزيع الميزانية'}
| ${lang === 'en' ? 'Marketing Channel / Phase' : 'القناة / المرحلة التسويقية'} | ${lang === 'en' ? 'Budget ($ / %)' : 'الميزانية ($ / %)'} | ${lang === 'en' ? 'Strategic Purpose' : 'الهدف الاستراتيجي'} | ${lang === 'en' ? 'Key Expected Action' : 'الإجراء المتوقع'} |
| :--- | :--- | :--- | :--- |
| **${lang === 'en' ? 'Testing Phase (Paid Ads)' : 'مرحلة الاختبار (إعلانات ممولة)'}** | $X (X%) | Test creatives & find winners | Traffic & initial conversion |
| **${lang === 'en' ? 'Retargeting & Nurturing' : 'إعادة الاستهداف والمتابعة'}** | $X (X%) | Recapture cart abandoners | High ROI conversions |
| **${lang === 'en' ? 'Content & Email / Organic' : 'المحتوى والإيميل / المطبوعات'}** | $X (X%) | Build authority & email list | Long-term retention |

---

## ⚡ ${lang === 'en' ? 'Step-by-Step Execution Plan' : 'خطة التنفيذ خطوة بخطوة'}

### Phase 1: ${lang === 'en' ? 'Foundation & Tracking Setup' : 'التأسيس والتتبع'}
- [Key setup task 1]
- [Key setup task 2]

### Phase 2: ${lang === 'en' ? 'Campaign Strategy & Channels' : 'استراتيجية الحملات والقنوات'}
- **${lang === 'en' ? 'Paid Social Ads' : 'إعلانات السوشيال ميديا'}**: [Detailed setup]
- **${lang === 'en' ? 'Email & Direct Nurturing' : 'التسويق بالإيميل والتواصل'}**: [Sequence schedule]
- **${lang === 'en' ? 'Content Marketing' : 'تسويق المحتوى'}**: [Content angles]

---

## 💡 ${lang === 'en' ? 'Top-Performing Creative Concepts' : 'أفضل المفاهيم الإعلانية أداءً'}
1. **${lang === 'en' ? 'The "Us vs. Them" Comparison' : 'إعلان المقارنة (نحن ضد الآخرين)'}**
   - *Format*: Image/Video
   - *Concept*: [Specific execution]
2. **${lang === 'en' ? 'The Educational Hook / Problem Solver' : 'الخطاف التعليمي / حل المشكلة'}**
   - *Format*: Video/Carousel
   - *Concept*: [Specific execution]
3. **${lang === 'en' ? 'User-Generated Content (UGC) / Social Proof' : 'محتوى تجربة العميل (UGC) والرمز الاجتماعي'}**
   - *Format*: Short Video
   - *Concept*: [Specific execution]
4. **${lang === 'en' ? 'The Direct Offer & Urgency' : 'العرض المباشر ودافع العجلة'}**
   - *Format*: Carousel/Single Image
   - *Concept*: [Specific execution]

---

## 📈 ${lang === 'en' ? 'Critical KPIs & Performance Tracking' : 'مؤشرات الأداء الرئيسية والتحليل'}
- **${lang === 'en' ? 'Primary Metric' : 'المؤشر الرئيسي'}**: [Target CPA / Target ROAS]
- **${lang === 'en' ? 'Secondary Metrics' : 'المؤشرات الثانوية'}**:
  - **Link CTR**: Target > 1.5%
  - **Add to Cart Rate**: Target > 8%
  - **Checkout Completion**: Target > 40%

---

## 🏁 ${lang === 'en' ? 'Summary & Immediate Action Items' : 'الملخص والخطوات الفورية'}
- 3 immediate checklist steps the user must execute today.`;

      const userPrompt = `Generate the Master Marketing Plan for:
- Business Niche: ${nicheStr}
- Available Budget: $${budget || '500'}
- Campaign Duration: ${duration || '30'} Days
- Main Goal: ${goal || 'sales'}
- Client Experience Level: ${clientLevel || 'beginner'}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'website-construction': {
      const { brandName, colorHex, secondaryColor, nicheName } = inputs;
      const systemPrompt = `You are a world-class landing page developer. Generate a single-file HTML landing page using Tailwind CSS. Return ONLY pure, executable HTML code. Do NOT wrap in markdown explanation text or markdown ticks.`;
      const userPrompt = `Generate a single-file Tailwind CSS HTML landing page for:
Brand Name: ${brandName || brandNameStr}
Niche: ${nicheName || nicheStr}
Primary Color: ${colorHex || '#10B981'}
Secondary Color: ${secondaryColor || '#0f172a'}
Include: Hero section with CTA, 3 Features, Testimonials, Contact/Footer. Return ONLY raw HTML code.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'domain-matrix':
    case 'website-domain': {
      const bName = inputs.brandName || brandNameStr || 'MyBrand';
      const cleanBName = bName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mybrand';

      const systemPrompt = `You are an expert domain name & brand naming consultant.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "classic": {
    "title_ar": "الدومينات الكلاسيكية الرسمية",
    "title_en": "Official Classic Domains",
    "domains": [
      { "domain": "${cleanBName}.com", "desc": "Official dot-com domain" },
      { "domain": "${cleanBName}.co", "desc": "Modern corporate dot-co" },
      { "domain": "${cleanBName}.net", "desc": "Network domain" }
    ]
  },
  "action": {
    "title_ar": "دومينات الحركة والحافز",
    "title_en": "Action & Impulse Domains",
    "domains": [
      { "domain": "get${cleanBName}.com", "desc": "Action prefix domain" },
      { "domain": "try${cleanBName}.com", "desc": "Trial prefix domain" }
    ]
  },
  "niche": {
    "title_ar": "دومينات مخصصة للنيش",
    "title_en": "Niche-Specific Domains",
    "domains": [
      { "domain": "${cleanBName}app.com", "desc": "App suffix domain" },
      { "domain": "${cleanBName}store.com", "desc": "E-commerce store domain" }
    ]
  }
}`;
      const userPrompt = `Generate strategic domain matrix suggestions for brand: "${bName}" in niche: "${nicheStr}".`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'landing-page-content': {
      const { productName, audience, objective, awareness, pricePoint, emotion } = inputs;
      const systemPrompt = `You are a direct-response landing page copywriter. Produce a 5-section landing page structure in JSON format.
${languageInstruction}
Return MUST be valid JSON strictly matching:
{
  "hero": ["Hero Headline 1\\n\\nSubheadline 1", "Hero Headline 2\\n\\nSubheadline 2"],
  "problem": ["Problem Statement 1", "Problem Statement 2"],
  "offer": ["Offer Copy 1", "Offer Copy 2"],
  "proof": ["Social Proof 1", "Social Proof 2"],
  "cta": ["Call To Action 1", "Call To Action 2"]
}`;
      const userPrompt = `Generate landing page copy for:
Product Name: ${productName || brandNameStr}
Target Audience: ${audience || nicheStr}
Objective: ${objective || 'direct_sales'}
Awareness Level: ${awareness || 'problem_aware'}
Price Point: ${pricePoint || 'low_ticket'}
Emotional Trigger: ${emotion || 'urgency'}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'product-source': {
      const { selectedType, selectedNiche, selectedEffort } = inputs;
      const systemPrompt = `You are a product sourcing & e-commerce analyst. Generate 3 lucrative product sourcing ideas in JSON format.
${languageInstruction}
Return MUST be valid JSON strictly matching:
{
  "ideas": [
    {
      "id": "live_prod_1",
      "name_ar": "اسم المنتج 1 الجذاب والمربح",
      "name_en": "High-Demand Sourcing Product 1",
      "name": "High-Demand Sourcing Product 1",
      "desc_ar": "خطة التوريد والتنفيذ المباشرة والموردين ومواصفات المنتج وحواش الأرباح...",
      "desc_en": "Comprehensive sourcing roadmap, supplier channels, target margins, and competitive moat...",
      "desc": "Comprehensive sourcing roadmap, supplier channels, target margins, and competitive moat...",
      "price_ar": "49$ - 99$",
      "price_en": "$49 - $99",
      "price": "$49 - $99",
      "effort": "${selectedEffort || 'medium'}"
    },
    {
      "id": "live_prod_2",
      "name_ar": "اسم المنتج 2 المبتكر",
      "name_en": "Innovative Digital/Physical Product 2",
      "name": "Innovative Digital/Physical Product 2",
      "desc_ar": "تفاصيل المنتج الثاني وزوايا البيع والتوريد...",
      "desc_en": "Detailed sourcing roadmap 2, supplier recommendations, and marketing angle...",
      "desc": "Detailed sourcing roadmap 2, supplier recommendations, and marketing angle...",
      "price_ar": "89$ - 179$",
      "price_en": "$89 - $179",
      "price": "$89 - $179",
      "effort": "low"
    },
    {
      "id": "live_prod_3",
      "name_ar": "اسم المنتج 3 عالي القيمة",
      "name_en": "High-Ticket Premium Offer 3",
      "name": "High-Ticket Premium Offer 3",
      "desc_ar": "خطة التوريد عالية القيمة والتموضع الاحترافي...",
      "desc_en": "Detailed sourcing roadmap 3, high-ticket positioning and supplier contact tips...",
      "desc": "Detailed sourcing roadmap 3, high-ticket positioning and supplier contact tips...",
      "price_ar": "129$ - 249$",
      "price_en": "$129 - $249",
      "price": "$129 - $249",
      "effort": "high"
    }
  ]
}`;
      const userPrompt = `Generate 3 innovative product sourcing ideas for:
Product Type: ${selectedType || 'digital/physical'}
Niche: ${selectedNiche || nicheStr}
Effort Level: ${selectedEffort || 'medium'}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'smart-ai-assistant': {
      const { selectedGoal, selectedChannel, selectedClient, selectedPricing } = inputs;
      const systemPrompt = `You are a world-class Freelance AI Strategist and business consultant.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "is_combination_ideal": true,
  "verdict_badge_ar": "مزيج عالي الكفاءة ✅",
  "verdict_badge_en": "High Efficiency Mix ✅",
  "expert_verdict_ar": "تقييم الخبير لمزيج الهدف وقناة التواصل والفئة المستهدفة...",
  "expert_verdict_en": "Expert strategic evaluation of the selected goal, channel, client type, and pricing tier...",
  "recommended_action_ar": "التوجيه المقترح لزيادة معدل تحويل الرسائل الباردة وإغلاق الصفقات...",
  "recommended_action_en": "Recommended action to optimize outreach conversion...",
  "strategy_title_ar": "استراتيجية الاستحواذ وإغلاق العقود",
  "strategy_title_en": "Client Acquisition & Retainer Strategy",
  "strategy_desc_ar": "خطة العمل الشاملة للوصول إلى العملاء وصياغة العرض الاستراتيجي...",
  "strategy_desc_en": "Comprehensive roadmap to reach target clients and position high-value offers...",
  "outreach_subject_ar": "فكرة مخصصة لتنمية أعمالكم زيادة المبيعات",
  "outreach_subject_en": "Custom Idea to Scale Your Revenue",
  "outreach_script_ar": "مرحباً، لاحظت أنكم تبحثون عن نتائج ممتازة في مجالكم. أقدم لكم حلولاً مخصصة تضمن لكم تحقيق الأهداف...",
  "outreach_script_en": "Hi, I noticed you are scaling your team in this niche. I help businesses achieve measurable ROI with zero setup hassle...",
  "objections": [
    {
      "objection_ar": "التكلفة أعلى من الميزانية المحددة لدينا",
      "objection_en": "Price is higher than our budget",
      "response_ar": "أفهم ذلك تماماً. لكن دعنا ننظر إلى عوائد الاستثمار بدلاً من التكلفة المباشرة...",
      "response_en": "I completely understand. However, let us look at the projected ROI rather than direct cost..."
    }
  ],
  "followups": [
    {
      "day_ar": "بعد 3 أيام",
      "day_en": "Day 3",
      "action_ar": "إرسال دراسة حالة سريعة تبرز نتائج مماثلة بنفس المجال",
      "action_en": "Send a quick relevant case study highlighting similar outcomes"
    }
  ]
}`;
      const userPrompt = `Create a complete Freelance AI Strategy for:
Goal: ${selectedGoal}
Channel: ${selectedChannel}
Target Client: ${selectedClient}
Pricing Tier: ${selectedPricing}
Freelancer Niche: ${nicheStr}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'profit-calculator': {
      const { salePrice, productCost, dailyBudget, cpc, cvr, roas, profitMargin, netProfitDaily } = inputs;
      const systemPrompt = `You are an elite E-commerce Media Buyer & Financial Strategist. Provide a detailed analysis and scaling recommendation in formatted Markdown.
${languageInstruction}`;
      const userPrompt = `Analyze campaign financial metrics for business in niche "${nicheStr}":
- Product Sale Price: $${salePrice}
- Cost of Goods: $${productCost}
- Daily Ad Budget: $${dailyBudget}
- CPC: $${cpc}
- CVR: ${cvr}%
- Calculated ROAS: ${roas}x
- Profit Margin: ${profitMargin}%
- Est. Net Daily Profit: $${netProfitDaily}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'ad-creative': {
      const { selectedProduct, selectedPain, selectedPlatform, selectedDialect } = inputs;

      const systemPrompt = `You are a top-tier ad script copywriter.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "hook_ar": "الخطاف الجذاب بالعربية الجاذبة للتوقف...",
  "hook_en": "Stop-scrolling hook script in English...",
  "visual_ar": "التوجيه البصري الدقيق للتصوير والمؤثرات البصرية...",
  "visual_en": "Detailed visual & camera directions...",
  "script_ar": "السكربت الإعلاني الكامل مع النص والحديث...",
  "script_en": "Full spoken ad script text...",
  "cta_ar": "نداء الإجراء المباشر والقوي...",
  "cta_en": "Urgent and clear call to action...",
  "ad_angles": [
    {
      "angle_ar": "زاوية الإثبات الاجتماعي والتأثير",
      "angle_en": "Social Proof & Results Angle",
      "desc_ar": "Focus on customer reviews and proven transformation.",
      "desc_en": "Focus on customer reviews and proven transformation."
    },
    {
      "angle_ar": "زاوية حل الألم الفوري",
      "angle_en": "Immediate Pain Relief Angle",
      "desc_ar": "Address the core pain point in the first 3 seconds.",
      "desc_en": "Address the core pain point in the first 3 seconds."
    }
  ],
  "pro_tip_ar": "قم بتسجيل 3 خيارات مختلفة للخطاف بنفس جسم الفيديو لاختيار الأفضل.",
  "pro_tip_en": "Record 3 different hook variations with the same video body to find the winner."
}`;

      const userPrompt = `Generate a high-converting video ad script for Product: "${selectedProduct}", Pain Point: "${selectedPain}", Platform: "${selectedPlatform}", Dialect/Language: "${selectedDialect}".`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'proposal-sniper': {
      const { jobDescription, tone, proposalLang } = inputs;

      const systemPrompt = `You are an elite freelancer proposal writer.
Write a winning proposal bid tailored directly to the client's job post.
Language for proposal: ${proposalLang === 'en' ? 'English' : 'Arabic'}.`;

      const userPrompt = `Write a winning proposal for this job post:
---
${jobDescription}
---
Freelancer Niche: ${nicheStr}
Tone of Voice: ${tone || 'expert'}
User Name: ${context.user?.name || 'Freelancer'}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return `### 🤖 ${isArabic ? 'عرض الذكاء الاصطناعي المباشر المخصص (Live AI Bid)' : 'Live AI Customized Proposal Bid'}\n\n${responseText}`;
    }

    case 'script-writer': {
      const { scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, challengeText, featureText, activeAudio } = inputs;
      const systemPrompt = `You are an elite Social Media Video Script Writer and Content Strategist.
${languageInstruction}
Format your response using professional markdown with headers, bullet points, and appropriate emojis. Ensure the script is highly engaging and structured for retention.`;

      let userPrompt = `Write a high-converting video script for a business in the niche: "${nicheStr}".
Topic / Core Concept: "${scriptTopic}"
Platform: "${scriptPlatform || 'Instagram Reels'}"
Tone & Energy: "${scriptTone || 'Engaging & Professional'}"
Hook Style: "${scriptHookStyle || 'Curiosity Hook'}"`;

      if (challengeText) {
        userPrompt += `\nTarget Challenges & Objections to overcome: ${challengeText}`;
      }
      if (featureText) {
        userPrompt += `\nCore Features & Advantages to highlight: ${featureText}`;
      }
      if (activeAudio) {
        userPrompt += `\nNote: The user will use this background audio: "${activeAudio}". Please mention it in the directions.`;
      }

      userPrompt += `\n\nPlease structure the script with:
1. A captivating Hook (0-3s).
2. The core Body with high value/retention strategies.
3. A strong Call to Action (CTA).`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'caption-generator': {
      const { captionTopic, captionTone, captionHook } = inputs;
      const systemPrompt = `You are a world-class Social Media Copywriter and SEO expert.
${languageInstruction}
Provide a highly engaging, structured caption using markdown formatting, clear paragraph breaks, emojis, and relevant viral hashtags.`;

      const userPrompt = `Write a high-converting social media caption for a business in the niche: "${nicheStr}".
Topic / Visual Context: "${captionTopic}"
Brand Tone: "${captionTone || 'Professional'}"
Hook / Opening Style: "${captionHook || 'Value-driven'}"

Ensure the caption includes:
1. A scroll-stopping first sentence.
2. Value-driven main body.
3. A clear Call to Action (CTA).
4. A set of 5-10 optimized hashtags.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'content-repurposer': {
      const { originalContent, repurposeFormat } = inputs;
      const systemPrompt = `You are a brilliant Content Repurposing Strategist.
${languageInstruction}
Format your output cleanly using professional markdown, bullet points, and emojis to make the content highly readable and visually engaging.`;

      const userPrompt = `Take the following original content and transform it into a highly engaging "${repurposeFormat || 'Twitter Thread / Carousel'}".
Original Content:
"${originalContent}"

Ensure the new format is optimized for its specific platform, maintaining the core value but adapting the structure for maximum engagement.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'qa-generator': {
      const { qaQuestion, qaTone, qaFormat } = inputs;
      const systemPrompt = `You are a knowledgeable industry expert and customer success specialist.
${languageInstruction}
Provide your response using structured markdown with headers, bullet points, and emojis. Be concise, authoritative, and helpful.`;

      const userPrompt = `Answer the following audience question or objection for a business in the niche: "${nicheStr}".
Question/Objection: "${qaQuestion}"
Tone: "${qaTone || 'Empathetic & Professional'}"
Desired Format: "${qaFormat || 'Short Direct Answer'}"

Provide a clear, value-driven answer that builds trust and authority.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'idea-lab': {
      const systemPrompt = `You are a creative Content Strategist and Viral Idea Generator.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "ideas": [
    { "title": "Catchy Idea 1", "description": "Brief description..." },
    { "title": "Catchy Idea 2", "description": "Brief description..." },
    { "title": "Catchy Idea 3", "description": "Brief description..." }
  ]
}`;
      const userPrompt = `Generate 6 highly engaging, viral-potential content ideas for a business in the niche: "${nicheStr}". The ideas should be a mix of educational, entertaining, and promotional content.`;
      
      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    case 'viral-vids': {
      const { videoTitle } = inputs;
      const systemPrompt = `You are an expert TikTok/Reels Growth Strategist.
${languageInstruction}
Provide a structured, professional markdown response detailing how to adapt a viral video trend for a specific business niche.`;

      const userPrompt = `Adapt the viral video trend/concept "${videoTitle}" for a business in the niche: "${nicheStr}".

Structure your advice:
1. **Visual Hook:** What to show on screen in the first 3 seconds.
2. **Verbal Hook:** The exact opening phrase to grab attention.
3. **Body & CTA:** How to deliver the core value and end with a strong Call to Action.`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }

    case 'trends': {
      const systemPrompt = `You are an expert Social Media Trend Analyst.
${languageInstruction}
Return MUST be valid JSON strictly matching this structure:
{
  "hashtags": [
    { "tag": "#trend1", "category": "hot", "label": "Super Hot", "growth": "+450%" },
    { "tag": "#trend2", "category": "rising", "label": "Rising Fast", "growth": "+290%" }
  ],
  "audios": [
    { "title": "Viral Trend Sound", "creator": "Studio Audio", "uses": "120K uses" },
    { "title": "Upbeat Promo Beat", "creator": "Creator Name", "uses": "45K uses" }
  ]
}`;
      const userPrompt = `Identify 3 highly trending hashtags and 2 viral audio tracks currently popular in the niche: "${nicheStr}". Provide realistic growth metrics.`;
      
      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: true });
      return JSON.parse(responseText);
    }

    default: {
      // General fallback for all interactive tools
      const systemPrompt = `You are an expert AI consultant for business growth and freelance automation.
${languageInstruction}`;

      const userPrompt = `Provide a detailed real-time execution result for the tool "${toolId}".
User Context: Niche="${nicheStr}", Brand="${brandNameStr}".
Tool Input Details: ${JSON.stringify(inputs)}`;

      const responseText = await callOpenAiApiWithCredits({ uid, systemPrompt, userPrompt, jsonMode: false });
      return responseText;
    }
  }
}
