import { db } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

const COL_CONTENT_PLANS = 'tc_content_plans';

// ─── NICHE DEFINITIONS ─────────────────────────────────
const NICHES = [
  'ecom', 'saas', 'life_coaching', 'fitness', 'restaurants', 
  'realestate_sales', 'online_courses', 'digital_marketing', 
  'personal_brand', 'personal_finance'
];

const FORMATS = ['video', 'carousel', 'text'];

// ─── NICHE SPECIFIC DETAILED CONTENT ─────────────────────────────────
export const NICHE_CONTENT = {
  ecom: {
    story: {
      ar_fusha: { title: "كيف حولنا منتجاً عادياً لأكثر مبيعاً في شهر", caption: "في البداية كنا نبيع كغيرنا، نفس المنتج ونفس الإعلانات، والنتيجة كانت خسارة في الميزانية!\n\nحتى غيرنا زاوية التسويق وركزنا على 'المشكلة التي يحلها المنتج' بدلاً من مواصفاته.\n\nالنتيجة؟ المبيعات تضاعفت 3 مرات في أقل من 30 يوماً. السر دائماً في العرض وليس فقط في المنتج. هل جربت تغيير زاوية إعلانك من قبل؟ 👇" },
      ar_egy: { title: "إزاي حولنا منتج عادي لأكثر مبيعاً في شهر", caption: "في الأول كنا بنبيع زي أي حد، نفس المنتج ونفس الإعلانات، والنتيجة كانت خسارة في الإعلانات!\n\nلحد ما غيرنا زاوية التسويق وركزنا على 'المشكلة اللي بيحلها المنتج' بدل مواصفاته.\n\nالنتيجة؟ المبيعات تضاعفت 3 مرات في أقل من 30 يوم. السر دايمًا في العرض مش بس في المنتج. جربت تغير زاوية إعلانك قبل كده؟ 👇" },
      ar_gulf: { title: "شلون حولنا منتج عادي لأكثر مبيعاً في شهر", caption: "بالبداية كنا نبيع مثل غيرنا، نفس المنتج ونفس الإعلانات، والنتيجة كانت خساير بالإعلانات!\n\nلين ما غيرنا زاوية التسويق وركزنا على 'المشكلة اللي يحلها المنتج' بدل مواصفاته.\n\nالنتيجة؟ المبيعات تضاعفت 3 مرات بأقل من 30 يوم. السر دايم بالعرض مو بس بالمنتج. جربت تغير زاوية إعلانك من قبل؟ 👇" },
      en: { title: "How we turned an average product into a bestseller in a month", caption: "At first, we were selling like everyone else. Same product, same ads. The result? Burning ad spend.\n\nUntil we shifted our marketing angle to focus on the 'problem it solves' rather than features.\n\nThe result? 3X sales in under 30 days. The secret is in the offer, not just the product. Have you tried changing your ad angle? 👇" }
    },
    bts: {
      ar_fusha: { title: "خطوات تغليف طلباتكم بكل حب", caption: "هل تساءلت يوماً كيف نجهز طلبك؟\n\n1️⃣ فحص جودة المنتج لضمان خلوه من أي عيوب.\n2️⃣ التغليف الآمن لحمايته أثناء الشحن.\n3️⃣ إضافة لمستنا الخاصة (رسالة شكر صغيرة تسعد يومك).\n\nنحن لا نبيع منتجات فقط، نحن نرسل لك تجربة. متى كانت آخر مرة وصلك فيها طلب وأسعدك تغليفه؟ 📦✨" },
      ar_egy: { title: "خطوات تغليف طلباتكم بكل حب", caption: "عمرك سألت نفسك إزاي بنجهز طلبك؟\n\n1️⃣ بنراجع جودة المنتج عشان نتأكد إنه مفيهوش عيوب.\n2️⃣ التغليف الآمن عشان نحميه وقت الشحن.\n3️⃣ بنضيف لمستنا (رسالة شكر صغيرة تفرحك).\n\nإحنا مش بنبيع منتجات بس، إحنا بنبعتلك تجربة. إمتى آخر مرة جالك أوردر وفرحت بتغليفه؟ 📦✨" },
      ar_gulf: { title: "خطوات تغليف طلباتكم بكل حب", caption: "عمرك تساءلت شلون نجهز طلبك؟\n\n1️⃣ نفحص جودة المنتج عشان نضمن إنه خالي من العيوب.\n2️⃣ التغليف الآمن عشان نحميه وقت الشحن.\n3️⃣ نضيف لمستنا الخاصة (رسالة شكر صغيرة تسعد يومك).\n\nإحنا ما نبيع منتجات بس، إحنا نرسل لك تجربة. متى آخر مرة وصلك طلب وأسعدك تغليفه؟ 📦✨" },
      en: { title: "How we pack your orders with love", caption: "Ever wondered how we prep your order?\n\n1️⃣ Quality check to ensure zero defects.\n2️⃣ Secure packaging for safe transit.\n3️⃣ Adding our special touch (a little thank you note to make your day).\n\nWe don't just sell products; we deliver an experience. When was the last time an unboxing made you smile? 📦✨" }
    },
    edu: {
      ar_fusha: { title: "3 أخطاء تدمر مبيعات متجرك الإلكتروني", caption: "هل تجلب زيارات ولكن بدون مبيعات؟ راجع هذه الأخطاء:\n\n1️⃣ صور منتجات ضعيفة: العميل يشتري بعينه أولاً.\n2️⃣ وصف منتج ممل: ركز على الفائدة بدلاً من المواصفات.\n3️⃣ خطوات دفع معقدة: كل نقرة إضافية تقلل نسبة الشراء 20%.\n\nأصلح هذه الأخطاء وراقب زيادة مبيعاتك. ما هي أكبر مشكلة تواجهك في متجرك؟ 🛒" },
      ar_egy: { title: "3 أخطاء بتدمر مبيعات متجرك الإلكتروني", caption: "بتجيب ترافيك بس مفيش مبيعات؟ راجع الـ 3 أخطاء دي:\n\n1️⃣ صور منتجات ضعيفة: العميل بيشتري بعينه أولاً.\n2️⃣ وصف منتج ممل: ركز على الفايدة مش بس المواصفات.\n3️⃣ خطوات دفع معقدة: كل كليك زيادة بتقلل نسبة الشراء 20%.\n\nصلح الأخطاء دي وراقب مبيعاتك بتزيد. إيه أكتر مشكلة بتواجهك في متجرك؟ 🛒" },
      ar_gulf: { title: "3 أخطاء تدمر مبيعات متجرك الإلكتروني", caption: "تجيب ترافيك بس ماكو مبيعات؟ راجع هذي الـ 3 أخطاء:\n\n1️⃣ صور منتجات ضعيفة: العميل يشتري بعينه أول.\n2️⃣ وصف منتج ممل: ركز على الفايدة مو بس المواصفات.\n3️⃣ خطوات دفع معقدة: كل كليك زيادة تنزل نسبة الشراء 20%.\n\nصلح هذي الأخطاء وشوف مبيعاتك تزيد. شنو أكبر مشكلة تواجهك بمتجرك؟ 🛒" },
      en: { title: "3 mistakes destroying your e-com sales", caption: "Getting traffic but no sales? Check these 3 mistakes:\n\n1️⃣ Poor product images: Customers buy with their eyes first.\n2️⃣ Boring descriptions: Focus on benefits, not just features.\n3️⃣ Complex checkout: Every extra click drops conversion by 20%.\n\nFix these and watch your sales grow. What's your biggest e-com struggle? 🛒" }
    },
    proof: {
      ar_fusha: { title: "كيف حل منتجنا مشكلة عميلنا في أسبوع", caption: "تخيل أنك تعاني من مشكلة مزعجة لفترة طويلة، وفجأة تجد الحل البسيط.\n\nهذا بالضبط ما حدث مع أحد عملائنا. كان يعاني من [اذكر المشكلة]، وبعد استخدام منتجنا لمدة أسبوع واحد، أرسل لنا رسالة شكر طويلة يشرح فيها كيف تغيرت حياته.\n\nلا تأخذ كلمتنا فقط، جرب بنفسك ولاحظ الفرق! 🌟" },
      ar_egy: { title: "إزاي منتجنا حل مشكلة عميل في أسبوع", caption: "تخيل إنك بتعاني من مشكلة مزعجة بقالك فترة، وفجأة تلاقي الحل البسيط.\n\nده بالظبط اللي حصل مع واحد من عملائنا. كان بيعاني من [المشكلة]، وبعد استخدام منتجنا أسبوع واحد بس، بعتلنا رسالة شكر طويلة يشرح فيها إزاي حياته اتغيرت.\n\nمتصدقش كلامنا، جرب بنفسك ولاحظ الفرق! 🌟" },
      ar_gulf: { title: "شلون منتجنا حل مشكلة عميلنا بأسبوع", caption: "تخيل إنك تعاني من مشكلة مزعجة لفترة طويلة، وفجأة تلاقي الحل البسيط.\n\nهذا بالظبط اللي صار مع واحد من عملائنا. كان يعاني من [المشكلة]، وبعد استخدام منتجنا لمدة أسبوع واحد، أرسل لنا رسالة شكر طويلة يشرح فيها شلون تغيرت حياته.\n\nلا تاخذ كلمتنا، جرب بنفسك وشوف الفرق! 🌟" },
      en: { title: "How our product solved a client's problem in a week", caption: "Imagine struggling with an annoying issue for a long time, and suddenly finding a simple fix.\n\nThat's exactly what happened with one of our clients. They struggled with [mention common problem], and after using our product for just a week, they sent a long thank-you note explaining how their daily life changed.\n\nDon't take our word for it, try it and see the difference! 🌟" }
    },
    myth: {
      ar_fusha: { title: "الخرافة الأكبر في عالم المتاجر الإلكترونية", caption: "الكثير يعتقدون أنك تحتاج لميزانية إعلانات ضخمة لتبدأ وتنجح.\n\nالحقيقة: المحتوى العضوي (الأورجانيك) القوي وبناء الثقة مع عملائك الأوائل أهم بكثير من حرق آلاف الدولارات في الإعلانات بدون أساس قوي.\n\nابدأ بذكاء، اختبر منتجك بميزانية بسيطة، وعندما ينجح.. كبّر الميزانية! متفقون؟ 💸" },
      ar_egy: { title: "الخرافة الأكبر في عالم المتاجر الإلكترونية", caption: "ناس كتير فاكرة إنك محتاج ميزانية إعلانات ضخمة عشان تبدأ وتنجح.\n\nالحقيقة: المحتوى الأورجانيك القوي وبناء ثقة مع عملائك الأوائل أهم بكتير من حرق آلاف الدولارات في الإعلانات من غير أساس قوي.\n\nابدأ ذكي، جرب منتجك بميزانية بسيطة، ولما ينجح.. كبّر الميزانية! متفقين؟ 💸" },
      ar_gulf: { title: "أكبر خرافة بعالم المتاجر الإلكترونية", caption: "وايد ناس يعتقدون إنك تحتاج ميزانية إعلانات ضخمة عشان تبدأ وتنجح.\n\nالحقيقة: المحتوى الأورجانيك القوي وبناء الثقة مع عملائك الأوائل أهم بوايد من حرق آلاف الدولارات بالإعلانات بدون أساس قوي.\n\nابدأ بذكاء، اختبر منتجك بميزانية بسيطة، ولما ينجح.. كبّر الميزانية! متفقين؟ 💸" },
      en: { title: "The biggest myth in E-commerce", caption: "Many believe you need a massive ad budget to start and succeed.\n\nThe truth: Strong organic content and building trust with early customers is far more important than burning thousands on ads with no solid foundation.\n\nStart smart, test with a small budget, and scale when it works! Agree? 💸" }
    },
    pitch: {
      ar_fusha: { title: "المنتج الذي سيغير روتينك بالكامل متوفر الآن", caption: "هل سئمت من الحلول المؤقتة؟\n\nصممنا هذا المنتج خصيصاً ليحل المشكلة من جذورها، بخامات عالية الجودة وسعر يناسبك.\n\nالكمية محدودة جداً بسبب الطلب العالي. اضغط على الرابط واطلبه الآن قبل نفاذ الكمية! 🚀" },
      ar_egy: { title: "المنتج اللي هيغير روتينك بالكامل متوفر دلوقتي", caption: "زهقت من الحلول المؤقتة؟\n\nصممنا المنتج ده مخصوص عشان يحل المشكلة من جذورها، بخامات عالية الجودة وسعر يناسبك.\n\nالكمية محدودة جداً بسبب الطلب العالي. دوس على الرابط واطلبه دلوقتي قبل ما يخلص! 🚀" },
      ar_gulf: { title: "المنتج اللي بيغير روتينك بالكامل متوفر الحين", caption: "مليت من الحلول المؤقتة؟\n\nصممنا هالمنتج خصيصاً عشان يحل المشكلة من جذورها، بخامات عالية الجودة وسعر يناسبك.\n\nالكمية محدودة حيل بسبب الطلب العالي. اضغط على الرابط واطلبه الحين قبل تخلص الكمية! 🚀" },
      en: { title: "The product that will change your routine is here", caption: "Tired of temporary fixes?\n\nWe designed this specifically to solve [mention problem] from the root, with high-quality materials at an affordable price.\n\nStock is highly limited due to demand. Click the link in bio and grab yours before it's gone! 🚀" }
    }
  },
  saas: {
    story: {
      ar_fusha: { title: "كيف بنينا ميزة غيرت طريقة عمل مستخدمينا", caption: "في البداية، لاحظنا أن معظم مستخدمينا يضيعون ساعات في أداء مهمة معينة يدوياً.\n\nقررنا أن نوقف كل شيء ونبني ميزة أتمتة تحل هذه الأزمة. النتيجة؟\n\nتوفير أكثر من 10 ساعات أسبوعياً لكل مستخدم. الاستماع لمشاكل العملاء هو أفضل بوصلة للتطوير. ما هي أكثر مهمة يدوية تكرهها؟ 👇" },
      ar_egy: { title: "إزاي عملنا ميزة غيرت طريقة شغل مستخدمينا", caption: "في الأول، لاحظنا إن معظم مستخدمينا بيضيعوا ساعات في مهمة معينة يدوي.\n\nقررنا نوقف كل حاجة ونعمل ميزة أتمتة (Automation) تحل الأزمة دي. النتيجة؟\n\nتوفير أكتر من 10 ساعات في الأسبوع لكل مستخدم. الاستماع للعميل هو أحسن بوصلة للتطوير. إيه أكتر حاجة بتكره تعملها مانيوال؟ 👇" },
      ar_gulf: { title: "شلون سوينا ميزة غيرت طريقة شغل مستخدمينا", caption: "بالبداية، لاحظنا إن أغلب مستخدمينا يضيعون ساعات عشان يسوون مهمة معينة يدوي.\n\nقررنا نوقف كل شي ونبني ميزة أتمتة تحل هالأزمة. النتيجة؟\n\nتوفير أكثر من 10 ساعات أسبوعياً لكل مستخدم. الاستماع لمشاكل العملاء هو أحسن بوصلة للتطوير. شنو أكثر مهمة تكره تسويها بيدك؟ 👇" },
      en: { title: "How we built a feature that changed our users' workflow", caption: "We noticed our users were wasting hours doing a specific task manually.\n\nWe dropped everything to build an automation feature to solve this. It took weeks of coding and late nights, but the result?\n\nSaving 10+ hours a week per user. Sometimes, listening to customer pain points is the best development compass. What manual task do you hate most? 👇" }
    },
    bts: {
      ar_fusha: { title: "يوم في حياة فريق التطوير (خلف الكواليس)", caption: "هكذا يبدو الأمر خلف الشاشات لضمان عمل النظام بدون توقف:\n\n👨‍💻 مراجعة الأكواد الصباحية.\n☕ الكثير من القهوة أثناء حل المشاكل.\n🚀 إطلاق ميزات جديدة بناءً على طلباتكم.\n\nهل تحبون رؤية كيف نبرمج المنصة؟ 💻" },
      ar_egy: { title: "يوم في حياة فريق التطوير (الكواليس)", caption: "ده اللي بيحصل ورا الشاشات عشان نضمن إن النظام شغال على طول:\n\n👨‍💻 مراجعة الأكواد الصبح.\n☕ قهوة كتير واحنا بنحل المشاكل.\n🚀 إطلاق ميزات جديدة عشانكم.\n\nتحبوا تشوفوا إزاي بنكتب الكود للمنصة؟ 💻" },
      ar_gulf: { title: "يوم بحياة فريق التطوير (الكواليس)", caption: "هذا اللي يصير ورا الشاشات عشان نضمن النظام شغال بدون توقف:\n\n👨‍💻 مراجعة الأكواد الصبح.\n☕ وايد قهوة وإحنا نحل المشاكل.\n🚀 إطلاق ميزات جديدة بناءً على طلبكم.\n\nتحبون تشوفون شلون نبرمج المنصة؟ 💻" },
      en: { title: "A day in the life of our dev team (BTS)", caption: "Here's what it looks like behind the screens to keep the system running 24/7:\n\n👨‍💻 Morning code reviews and security updates.\n☕ Lots of coffee while debugging complex issues.\n🚀 Deploying new features based on your requests.\n\nWe work backstage so you can run your business smoothly. Want to see how we code the platform? 💻" }
    },
    edu: {
      ar_fusha: { title: "3 أدوات تضيع وقتك لو استخدمتها بشكل منفصل", caption: "هل ما زلت تستخدم أداة للمهام، وأخرى للإيميلات، وثالثة للتقارير؟\n\nالتشتت بين التطبيقات يكلفك 20% من إنتاجيتك يومياً. الحل هو نظام متكامل يجمع بياناتك بمكان واحد.\n\nكم تطبيق تستخدم يومياً؟ ⚙️" },
      ar_egy: { title: "3 أدوات بتضيع وقتك لو استخدمتهم لوحدهم", caption: "لسه بتستخدم أداة للمهام، والتانية للإيميلات، والتالتة للتقارير؟\n\nالتشتت بين الأبلكيشنز بيكلفك 20% من إنتاجيتك كل يوم. الحل هو نظام متكامل يجمع كل حاجة في مكان واحد.\n\nبتستخدم كام أبلكيشن في اليوم؟ ⚙️" },
      ar_gulf: { title: "3 أدوات تضيع وقتك لو استخدمتها منفصلة", caption: "للحين تستخدم أداة للمهام، وثانية للإيميلات، وثالثة للتقارير؟\n\nالتشتت بين التطبيقات يكلفك 20% من إنتاجيتك اليومية. الحل هو نظام متكامل يجمع بياناتك بمكان واحد.\n\nكم تطبيق تستخدم باليوم؟ ⚙️" },
      en: { title: "3 tools wasting your time if used separately", caption: "Still using one tool for tasks, another for emails, and a third for reports?\n\nContext-switching costs you 20% of your daily productivity. The solution is an All-in-one system that centralizes your data for faster, better decisions.\n\nHow many apps do you use daily to run your business? ⚙️" }
    },
    proof: {
      ar_fusha: { title: "كيف وفرنا لشركة 40 ساعة عمل شهرياً", caption: "شركة كانت تعاني من الفوضى في بيانات العملاء عبر إكسيل.\n\nبعد منصتنا، تمت أتمتة 80% من العمل اليدوي، وزادت إنتاجية الفريق بشكل ملحوظ.\n\nالبرمجيات الجيدة تشتري لك وقتاً. مستعد للتجربة؟ 📈" },
      ar_egy: { title: "إزاي وفرنا لشركة 40 ساعة شغل في الشهر", caption: "شركة كانت بتعاني من اللخبطة في بيانات العملاء على الإكسيل.\n\nبعد ما استخدموا منصتنا، 80% من الشغل اليدوي بقى أوتوماتيك، والإنتاجية زادت جداً.\n\nالبرامج النضيفة بتشتريلك وقتك. جاهز للتجربة؟ 📈" },
      ar_gulf: { title: "شلون وفرنا لشركة 40 ساعة شغل بالشهر", caption: "شركة كانت تعاني من الفوضى ببيانات العملاء على الإكسيل.\n\nبعد ما حولوا لمنصتنا، 80% من الشغل اليدوي صار أوتوماتيك، والإنتاجية زادت حيل.\n\nالبرامج الزينة تشتري لك وقتك. جاهز للتجربة؟ 📈" },
      en: { title: "How we saved a company 40 hours a month", caption: "A company was struggling with messy client data, managing everything on complex Excel sheets.\n\nAfter switching to our platform, 80% of manual work was automated. The result? The team now focuses on sales instead of data entry, significantly boosting output.\n\nGood software doesn't cost money; it buys you time. Ready for the shift? 📈" }
    },
    myth: {
      ar_fusha: { title: "الخرافة: الأنظمة التقنية معقدة وتحتاج لتدريب", caption: "البعض يخاف من الانتقال لبرامج جديدة ظناً أنها تحتاج شهوراً للتعلم.\n\nالحقيقة: واجهة المستخدم الممتازة تصنع المعجزات ويمكن تعلمها في ساعات.\n\nما هو أكبر عائق يمنعك من تجربة أنظمة جديدة؟ 🚀" },
      ar_egy: { title: "الخرافة: الأنظمة التقنية معقدة وعايزة تدريب كتير", caption: "في ناس بتخاف تنقل لبرامج جديدة عشان فاكرين إنها هتاخد شهور للتعلم.\n\nالحقيقة: الواجهة السهلة (UI/UX) بتعمل معجزات وممكن تتعلمها في كام ساعة بس.\n\nإيه أكتر حاجة مخلياك خايف تجرب أنظمة جديدة؟ 🚀" },
      ar_gulf: { title: "الخرافة: الأنظمة التقنية معقدة وتحتاج تدريب", caption: "البعض يخاف ينقل لبرامج جديدة لأنه يعتقد إنها تاخذ شهور للتعلم.\n\nالحقيقة: واجهة المستخدم الممتازة تسوي معجزات وتقدر تتعلمها بساعات.\n\nشنو العائق اللي يمنعك من تجربة أنظمة جديدة؟ 🚀" },
      en: { title: "Myth: Tech systems are complex and require long training", caption: "Some fear switching to new software thinking it takes months to learn.\n\nThe truth: Great UI/UX works miracles. A smartly designed system can be learned in hours, saving you years of chaotic work.\n\nDon't let tech-phobia stop your growth. What's holding you back from trying new systems? 🚀" }
    },
    pitch: {
      ar_fusha: { title: "ابدأ نسختك التجريبية المجانية اليوم ووفر وقتك", caption: "منصتنا تمنحك كل ما تحتاجه لأتمتة مهامك وزيادة إنتاجيتك بنقرات بسيطة.\n\nلا تدفع شيئاً الآن. جربها مجاناً لمدة 14 يوماً. الرابط في البايو! 🔗" },
      ar_egy: { title: "ابدأ نسختك التجريبية المجانية النهاردة ووفر وقتك", caption: "منصتنا بتديك كل اللي هتحتاجه عشان تأتمت مهامك وتزود إنتاجيتك بكام كليك.\n\nماتدفعش حاجة دلوقتي. جربها ببلاش لمدة 14 يوم. الرابط في البايو! 🔗" },
      ar_gulf: { title: "ابدأ نسختك التجريبية المجانية اليوم ووفر وقتك", caption: "منصتنا تعطيك كل اللي تحتاجه عشان تأتمت مهامك وتزيد إنتاجيتك بضغطة زر.\n\nلا تدفع شي الحين. جربها مجاناً لمدة 14 يوم. الرابط بالبايو! 🔗" },
      en: { title: "Start your free trial today and save your time", caption: "Why keep doing it the hard way when the solution is right here?\n\nOur platform gives you everything you need to automate tasks, track clients, and boost productivity with a few clicks.\n\nPay nothing now. Try it free for 14 days and see the difference. Link in bio! 🔗" }
    }
  },
  life_coaching: {
    story: {
      ar_fusha: { title: "كيف تحولت للكوتش الذي أنا عليه اليوم", caption: "لم أكن دائماً أمتلك هذه الرؤية. في يوم من الأيام، كنت عالقاً في دوامة من التشتت.\n\nالتغيير بدأ بتغيير قناعة واحدة صغيرة في العقل. من هناك بدأت رحلتي.\n\nهل مررت بلحظة إدراك غيرت مسار حياتك؟ 💡" },
      ar_egy: { title: "إزاي اتحولت للكوتش اللي أنا عليه النهاردة", caption: "ماكنتش دايماً عندي الرؤية دي. زمان كنت محبوس في دوامة من التشتت.\n\nالتغيير بدأ لما غيرت قناعة واحدة صغيرة في تفكيري. ومن هنا بدأت رحلتي.\n\nعمرك مريت بلحظة 'إدراك' غيرت مسار حياتك؟ 💡" },
      ar_gulf: { title: "شلون صرت الكوتش اللي أنا عليه اليوم", caption: "ما كنت دايماً أملك هذي الرؤية. بيوم من الأيام، كنت عالق بدوامة من التشتت.\n\nالتغيير بدأ لما غيرت قناعة وحدة صغيرة بعقلي. ومن هناك بدأت رحلتي.\n\nمريت بلحظة استيعاب غيرت مسار حياتك؟ 💡" },
      en: { title: "How I went from overwhelmed to the coach I am today", caption: "I didn't always have this clarity. Once, I was stuck in the same loop many face... burnout, distraction, and feeling unfulfilled.\n\nThe turning point was realizing that change doesn't start with giant leaps, but by shifting one small mindset. That's where my journey began.\n\nHave you ever had an 'aha' moment that changed your life? Share below. 💡" }
    },
    bts: {
      ar_fusha: { title: "كيف أحضر لجلسة كوتشنج تغير حياة عميل؟", caption: "قبل أن ألتقي بأي عميل:\n1️⃣ أراجع ملاحظاتنا السابقة.\n2️⃣ أجهز أسئلة تفتح آفاقاً جديدة.\n3️⃣ أصفي ذهني لأكون حاضراً 100%.\n\nالتحضير النفسي هو سر الجلسة الناجحة. 🧘‍♂️" },
      ar_egy: { title: "إزاي بحضر لجلسة كوتشنج تغير حياة عميل؟", caption: "قبل ما أقابل أي عميل:\n1️⃣ براجع ملاحظاتنا القديمة.\n2️⃣ بجهز أسئلة تفتحله أفاق جديدة.\n3️⃣ بصفي ذهني عشان أكون حاضر معاه 100%.\n\nالتحضير النفسي هو سر الجلسة الناجحة. 🧘‍♂️" },
      ar_gulf: { title: "شلون أجهز لجلسة كوتشنج تغير حياة عميل؟", caption: "قبل ما ألتقي بأي عميل:\n1️⃣ أراجع ملاحظاتنا السابقة.\n2️⃣ أجهز أسئلة تفتح آفاق جديدة له.\n3️⃣ أصفي ذهني عشان أكون معاه 100%.\n\nالتحضير النفسي هو سر الجلسة الناجحة. 🧘‍♂️" },
      en: { title: "How I prep for a life-changing coaching session", caption: "A session isn't just a chat; it's a carefully built strategy.\n\nBefore meeting a client:\n1️⃣ I review our previous notes carefully.\n2️⃣ I prepare 'provocative' questions to open new mental horizons.\n3️⃣ I clear my mind completely to be 100% present.\n\nMental prep is the secret to a successful session. Have you ever tried life coaching? 🧘‍♂️" }
    },
    edu: {
      ar_fusha: { title: "3 علامات تدل أنك تعيش في 'منطقة الراحة'", caption: "منطقة الراحة دافئة، لكن لا شيء ينمو هناك!\n\n1️⃣ أيامك متشابهة ولا تتعلم شيئاً جديداً.\n2️⃣ ترفض الفرص بحجة لست مستعداً.\n3️⃣ تشعر بالغيرة بدلاً من الإلهام.\n\nحان وقت كسر الروتين. ما الخطوة التي تخافها؟ 🚀" },
      ar_egy: { title: "3 علامات بتقول إنك عايش في 'منطقة الراحة'", caption: "منطقة الراحة دافية، بس مفيش حاجة بتكبر هناك!\n\n1️⃣ أيامك كلها شبه بعض ومبتتعلمش حاجة جديدة.\n2️⃣ بترفض الفرص بحجة إنك مش جاهز.\n3️⃣ بتحس بالغيرة بدل ما تتلهم.\n\nجه الوقت عشان تكسر الروتين. إيه الخطوة اللي خايف تاخدها؟ 🚀" },
      ar_gulf: { title: "3 علامات تدل إنك عايش بـ 'منطقة الراحة'", caption: "منطقة الراحة دافية، بس ماكو شي ينمو هناك!\n\n1️⃣ أيامك كلها تتشابه وما تتعلم شي يديد.\n2️⃣ ترفض الفرص وتقول مو مستعد.\n3️⃣ تحس بالغيرة بدل ما تستلهم.\n\nصار الوقت تكسر الروتين. شنو الخطوة اللي خايف منها؟ 🚀" },
      en: { title: "3 signs you are stuck in the deadly 'Comfort Zone'", caption: "The comfort zone is warm, but nothing grows there! Watch for these signs:\n\n1️⃣ Every day looks the same, and you're learning nothing new.\n2️⃣ You reject opportunities claiming 'I'm not ready'.\n3️⃣ You feel jealous of others' success instead of inspired.\n\nIf you're here, it's time to break the routine. What step are you afraid to take? 🚀" }
    },
    proof: {
      ar_fusha: { title: "من الإحباط إلى تأسيس عمله الخاص في 3 أشهر", caption: "جاءني العميل وهو فاقد للشغف تماماً.\n\nعملنا على تفكيك مخاوفه، واليوم هو يدير مشروعه الخاص بشغف.\nالوضوح هو القوة. التوجيه الصحيح يختصر السنوات. 🎯" },
      ar_egy: { title: "من الإحباط لتأسيس شغله الخاص في 3 شهور", caption: "جالي عميل وكان فاقد الشغف تماماً.\n\nاشتغلنا على مخاوفه، والنهاردة هو بيدير مشروعه الخاص بشغف.\nالوضوح هو القوة. التوجيه الصح بيوفر عليك سنين. 🎯" },
      ar_gulf: { title: "من الإحباط لتأسيس عمله الخاص بـ 3 شهور", caption: "جاني العميل وهو فاقد الشغف تماماً.\n\nاشتغلنا على مخاوفه، واليوم هو يدير مشروعه الخاص بشغف.\nالوضوح هو القوة. التوجيه الصح يختصر لك سنين. 🎯" },
      en: { title: "From career burnout to founding a business in 3 months", caption: "Client (X) came to me completely burnt out at their job, but terrified to quit.\n\nOver 6 intense sessions, we dismantled their fears, uncovered their true strengths, and built a safe exit plan. Today? They run their own business with unprecedented passion.\n\nClarity is power. If you feel lost, remember that the right guidance saves years. 🎯" }
    },
    myth: {
      ar_fusha: { title: "الخرافة الأكبر: الكوتش يعطيك نصائح جاهزة", caption: "البعض يعتقد أن وظيفتي هي إخبارك بما يجب فعله.\n\nالحقيقة أن الكوتش ينير لك الطريق لتكتشف الحل بنفسك.\nأنا هنا لأسألك الأسئلة التي تتهرب منها. جاهز للمواجهة؟ 🧠" },
      ar_egy: { title: "الخرافة الأكبر: الكوتش بيديك نصايح جاهزة", caption: "في ناس فاكرة إن وظيفتي أقولك تعمل إيه.\n\nالحقيقة إن الكوتش بينورلك الطريق عشان تكتشف الحل بنفسك.\nأنا هنا عشان أسألك الأسئلة اللي بتهرب منها. جاهز للمواجهة؟ 🧠" },
      ar_gulf: { title: "أكبر خرافة: الكوتش يعطيك نصايح جاهزة", caption: "البعض يعتقد إن وظيفتي أقول لك شنو تسوي.\n\nالحقيقة إن الكوتش ينور لك الدرب عشان تكتشف الحل بنفسك.\nأنا هني عشان أسألك الأسئلة اللي تتهرب منها. جاهز للمواجهة؟ 🧠" },
      en: { title: "The biggest myth: 'A coach gives you ready-made advice'", caption: "Many believe a coach's job is to tell you what to do.\n\nThe truth is the exact opposite! A pro coach doesn't hand you fish; they light the way with deep questions so you discover the solution yourself. Solutions from within are the only ones that last.\n\nI'm here to ask you the questions you've been avoiding. Ready to face them? 🧠" }
    },
    pitch: {
      ar_fusha: { title: "هل أنت مستعد لنقل حياتك للمستوى التالي؟", caption: "الانتظار لن يغير شيئاً.\n\nاحجز جلستك الاستكشافية المجانية معي الآن لبناء خطة عمل حقيقية.\nالمقاعد محدودة. الرابط في البايو! ✨" },
      ar_egy: { title: "جاهز تنقل حياتك للمستوى اللي بعده؟", caption: "الانتظار مش هيغير حاجة.\n\nاحجز جلستك الاستكشافية المجانية معايا دلوقتي عشان نبني خطة عمل بجد.\nالأماكن محدودة. الرابط في البايو! ✨" },
      ar_gulf: { title: "مستعد تنقل حياتك للمستوى الياي؟", caption: "الانتظار ما راح يغير شي.\n\nاحجز جلستك الاستكشافية المجانية معاي الحين عشان نبني خطة عمل صجية.\nالمقاعد محدودة. الرابط بالبايو! ✨" },
      en: { title: "Are you ready to take your life to the next level?", caption: "Waiting changes nothing. Years pass, and postponed goals drift further away.\n\nIf you're ready to break mental barriers and build a real action plan for your life or career, book your free discovery call with me now.\n\nSlots are strictly limited this month. Link in bio to apply! ✨" }
    }
  },
  fitness: {
    story: {
      ar_fusha: { title: "كيف خسرت 20 كيلو بدون حرمان", caption: "في البداية كنت أظن أن الدايت يعني الجوع المستمر.\n\nبعد تجارب فاشلة، أدركت أن السر في 'المرونة' وحساب السعرات، وليس الحرمان التام.\nالآن أساعد عملائي على الوصول لنفس النتيجة بدون تعقيد. ما هو أصعب جزء في الدايت بالنسبة لك؟ 👇" },
      ar_egy: { title: "إزاي خسيت 20 كيلو من غير حرمان", caption: "في الأول كنت فاكر إن الدايت يعني الجوع على طول.\n\nبعد تجارب كتير فاشلة، اكتشفت إن السر في 'المرونة' وحساب السعرات، مش الحرمان التام.\nدلوقتي بساعد عملائي يوصلوا لنفس النتيجة من غير تعقيد. إيه أصعب حاجة في الدايت بالنسبالك؟ 👇" },
      ar_gulf: { title: "شلون نزلت 20 كيلو بدون حرمان", caption: "بالبداية كنت أظن إن الدايت يعني الجوع المستمر.\n\nبعد تجارب فاشلة، اكتشفت إن السر بـ 'المرونة' وحساب السعرات، مو الحرمان التام.\nالحين أساعد عملائي يوصلون لنفس النتيجة بدون تعقيد. شنو أصعب شي بالدايت لك؟ 👇" },
      en: { title: "How I lost 20kg without starving", caption: "I used to think dieting meant constant hunger.\n\nAfter many failed attempts, I realized the secret is 'flexibility' and macro tracking, not total restriction.\nNow I help my clients achieve the same without the headache. What's your biggest diet struggle? 👇" }
    },
    bts: {
      ar_fusha: { title: "تجهيز وجبات الأسبوع في ساعة واحدة", caption: "الالتزام يبدأ من التحضير المسبق!\n\nهكذا أجهز وجباتي الصحية للأسبوع كله لضمان عدم اللجوء للوجبات السريعة في أوقات الانشغال.\nهل تفضل تحضير وجباتك مسبقاً أم طهيها يومياً؟ 🥗" },
      ar_egy: { title: "تجهيز وجبات الأسبوع في ساعة واحدة", caption: "الالتزام بيبدأ من التحضير المسبق!\n\nكده بجهز وجباتي الصحية للأسبوع كله عشان مضطرش أكل فاست فود وقت الزحمة.\nبتحب تجهز وجباتك مسبقاً ولا تطبخ كل يوم؟ 🥗" },
      ar_gulf: { title: "تجهيز وجبات الأسبوع بساعة وحدة", caption: "الالتزام يبدأ من التحضير المسبق!\n\nهذا ترتيبي لوجباتي الصحية للأسبوع كله عشان ما ألجأ للفاست فود وقت الزحمة.\nتفضل تجهز وجباتك مسبقاً ولا تطبخ كل يوم؟ 🥗" },
      en: { title: "Meal prepping for the week in 1 hour", caption: "Consistency starts with preparation!\n\nHere is how I prep my healthy meals for the entire week to avoid fast food when I get busy.\nDo you meal prep or cook daily? 🥗" }
    },
    edu: {
      ar_fusha: { title: "3 أخطاء تمنعك من بناء العضلات", caption: "تتدرب بقوة ولكن لا ترى نتائج؟\n1️⃣ لا تتناول كمية كافية من البروتين.\n2️⃣ لا تنام لساعات تكفي للاستشفاء.\n3️⃣ تغير جدول تمرينك باستمرار.\nركز على الأساسيات وسترى الفرق! 💪" },
      ar_egy: { title: "3 أخطاء بتمنعك تبني عضلات", caption: "بتتريق بقوة بس مفيش نتيجة؟\n1️⃣ مابتاكلش بروتين كفاية.\n2️⃣ مابتنامش وقت كفاية للاستشفاء.\n3️⃣ بتغير جدول تمرينك كل شوية.\nركز على الأساسيات وهتشوف الفرق! 💪" },
      ar_gulf: { title: "3 أخطاء تمنعك من بناء العضلات", caption: "تتمرن بقوة بس ما تشوف نتايج؟\n1️⃣ ما تاكل بروتين كفاية.\n2️⃣ ما تنام ساعات تكفي للاستشفاء.\n3️⃣ تغير جدول تمرينك كل شوي.\nركز على الأساسيات وراح تشوف الفرق! 💪" },
      en: { title: "3 mistakes killing your muscle gains", caption: "Training hard but seeing no results?\n1️⃣ Not eating enough protein.\n2️⃣ Not sleeping enough for recovery.\n3️⃣ Changing your workout routine too often.\nFocus on the basics and watch your body change! 💪" }
    },
    proof: {
      ar_fusha: { title: "تحول مذهل لعميلي في 3 أشهر فقط", caption: "التزم بالخطة، طبق التمارين بانتظام، والنتيجة كانت خسارة 15 كيلو من الدهون الصافية!\n\nالالتزام هو ما يصنع الفارق. مستعد لتكون قصة النجاح القادمة؟ 🌟" },
      ar_egy: { title: "تحول مذهل لعميلي في 3 شهور بس", caption: "التزم بالخطة، عمل التمارين بانتظام، والنتيجة كانت خسارة 15 كيلو دهون صافي!\n\nالالتزام هو اللي بيعمل الفرق. مستعد تكون قصة النجاح الجاية؟ 🌟" },
      ar_gulf: { title: "تحول مذهل لعميلي بـ 3 شهور بس", caption: "التزم بالخطة، وطبق التمارين بانتظام، والنتيجة خسارة 15 كيلو دهون صافي!\n\nالالتزام هو اللي يصنع الفرق. مستعد تكون قصة النجاح الياية؟ 🌟" },
      en: { title: "Amazing 3-month transformation", caption: "They stuck to the plan, followed the workouts, and lost 15kg of pure fat!\n\nConsistency is the ultimate game changer. Ready to be our next success story? 🌟" }
    },
    myth: {
      ar_fusha: { title: "الكاربوهيدرات لا تجعلك سميناً!", caption: "أكبر خرافة في عالم الدايت هي قطع النشويات تماماً.\n\nزيادة الوزن تحدث بسبب فائض السعرات الحرارية، وليس بسبب الكاربوهيدرات.\nيمكنك أكل الأرز والبطاطس وتخسر الوزن! ما هي خرافة الدايت التي صدقتها طويلاً؟ 🍚" },
      ar_egy: { title: "الكارب مش بيتخن!", caption: "أكبر خرافة في الدايت إنك تقطع نشويات خالص.\n\nزيادة الوزن بتحصل بسبب السعرات الحرارية الزايدة، مش بسبب الكاربوهيدرات.\nتقدر تاكل رز وبطاطس وتخس عادي! إيه خرافة الدايت اللي صدقتها زمان؟ 🍚" },
      ar_gulf: { title: "الكارب ما يمتنك!", caption: "أكبر خرافة بالدايت إنك تقطع نشويات بالمرة.\n\nزيادة الوزن تصير بسبب السعرات الزايدة، مو بسبب الكاربوهيدرات.\nتقدر تاكل عيش وبطاط وتضعف عادي! شنو خرافة الدايت اللي كنت مصدقها؟ 🍚" },
      en: { title: "Carbs don't make you fat!", caption: "The biggest diet myth is cutting out carbs completely.\n\nWeight gain happens from a calorie surplus, not from eating carbohydrates.\nYou can eat rice and potatoes and still lose weight! What diet myth did you believe for too long? 🍚" }
    },
    pitch: {
      ar_fusha: { title: "هل أنت مستعد لتغيير شكل جسمك؟", caption: "لا تضيع المزيد من الوقت في التخبط.\n\nاشترك الآن في برنامج التدريب الشخصي واحصل على خطة تغذية وتمرين مخصصة لك بالكامل.\nالأماكن محدودة، تواصل معي الآن! 🚀" },
      ar_egy: { title: "جاهز تغير شكل جسمك؟", caption: "مضيعش وقت أكتر من كده في التخبط.\n\nاشترك دلوقتي في برنامج التدريب الشخصي واستلم خطة تغذية وتمرين معمولة مخصوص عشانك.\nالأماكن محدودة، ابعتلي رسالة دلوقتي! 🚀" },
      ar_gulf: { title: "مستعد تغير شكل جسمك؟", caption: "لا تضيع وقت أكثر بالتخبط.\n\nاشترك الحين ببرنامج التدريب الشخصي واستلم خطة تغذية وتمرين مخصصة لك بالكامل.\nالأماكن محدودة، تواصل معاي الحين! 🚀" },
      en: { title: "Ready to transform your physique?", caption: "Stop wasting time guessing your workouts.\n\nJoin my online coaching program and get a fully customized meal and workout plan designed for your goals.\nSpots are limited, DM me to start! 🚀" }
    }
  },
  restaurants: {
    story: {
      ar_fusha: { title: "كيف بدأنا بوصفة عائلية سرية", caption: "بدايتنا لم تكن بمطعم كبير، بل من مطبخ صغير ووصفة توارثناها لأجيال.\n\nهدفنا كان تقديم طعم يعيدك لذكريات الطفولة.\nما هو طبقك المفضل لدينا؟ 🍲" },
      ar_egy: { title: "إزاي بدأنا بوصفة عيلة سرية", caption: "بدايتنا مكانتش بمطعم كبير، دي كانت من مطبخ صغير ووصفة متوارثة من أجيال.\n\nهدفنا كان نقدم طعم يرجعك لذكريات زمان.\nإيه أكتر طبق بتحبه عندنا؟ 🍲" },
      ar_gulf: { title: "شلون بدينا بوصفة عائلية سرية", caption: "بدايتنا ما كانت بمطعم كبير، كانت من مطبخ صغير ووصفة توارثناها لأجيال.\n\nهدفنا كان نقدم طعم يرجعك لذكريات الطفولة.\nشنو طبقك المفضل عندنا؟ 🍲" },
      en: { title: "How we started with a secret family recipe", caption: "We didn't start in a big fancy restaurant. It all began in a small kitchen with a recipe passed down for generations.\n\nOur goal was to serve a taste that brings back childhood memories.\nWhat's your favorite dish here? 🍲" }
    },
    bts: {
      ar_fusha: { title: "خلف الكواليس: كيف نحضر الطبق المميز", caption: "السر دائمًا في المكونات الطازجة والتفاصيل الدقيقة.\n\nنأخذكم في جولة سريعة داخل مطبخنا لتروا الشغف في كل خطوة.\nهل تحبون رائحة الطعام الطازج؟ 🔥" },
      ar_egy: { title: "خلف الكواليس: إزاي بنحضر طبقنا المميز", caption: "السر دايماً في المكونات الفريش والتفاصيل الدقيقة.\n\nتعالوا جولة سريعة جوه مطبخنا عشان تشوفوا الشغف في كل خطوة.\nبتحبوا ريحة الأكل وهو لسه سخن؟ 🔥" },
      ar_gulf: { title: "الكواليس: شلون نجهز طبقنا المميز", caption: "السر دايماً بالمكونات الفريش والتفاصيل الدقيقة.\n\nناخذكم جولة سريعة داخل مطبخنا عشان تشوفون الشغف بكل خطوة.\nتحبون ريحة الأكل الطازج؟ 🔥" },
      en: { title: "BTS: How we prep our signature dish", caption: "The secret is always in the fresh ingredients and careful attention to detail.\n\nTaking you on a quick tour inside our kitchen to see the passion in every step.\nWho else loves the smell of fresh food? 🔥" }
    },
    edu: {
      ar_fusha: { title: "كيف تختار قطعة اللحم المثالية للشواء؟", caption: "لشواء مثالي، يجب الانتباه لتوزيع الدهون (الرخامية) وسُمك القطعة.\n\nنحن في مطعمنا نختار أفضل القطع خصيصاً لكم لضمان طعم لا يُنسى.\nكيف تفضل تسوية اللحم؟ 🥩" },
      ar_egy: { title: "إزاي تختار حتة اللحمة الصح للشوي؟", caption: "عشان الشوي يطلع مظبوط، لازم تركز على توزيع الدهون وتخانة القطعة.\n\nإحنا في مطعمنا بننقي أحسن القطع مخصوص عشان نضمنلك طعم ميتنسيش.\nبتحب اللحمة تسويتها إيه؟ 🥩" },
      ar_gulf: { title: "شلون تختار قطعة اللحم المثالية للشوي؟", caption: "عشان شواء مثالي، لازم تنتبه لتوزيع الشحم (الرخامي) وسُمك القطعة.\n\nإحنا بمطعمنا نختار أفضل القطع خصيصاً لكم لضمان طعم لذيذ.\nشلون تفضل تسوية اللحم؟ 🥩" },
      en: { title: "How to pick the perfect steak for grilling", caption: "For the perfect grill, you must look at the marbling and the thickness of the cut.\n\nIn our restaurant, we handpick the best cuts to ensure an unforgettable taste.\nHow do you like your steak cooked? 🥩" }
    },
    proof: {
      ar_fusha: { title: "هذا ما قاله زبائننا عن طبقنا الجديد", caption: "آراء عملائنا هي أهم دافع لنا للاستمرار والتطوير.\n\nشكراً لكل من زارنا وشاركنا تجربته الرائعة. نحن هنا لنقدم لكم الأفضل دائماً.\nمتى ستزورنا لتجربة هذا الطبق؟ 🌟" },
      ar_egy: { title: "ده اللي قاله ضيوفنا عن طبقنا الجديد", caption: "رأي عملائنا هو أهم دافع لينا عشان نكمل ونطور.\n\nشكراً لكل حد زارنا وشاركنا تجربته الحلوة. إحنا هنا عشان نقدم لكم الأحسن دايماً.\nهتنورنا إمتى عشان تجرب الطبق ده؟ 🌟" },
      ar_gulf: { title: "هذا اللي قالوه زبايننا عن طبقنا اليديد", caption: "رأي زبايننا هو أهم دافع لنا عشان نستمر ونطور.\n\nشكراً لكل من زارنا وشاركنا تجربته الحلوة. إحنا هني عشان نقدم لكم الأفضل دايماً.\nمتى بتزورنا وتجرب هالطبق؟ 🌟" },
      en: { title: "What our guests said about our new dish", caption: "Your feedback is our biggest motivation to keep improving.\n\nThank you to everyone who visited and shared their wonderful experience. We're here to serve you the best.\nWhen are you coming in to try this? 🌟" }
    },
    myth: {
      ar_fusha: { title: "خرافة: الطعام الصحي لا يمكن أن يكون لذيذاً", caption: "من قال أن الأكل الصحي يعني طعماً مملاً؟\n\nنحن كسرنا هذه القاعدة بخيارات صحية غنية بالنكهات والتوابل المميزة التي سترضي ذوقك.\nجربها واحكم بنفسك! 🥗🔥" },
      ar_egy: { title: "خرافة: الأكل الصحي طعمه وحش", caption: "مين قال إن الأكل الصحي معناه طعم ممل؟\n\nإحنا كسرنا القاعدة دي باختيارات صحية غنية بالنكهات والتوابل المميزة اللي هتعجبك جداً.\nجربها واحكم بنفسك! 🥗🔥" },
      ar_gulf: { title: "خرافة: الأكل الصحي ما يكون لذيذ", caption: "منو قال إن الأكل الصحي يعني طعم ممل؟\n\nإحنا كسرنا هالقاعدة بخيارات صحية غنية بالنكهات والتوابل المميزة اللي بترضيك.\nجربها واحكم بنفسك! 🥗🔥" },
      en: { title: "Myth: Healthy food can't be delicious", caption: "Who said eating healthy means boring flavors?\n\nWe broke this rule with healthy options rich in spices and unique flavors that will satisfy your cravings.\nTry it and judge for yourself! 🥗🔥" }
    },
    pitch: {
      ar_fusha: { title: "عروض الويك إند لا تفوت!", caption: "خططت لعطلة نهاية الأسبوع؟\n\nاجمع عائلتك وأصدقائك واستمتع بأشهى الأطباق مع خصم 20% على الطلبات الداخلية.\nاحجز طاولتك الآن، الرابط في البايو! 🍽️" },
      ar_egy: { title: "عروض الويك إند متتفوتش!", caption: "مخططت للويك إند؟\n\nجمع عيلتك وأصحابك واستمتع بأحلى الأكل مع خصم 20% على الصالة.\nاحجز ترابيزتك دلوقتي، الرابط في البايو! 🍽️" },
      ar_gulf: { title: "عروض الويك إند لا تطوفك!", caption: "مخطط للويك إند؟\n\nاجمع أهلك وربعك واستمتع بألذ الأطباق مع خصم 20% على الطلبات الداخلية.\nاحجز طاولتك الحين، الرابط بالبايو! 🍽️" },
      en: { title: "Weekend offers you can't miss!", caption: "Got plans for the weekend?\n\nGather your family and friends and enjoy the most delicious dishes with a 20% discount on dine-in orders.\nBook your table now, link in bio! 🍽️" }
    }
  },
  realestate_sales: {
    story: {
      ar_fusha: { title: "كيف ساعدنا عائلة في إيجاد منزل أحلامهم", caption: "بحثوا لشهور طويلة ولم يجدوا ما يناسب ميزانيتهم واحتياجاتهم.\n\nعندما تواصلوا معنا، قمنا بتصفية الخيارات بناءً على أولوياتهم (القرب من المدارس، الهدوء، والسعر). في أقل من أسبوعين، وقعوا عقد منزلهم الجديد!\nالسر ليس في كثرة العروض، بل في الفهم الدقيق لاحتياج العميل. ما هو أهم شرط لك في منزلك القادم؟ 🏡" },
      ar_egy: { title: "إزاي ساعدنا عيلة تلاقي بيت أحلامها", caption: "دوروا شهور طويلة ومفيش حاجة ناسبت ميزانيتهم واحتياجاتهم.\n\nلما كلمونا، فلترنا الاختيارات على أساس أولوياتهم (قريب من المدارس، الهدوء، والسعر). في أقل من أسبوعين، مضوا عقد بيتهم الجديد!\nالسر مش في كتر العروض، السر إنك تفهم العميل عايز إيه بالظبط. إيه أهم شرط عندك في بيتك الجاي؟ 🏡" },
      ar_gulf: { title: "شلون ساعدنا عائلة يلقون بيت أحلامهم", caption: "دوروا شهور طويلة وما لقوا شي يناسب ميزانيتهم واحتياجاتهم.\n\nلما تواصلوا معانا، صفينا الخيارات بناءً على أولوياتهم (قريب من المدارس، الهدوء، والسعر). بأقل من أسبوعين، وقعوا عقد بيتهم الجديد!\nالسر مو بكثرة العروض، السر بالفهم الدقيق لاحتياج العميل. شنو أهم شرط ببيتك الياي؟ 🏡" },
      en: { title: "How we helped a family find their dream home", caption: "They searched for months but found nothing that fit their budget and needs.\n\nWhen they contacted us, we filtered options based on their priorities (near schools, quiet area, price). In less than two weeks, they signed for their new home!\nThe secret isn't showing a hundred houses; it's understanding exactly what the client wants. What's your #1 requirement for a new home? 🏡" }
    },
    bts: {
      ar_fusha: { title: "كيف نقيم العقار قبل عرضه عليكم؟", caption: "لا نعرض أي عقار قبل التأكد من 3 أشياء:\n1️⃣ سلامة الأوراق القانونية.\n2️⃣ جودة البنية التحتية والتشطيبات.\n3️⃣ تناسب السعر مع القيمة السوقية للمنطقة.\nالجودة والمصداقية هي أساس عملنا. هل تفضل العقارات الجاهزة أم تحت الإنشاء؟ 🏗️" },
      ar_egy: { title: "إزاي بنقيم العقار قبل ما نعرضه عليكم؟", caption: "مش بنعرض أي عقار قبل ما نتأكد من 3 حاجات:\n1️⃣ سلامة الورق القانوني.\n2️⃣ جودة البنية التحتية والتشطيبات.\n3️⃣ السعر مناسب لقيمة المنطقة.\nالجودة والمصداقية هما أساس شغلنا. بتفضل العقارات الجاهزة ولا اللي تحت الإنشاء؟ 🏗️" },
      ar_gulf: { title: "شلون نقيم العقار قبل نعرضه عليكم؟", caption: "ما نعرض أي عقار قبل ما نتأكد من 3 أشياء:\n1️⃣ سلامة الأوراق القانونية.\n2️⃣ جودة البنية التحتية والتشطيبات.\n3️⃣ السعر مناسب للقيمة السوقية للمنطقة.\nالجودة والمصداقية أساس شغلنا. تفضل العقارات الجاهزة ولا اللي تحت الإنشاء؟ 🏗️" },
      en: { title: "How we inspect a property before listing it", caption: "We never list a property before checking 3 things:\n1️⃣ Clear legal paperwork.\n2️⃣ Quality of infrastructure and finishing.\n3️⃣ Fair market price for the area.\nQuality and trust are our foundation. Do you prefer move-in ready or off-plan properties? 🏗️" }
    },
    edu: {
      ar_fusha: { title: "3 نصائح قبل شراء عقار للاستثمار", caption: "هل تفكر في الاستثمار العقاري؟ انتبه لهذه النقاط:\n1️⃣ الموقع هو الملك (اختر مناطق قيد التطور).\n2️⃣ احسب العائد الإيجاري المتوقع بدقة.\n3️⃣ تأكد من سهولة إعادة البيع في المستقبل.\nالاستثمار العقاري هو الأكثر أماناً إذا تم بذكاء. في أي منطقة تفضل الاستثمار؟ 📈" },
      ar_egy: { title: "3 نصايح قبل ما تشتري عقار للاستثمار", caption: "بتفكر في الاستثمار العقاري؟ ركز في النقط دي:\n1️⃣ اللوكيشن هو الملك (اختار مناطق لسه بتعمر).\n2️⃣ احسب العائد الإيجاري المتوقع بدقة.\n3️⃣ اتأكد من سهولة إعادة البيع بعدين.\nالاستثمار العقاري هو الأأمن لو اتعمل بذكاء. بتحب تستثمر في أي منطقة؟ 📈" },
      ar_gulf: { title: "3 نصايح قبل تشتري عقار للاستثمار", caption: "تفكر بالاستثمار العقاري؟ انتبه لهذي النقاط:\n1️⃣ الموقع هو الملك (اختار مناطق قيد التطور).\n2️⃣ احسب العائد الإيجاري المتوقع بدقة.\n3️⃣ تأكد من سهولة إعادة البيع بالمستقبل.\nالاستثمار العقاري هو الأكثر أمان إذا تم بذكاء. بأي منطقة تفضل تستثمر؟ 📈" },
      en: { title: "3 tips before buying an investment property", caption: "Thinking about real estate investing? Keep this in mind:\n1️⃣ Location is king (choose developing areas).\n2️⃣ Calculate the expected rental yield accurately.\n3️⃣ Ensure high resale liquidity for the future.\nReal estate is the safest investment if done smart. Where are you looking to invest? 📈" }
    },
    proof: {
      ar_fusha: { title: "بيعت في 48 ساعة فقط!", caption: "بفضل خطتنا التسويقية وتحديد السعر المناسب للسوق، تمكنا من بيع هذه الوحدة الرائعة في يومين فقط من عرضها.\n\nالتسويق العقاري الاحترافي يصنع الفارق. هل تفكر في بيع عقارك؟ 🤝" },
      ar_egy: { title: "اتباعت في 48 ساعة بس!", caption: "بفضل خطتنا التسويقية وتحديد السعر الصح للسوق، قدرنا نبيع الوحدة دي في يومين بس من وقت العرض.\n\nالتسويق العقاري الاحترافي بيعمل فرق كبير. بتفكر تبيع عقارك؟ 🤝" },
      ar_gulf: { title: "انباعت بـ 48 ساعة بس!", caption: "بفضل خطتنا التسويقية وتحديد السعر المناسب للسوق، قدرنا نبيع هالوحدة في يومين بس من عرضها.\n\nالتسويق العقاري الاحترافي يصنع الفارق. تفكر تبيع عقارك؟ 🤝" },
      en: { title: "Sold in just 48 hours!", caption: "Thanks to our targeted marketing plan and accurate market pricing, we closed this amazing unit in just two days.\n\nProfessional real estate marketing makes all the difference. Looking to sell your property? 🤝" }
    },
    myth: {
      ar_fusha: { title: "خرافة: يجب أن تنتظر انخفاض الأسعار لتشتري", caption: "أكبر خطأ يقع فيه المشتري هو انتظار 'انهيار السوق'.\n\nتاريخياً، العقار يحفظ قيمته ويرتفع على المدى الطويل. الانتظار غالباً يعني أنك ستدفع أكثر لاحقاً.\nأفضل وقت لشراء العقار كان بالأمس، والوقت الثاني هو اليوم! هل توافق؟ ⏳" },
      ar_egy: { title: "خرافة: استنى الأسعار تنزل عشان تشتري", caption: "أكبر غلطة بيقع فيها المشتري إنه يستنى 'السوق يقع'.\n\nتاريخياً، العقار بيحفظ قيمته وبيزيد على المدى الطويل. الانتظار غالباً معناه إنك هتدفع أكتر بعدين.\nأحسن وقت تشتري فيه عقار كان امبارح، وتاني أحسن وقت هو النهاردة! متفق؟ ⏳" },
      ar_gulf: { title: "خرافة: لازم تنطر الأسعار تنزل عشان تشتري", caption: "أكبر غلطة يطيح فيها المشتري إنه ينطر 'السوق يطيح'.\n\nتاريخياً، العقار يحفظ قيمته ويرتفع على المدى الطويل. الانتظار غالباً يعني إنك بتدفع أكثر بعدين.\nأفضل وقت تشتري فيه عقار كان أمس، والوقت الثاني هو اليوم! تتفق؟ ⏳" },
      en: { title: "Myth: Wait for prices to drop before buying", caption: "The biggest mistake buyers make is waiting for the 'market crash'.\n\nHistorically, real estate appreciates and holds value over the long term. Waiting usually means getting priced out.\nThe best time to buy real estate was yesterday, the next best time is today! Do you agree? ⏳" }
    },
    pitch: {
      ar_fusha: { title: "فرصة استثمارية بعائد مضمون", caption: "مشروع جديد في قلب المدينة الحيوية بخطط سداد مرنة تصل إلى 5 سنوات، وعائد إيجاري متوقع 10% سنوياً.\n\nالفرص المميزة تنفذ بسرعة. تواصل معنا الآن للحصول على البروشور والأسعار! 🏢" },
      ar_egy: { title: "فرصة استثمارية بعائد مضمون", caption: "مشروع جديد في قلب المدينة بخطط سداد مرنة بتوصل لـ 5 سنين، وعائد إيجاري متوقع 10% سنوياً.\n\nالفرص المميزة بتخلص بسرعة. كلمنا دلوقتي عشان نبعتلك البروشور والأسعار! 🏢" },
      ar_gulf: { title: "فرصة استثمارية بعائد مضمون", caption: "مشروع يديد في قلب المدينة بخطط سداد مرنة توصل 5 سنين، وعائد إيجاري متوقع 10% سنوياً.\n\nالفرص المميزة تخلص بسرعة. تواصل معانا الحين عشان نرسلك البروشور والأسعار! 🏢" },
      en: { title: "Investment opportunity with high ROI", caption: "New project in a prime location with flexible payment plans up to 5 years and an expected 10% annual rental yield.\n\nPremium units sell out fast. DM us now to receive the brochure and pricing! 🏢" }
    }
  },
  online_courses: {
    story: {
      ar_fusha: { title: "لماذا قررت تحويل خبرتي إلى كورس؟", caption: "بعد 10 سنوات من العمل في هذا المجال، كنت أستقبل رسائل يومية تسأل نفس الأسئلة المبتدئة.\n\nقررت أن أجمع كل أسراري وأخطائي التي كلفتني الكثير في منهج واحد يختصر عليك سنوات من التخبط.\nالمعرفة قوة، ومشاركتها شغف. ما هي المهارة التي تود تعلمها هذا العام؟ 📚" },
      ar_egy: { title: "ليه قررت أحول خبرتي لكورس؟", caption: "بعد 10 سنين شغل في المجال ده، كنت بستقبل رسايل كل يوم بتسأل نفس الأسئلة بتاعة المبتدئين.\n\nقررت أجمع كل أسراري وأخطائي اللي كلفتني كتير في منهج واحد يوفر عليك سنين من اللخبطة.\nالمعرفة قوة، ومشاركتها شغف. إيه المهارة اللي نفسك تتعلمها السنة دي؟ 📚" },
      ar_gulf: { title: "ليش قررت أحول خبرتي لكورس؟", caption: "بعد 10 سنين شغل بهالمجال، كنت أستقبل رسايل يومياً تسأل نفس أسئلة المبتدئين.\n\nقررت أجمع كل أسراري وأخطائي اللي كلفتني وايد في منهج واحد يختصر عليك سنين من التخبط.\nالمعرفة قوة، ومشاركتها شغف. شنو المهارة اللي ودك تتعلمها هالسنة؟ 📚" },
      en: { title: "Why I turned my expertise into a course", caption: "After 10 years in the industry, I kept getting DMs asking the exact same beginner questions.\n\nI decided to compile all my secrets and costly mistakes into one framework that saves you years of trial and error.\nKnowledge is power, sharing it is a passion. What skill do you want to master this year? 📚" }
    },
    bts: {
      ar_fusha: { title: "كيف أضمن جودة محتوى الكورس؟", caption: "تصوير الكورس ليس مجرد فتح الكاميرا والتحدث!\n\nيستغرق الأمر أسابيع من كتابة السيناريو، وتصميم العروض التقديمية، ومونتاج دقيق لضمان وصول المعلومة بأسهل طريقة ممكنة.\nالجهد المبذول خلف الكواليس هو ما يصنع الفارق. هل جربت التعلم عن بعد من قبل؟ 🎥" },
      ar_egy: { title: "إزاي بضمن جودة محتوى الكورس؟", caption: "تصوير الكورس مش مجرد إني أفتح الكاميرا وأتكلم!\n\nالموضوع بياخد أسابيع من كتابة السكريبت، وتصميم البريزنتيشن، ومونتاج دقيق عشان نضمن إن المعلومة توصل بأسهل طريقة.\nالتعب اللي ورا الكواليس هو اللي بيعمل الفرق. جربت الأونلاين كورسز قبل كده؟ 🎥" },
      ar_gulf: { title: "شلون أضمن جودة محتوى الكورس؟", caption: "تصوير الكورس مو مجرد أفتح الكاميرا وأسولف!\n\nياخذ الموضوع أسابيع من كتابة السكريبت، وتصميم البرزنتيشن، ومونتاج دقيق عشان المعلومة توصل بأسهل طريقة.\nالتعب اللي ورا الكواليس هو اللي يصنع الفرق. جربت التعلم عن بعد من قبل؟ 🎥" },
      en: { title: "How I ensure the quality of my course", caption: "Filming a course isn't just pressing record and talking!\n\nIt takes weeks of scripting, designing slides, and precise editing to ensure the information is delivered as smoothly as possible.\nThe BTS effort is what makes a course truly valuable. Have you ever taken an online course? 🎥" }
    },
    edu: {
      ar_fusha: { title: "أكبر عائق يمنعك من إتقان مهارة جديدة", caption: "الكثير يبدأ بحماس ثم يتوقف بعد أسبوع. لماذا؟\nلأنهم يعتمدون على 'التحفيز' بدلاً من 'النظام'.\nخصص 20 دقيقة فقط يومياً في نفس الموعد. الاستمرارية البسيطة تهزم المجهود الكبير المتقطع.\nما هو أكثر ما يشتتك أثناء التعلم؟ ⏱️" },
      ar_egy: { title: "أكبر عائق بيمنعك تتعلم مهارة جديدة", caption: "ناس كتير بتبدأ بحماس وتقف بعد أسبوع. ليه؟\nعشان بيعتمدوا على 'التحفيز' بدل 'النظام'.\nخصص 20 دقيقة بس كل يوم في نفس الميعاد. الاستمرارية البسيطة بتكسب المجهود الكبير المتقطع.\nإيه أكتر حاجة بتشتتك وإنت بتذاكر؟ ⏱️" },
      ar_gulf: { title: "أكبر عائق يمنعك تتعلم مهارة يديدة", caption: "وايد ناس تبدأ بحماس وتوقف بعد أسبوع. ليش؟\nلأنهم يعتمدون على 'التحفيز' بدل 'النظام'.\nخصص 20 دقيقة بس كل يوم بنفس الوقت. الاستمرارية البسيطة تغلب المجهود الكبير المتقطع.\nشنو أكثر شي يشتتك وقت التعلم؟ ⏱️" },
      en: { title: "The biggest barrier to mastering a new skill", caption: "Many start with high motivation and quit after a week. Why?\nBecause they rely on 'Motivation' instead of 'Systems'.\nDedicate just 20 minutes a day at the exact same time. Small consistency always beats sporadic massive effort.\nWhat distracts you most when studying? ⏱️" }
    },
    proof: {
      ar_fusha: { title: "من مبتدئ إلى محترف في شهرين", caption: "هذه رسالة من أحد المتدربين يشاركني فيها حصوله على أول وظيفة له بعد تطبيق ما تعلمه في الدورة.\n\nفرحتي بنجاح طلابي تفوق أي شيء آخر. التطبيق العملي هو مفتاح النجاح. مستعد لتبدأ رحلتك؟ 🎓" },
      ar_egy: { title: "من مبتدئ لمحترف في شهرين", caption: "دي رسالة من واحد من المتدربين بيفرحني فيها إنه جاله أول شغل ليه بعد ما طبق اللي اتعلمه في الكورس.\n\nفرحتي بنجاح طلابي متتوصفش. التطبيق العملي هو مفتاح النجاح. جاهز تبدأ رحلتك؟ 🎓" },
      ar_gulf: { title: "من مبتدئ لمحترف بشهرين", caption: "هذي رسالة من أحد المتدربين يشاركني فيها إنه حصل على أول وظيفة بعد ما طبق اللي تعلمه بالكورس.\n\nفرحتي بنجاح طلابي ما توصف. التطبيق العملي هو مفتاح النجاح. مستعد تبدأ رحلتك؟ 🎓" },
      en: { title: "From beginner to pro in 2 months", caption: "This is a message from a student sharing that they landed their first client after applying what they learned in the course.\n\nMy joy in seeing my students succeed is unmatched. Practical application is the key to success. Ready to start your journey? 🎓" }
    },
    myth: {
      ar_fusha: { title: "خرافة: كل المعلومات موجودة مجاناً على يوتيوب", caption: "نعم، المعلومات موجودة، لكنها مشتتة، غير مرتبة، وغالباً ما ينقصها التطبيق العملي والتوجيه.\n\nالكورسات المدفوعة لا تبيعك المعلومة، بل تبيعك 'الوقت' و'الترتيب المنطقي' و'خلاصة التجربة'.\nهل تفضل التعلم المجاني المشتت أم المنهج المنظم؟ 💡" },
      ar_egy: { title: "خرافة: كل حاجة موجودة ببلاش على يوتيوب", caption: "آه، المعلومات موجودة، بس متلخبطة، مش مترتبة، وناقصها التطبيق العملي والتوجيه.\n\nالكورسات المدفوعة مش بتبيعلك المعلومة، دي بتبيعلك 'الوقت' و'الترتيب الصح' و'خلاصة التجربة'.\nبتفضل تتعلم ببلاش وتدور كتير ولا تاخد منهج منظم؟ 💡" },
      ar_gulf: { title: "خرافة: كل المعلومات موجودة مجاناً بيوتيوب", caption: "إي، المعلومات موجودة، بس متشتتة ومو مرتبة، وناقصها التطبيق العملي والتوجيه.\n\nالكورسات المدفوعة ما تبيع لك المعلومة، تبيع لك 'الوقت' و'الترتيب' و'خلاصة التجربة'.\nتفضل التعلم المجاني المشتت ولا المنهج المنظم؟ 💡" },
      en: { title: "Myth: You can learn everything for free on YouTube", caption: "Yes, the information is out there, but it's scattered, unstructured, and lacks practical guidance.\n\nPaid courses don't sell you information; they sell you 'time', 'structure', and 'distilled experience'.\nDo you prefer piecing things together or following a proven blueprint? 💡" }
    },
    pitch: {
      ar_fusha: { title: "التسجيل متاح الآن بخصم 40% (لفترة محدودة)", caption: "إذا كنت جاداً في تطوير مهاراتك، فهذا هو الوقت المناسب.\n\nالكورس الشامل متاح الآن مع وصول مدى الحياة وتحديثات مجانية.\nاستثمر في نفسك اليوم. الرابط في البايو للتسجيل! 💻" },
      ar_egy: { title: "التسجيل مفتوح دلوقتي بخصم 40% (لفترة محدودة)", caption: "لو أنت جاد وعايز تطور مهاراتك بجد، ده الوقت المناسب.\n\nالكورس الشامل متاح دلوقتي مع وصول مدى الحياة وتحديثات مجانية.\nاستثمر في نفسك النهاردة. الرابط في البايو للتسجيل! 💻" },
      ar_gulf: { title: "التسجيل متاح الحين بخصم 40% (لفترة محدودة)", caption: "إذا كنت جاد بتطوير مهاراتك، فهذا هو الوقت المناسب.\n\nالكورس الشامل متاح الحين مع وصول مدى الحياة وتحديثات مجانية.\nاستثمر بنفسك اليوم. الرابط بالبايو للتسجيل! 💻" },
      en: { title: "Enrollment is OPEN with a 40% discount!", caption: "If you are serious about upgrading your skills, the time is now.\n\nThe comprehensive course is now available with lifetime access and free updates.\nInvest in yourself today. Click the link in bio to enroll! 💻" }
    }
  },
  digital_marketing: {
    story: {
      ar_fusha: { title: "كيف ضاعفنا مبيعات عميل بـ 3 أضعاف بدون زيادة ميزانية الإعلانات", caption: "الجميع يظن أن زيادة المبيعات تتطلب زيادة في الميزانية الإعلانية.\n\nعندما استلمنا حساب هذا العميل، قمنا بإيقاف الإعلانات تماماً لمدة أسبوع! ركزنا على تحسين صفحة الهبوط وتعديل رسالة البيع (Copywriting).\nعندما أعدنا إطلاق نفس الإعلانات بنفس الميزانية، تضاعفت المبيعات 3 مرات. التسويق ليس مجرد إعلانات، بل هو رحلة عميل متكاملة. ما هي أكبر مشكلة تواجهك في حملاتك؟ 📊" },
      ar_egy: { title: "إزاي ضاعفنا مبيعات عميل 3 مرات من غير ما نزود الميزانية", caption: "الكل فاكر إن زيادة المبيعات محتاجة فلوس أكتر في الإعلانات.\n\nلما استلمنا حساب العميل ده، وقفنا الإعلانات أسبوع بحاله! ركزنا على تحسين صفحة الهبوط (Landing Page) وتعديل رسالة البيع.\nولما شغلنا نفس الإعلانات بنفس الميزانية، المبيعات اتضاعفت 3 مرات. التسويق مش إعلانات وبس، ده رحلة عميل كاملة. إيه أكتر مشكلة بتواجهك في حملاتك؟ 📊" },
      ar_gulf: { title: "شلون ضاعفنا مبيعات عميل 3 مرات بدون زيادة الميزانية", caption: "الكل يعتقد إن زيادة المبيعات تحتاج ميزانية إعلانية أكبر.\n\nلما استلمنا حساب العميل، وقفنا الإعلانات أسبوع كامل! ركزنا على تحسين صفحة الهبوط وتعديل رسالة البيع.\nولما شغلنا الإعلانات بنفس الميزانية، المبيعات تضاعفت 3 مرات. التسويق مو بس إعلانات، هو رحلة عميل متكاملة. شنو أكبر مشكلة تواجهك بحملاتك؟ 📊" },
      en: { title: "How we 3X'd a client's sales without increasing ad spend", caption: "Everyone thinks scaling sales requires scaling the ad budget.\n\nWhen we took over this client's account, we paused ALL ads for a week! We focused entirely on optimizing their landing page and rewriting their offer.\nWhen we turned the same ads back on with the exact same budget, sales tripled. Marketing isn't just media buying; it's the entire customer journey. What's your biggest struggle with ads? 📊" }
    },
    bts: {
      ar_fusha: { title: "كيف نبني خطة تسويقية لعملائنا الجدد", caption: "الأمر ليس مجرد إطلاق حملة عشوائية.\n\n1️⃣ تحليل المنافسين بعمق.\n2️⃣ تحديد زوايا بيع مبتكرة (Angles).\n3️⃣ بناء مسار مبيعات (Funnel) واضح.\nالعمل الذي يسبق الإعلان هو ما يحدد نجاحه. هل تضع خطة قبل إطلاق حملاتك؟ 📝" },
      ar_egy: { title: "إزاي بنبني خطة تسويق لعملائنا الجداد", caption: "الموضوع مش مجرد إعلان بنشغله وخلاص.\n\n1️⃣ بنحلل المنافسين بدقة.\n2️⃣ بنحدد زوايا بيع مختلفة عن السوق.\n3️⃣ بنبني مسار مبيعات (Funnel) واضح للعميل.\nالشغل اللي قبل الإعلان هو اللي بيحدد نجاحه. بتعمل خطة قبل ما تطلق حملاتك؟ 📝" },
      ar_gulf: { title: "شلون نبني خطة تسويقية لعملائنا الجدد", caption: "الموضوع مو مجرد إطلاق حملة وبس.\n\n1️⃣ نحلل المنافسين بعمق.\n2️⃣ نحدد زوايا بيع مبتكرة.\n3️⃣ نبني مسار مبيعات (Funnel) واضح.\nالشغل اللي يسبق الإعلان هو اللي يحدد نجاحه. تحط خطة قبل إطلاق حملاتك؟ 📝" },
      en: { title: "How we build a marketing strategy for new clients", caption: "It's never just about hitting 'publish' on an ad.\n\n1️⃣ Deep competitor analysis.\n2️⃣ Identifying unique marketing angles.\n3️⃣ Building a high-converting funnel.\nThe work done before the ad goes live dictates its success. Do you map out a strategy before launching? 📝" }
    },
    edu: {
      ar_fusha: { title: "الفرق بين التسويق والمبيعات (خطأ شائع)", caption: "الكثير يخلط بينهما مما يؤدي لفشل الحملات.\n\nالتسويق: هو جذب انتباه العميل الصحيح وتوعيته بالمشكلة والحل.\nالمبيعات: هي تحويل هذا الاهتمام إلى صفقة فعلية (إقناع العميل بدفع المال).\nإذا كان تسويقك ممتازاً ومبيعاتك ضعيفة، راجع مهارات الإغلاق لديك أو سهولة الدفع. أي القسمين أصعب بالنسبة لك؟ 🎯" },
      ar_egy: { title: "الفرق بين التسويق والمبيعات (غلطة مشهورة)", caption: "ناس كتير بتتلخبط بينهم وده بيبوظ الحملات.\n\nالتسويق: هو إنك تلفت انتباه العميل الصح وتوعيه بالمشكلة والحل.\nالمبيعات: هي إنك تحول الاهتمام ده لفلوس بتدفع.\nلو تسويقك حلو ومبيعاتك ضعيفة، راجع طريقة قفلة البيعة أو سهولة الدفع. إيه الأصعب بالنسبالك؟ 🎯" },
      ar_gulf: { title: "الفرق بين التسويق والمبيعات (خطأ شائع)", caption: "الكل يخلط بينهم وهذا سبب فشل وايد حملات.\n\nالتسويق: هو جذب انتباه العميل الصح وتوعيته بمشكلته والحل.\nالمبيعات: هي تحويل هذا الاهتمام لصفقة فعلية.\nإذا تسويقك قوي ومبيعاتك ضعيفة، راجع مهارات إغلاق البيعة عندك. أي قسم تحسه أصعب؟ 🎯" },
      en: { title: "Marketing vs. Sales: The biggest misconception", caption: "Many mix these up, leading to failed campaigns.\n\nMarketing: Attracting the right audience and educating them on the problem/solution.\nSales: Converting that generated interest into actual revenue.\nIf your marketing is great but sales are low, fix your closing skills or checkout process. Which one do you struggle with more? 🎯" }
    },
    proof: {
      ar_fusha: { title: "كيف خفضنا تكلفة الاستحواذ بنسبة 60%", caption: "العميل كان يعاني من ارتفاع تكلفة النقرات (CPC).\n\nمن خلال اختبار أ ب (A/B Testing) مكثف للفيديوهات وتحديث استهداف الجمهور، خفضنا تكلفة اكتساب العميل بنسبة 60% في أول 30 يوماً.\nالبيانات لا تكذب أبدًا. هل تقيس عائد استثمارك بدقة؟ 📈" },
      ar_egy: { title: "إزاي قللنا تكلفة العميل بنسبة 60%", caption: "العميل كان بيشتكي إن سعر الكليك غالي جداً.\n\nبعد ما عملنا (A/B Testing) كتير للفيديوهات وغيرنا الاستهداف، قدرنا نقلل تكلفة اكتساب العميل 60% في أول شهر.\nالأرقام مابتكدبش. بتقيس الـ ROI بتاعك صح؟ 📈" },
      ar_gulf: { title: "شلون نزلنا تكلفة العميل بنسبة 60%", caption: "العميل كان يعاني من ارتفاع تكلفة النقرة.\n\nمن خلال اختبارات (A/B Testing) مكثفة للفيديوهات وتغيير الاستهداف، نزلنا تكلفة العميل 60% بأول 30 يوم.\nالأرقام ما تجذب. تقيس عائدك الاستثماري بدقة؟ 📈" },
      en: { title: "How we dropped CPA by 60%", caption: "The client was suffering from insanely high ad costs.\n\nThrough aggressive A/B testing of their video creatives and tightening the audience targeting, we dropped their Cost Per Acquisition by 60% in the first 30 days.\nData never lies. Are you tracking your ROI accurately? 📈" }
    },
    myth: {
      ar_fusha: { title: "خرافة: الإعلانات هي الحل لكل مشاريع التجارة", caption: "أكبر كذبة في عالم التسويق الرقمي هي: 'ادفع إعلانات أكثر لتبيع أكثر'.\n\nإذا كان منتجك سيئاً، أو موقعك بطيئاً، أو خدمة عملائك ضعيفة، فالإعلانات ستسرع فقط من فشل مشروعك وتكشف عيوبه لعدد أكبر من الناس.\nأصلح الأساسيات أولاً. متفق؟ 💡" },
      ar_egy: { title: "خرافة: الإعلانات هي سحر المبيعات", caption: "أكبر كدبة في الماركتينج: 'ادفع إعلانات أكتر تبيع أكتر'.\n\nلو منتجك وحش، أو الويب سايت بطيء، أو خدمة العملاء سيئة، الإعلانات هتسرع فشل مشروعك وهتفضح عيوبك لعدد أكبر من الناس بس.\nصلح الأساسيات الأول. متفقين؟ 💡" },
      ar_gulf: { title: "خرافة: الإعلانات هي الحل السحري", caption: "أكبر كذبة بعالم الماركتينج: 'ادفع إعلانات أكثر تبيع أكثر'.\n\nإذا كان منتجك سيء، أو موقعك بطيء، الإعلانات راح تسرع فشل مشروعك وتفضح عيوبه لعدد أكبر من الناس.\nصلح الأساسيات أول. تتفق؟ 💡" },
      en: { title: "Myth: Ads will fix your business", caption: "The biggest lie in digital marketing is 'spend more on ads to get more sales'.\n\nIf your product is bad, your site is slow, or your offer is weak, ads will only amplify your failure to a larger audience faster.\nFix the fundamentals before spending a dime. Agree? 💡" }
    },
    pitch: {
      ar_fusha: { title: "دعنا نضاعف مبيعاتك في الـ 90 يوماً القادمة", caption: "هل سئمت من حرق ميزانيتك على حملات لا تجلب عائداً؟\n\nوكالتنا متخصصة في بناء مسارات بيع متكاملة وإدارة الإعلانات لضمان أعلى عائد استثماري (ROI).\nنقبل 3 عملاء جدد فقط هذا الشهر. الرابط في البايو لحجز استشارة مجانية! 🚀" },
      ar_egy: { title: "خلينا نضاعف مبيعاتك في الـ 90 يوم الجايين", caption: "زهقت من حرق الفلوس على حملات مبتجبش همها؟\n\nإحنا متخصصين في بناء مسارات بيع متكاملة (Funnels) وإدارة الإعلانات عشان نضمنلك أعلى عائد (ROI).\nبنقبل 3 عملاء جداد بس الشهر ده. الرابط في البايو عشان تحجز استشارة مجانية! 🚀" },
      ar_gulf: { title: "خلنا نضاعف مبيعاتك بالـ 90 يوم الياية", caption: "مليت من حرق ميزانيتك على إعلانات ما تجيب نتيجة؟\n\nوكالتنا متخصصة ببناء مسارات بيع متكاملة وإدارة الإعلانات لضمان أعلى عائد استثماري.\nنستقبل 3 عملاء جدد بس هالشهر. الرابط بالبايو لحجز استشارتك المجانية! 🚀" },
      en: { title: "Let us scale your sales in the next 90 days", caption: "Tired of burning ad budget with zero ROI?\n\nOur agency specializes in building high-converting funnels and data-driven media buying to scale your revenue.\nWe are taking exactly 3 new clients this month. Link in bio to book a free discovery call! 🚀" }
    }
  },
  personal_brand: {
    story: {
      ar_fusha: { title: "لماذا بدأت في صناعة المحتوى؟", caption: "لسنوات، كنت أعمل خلف الكواليس وأرى أشخاصاً أقل خبرة يتصدرون المشهد فقط لأنهم يتحدثون أمام الكاميرا.\n\nقررت أن أتغلب على خجلي وأشارك خبرتي مع العالم. بناء علامة تجارية شخصية كان أفضل قرار اتخذته في مسيرتي المهنية.\nمتى ستبدأ أنت؟ ✨" },
      ar_egy: { title: "ليه بدأت أعمل محتوى؟", caption: "لسنين، كنت بشتغل في الكواليس وبشوف ناس أقل مني خبرة واخدين اللقطة عشان بس بيطلعوا يتكلموا قدام الكاميرا.\n\nقررت أتغلب على كسوفي وأشارك خبرتي. بناء علامة تجارية شخصية كان أحسن قرار أخدته في حياتي المهنية.\nهتبدأ إمتى؟ ✨" },
      ar_gulf: { title: "ليش بديت بصناعة المحتوى؟", caption: "لسنين، كنت أشتغل ورا الكواليس وأشوف ناس أقل خبرة يتصدرون المشهد لأنهم يصورون نفسهم.\n\nقررت أتغلب على الخجل وأشارك خبرتي مع العالم. بناء علامتي الشخصية كان أفضل قرار مهني.\nمتى راح تبدأ أنت؟ ✨" },
      en: { title: "Why I started creating content", caption: "For years, I worked behind the scenes watching people with less expertise get all the recognition just because they showed up on camera.\n\nI decided to overcome my fear of judgment and share my knowledge. Building a personal brand was the highest-ROI decision of my career.\nWhen are you starting yours? ✨" }
    },
    bts: {
      ar_fusha: { title: "روتين تصوير المحتوى الأسبوعي الخاص بي", caption: "المحتوى يبدو سهلاً، لكن خلفه نظام صارم.\n\nأخصص يوم السبت من كل أسبوع لكتابة الأفكار، ويوم الأحد لتصوير 5 فيديوهات دفعة واحدة (Batching).\nهذا النظام يوفر وقتي ويجعلني أركز على عملي الأساسي باقي أيام الأسبوع. كيف تنظم وقتك؟ 📅" },
      ar_egy: { title: "روتيني في تصوير المحتوى الأسبوعي", caption: "المحتوى بيبان سهل، بس وراه نظام قوي.\n\nبخصص يوم السبت لكتابة الأفكار، ويوم الحد بصور 5 فيديوهات ورا بعض (Batching).\nالنظام ده بيوفرلي وقت وبيركزني في شغلي الأساسي بقية الأسبوع. بتنظم وقتك إزاي؟ 📅" },
      ar_gulf: { title: "روتيني بتصوير المحتوى كل أسبوع", caption: "المحتوى يبين سهل، بس وراه نظام والتزام.\n\nأخصص يوم السبت لكتابة الأفكار، والأحد أصور 5 فيديوهات دفعة وحدة.\nهذا النظام يوفر وقتي ويخليني أركز بشغلي الأساسي. شلون تنظم وقتك؟ 📅" },
      en: { title: "My weekly content creation routine", caption: "Content looks effortless, but it requires a strict system.\n\nI dedicate Saturdays to scripting and Sundays to batch-filming 5 videos at once.\nThis system saves me hours and lets me focus on my actual business during the week. Do you batch your work? 📅" }
    },
    edu: {
      ar_fusha: { title: "المعادلة الذهبية لبناء علامة تجارية شخصية قوية", caption: "لا يتعلق الأمر بعدد المتابعين، بل بالثقة.\n\nالمعادلة هي: تقديم قيمة حقيقية + الاستمرارية + إظهار شخصيتك الحقيقية (Authenticity).\nالناس تشتري من أشخاص يثقون بهم ويشعرون بأنهم يشبهونهم. هل تعبر عن شخصيتك الحقيقية في محتواك؟ 👑" },
      ar_egy: { title: "المعادلة الذهبية لبناء علامة تجارية شخصية", caption: "الموضوع مش بعدد الفولورز، الموضوع بالثقة.\n\nالمعادلة هي: تقديم قيمة بجد + استمرارية + تبين شخصيتك الحقيقية (Authenticity).\nالناس بتشتري من ناس واثقين فيهم وشايفينهم شبههم. بتبين شخصيتك الحقيقية في محتواك؟ 👑" },
      ar_gulf: { title: "المعادلة الذهبية للعلامة التجارية الشخصية", caption: "الموضوع مو بعدد المتابعين، الموضوع بالثقة.\n\nالمعادلة هي: تقديم قيمة فعلية + الاستمرارية + إظهار شخصيتك الحقيقية (Authenticity).\nالناس تشتري من أشخاص يثقون فيهم ويحسون إنهم يشبهونهم. هل تعبر عن شخصيتك الحقيقية بمحتواك؟ 👑" },
      en: { title: "The golden formula for a strong personal brand", caption: "It's never about follower count; it's about trust density.\n\nThe formula: High Value + Extreme Consistency + Raw Authenticity.\nPeople buy from people they know, like, and trust. Are you showing your true self in your content? 👑" }
    },
    proof: {
      ar_fusha: { title: "كيف جلبت تغريدة واحدة 5 عملاء جدد", caption: "الاستمرار في نشر المحتوى القيم يبني لك أصولاً رقمية.\n\nتغريدة نشرتها قبل 3 أشهر تشرح فيها حلاً لمشكلة تقنية، استمرت في الانتشار وجلبت لي 5 عملاء ذوي قيمة عالية.\nعلامتك الشخصية هي مندوب مبيعات يعمل لك 24 ساعة مجاناً. هل بدأت الاستثمار فيها؟ 🚀" },
      ar_egy: { title: "إزاي تويتة واحدة جابتلي 5 عملاء جداد", caption: "الاستمرار في نشر محتوى قوي بيبنيلك أصول ديجيتال.\n\nتويتة نزلتها من 3 شهور بشرح فيها حل لمشكلة، فضلت تنتشر وجابتلي 5 عملاء كبار.\nالبراند الشخصي بتاعك هو سيلز مان شغال عندك 24 ساعة ببلاش. بدأت تستثمر فيه ولا لسه؟ 🚀" },
      ar_gulf: { title: "شلون تغريدة وحدة يابت لي 5 عملاء جدد", caption: "الاستمرار بنشر المحتوى يبني لك أصول رقمية.\n\nتغريدة نزلتها قبل 3 شهور أشرح فيها حل لمشكلة، استمرت بالانتشار ويابت لي 5 عملاء كبار.\nعلامتك الشخصية هي مندوب مبيعات شغال لك 24 ساعة مجاناً. بديت تستثمر فيها؟ 🚀" },
      en: { title: "How ONE post landed me 5 high-ticket clients", caption: "Consistent content creation builds digital assets.\n\nA deep-dive post I wrote 3 months ago kept circulating and brought me 5 high-paying clients on autopilot.\nYour personal brand is a 24/7 free sales rep. Have you started investing in it? 🚀" }
    },
    myth: {
      ar_fusha: { title: "خرافة: يجب أن تكون خبيراً عالمياً لتبدأ بصناعة المحتوى", caption: "أكبر حاجز نفسي هو متلازمة المحتال (Imposter Syndrome).\n\nلا تحتاج لأن تكون الأول في العالم، تحتاج فقط أن تكون متقدماً بخطوة واحدة عن الشخص الذي تحاول تعليمه.\nشارك رحلة تعلمك، فالناس تتفاعل مع الرحلة أكثر من النتيجة النهائية. متفقون؟ 💡" },
      ar_egy: { title: "خرافة: لازم تكون خبير عالمي عشان تعمل محتوى", caption: "أكبر حاجز نفسي هو (Imposter Syndrome).\n\nمش لازم تكون الأول في العالم، أنت محتاج بس تكون سابق بخطوة واحدة عن الشخص اللي بتعلمه.\nشارك رحلة تعلمك، الناس بتحب تتابع الرحلة أكتر من النتيجة النهائية. متفقين؟ 💡" },
      ar_gulf: { title: "خرافة: لازم تكون خبير عالمي عشان تبدأ محتوى", caption: "أكبر حاجز نفسي هو (Imposter Syndrome).\n\nما تحتاج تكون الأول بالعالم، تحتاج بس تكون متقدم بخطوة عن الشخص اللي تحاول تعلمه.\nشارك رحلتك، الناس تتفاعل مع الرحلة أكثر من النتيجة. تتفق؟ 💡" },
      en: { title: "Myth: You must be a world-class expert to create content", caption: "The biggest mental block is Imposter Syndrome.\n\nYou don't need to be the #1 expert in the world. You just need to be one step ahead of the person you are teaching.\nDocument your journey. People connect with the struggle more than the polished result. Agree? 💡" }
    },
    pitch: {
      ar_fusha: { title: "حان الوقت لبناء علامتك الشخصية باحترافية", caption: "إذا كنت خبيراً في مجالك ولكنك مختفٍ عن الساحة الرقمية، فأنت تترك أموالاً طائلة على الطاولة.\n\nأقدم لك استشارة مجانية لتحليل حساباتك ووضع خطة محتوى متكاملة تناسب شخصيتك وأهدافك.\nاحجز مكاناً من الرابط في البايو! 🌟" },
      ar_egy: { title: "جه الوقت تبني علامتك الشخصية باحترافية", caption: "لو أنت شاطر في مجالك بس مختفي عن السوشيال ميديا، أنت بتخسر كتير جداً.\n\nبقدملك استشارة مجانية أحلل فيها حساباتك ونحط خطة محتوى تناسب شخصيتك.\nاحجز مكانك دلوقتي من الرابط اللي في البايو! 🌟" },
      ar_gulf: { title: "صار الوقت تبني علامتك الشخصية باحترافية", caption: "إذا كنت خبير بمجالك بس مختفي من السوشيال ميديا، أنت قاعد تضيع فرص وايد.\n\nأقدم لك استشارة مجانية أحلل حساباتك ونحط خطة محتوى تناسب شخصيتك وأهدافك.\nاحجز من الرابط بالبايو! 🌟" },
      en: { title: "It's time to build your Personal Brand", caption: "If you are brilliant at what you do but invisible online, you are leaving massive opportunities on the table.\n\nI'm offering a free audit call to analyze your current presence and map out a bespoke content strategy for you.\nLink in bio to book your slot! 🌟" }
    }
  },
  personal_finance: {
    story: {
      ar_fusha: { title: "كيف تخلصت من ديوني وبدأت الاستثمار", caption: "منذ سنوات، كنت أعمل بجد ولكن راتبي يتبخر في منتصف الشهر بسبب الديون الاستهلاكية.\n\nنقطة التحول كانت عندما تعلمت قاعدة 50/30/20 وكيفية تتبع نفقاتي حرفياً. بعد سنة، تخلصت من الديون وبدأت أستثمر أول 1000 دولار لي.\nإدارة المال أهم من كسبه. ما هو أكبر تحدي مالي يواجهك؟ 💰" },
      ar_egy: { title: "إزاي خلصت ديوني وبدأت أستثمر", caption: "من كام سنة، كنت بشتغل ليل نهار بس مرتبي بيخلص نص الشهر بسبب الكريدت كارد.\n\nنقطة التحول كانت لما اتعلمت قاعدة 50/30/20 وإزاي أكتب كل قرش بصرفه. بعد سنة، قفلت كل ديوني وبدأت أستثمر أول 1000 دولار.\nإدارة الفلوس أهم من إنك تجيبها. إيه أكبر تحدي مالي عندك؟ 💰" },
      ar_gulf: { title: "شلون تخلصت من ديوني وبديت استثمر", caption: "قبل كم سنة، كنت أشتغل بس راتبي يطير بنص الشهر بسبب الديون الاستهلاكية.\n\nنقطة التحول لما تعلمت قاعدة 50/30/20 وشلون أتابع مصاريفي بالضبط. بعد سنة، تخلصت من الديون وبديت أستثمر أول 1000 دولار لي.\nإدارة الفلوس أهم من كسبها. شنو أكبر تحدي مالي تواجهه؟ 💰" },
      en: { title: "How I crushed my debt and started investing", caption: "Years ago, I was making decent money, but I was living paycheck to paycheck drowning in consumer debt.\n\nThe turning point was aggressively tracking every penny and applying the 50/30/20 rule. Within a year, I was debt-free and made my first $1,000 investment.\nManaging money is harder than making it. What's your biggest financial hurdle right now? 💰" }
    },
    bts: {
      ar_fusha: { title: "كيف أخطط لميزانيتي الشهرية في 15 دقيقة", caption: "التخطيط المالي لا يجب أن يكون معقداً.\n\nأستخدم جدول إكسيل بسيط (أو تطبيق تتبع) في أول كل شهر. أحدد المصروفات الثابتة، ثم أقتطع نسبة الاستثمار 'أولاً'، وما يتبقى هو للترفيه.\nادفع لنفسك المستقبلية أولاً! هل تستخدم تطبيقاً لتتبع نفقاتك؟ 📊" },
      ar_egy: { title: "إزاي بخطط ميزانيتي الشهرية في 15 دقيقة", caption: "التخطيط المالي مش لازم يكون معقد.\n\nبستخدم شيت إكسيل بسيط أول كل شهر. بحدد المصاريف الثابتة، بعدين أشيل جزء الاستثمار 'في الأول'، والباقي للمصاريف العادية.\nادفع لنفسك بتاعت المستقبل الأول! بتستخدم أبلكيشن عشان تتابع مصاريفك؟ 📊" },
      ar_gulf: { title: "شلون أخطط ميزانيتي الشهرية بـ 15 دقيقة", caption: "التخطيط المالي مو لازم يكون معقد.\n\nأستخدم جدول إكسيل بسيط أول كل شهر. أحدد المصاريف الثابتة، وأشيل نسبة الاستثمار 'أول شي'، والباقي للترفيه.\nادفع لنفسك المستقبلية أول! تستخدم تطبيق حق تتبع مصاريفك؟ 📊" },
      en: { title: "How I plan my monthly budget in 15 minutes", caption: "Financial planning doesn't have to be a nightmare.\n\nI use a simple spreadsheet on the 1st of every month. I list fixed costs, 'Pay Myself First' by automating investments, and what's left is guilt-free spending.\nAutomate your wealth. Do you use an app to track your expenses? 📊" }
    },
    edu: {
      ar_fusha: { title: "التضخم يأكل مدخراتك السائلة", caption: "هل تترك أموالك في حساب بنكي بدون عوائد استثمارية؟\n\nإذا كان التضخم 5%، فأنت تفقد 5% من القوة الشرائية لأموالك كل عام وهي في مكانها.\nالاستثمار في الأصول (عقارات، أسهم، ذهب) ليس رفاهية، بل هو الدرع الوحيد لحماية ثروتك. أين تضع مدخراتك؟ 🛡️" },
      ar_egy: { title: "التضخم بياكل تحويشة عمرك", caption: "سايب فلوسك في البنك من غير عوائد استثمارية؟\n\nلو التضخم 5%، يبقى إنت بتخسر 5% من قيمة فلوسك كل سنة وهي في مكانها.\nالاستثمار (عقارات، أسهم، دهب) مابقاش رفاهية، ده الدرع الوحيد عشان تحمي فلوسك. بتستثمر مدخراتك في إيه؟ 🛡️" },
      ar_gulf: { title: "التضخم ياكل فلوسك الكاش", caption: "مخلي فلوسك بحساب بنكي بدون عوائد؟\n\nإذا التضخم 5%، فأنت قاعد تخسر 5% من القوة الشرائية لفلوسك كل سنة.\nالاستثمار (عقار، أسهم، ذهب) مو رفاهية، هو الدرع الوحيد عشان تحمي ثروتك. وين تستثمر فلوسك؟ 🛡️" },
      en: { title: "Inflation is quietly eating your cash", caption: "Are you leaving your life savings in a checking account?\n\nIf inflation is at 5%, you are literally losing 5% of your purchasing power every single year doing absolutely nothing.\nInvesting in assets (Index funds, Real estate, Gold) isn't a luxury; it's a necessity to protect your wealth. Where do you park your savings? 🛡️" }
    },
    proof: {
      ar_fusha: { title: "كيف حققت محفظتي الاستثمارية عائد 12% هذا العام", caption: "ليس سحراً ولا ضربة حظ. إنه الاستثمار المنهجي المستمر (DCA).\n\nبتخصيص مبلغ شهري ثابت في صناديق استثمارية متنوعة، بغض النظر عن حالة السوق، تراكمت الأرباح بفضل الفائدة المركبة.\nالاستثمار ماراثون وليس سبرينت. هل تفضل الاستثمار طويل أم قصير الأجل؟ 🚀" },
      ar_egy: { title: "إزاي محفظتي عملت عائد 12% السنة دي", caption: "ولا سحر ولا ضربة حظ. ده الاستثمار المنتظم (DCA).\n\nمن خلال استقطاع مبلغ ثابت كل شهر في صناديق استثمارية، من غير ما أركز مع طلوع ونزول السوق، الأرباح اتراكمت بفضل الفائدة المركبة.\nالاستثمار نفس طويل مش ضربة حظ. بتفضل الاستثمار الطويل ولا القصير؟ 🚀" },
      ar_gulf: { title: "شلون محفظتي حققت عائد 12% هالسنة", caption: "مو سحر ولا حظ. هو الاستثمار المنتظم (DCA).\n\nبتخصيص مبلغ شهري ثابت بصناديق استثمارية، بغض النظر عن حالة السوق، تراكمت الأرباح بفضل الفائدة المركبة.\nالاستثمار ماراثون مو ركض سريع. تفضل الاستثمار الطويل ولا القصير؟ 🚀" },
      en: { title: "How my portfolio hit a 12% return this year", caption: "No magic, no timing the market, and no luck. Just Dollar Cost Averaging (DCA).\n\nBy consistently investing a fixed amount every month into index funds regardless of market conditions, compound interest did the heavy lifting.\nInvesting is a marathon, not a sprint. Are you a long-term or short-term investor? 🚀" }
    },
    myth: {
      ar_fusha: { title: "خرافة: تحتاج لمبالغ ضخمة لتبدأ الاستثمار", caption: "هذه الكذبة تمنع الملايين من البدء.\n\nالاستثمار بـ 50 دولار شهرياً الآن أفضل من انتظار تجميع 5000 دولار بعد سنوات.\nالفائدة المركبة تعشق 'الوقت' أكثر من 'رأس المال'. ابدأ اليوم بأي مبلغ مهما كان صغيراً. متفق؟ ⏳" },
      ar_egy: { title: "خرافة: لازم معاك ملايين عشان تستثمر", caption: "الكدبة دي بتمنع ناس كتير إنها تبدأ.\n\nإنك تستثمر 50 دولار في الشهر دلوقتي أحسن من إنك تستنى تحوش 5000 دولار بعدين.\nالفائدة المركبة بتحب 'الوقت' أكتر من 'رأس المال'. ابدأ النهاردة بأي مبلغ. متفقين؟ ⏳" },
      ar_gulf: { title: "خرافة: تحتاج مبالغ كبيرة عشان تبدأ استثمار", caption: "هذي الكذبة تمنع وايد ناس يبدأون.\n\nإنك تستثمر 50 دولار بالشهر الحين أحسن من إنك تنطر تجمع 5000 دولار بعدين.\nالفائدة المركبة تعشق 'الوقت' أكثر من 'رأس المال'. ابدأ اليوم بأي مبلغ. تتفق؟ ⏳" },
      en: { title: "Myth: You need a lot of money to start investing", caption: "This is the #1 lie keeping people broke.\n\nInvesting $50 a month right now is mathematically better than waiting 5 years to invest a lump sum of $5,000.\nCompound interest rewards 'Time in the market' way more than 'Timing the market'. Start today with whatever you have. Agree? ⏳" }
    },
    pitch: {
      ar_fusha: { title: "خطتك المالية الشاملة لعام 2024", caption: "إذا كنت تريد التحكم في أموالك بدلاً من أن تتحكم هي بك، فقد صممت لك هذا الكورس الشامل.\n\nسنتعلم كيفية تتبع النفقات، التخلص من الديون، والبدء في بناء محفظة استثمارية من الصفر.\nسجل الآن عبر الرابط في البايو واحصل على خصم الإطلاق السريع! 🎓" },
      ar_egy: { title: "خطتك المالية الشاملة للسنة دي", caption: "لو عايز تتحكم في فلوسك بدل ما هي اللي تتحكم فيك، الكورس ده عشانك.\n\nهنتعلم إزاي تتابع مصاريفك، تقفل ديونك، وتبدأ تبني محفظة استثمارية من الصفر.\nسجل دلوقتي من الرابط في البايو واستفيد بخصم البداية! 🎓" },
      ar_gulf: { title: "خطتك المالية الشاملة لهالسنة", caption: "إذا تبي تتحكم بفلوسك بدل ما هي تتحكم فيك، صممت لك هالكورس.\n\nراح نتعلم شلون تتابع مصاريفك، تتخلص من ديونك، وتبدأ تبني محفظة استثمارية من الصفر.\nسجل الحين من الرابط بالبايو واحصل على خصم حصري! 🎓" },
      en: { title: "Your ultimate Financial Blueprint is here", caption: "If you want to control your money instead of letting it control you, I built this comprehensive course for you.\n\nWe cover aggressive debt payoff strategies, budgeting systems, and building an index fund portfolio from scratch.\nClick the link in my bio to enroll and grab the early-bird discount! 🎓" }
    }
  },
  generic: {
    story: {
      ar_fusha: { title: "كيف بدأنا من الصفر ووصلنا لهدفنا", caption: "البدايات دائماً صعبة. واجهنا عقبات جعلتنا نفكر بالاستسلام، لكن التزامنا هو ما دفعنا للاستمرار.\n\nما هو التحدي الأكبر الذي يواجهك حالياً؟ 👇" },
      ar_egy: { title: "إزاي بدأنا من الصفر ووصلنا لهدفنا", caption: "البدايات دايماً صعبة. واجهنا مطبات خلتنا نفكر نستسلم، بس التزامنا هو اللي خلانا نكمل.\n\nإيه أكتر تحدي بيواجهك دلوقتي؟ 👇" },
      ar_gulf: { title: "شلون بدينا من الصفر ووصلنا لهدفنا", caption: "البدايات دايماً صعبة. واجهنا عقبات خلتنا نفكر نستسلم، بس التزامنا هو اللي خلانا نكمل.\n\nشنو التحدي الأكبر اللي يواجهك حالياً؟ 👇" },
      en: { title: "How we started from zero and reached our goal", caption: "Beginnings are always tough. We faced obstacles that made us want to quit, but our commitment to delivering real value kept us pushing forward.\n\nToday, we are proud of what we've achieved and every client we've helped.\nWhat's the biggest challenge you're facing right now? 👇" }
    },
    bts: {
      ar_fusha: { title: "نظرة سريعة وراء كواليس عملنا", caption: "نحرص دائماً على الاهتمام بأدق التفاصيل لأن الجودة لا تقبل المساومة.\n\nهل تفضلون رؤية المزيد من الكواليس؟ 👁️" },
      ar_egy: { title: "نظرة سريعة ورا كواليس شغلنا", caption: "بنهتم دايماً بأدق التفاصيل عشان الجودة مفيهوش فصال.\n\nتحبوا تشوفوا أكتر من الكواليس دي؟ 👁️" },
      ar_gulf: { title: "نظرة سريعة ورا كواليس شغلنا", caption: "نحرص دايماً نهتم بأدق التفاصيل لأن الجودة ما نقبل المساومة فيها.\n\nتحبون تشوفون الكواليس أكثر؟ 👁️" },
      en: { title: "A quick peek behind our scenes", caption: "Ever wondered how we get things done? The secret is organization and working with passion.\n\nWe always obsess over the smallest details because we believe quality is non-negotiable.\n\nWould you like to see more BTS in the future? 👁️" }
    },
    edu: {
      ar_fusha: { title: "3 نصائح جوهرية لتطوير نتائجك", caption: "الكثير يقع في هذه الأخطاء:\n1️⃣ التركيز على الكم.\n2️⃣ تجاهل آراء العملاء.\n3️⃣ عدم الاستمرار.\n\nأي نصيحة ستطبقها اليوم؟ 💡" },
      ar_egy: { title: "3 نصايح مهمة عشان تطور نتايجك", caption: "ناس كتير بتقع في الأخطاء دي:\n1️⃣ التركيز على الكم بدل الكيف.\n2️⃣ تجاهل رأي العملاء.\n3️⃣ قلة الاستمرارية.\n\nإيه النصيحة اللي هتطبقها النهاردة؟ 💡" },
      ar_gulf: { title: "3 نصايح مهمة عشان تطور نتايجك", caption: "الكل يطيح بهالأخطاء:\n1️⃣ التركيز على الكمية.\n2️⃣ تجاهل آراء العملاء.\n3️⃣ عدم الاستمرار.\n\nأي نصيحة راح تطبقها اليوم؟ 💡" },
      en: { title: "3 core tips to improve your results", caption: "Many fall into these growth-blocking mistakes:\n1️⃣ Focusing on quantity over quality.\n2️⃣ Ignoring customer feedback.\n3️⃣ Lack of consistency.\n\nCommitment is key to success in any field. Which tip will you apply today? 💡" }
    },
    proof: {
      ar_fusha: { title: "قصة نجاح نفخر بها مع أحد عملائنا", caption: "عندما بدأنا، كانت التوقعات منخفضة.\n\nبتطبيق منهجيتنا، لاحظنا تحولاً جذرياً في أسابيع قليلة.\nالنتائج تتحدث. جاهز لتكون قصة نجاحنا القادمة؟ 🌟" },
      ar_egy: { title: "قصة نجاح بنفخر بيها مع واحد من عملائنا", caption: "لما بدأنا، كانت التوقعات قليلة.\n\nبتطبيق طريقتنا، لاحظنا تغيير جذري في كام أسبوع.\nالنتايج بتتكلم. جاهز تكون قصة نجاحنا الجاية؟ 🌟" },
      ar_gulf: { title: "قصة نجاح نفتخر فيها مع أحد عملائنا", caption: "لما بدينا، كانت التوقعات بسيطة.\n\nبتطبيق طريقتنا، لاحظنا تحول جذري بأسابيع قليلة.\nالنتايج تتكلم. جاهز تكون قصة نجاحنا الياية؟ 🌟" },
      en: { title: "A success story we are proud of", caption: "When we started with this client, expectations were low and challenges were high.\n\nBy applying our methodology, we saw a radical shift in results within weeks.\nResults speak louder than promises. Ready to be our next success story? 🌟" }
    },
    myth: {
      ar_fusha: { title: "أكبر خرافة تسمعها في مجالنا", caption: "البعض يعتقد أن النجاح يحتاج لحظ خارق.\n\nهذا غير صحيح! العمل الجاد هو البطل الحقيقي.\nما هي أكثر خرافة سمعتها؟ ❌" },
      ar_egy: { title: "أكبر خرافة هتسمعها في مجالنا", caption: "في ناس فاكرة إن النجاح محتاج حظ كبير.\n\nده مش صح! الشغل الجاد هو البطل الحقيقي.\nإيه أكتر خرافة سمعتها؟ ❌" },
      ar_gulf: { title: "أكبر خرافة تسمعها بمجالنا", caption: "البعض يعتقد إن النجاح يحتاج حظ قوي.\n\nهذا مو صحيح! الشغل الجاد هو البطل الحقيقي.\nشنو أكبر خرافة سمعتها؟ ❌" },
      en: { title: "The biggest myth in our industry", caption: "There's a common belief that success requires insane luck or shortcuts.\n\nThat's false! Hard work, a clear strategy, and consistency are the real heroes.\n\nWhat's the biggest myth you've heard? ❌" }
    },
    pitch: {
      ar_fusha: { title: "لا تفوت الفرصة للبدء معنا اليوم", caption: "نحن هنا لنقدم لك الحل الأمثل الذي يختصر الوقت.\nتواصل معنا اليوم للبدء فوراً! 🚀" },
      ar_egy: { title: "ماتفوتش الفرصة وابدأ معانا النهاردة", caption: "إحنا هنا عشان نديك الحل الأمثل اللي بيوفر وقتك.\nتواصل معانا النهاردة وابدأ علطول! 🚀" },
      ar_gulf: { title: "لا تفوت الفرصة وابدأ معانا اليوم", caption: "إحنا هني عشان نعطيك الحل الأمثل اللي يختصر وقتك.\nتواصل معانا اليوم وابدأ فوراً! 🚀" },
      en: { title: "Don't miss the chance to start with us today", caption: "The difference between success and stagnation is 'taking action'.\n\nWe are here to provide the ultimate solution that saves you time and effort.\nContact us today or click the link in bio to start immediately! 🚀" }
    }
  }
};

