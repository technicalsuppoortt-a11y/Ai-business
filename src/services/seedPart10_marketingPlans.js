// seedPart10_marketingPlans.js — Advertising Plan Factory
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_marketing_plans';

const niches = [
  { id: 'ecom', name_en: 'General E-Commerce', name_ar: 'التجارة الإلكترونية' },
  { id: 'ecom_fashion', name_en: 'Fashion E-Commerce', name_ar: 'متجر أزياء وموضة' },
  { id: 'ecom_electronics', name_en: 'Electronics', name_ar: 'الإلكترونيات والتقنية' },
  { id: 'dropshipping', name_en: 'Dropshipping', name_ar: 'الدروبشيبينغ' },
  { id: 'agency', name_en: 'Marketing Agency', name_ar: 'وكالة تسويق' },
  { id: 'freelance', name_en: 'Freelance Services', name_ar: 'العمل الحر' },
  { id: 'consulting', name_en: 'Consulting & Coaching', name_ar: 'الاستشارات والتدريب' },
  { id: 'local', name_en: 'Local Business', name_ar: 'نشاط تجاري محلي' },
  { id: 'local_cafe', name_en: 'Cafe / Restaurant', name_ar: 'مقهى / مطعم' },
  { id: 'affiliate', name_en: 'Affiliate Marketing', name_ar: 'التسويق بالعمولة' },
];

const budgetTiers = [
  { id: 'starter', name_en: 'Starter (Under $300)', name_ar: 'مبتدئ (أقل من 300$)' },
  { id: 'growth', name_en: 'Growth ($300 - $1000)', name_ar: 'نمو (300$ - 1000$)' },
  { id: 'scale', name_en: 'Scale (Over $1000)', name_ar: 'توسع (أكثر من 1000$)' }
];

const goals = [
  { id: 'sales', name_en: 'Direct Sales', name_ar: 'مبيعات مباشرة' },
  { id: 'leads', name_en: 'Lead Generation', name_ar: 'جمع عملاء محتملين' },
  { id: 'awareness', name_en: 'Brand Awareness', name_ar: 'وعي بالعلامة التجارية' }
];

const clientLevels = [
  { id: 'beginner', name_en: 'Beginner', name_ar: 'مبتدئ' },
  { id: 'intermediate', name_en: 'Intermediate', name_ar: 'متوسط' },
  { id: 'professional', name_en: 'Professional', name_ar: 'محترف' }
];

