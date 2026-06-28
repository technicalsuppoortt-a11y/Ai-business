/**
 * seedPart18_profitScenarios.js
 * ======================================================
 * Seeding data for the Profit Calculator Scenarios
 * Evaluates full funnel metrics (ROAS, Margin, CPC, CVR)
 * ======================================================
 */
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const PROFIT_SCENARIOS = {
  profitable_scale: {
    en: `### 🚀 Excellent Performance: Time to Scale!\n\n` +
        `**Diagnosis:**\n` +
        `Your funnel is highly profitable. With a ROAS of **{{roas}}x** and a Net Profit Margin of **{{margin}}%**, your unit economics are in the top 10% of businesses.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Scale the Budget:** Increase your daily ad budget by 20% every 3 days as long as ROAS stays above 2.0.\n` +
        `2. **Duplicate Winners:** Duplicate your winning ad sets or campaigns to reach new audiences.\n` +
        `3. **Do Not Touch:** Do not make major changes to your landing page; it is clearly converting well at {{cvr}}%.`,
    ar: `### 🚀 أداء ممتاز: حان وقت التوسع (Scale)!\n\n` +
        `**التشخيص:**\n` +
        `مسار المبيعات الخاص بك مربح للغاية. بعائد إعلانات (ROAS) يبلغ **{{roas}}x** وهامش ربح صافي **{{margin}}%**، أرقامك تعتبر في أعلى 10% من المشاريع الناجحة.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **رفع الميزانية:** قم بزيادة ميزانيتك الإعلانية اليومية بنسبة 20% كل 3 أيام طالما أن الـ ROAS فوق 2.0.\n` +
        `2. **استنساخ الناجح:** قم بعمل نسخ (Duplicate) للمجموعات الإعلانية الناجحة للوصول لجمهور جديد.\n` +
        `3. **لا تلمس صفحة الهبوط:** لا تقم بتعديلات جذرية على صفحة الهبوط، فهي تحول الزوار لمشترين بنسبة ممتازة {{cvr}}%.`
  },
  profitable_low_margin: {
    en: `### ⚠️ Good ROAS, But Low Margin\n\n` +
        `**Diagnosis:**\n` +
        `Your ads are bringing in sales cheaply (ROAS: **{{roas}}x**), but your Net Profit Margin is only **{{margin}}%**. You are doing a lot of work for a small piece of the pie.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Increase Pricing:** You can safely raise your sale price by 10-20%. Your CVR might drop slightly, but your Net Profit will jump.\n` +
        `2. **Order Bumps:** Add a small complementary product at checkout to instantly increase your Average Order Value (AOV).\n` +
        `3. **Reduce Costs:** Negotiate with your supplier to lower the \${{productCost}} base cost.`,
    ar: `### ⚠️ مبيعات جيدة، لكن هامش الربح ضعيف\n\n` +
        `**التشخيص:**\n` +
        `إعلاناتك تجلب مبيعات بتكلفة جيدة (ROAS: **{{roas}}x**)، لكن هامش ربحك الصافي فقط **{{margin}}%**. أنت تبذل جهداً كبيراً مقابل أرباح قليلة في النهاية.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **رفع السعر:** يمكنك رفع سعر البيع بأمان بنسبة 10-20%. قد يقل معدل التحويل قليلاً، لكن صافي الربح سيقفز.\n` +
        `2. **عروض إضافية (Order Bumps):** أضف منتجاً مكملاً صغيراً في صفحة الدفع لزيادة متوسط قيمة الطلب (AOV).\n` +
        `3. **تقليل التكاليف:** حاول التفاوض مع المورد لتقليل تكلفة المنتج الأساسية (\${{productCost}}).`
  },
  breakeven_high_cvr: {
    en: `### ⚖️ Breaking Even: Optimization Required\n\n` +
        `**Diagnosis:**\n` +
        `Your landing page converts well (**{{cvr}}%**), but your ROAS is hovering around **{{roas}}x**. You are barely breaking even after costs.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Bundle Offers:** Sell 2 or 3 items together at a slight discount. You pay for the click once, but sell more products.\n` +
        `2. **Retargeting:** Set up cheap retargeting ads. People who didn't buy the first time are much cheaper to convert.\n` +
        `3. **Email Follow-up:** Use email sequences to recover abandoned carts. These are free sales that boost your bottom line.`,
    ar: `### ⚖️ نقطة التعادل: تحتاج لتحسينات سريعة\n\n` +
        `**التشخيص:**\n` +
        `صفحة الهبوط الخاصة بك تحول الزوار بشكل جيد (**{{cvr}}%**)، لكن عائد الإعلانات يدور حول **{{roas}}x**. أنت بالكاد تغطي تكاليفك.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **عروض الحزم (Bundles):** بِع قطعتين أو ثلاثة معاً بخصم بسيط. أنت تدفع ثمن النقرة مرة واحدة، لكنك تبيع منتجات أكثر.\n` +
        `2. **إعادة الاستهداف:** قم بعمل إعلانات إعادة استهداف رخيصة. العملاء المترددين تكلفة إقناعهم أقل بكثير من العملاء الجدد.\n` +
        `3. **استرجاع السلات:** استخدم الإيميلات لاسترجاع السلات المتروكة. هذه مبيعات مجانية ترفع هامش ربحك فوراً.`
  },
  losing_low_cvr: {
    en: `### 🛑 Stop Ads: Landing Page Bottleneck\n\n` +
        `**Diagnosis:**\n` +
        `You are losing money. The primary bottleneck is your Conversion Rate (**{{cvr}}%**). Traffic is clicking your ads, but they abandon your website without buying.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Trust Factors:** Ensure your site has clear reviews, high-quality images, and a professional design.\n` +
        `2. **Speed:** Check your website loading speed on mobile devices.\n` +
        `3. **Offer Clarity:** Your offer might be confusing or too expensive. Make the primary benefit immediately obvious above the fold.`,
    ar: `### 🛑 أوقف الإعلانات فوراً: مشكلة في صفحة الهبوط\n\n` +
        `**التشخيص:**\n` +
        `أنت تخسر المال، والمشكلة الكبرى هي معدل التحويل (**{{cvr}}%**). الزوار يضغطون على الإعلان ويدخلون موقعك، لكنهم يخرجون دون شراء.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **عناصر الثقة:** تأكد من وجود تقييمات واضحة، صور عالية الجودة للمنتج، وتصميم احترافي يبعث على الثقة.\n` +
        `2. **السرعة:** اختبر سرعة تحميل موقعك على الجوال، البطء يقتل المبيعات.\n` +
        `3. **وضوح العرض:** قد يكون عرضك غير واضح. اجعل الفائدة الأساسية للمنتج واضحة جداً في أعلى الصفحة (Above the fold).`
  },
  losing_high_cpc: {
    en: `### 💸 Expensive Traffic: Ad Creative Issue\n\n` +
        `**Diagnosis:**\n` +
        `Your landing page converts fairly well (**{{cvr}}%**), but you are losing money because clicks are too expensive (CPC: **\${{cpc}}**).\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Test New Creatives:** Create 3 completely new ad videos/images with different hooks (First 3 seconds).\n` +
        `2. **Broaden Audience:** If your targeting is too narrow, platforms charge more per impression. Broaden your audience.\n` +
        `3. **Clickbait (Ethical):** Improve the curiosity in your ad copy to increase Click-Through Rate (CTR), which instantly lowers CPC.`,
    ar: `### 💸 زوار بتكلفة عالية: مشكلة في الإعلان نفسه\n\n` +
        `**التشخيص:**\n` +
        `موقعك يحول الزوار بشكل لا بأس به (**{{cvr}}%**)، لكنك تخسر المال لأن تكلفة النقرة عالية جداً ومكلفة (CPC: **\${{cpc}}**).\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **اختبر إعلانات جديدة:** قم بتصميم 3 فيديوهات/صور إعلانية مختلفة تماماً، وركز على "الخطفة" في أول 3 ثواني.\n` +
        `2. **توسيع الاستهداف:** إذا كان استهدافك ضيقاً جداً، فستكون التكلفة عالية. جرب توسيع شريحة الجمهور.\n` +
        `3. **رفع نسبة النقر (CTR):** استخدم نصوص إعلانية تثير الفضول بقوة لزيادة نسبة النقر، مما يؤدي تلقائياً لانخفاض سعر النقرة (CPC).`
  },
  losing_pricing_error: {
    en: `### ❌ Mathematical Failure: Pricing Error\n\n` +
        `**Diagnosis:**\n` +
        `Your Net Profit is mathematically doomed. Your Product Cost (\${{productCost}}) is too close to your Sale Price (\${{salePrice}}). You do not have enough margin to absorb the Cost Per Acquisition (CPA).\n\n` +
        `**Strategic Advice:**\n` +
        `1. **The 3X Rule:** In e-commerce, your sale price should ideally be 3x to 5x your product cost.\n` +
        `2. **Reposition the Brand:** Rebrand your product as a "Premium" item so you can charge double without changing the product itself.\n` +
        `3. **Source Cheaper:** Find a cheaper supplier immediately, or do not run paid ads for this specific product.`,
    ar: `### ❌ فشل رياضي: خطأ قاتل في التسعير\n\n` +
        `**التشخيص:**\n` +
        `من المستحيل رياضياً أن تربح من هذا المنتج. تكلفة منتجك (\${{productCost}}) قريبة جداً من سعر البيع (\${{salePrice}}). ليس لديك هامش ربح كافي لتغطية تكلفة الاستحواذ (CPA) للإعلانات.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **قاعدة الـ 3 أضعاف:** في التجارة الإلكترونية، يجب أن يكون سعر البيع من 3 إلى 5 أضعاف تكلفة المنتج الأساسية.\n` +
        `2. **إعادة التموضع (Repositioning):** قم بتسويق منتجك على أنه منتج "فاخر/بريميوم" لتتمكن من مضاعفة سعره دون تغيير المنتج نفسه.\n` +
        `3. **تغيير المورد:** ابحث فوراً عن مورد أرخص، أو لا تقم بتشغيل إعلانات مدفوعة لهذا المنتج بالذات.`
  },
  profitable_general: {
    en: `### 🟢 Healthy Business Operations\n\n` +
        `**Diagnosis:**\n` +
        `Your operations are in the green. With a positive Net Profit and an acceptable ROAS, your model works.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Optimize Slowly:** Make small tweaks to your landing page and ads to see if you can squeeze out another 2-5% in margin.\n` +
        `2. **Build an Email List:** Start collecting emails to reduce your reliance on paid ads over time.\n` +
        `3. **Consistent Growth:** Maintain your current budget and monitor your CPA closely.`,
    ar: `### 🟢 أداء صحي ومستقر\n\n` +
        `**التشخيص:**\n` +
        `عملياتك في النطاق الأخضر. مع صافي ربح إيجابي وعائد إعلانات مقبول، نموذج عملك ناجح.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **تحسين تدريجي:** قم بتعديلات بسيطة جداً على صفحة الهبوط لمحاولة زيادة هامش الربح 2-5% إضافية.\n` +
        `2. **بناء قائمة بريدية:** ابدأ في تجميع إيميلات العملاء لتقليل اعتمادك الكامل على الإعلانات المدفوعة بمرور الوقت.\n` +
        `3. **نمو مستمر:** حافظ على ميزانيتك الحالية وراقب تكلفة الاستحواذ (CPA) باستمرار لضمان استقرارها.`
  },
  losing_general: {
    en: `### 🔴 Systemic Underperformance\n\n` +
        `**Diagnosis:**\n` +
        `The current metrics result in a daily loss. The funnel is leaking money at multiple stages.\n\n` +
        `**Strategic Advice:**\n` +
        `1. **Back to Basics:** Pause your ads immediately.\n` +
        `2. **Re-evaluate:** Use the "Niche Selection" and "Pricing Strategy" tools to rethink your offer from the ground up.\n` +
        `3. **Learn:** Re-watch the basic media buying tutorials to understand funnel mechanics before spending more budget.`,
    ar: `### 🔴 أداء ضعيف عام في المسار\n\n` +
        `**التشخيص:**\n` +
        `المعطيات الحالية تؤدي إلى خسارة يومية. مسار المبيعات ينزف الأموال في عدة مراحل.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **العودة للأساسيات:** أوقف إعلاناتك فوراً لتجنب المزيد من الخسائر.\n` +
        `2. **إعادة التقييم:** استخدم أداة "اختيار النيش" وأداة "التسعير" لإعادة هيكلة عرضك التجاري من الصفر.\n` +
        `3. **التعلم:** راجع الشروحات الأساسية للميديا بايينج لتفهم ميكانيكية مسار المبيعات قبل إنفاق المزيد من الأموال.`
  }
};

export const seedProfitScenarios = async () => {
  console.log("Seeding Profit Scenarios...");
  
  for (const [docId, docData] of Object.entries(PROFIT_SCENARIOS)) {
    await setDoc(doc(db, 'tc_profit_scenarios', docId), docData);
  }

  console.log("Profit Scenarios seeded successfully!");
};