export const generatePostContent = (nicheKey, platform, format, angle, audience = 'general') => {
  const contentMap = NICHE_CONTENT[nicheKey] || NICHE_CONTENT['generic'];
  const content = contentMap[angle] || NICHE_CONTENT['generic'][angle];
  
  const formatPrefix = {
    video: { ar: '🎥 ', en: '🎥 ' },
    carousel: { ar: '🖼️ ', en: '🖼️ ' },
    text: { ar: '📝 ', en: '📝 ' }
  };
  const prefix = formatPrefix[format];

  let tips = { fusha: '', egy: '', gulf: '', en: '' };

  switch (platform) {
    case 'instagram':
      tips.fusha = '\n\n💡 نصيحة إنستجرام: استخدم صور وفيديوهات عالية الجودة واهتم بالجانب الجمالي.';
      tips.egy = '\n\n💡 نصيحة إنستجرام: استخدم صور وفيديوهات جودتها عالية واهتم بشكل البروفايل.';
      tips.gulf = '\n\n💡 نصيحة إنستجرام: استخدم صور وفيديوهات جودتها زينة واهتم بشكل حسابك.';
      tips.en = '\n\n💡 IG Tip: Use high-quality visuals and maintain a consistent aesthetic grid.';
      break;
    case 'tiktok':
      tips.fusha = '\n\n🔥 نصيحة تيك توك: ابدأ بحركة سريعة في أول 3 ثوانٍ واستخدم موسيقى رائجة.';
      tips.egy = '\n\n🔥 نصيحة تيك توك: ابدأ بحركة سريعة في أول 3 ثواني واستخدم مزيكا تريند.';
      tips.gulf = '\n\n🔥 نصيحة تيك توك: ابدأ بحركة سريعة بأول 3 ثواني واستخدم صوت تريند.';
      tips.en = '\n\n🔥 TikTok Tip: Start with fast motion in the first 3 seconds and use trending audio.';
      break;
    case 'linkedin':
      tips.fusha = '\n\n💼 نصيحة لينكد إن: اجعل أسلوبك مهنياً، وركز على الدروس المستفادة وبناء العلاقات.';
      tips.egy = '\n\n💼 نصيحة لينكد إن: خلي أسلوبك بروفيشينال، وركز على الدروس المستفادة وبناء العلاقات.';
      tips.gulf = '\n\n💼 نصيحة لينكد إن: خل أسلوبك مهني، وركز على الدروس المستفادة وبناء العلاقات.';
      tips.en = '\n\n💼 LinkedIn Tip: Keep your tone professional, focus on lessons learned, and network building.';
      break;
    case 'twitter':
      tips.fusha = '\n\n🐦 نصيحة إكس: كن مباشراً ومختصراً. استخدم نظام السلاسل لسرد القصص.';
      tips.egy = '\n\n🐦 نصيحة إكس: خليك مباشر ومختصر. استخدم نظام الثريدز للقصص الطويلة.';
      tips.gulf = '\n\n🐦 نصيحة إكس: خلك مباشر ومختصر. استخدم نظام الثريدز للقصص الطويلة.';
      tips.en = '\n\n🐦 X (Twitter) Tip: Be direct and concise. Use threads for long-form storytelling.';
      break;
    case 'facebook':
      tips.fusha = '\n\n📘 نصيحة فيسبوك: شجع على النقاش في التعليقات لبناء مجتمع تفاعلي قوي.';
      tips.egy = '\n\n📘 نصيحة فيسبوك: شجع النقاش في الكومنتات عشان تبني مجتمع متفاعل.';
      tips.gulf = '\n\n📘 نصيحة فيسبوك: شجع النقاش بالكومنتات عشان تبني مجتمع متفاعل قوي.';
      tips.en = '\n\n📘 Facebook Tip: Encourage discussions in the comments to build a strong interactive community.';
      break;
    case 'youtube':
      tips.fusha = '\n\n▶️ نصيحة يوتيوب: ركز على جودة الصوت أولاً واطلب الاشتراك في النهاية.';
      tips.egy = '\n\n▶️ نصيحة يوتيوب: ركز على جودة الصوت الأول واطلب منهم يشتركوا في الآخر.';
      tips.gulf = '\n\n▶️ نصيحة يوتيوب: ركز على جودة الصوت أول واطلب الاشتراك بالنهاية.';
      tips.en = '\n\n▶️ YouTube Tip: Focus on audio quality first, and add a clear call to subscribe at the end.';
      break;
    case 'snapchat':
      tips.fusha = '\n\n👻 نصيحة سناب شات: اجعل المحتوى عفوياً وسريعاً واستخدم الفلاتر بذكاء.';
      tips.egy = '\n\n👻 نصيحة سناب شات: خلي المحتوى عفوي وسريع واستخدم الفلاتر بذكاء.';
      tips.gulf = '\n\n👻 نصيحة سناب شات: خل المحتوى عفوي وسريع واستخدم الفلاتر بذكاء.';
      tips.en = '\n\n👻 Snapchat Tip: Keep it raw, fast-paced (behind the scenes), and use filters smartly.';
      break;
    case 'pinterest':
      tips.fusha = '\n\n📌 نصيحة بينتريست: استخدم صوراً طولية جذابة مع نصوص واضحة.';
      tips.egy = '\n\n📌 نصيحة بينتريست: استخدم صور بالطول جذابة عليها نصوص واضحة.';
      tips.gulf = '\n\n📌 نصيحة بينتريست: استخدم صور بالطول جذابة وعليها نصوص واضحة.';
      tips.en = '\n\n📌 Pinterest Tip: Use attractive vertical images with clear text overlays (Infographics).';
      break;
  }

  const audienceInjectors = {
    beginners: { ar: '\n\n(هذه الاستراتيجية مثالية جداً للمبتدئين لبناء أساس قوي بخطوات بسيطة، ابدأ بها الآن!)', en: '\n\n(This strategy is highly perfect for beginners to build a strong foundation with simple steps, start now!)' },
    professionals: { ar: '\n\n(تطبيق ذلك سيساعدك كمحترف أو صاحب عمل في تقليل التكاليف ومضاعفة العائد الاستثماري)', en: '\n\n(Applying this helps professionals and business owners reduce costs and maximize ROI)' },
    parents: { ar: '\n\n(لأنك كأب/أم وقتك ثمين جداً، هذا التكتيك سيوفر عليك الكثير من الجهد)', en: '\n\n(As a busy parent, your time is valuable, this tactic will save you a ton of effort)' },
    students: { ar: '\n\n(ركز على تطبيق هذا كطالب لتتمكن من التميز السريع في سوق العمل مستقبلاً)', en: '\n\n(Focus on applying this as a student to stand out quickly in the future job market)' },
    general: { ar: '', en: '' }
  };
  
  const platformToneModifiers = {
    linkedin: { ar: 'في عالم الأعمال: ', en: 'In business: ' },
    tiktok: { ar: 'تريند سريع: ', en: 'Quick trend: ' },
    snapchat: { ar: 'مباشر من الكواليس: ', en: 'Live BTS: ' },
  };

  const getPlatformModifier = (lang) => platformToneModifiers[platform]?.[lang] || '';
  const getAudienceInjector = (lang) => audienceInjectors[audience]?.[lang] || '';

  return {
    title_ar_fusha: `${prefix.ar}${getPlatformModifier('ar')}${content.ar_fusha.title}`,
    caption_ar_fusha: content.ar_fusha.caption + getAudienceInjector('ar') + tips.fusha,
    title_ar_egy: `${prefix.ar}${getPlatformModifier('ar')}${content.ar_egy.title}`,
    caption_ar_egy: content.ar_egy.caption + getAudienceInjector('ar') + tips.egy,
    title_ar_gulf: `${prefix.ar}${getPlatformModifier('ar')}${content.ar_gulf.title}`,
    caption_ar_gulf: content.ar_gulf.caption + getAudienceInjector('ar') + tips.gulf,
    title_en: `${prefix.en}${getPlatformModifier('en')}${content.en.title}`,
    caption_en: content.en.caption + getAudienceInjector('en') + tips.en
  };
};