const generateMarketingPlan = (niche, budget, goal, clientLevel) => {
  const planEn = `# 🗺️ Master Advertising & Marketing Plan

## 📌 Executive Overview
- **Niche/Industry**: ${niche.name_en}
- **Total Budget**: ${budget.name_en}
- **Campaign Duration**: 30 Days
- **Primary Goal**: ${goal.name_en} (${clientLevel.name_en} Level)

---

## 🎯 Target Audience & Angles
- **Demographics & Profile**: Target customers interested in ${niche.name_en}, seeking high quality, convenience, and value.
- **High-Priority Targeting Angles**:
  1. **Direct/Broad**: Leverage Meta & TikTok broad AI targeting to reach wide intent pools.
  2. **Interests & Behaviors**: Filter by active buyers, niche enthusiasts, and key competitor brand followers.
  3. **Lookalike/Retargeting**: 1-3% LAL of top purchasers and aggressive retargeting for 7-day cart abandoners.

---

## 📊 Budget Allocation Strategy
| Marketing Channel / Phase | Budget ($ / %) | Strategic Purpose | Key Expected Action |
| :--- | :--- | :--- | :--- |
| **Testing Phase (Paid Ads)** | $350 (70%) | Test creatives & find winners | Traffic & initial conversion |
| **Retargeting & Nurturing** | $100 (20%) | Recapture cart abandoners | High ROI conversions |
| **Content & Email / Organic** | $50 (10%) | Build authority & email list | Long-term retention |

---

## ⚡ Step-by-Step Execution Plan

### Phase 1: Foundation & Tracking Setup
- Verify Pixel & Server-Side CAPI tracking installation on checkout & landing pages.
- Setup Campaign Structure: 1 CBO Campaign > 2 Ad Sets (Broad vs Interests) > 3 Creatives each.

### Phase 2: Campaign Strategy & Channels
- **Paid Social Ads**: Meta/TikTok Ads focused on short-form video & high-converting carousel formats.
- **Email & Direct Nurturing**: Automated 3-day welcome & abandoned cart email sequences.
- **Content Marketing**: Produce 3 weekly organic value posts to boost social proof.

---

## 💡 Top-Performing Creative Concepts
1. **The "Us vs. Them" Comparison**
   - *Format*: Image/Video
   - *Concept*: Side-by-side comparison showing ${niche.name_en} solution vs frustrating traditional alternatives.
2. **The Educational Hook / Problem Solver**
   - *Format*: Video/Carousel
   - *Concept*: "Stop doing this mistake in ${niche.name_en}, do this instead."
3. **User-Generated Content (UGC) / Social Proof**
   - *Format*: Short Video
   - *Concept*: Authentic selfie-style customer review highlighting emotional transformation.
4. **The Direct Offer & Urgency**
   - *Format*: Carousel/Single Image
   - *Concept*: Unboxing showcase with an irresistible limited-time bonus offer.

---

## 📈 Critical KPIs & Performance Tracking
- **Primary Metric**: Target CPA < 30% of Sale Price / Target ROAS > 2.5x
- **Secondary Metrics**:
  - **Link CTR**: Target > 1.5%
  - **Add to Cart Rate**: Target > 8%
  - **Checkout Completion**: Target > 40%

---

## 🏁 Summary & Immediate Action Items
- Launch Pixel & CAPI tracking diagnostic test.
- Finalize 4 creative assets (1 Us vs Them, 1 UGC, 1 Educational, 1 Offer).
- Publish Campaign with $15-30/day initial testing budget.`;

  const planAr = `# 🗺️ خطة التسويق والإعلانات الشاملة

## 📌 النظرة العامة والتنفيذية
- **النيتش / القطاع**: ${niche.name_ar}
- **إجمالي الميزانية**: ${budget.name_ar}
- **مدة الحملة**: 30 يومًا
- **الهدف الرئيسي**: ${goal.name_ar} (مستوى ${clientLevel.name_ar})

---

## 🎯 الجمهور المستهدف وزوايا الإعلان
- **الخصائص الديموغرافية والملف الشخصي**: العملاء المهتمين بقطاع ${niche.name_ar}، والباحثين عن الجودة العالية والحلول السريعة.
- **زوايا الاستهداف عالية الأولوية**:
  1. **الاستهداف المفتوح (Broad)**: الاستفادة من خوارزميات Meta و TikTok للوصول لأكبر شرائح المهتمين.
  2. **الاهتمامات والسلوكيات**: استهداف المتابعين للمنافسين والمشترين المتفاعلين (Engaged Shoppers).
  3. **الجماهير المشابهة وإعادة الاستهداف**: جمهور مشابه (1-3% LAL) وإعادة استهداف شرسة للتاركين للسلة في آخر 7 أيام.

---

## 📊 استراتيجية توزيع الميزانية
| القناة / المرحلة التسويقية | الميزانية ($ / %) | الهدف الاستراتيجي | الإجراء المتوقع |
| :--- | :--- | :--- | :--- |
| **مرحلة الاختبار (إعلانات ممولة)** | 70% | اختبر الإعلانات واعثر على الإعلان الرابح | زيارات وتحويلات أولية |
| **إعادة الاستهداف والمتابعة** | 20% | استرجاع زوار التاركين للسلة | مبيعات بعائد مرتفع (High ROAS) |
| **المحتوى والإيميل / المطبوعات** | 10% | بناء السلطة والقائمة البريدية | ولاء والاحتفاظ بالعملاء |

---

## ⚡ خطة التنفيذ خطوة بخطوة

### Phase 1: التأسيس والتتبع
- تأكد من تركيب Meta/TikTok Pixel وتفعيل الـ CAPI للتتبع الدقيق.
- بناء هيكل الحملة: حملة CBO واحدة > مجموعتان إعلانيتان > 3 إعلانات رابحة في كل مجموعة.

### Phase 2: استراتيجية الحملات والقنوات
- **إعلانات السوشيال ميديا**: فيديوهات قصيرة (Reels/TikTok) + إعلانات Carousel تفاعلية.
- **التسويق بالإيميل والتواصل**: متتابعة إيميلات تلقائية للتاركين للسلة (اليوم 1 واليوم 3).
- **تسويق المحتوى**: نشر 3 بوستات قيمة أسبوعياً لبناء الثقة والمصداقية.

---

## 💡 أفضل المفاهيم الإعلانية أداءً
1. **إعلان المقارنة (نحن ضد الآخرين)**
   - *الشكل*: صورة أو فيديو
   - *الفكرة*: شاشة مقسومة تقارن بين حلك الذكي في ${niche.name_ar} والبدائل التقليدية المتعبة.
2. **الخطاف التعليمي / حل المشكلة**
   - *الشكل*: فيديو / Carousel
   - *الفكرة*: "توقف عن فعل هذا الخطأ الشائع، وافعل هذا بدلاً منه..."
3. **محتوى تجربة العميل (UGC) والرمز الاجتماعي**
   - *الشكل*: فيديو قصير
   - *الفكرة*: فيديو عفوي (سيلفي) لعميل يشرح النتيجة الإيجابية التي حصل عليها.
4. **العرض المباشر ودافع العجلة**
   - *الشكل*: Carousel / صورة ترويجية
   - *الفكرة*: استعراض سريع للمنتج مع عرض محدد بوقت وسعر واضح.

---

## 📈 مؤشرات الأداء الرئيسية والتحليل
- **المؤشر الرئيسي**: تكلفة الاستحواذ Target CPA أقل من 30% من سعر البيع / عائد ROAS > 2.5x
- **المؤشرات الثانوية**:
  - **نسبة النقر للرابط (Link CTR)**: هدفك > 1.5%
  - **نسبة الإضافة للسلة**: هدفك > 8%
  - **إكمال الدفع (Checkout)**: هدفك > 40%

---

## 🏁 الملخص والخطوات الفورية
- إجراء اختبار فحص لبيكسل التتبع والتأكد من صحة البيانات.
- تجهيز 4 إعلانات مختلفة (مقارنة، UGC، تعليمي، عرض مباشر).
- إطلاق الحملة الإعلانية بميزانية تجريبية من 15-30$ يومياً.`;

  return { plan_en: planEn, plan_ar: planAr };
};

export const seedMarketingPlansMatrix = async () => {
  console.log('🌱 Generating Marketing Plans Matrix Database (270 Scenarios)...');
  let count = 0;

  for (const niche of niches) {
    for (const budget of budgetTiers) {
      for (const goal of goals) {
        for (const level of clientLevels) {
          const docId = `${niche.id}_${budget.id}_${goal.id}_${level.id}`;
          const planData = generateMarketingPlan(niche, budget, goal, level);
          
          await setDoc(doc(db, COL, docId), {
            id: docId,
            niche: niche.id,
            budgetTier: budget.id,
            goal: goal.id,
            clientLevel: level.id,
            ...planData,
            createdAt: new Date().toISOString()
          });
          count++;
        }
      }
    }
  }

  console.log(`✅ Successfully seeded ${count} Marketing Plans to '${COL}'`);
  return count;
};
