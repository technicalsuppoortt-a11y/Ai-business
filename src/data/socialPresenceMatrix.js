export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label_ar: 'إنستجرام', label_en: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'tiktok', label_ar: 'تيك توك', label_en: 'TikTok', icon: '🎵', color: '#25F4EE' },
  { id: 'linkedin', label_ar: 'لينكد إن', label_en: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'twitter', label_ar: 'إكس (تويتر)', label_en: 'X (Twitter)', icon: '𝕏', color: '#000000' },
  { id: 'facebook', label_ar: 'فيسبوك', label_en: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'youtube', label_ar: 'يوتيوب', label_en: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'pinterest', label_ar: 'بينتريست', label_en: 'Pinterest', icon: '📌', color: '#E60023' },
  { id: 'snapchat', label_ar: 'سناب شات', label_en: 'Snapchat', icon: '👻', color: '#FFFC00' }
];

export const SOCIAL_GOALS = [
  { id: 'awareness', label_ar: 'بناء الوعي والانتشار', label_en: 'Brand Awareness & Reach', icon: '🌍' },
  { id: 'engagement', label_ar: 'بناء مجتمع متفاعل', label_en: 'Community & Engagement', icon: '💬' },
  { id: 'leads', label_ar: 'جمع بيانات العملاء (Leads)', label_en: 'Lead Generation', icon: 's🧲' },
  { id: 'sales', label_ar: 'مبيعات مباشرة', label_en: 'Direct Sales', icon: '💰' }
];

// Helper function to generate rich content based on platform, goal, and niche.
export const generateSocialStrategyText = (contentMap, platform, goal, niche, brandName, lang = 'ar') => {
  if (!contentMap) return lang === 'en' ? "Loading strategy..." : "جاري تحميل الاستراتيجية...";

  // Fallback to Instagram logic if platform or goal is somehow missing.
  const platformData = contentMap[platform] || contentMap['instagram'];
  if (!platformData) return lang === 'en' ? "Platform data not available." : "بيانات المنصة غير متوفرة.";
  
  const data = platformData[goal] || platformData['awareness'];
  if (!data) return lang === 'en' ? "Strategy not available." : "الاستراتيجية غير متوفرة.";

  // Replace placeholders
  const formatText = (text) => text ? text.replace(/{niche}/g, niche).replace(/{brandName}/g, brandName) : "";

  if (lang === 'en') {
    return `### 📱 Launch Plan for ${formatText(brandName)} on ${platform.toUpperCase()}

**Account Strategy**
${formatText(data.strategy_en || data.strategy)}

**Suggested Bio**
${formatText(data.bio_en || data.bio)}

**Pro Tips**
${(data.tips_en || data.tips || []).map(t => `- ${t}`).join('\n')}

**First 5 Post Ideas (Actionable)**
${(data.ideas_en || data.ideas || []).map((idea, index) => `${index + 1}. ${formatText(idea)}`).join('\n')}
`;
  }

  return `### 📱 خطة الانطلاق لـ ${formatText(brandName)} على ${platform.toUpperCase()}

**استراتيجية الحساب**
${formatText(data.strategy_ar || data.strategy)}

**البايو (Bio) المقترح**
${formatText(data.bio_ar || data.bio)}

**أهم النصائح (Tips)**
${(data.tips_ar || data.tips || []).map(t => `- ${t}`).join('\n')}

**أول 5 أفكار للبوستات (Actionable Ideas)**
${(data.ideas_ar || data.ideas || []).map((idea, index) => `${index + 1}. ${formatText(idea)}`).join('\n')}
`;
};