const generateHooks = (format) => {
  if (format === 'video') {
    return [
      { ar_fusha: 'أوقف التمرير! السر الذي سيغير نتائجك...', ar_egy: 'وقف السكرول! السر اللي هيغير نتايجك...', ar_gulf: 'وقف السكرول! السر اللي بيغير نتايجك...', en: 'Stop scrolling! The secret that...' },
      { ar_fusha: '3 أخطاء مدمرة تفعلها كل يوم...', ar_egy: '3 أخطاء مدمرة بتعملها كل يوم...', ar_gulf: '3 أخطاء مدمرة تسويها كل يوم...', en: '3 destructive mistakes you make daily...' },
      { ar_fusha: 'إذا كنت تعاني من هذا، فالفيديو لك...', ar_egy: 'لو بتعاني من ده، فالفيديو ده ليك...', ar_gulf: 'إذا تعاني من هالشي، فالفيديو لك...', en: 'If you struggle with this, this is for you...' }
    ];
  } else if (format === 'carousel') {
    return [
      { ar_fusha: 'اسحب لليسار لتعرف السر المخفي...', ar_egy: 'اسحب شمال عشان تعرف السر المخفي...', ar_gulf: 'اسحب يسار عشان تعرف السر المخفي...', en: 'Swipe left to know the hidden secret...' },
      { ar_fusha: 'دليل شامل لتغيير مستواك بالكامل ⬅️', ar_egy: 'دليل خطوة بخطوة عشان تغير مستواك ⬅️', ar_gulf: 'دليل خطوة بخطوة عشان تغير مستواك ⬅️', en: 'A step-by-step guide to level up ⬅️' },
      { ar_fusha: 'احفظ هذا المنشور لأنك ستحتاجه لاحقاً 💾', ar_egy: 'احفظ البوست ده عشان هتحتاجه بعدين 💾', ar_gulf: 'احفظ هالبوست لأنك راح تحتاجه بعدين 💾', en: 'Save this post because you will need it later 💾' }
    ];
  } else {
    return [
      { ar_fusha: 'قصة قصيرة بدرس سيوفر عليك سنوات...', ar_egy: 'قصة قصيرة بس فيها درس هيوفر عليك سنين...', ar_gulf: 'قصة قصيرة بس فيها درس يختصر عليك سنين...', en: 'A short story with a lesson that saves years...' },
      { ar_fusha: 'الحقيقة الصادمة التي لا يتحدث عنها أحد...', ar_egy: 'الحقيقة الصادمة اللي محدش بيتكلم عنها...', ar_gulf: 'الحقيقة الصادمة اللي محد يتكلم عنها...', en: 'The shocking truth no one talks about...' },
      { ar_fusha: 'هل فكرت في هذا الأمر من قبل؟ اقرأ للنهاية...', ar_egy: 'فكرت في الموضوع ده قبل كده؟ اقرأ للآخر...', ar_gulf: 'فكرت بهالموضوع من قبل؟ اقرا للنهاية...', en: 'Have you thought about this? Read to the end...' }
    ];
  }
};

export const seedContentPlans = async () => {
  console.log('⏳ Generating & Seeding Content Plans Matrix...');
  try {
    const batchArray = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    const angles = ['story', 'bts', 'edu', 'proof', 'myth', 'pitch'];

    // Loop through all permutations: 10 Niches * 8 Platforms * 3 Formats * 5 Audiences = 1200 Documents
    NICHES.forEach(nicheKey => {
      ['instagram', 'tiktok', 'linkedin', 'twitter', 'facebook', 'youtube', 'snapchat', 'pinterest'].forEach(platform => {
        FORMATS.forEach(format => {
          ['beginners', 'professionals', 'parents', 'students', 'general'].forEach(audience => {
            const docId = `${nicheKey}_${platform}_${format}_${audience}`;
            const posts = angles.map(angle => generatePostContent(nicheKey, platform, format, angle, audience));
            const hooks = generateHooks(format);

            const docData = {
              id: docId,
              niche: nicheKey,
              platform: platform,
              format: format,
              audience: audience,
              posts: posts,
              hooks: hooks
            };

            const docRef = doc(db, COL_CONTENT_PLANS, docId);
            currentBatch.set(docRef, docData);
            opCount++;

            // Firestore allows max 500 writes per batch
            if (opCount === 400) {
              batchArray.push(currentBatch);
              currentBatch = writeBatch(db);
              opCount = 0;
            }
          });
        });
      });
    });

    if (opCount > 0) {
      batchArray.push(currentBatch);
    }

    // Commit all batches
    for (const batch of batchArray) {
      await batch.commit();
    }

    console.log(`✅ Successfully seeded 1200 Content Plans in ${COL_CONTENT_PLANS}`);
    alert('✅ تم تحديث بيانات المنصات الجديدة في قاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('❌ Error seeding Content Plans:', error);
    alert('❌ حدث خطأ أثناء التحديث: ' + error.message);
  }
};
