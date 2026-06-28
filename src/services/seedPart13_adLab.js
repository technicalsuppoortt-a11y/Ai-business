import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_ad_creatives_v2';

const products = [
  { id: 'course', name_en: 'Online Course', name_ar: 'كورس تعليمي أونلاين' },
  { id: 'ecom_product', name_en: 'Physical Product (E-com)', name_ar: 'منتج مادي (متجر إلكتروني)' },
  { id: 'saas', name_en: 'Software / App / SaaS', name_ar: 'تطبيق أو برنامج (SaaS)' },
  { id: 'service', name_en: 'Freelance Service', name_ar: 'خدمة مستقل (Freelance)' },
  { id: 'coaching', name_en: 'Coaching / Consulting', name_ar: 'تدريب أو استشارات' },
];

const painPoints = [
  { id: 'no_results', name_en: 'Tried everything, no results', name_ar: 'جرب كل شيء بدون نتائج' },
  { id: 'wasting_money', name_en: 'Wasting money on ads', name_ar: 'يصرف فلوس على إعلانات بدون عائد' },
  { id: 'no_time', name_en: 'No time, overwhelmed', name_ar: 'مشغول جداً وما عنده وقت' },
  { id: 'no_trust', name_en: 'Doesn\'t trust online offers', name_ar: 'لا يثق بالعروض على الإنترنت' },
  { id: 'confused', name_en: 'Confused, too many options', name_ar: 'محتار بين خيارات كثيرة' },
];

const platforms = [
  { id: 'tiktok', name_en: 'TikTok / Reels', name_ar: 'تيك توك / ريلز' },
  { id: 'facebook', name_en: 'Facebook / Instagram', name_ar: 'فيسبوك / إنستجرام' },
  { id: 'youtube', name_en: 'YouTube Ads', name_ar: 'يوتيوب' },
];

const dialects = [
  { id: 'standard', name_en: 'Standard Arabic', name_ar: 'الفصحى' },
  { id: 'egyptian', name_en: 'Egyptian', name_ar: 'المصرية' },
  { id: 'gulf', name_en: 'Gulf', name_ar: 'الخليجية' },
];

const generateAd = (product, pain, platform, dialect) => {
  const isKSA = dialect.id === 'gulf';
  const isEGY = dialect.id === 'egyptian';
  
  // 1. Hook Generation
  const hookMap = {
    no_results: {
      course: { ar: isKSA ? 'تعبت من الكورسات اللي ما منها فايدة؟' : isEGY ? 'زهقت من الكورسات اللي بتدفع فيها فلوس عالفاضي؟' : 'هل مللت من الدورات التدريبية التي لا تقدم لك نتائج حقيقية؟', en: "Tired of courses that don't give real results?" },
      ecom_product: { ar: isKSA ? 'جربت منتجات كثير وكلها خذلتك؟' : isEGY ? 'جربت منتجات كتير وكلها طلعت أي كلام؟' : 'هل جربت العديد من المنتجات دون أي فائدة تذكر؟', en: "Tried many products but nothing works?" },
      saas: { ar: isKSA ? 'تشترك في برامج وتطبيقات وما تستفيد منها؟' : isEGY ? 'بتدفع اشتراكات في برامج ومفيش أي نتيجة؟' : 'هل تشترك في أدوات برمجية لا تعطيك النتيجة المرجوة؟', en: "Paying for software that doesn't deliver?" },
      service: { ar: isKSA ? 'دفعت لمستقلين كثير والنتيجة دايم مخيبة؟' : isEGY ? 'دفعت لـ فريلانسرز كتير وشغلك دايماً بيقف؟' : 'هل استأجرت مستقلين وكانت النتائج دائماً مخيبة للآمال؟', en: "Hired freelancers but always disappointed?" },
      coaching: { ar: isKSA ? 'حضرت استشارات كثير وما تغير شي في البزنس؟' : isEGY ? 'عملت استشارات كتير ومفيش حاجة اتغيرت؟' : 'هل حضرت العديد من الاستشارات ولم يتغير شيء في عملك؟', en: "Paid for coaching but nothing changed in your business?" },
    },
    wasting_money: {
      course: { ar: isKSA ? 'كم صرفت على كورسات ما استفدت منها؟' : isEGY ? 'صرفت كام على كورسات وطلعت فلوسك في الأرض؟' : 'كم أنفقت من الأموال على دورات لم تستفد منها؟', en: "How much did you spend on useless courses?" },
      ecom_product: { ar: isKSA ? 'إعلاناتك تاكل فلوسك بدون مبيعات؟' : isEGY ? 'إعلاناتك بتحرق فلوسك ومفيش مبيعات؟' : 'هل تلتهم الإعلانات ميزانيتك دون تحقيق مبيعات حقيقية؟', en: "Are ads burning your budget with no sales?" },
      saas: { ar: isKSA ? 'تدفع اشتراكات شهرية على الفاضي؟' : isEGY ? 'بتدفع اشتراكات شهرية على الفاضي؟' : 'هل تدفع اشتراكات شهرية لأدوات لا تستخدمها؟', en: "Paying monthly subscriptions for nothing?" },
      service: { ar: isKSA ? 'ميزانيتك تتبخر على خدمات بدون عائد؟' : isEGY ? 'ميزانيتك بتطير على خدمات ومفيش عائد؟' : 'هل تتبخر ميزانيتك على خدمات دون عائد استثماري واضح؟', en: "Budget evaporating on services with no ROI?" },
      coaching: { ar: isKSA ? 'استثمرت في مدربين والنتيجة صفر؟' : isEGY ? 'دفعت لمدربين والنتيجة صفر؟' : 'هل استثمرت في مدربين وكانت النتيجة صفراً؟', en: "Invested in coaches with zero results?" },
    },
    no_time: {
      course: { ar: isKSA ? 'مشغول وما عندك وقت تتعلم؟' : isEGY ? 'مشغول لدرجة إنك مش لاقي وقت تتعلم؟' : 'هل أنت مشغول جداً ولا تملك وقتاً للتعلم؟', en: "Too busy to learn?" },
      ecom_product: { ar: isKSA ? 'ما عندك وقت تبحث عن المنتج الصح؟' : isEGY ? 'مش لاقي وقت تدور على المنتج الصح؟' : 'هل تفتقر للوقت للبحث عن المنتج المناسب؟', en: "No time to find the right product?" },
      saas: { ar: isKSA ? 'تضيع ساعات يومياً على مهام روتينية؟' : isEGY ? 'بتضيع ساعات كل يوم في حاجات روتينية؟' : 'هل تضيع ساعات يومياً في مهام يمكن أتمتتها؟', en: "Wasting hours daily on routine tasks?" },
      service: { ar: isKSA ? 'مشغول وما تلحق تسوي كل شي لحالك؟' : isEGY ? 'مضغوط ومش ملاحق تعمل كل حاجة بنفسك؟' : 'هل أنت منشغل لدرجة لا تسمح لك بالقيام بكل المهام وحدك؟', en: "Too overwhelmed to do everything yourself?" },
      coaching: { ar: isKSA ? 'تحس إنك تركض بدون اتجاه؟' : isEGY ? 'حاسس إنك بتجري في ساقية ومفيش طريق واضح؟' : 'هل تشعر أنك تدور في حلقة مفرغة دون توجيه؟', en: "Feeling like you're running with no direction?" },
    },
    no_trust: {
      course: { ar: isKSA ? 'خايف تشتري كورس ثاني ويطلع سوالف؟' : isEGY ? 'خايف تشتري كورس تاني ويطلع أي كلام؟' : 'هل تخشى شراء دورة أخرى وتكون مجرد كلام نظري؟', en: "Afraid to buy another course full of fluff?" },
      ecom_product: { ar: isKSA ? 'تطلب أونلاين ويجيك شي مختلف عن الصورة؟' : isEGY ? 'بتطلب أونلاين وتتفاجئ بحاجة تانية خالص؟' : 'هل تخشى أن تطلب منتجاً ويصلك مختلفاً عن الصورة الموعودة؟', en: "Scared to order online and get something different?" },
      saas: { ar: isKSA ? 'ما تثق بالأدوات الجديدة وتخاف على بياناتك؟' : isEGY ? 'مش بتثق في البرامج الجديدة وخايف على شغلك؟' : 'هل لا تثق بالأدوات الجديدة وتخشى على أمان بياناتك؟', en: "Don't trust new tools with your data?" },
      service: { ar: isKSA ? 'سمعت قصص رعب عن مستقلين يختفون؟' : isEGY ? 'سمعت قصص رعب عن فريلانسرز بياخدوا الفلوس ويختفوا؟' : 'هل تخشى التعامل مع مستقلين يختفون بعد استلام الدفعة؟', en: "Heard horror stories of freelancers disappearing?" },
      coaching: { ar: isKSA ? 'شاكك إن كل المدربين يبيعون وهم؟' : isEGY ? 'حاسس إن كل المدربين بيبيعوا الوهم؟' : 'هل تشك في أن بعض المدربين يبيعون الوهم بدلاً من القيمة؟', en: "Doubting coaches who sell fake dreams?" },
    },
    confused: {
      course: { ar: isKSA ? 'في ألف كورس... وما تدري وش تختار؟' : isEGY ? 'الكورسات كتير.. ومش عارف تختار إيه ولا تبدأ منين؟' : 'هناك آلاف الدورات... هل تشعر بالحيرة في الاختيار؟', en: "Thousands of courses... don't know what to choose?" },
      ecom_product: { ar: isKSA ? 'المنتجات كثير والمراجعات تلخبط... أيهم الصح؟' : isEGY ? 'المنتجات كتير والريفيوهات تلخبط... أيهم الصح؟' : 'الخيارات كثيرة والمراجعات متناقضة... كيف تختار؟', en: "Too many options and conflicting reviews?" },
      saas: { ar: isKSA ? 'كل يوم تطلع أداة جديدة وضعت بينهم؟' : isEGY ? 'كل يوم برنامج جديد وتوهت في وسطهم؟' : 'كل يوم تظهر أداة جديدة... هل ضللت الطريق بينهم؟', en: "A new tool every day... feeling lost?" },
      service: { ar: isKSA ? 'عروض من كل مكان وما تدري مين الأفضل؟' : isEGY ? 'عروض من كل مكان ومش عارف مين أحسن حد؟' : 'تتلقى عروضاً من كل مكان ولا تدري أيهم الأفضل؟', en: "Getting offers from everywhere... who is the best?" },
      coaching: { ar: isKSA ? 'كل مدرب يقول طريقته هي الأصح... مين تصدق؟' : isEGY ? 'كل مدرب يقول طريقتي هي الصح... مين تصدق؟' : 'كل مدرب يدعي أن طريقته هي الأصح... من تصدق؟', en: "Every coach claims their method is the best... who to believe?" },
    },
  };

  const hookObj = hookMap[pain.id]?.[product.id] || { 
    ar: isKSA ? 'تبي تحل مشكلتك بسرعة؟' : isEGY ? 'عايز تحل مشكلتك بأسرع وقت؟' : 'هل ترغب في حل مشكلتك بأسرع وقت؟', 
    en: "Want to solve your problem fast?" 
  };
  const hookStr = hookObj.ar;
  const hookStrEn = hookObj.en;

  // 2. Body Generation based on Platform and Dialect
  let scriptBody = '';
  let scriptBodyEn = '';
  
  if (platform.id === 'tiktok') {
    // Short-form vertical video (TikTok/Reels)
    const intro = isKSA ? `[ثانية 0-3]: "${hookStr}"\n[ثانية 3-8]: شوف، أنا كنت في نفس مكانك وعانيت من نفس الشي...` 
                : isEGY ? `[ثانية 0-3]: "${hookStr}"\n[ثانية 3-8]: بص، أنا كنت زيك بالظبط ولفيت كتير لحد ما تعبت...` 
                : `[ثانية 0-3]: "${hookStr}"\n[ثانية 3-8]: اسمعني جيداً، لقد مررت بنفس التجربة وعانيت من نفس المشكلة تماماً...`;
    
    const introEn = `[Sec 0-3]: "${hookStrEn}"\n[Sec 3-8]: Listen, I was in your shoes and struggled with the exact same thing...`;
    
    const body = isKSA ? `[ثانية 8-15]: بس الحل طلع بسيط مع ${product.name_ar}. الفكرة مو إنك تشتغل أكثر، الفكرة إنك تشتغل بذكاء.\n📌 أهم مميزاته:\n- سريع ما ياخذ من وقتك.\n- مبني على نتائج حقيقية مو نظريات.\n- يختصر عليك شهور من التجربة والخطأ.` 
               : isEGY ? `[ثانية 8-15]: بس الحل طلع أسهل مما تتخيل مع ${product.name_ar}. الفكرة مش إنك تتعب أكتر، الفكرة إنك تشتغل بذكاء.\n📌 أهم مميزاته:\n- سريع ومش هياخد من وقتك خالص.\n- متجرب وبيجيب من الآخر.\n- هيوفر عليك شهور من اللف والدوران.` 
               : `[ثانية 8-15]: لكن الحل كان أسهل مما نتخيل مع ${product.name_ar}. الفكرة ليست في العمل بجهد أكبر، بل بذكاء أكبر.\n📌 أهم المميزات:\n- سريع ولا يستهلك وقتك الثمين.\n- مبني على دراسات ونتائج فعلية.\n- يختصر عليك شهوراً من التجربة والخطأ.`;
               
    const bodyEn = `[Sec 8-15]: But the solution was easier than you think with ${product.name_en}. It's not about working harder, it's working smarter.\n📌 Top features:\n- Fast and saves your time.\n- Backed by real results.\n- Saves you months of trial and error.`;
               
    const proof = isKSA ? `[ثانية 15-22]: (أضف لقطات من الشاشة لنتائج حقيقية أو شهادات) ⬅️ "هذي نتائج ناس جربوها قبلك وشوف كيف تغير وضعهم!"` 
                : isEGY ? `[ثانية 15-22]: (حط لقطات شاشة أو ريفيوهات) ⬅️ "ودي نتائج ناس جربوها قبلك وشوف الفرق بنفسك!"` 
                : `[ثانية 15-22]: (أضف لقطات من الشاشة توضح الأدلة) ⬅️ "هذه نتائج حقيقية لأشخاص جربوا الخدمة وتغير مسارهم بالكامل."`;
                
    const proofEn = `[Sec 15-22]: (Add screenshots of real results) ⬅️ "These are real results from people who tried it!"`;
                
    const cta = isKSA ? `[ثانية 22-30]: لا تضيع وقتك أكثر، اضغط على الرابط في البايو واكتشف الحل بنفسك قبل انتهاء العرض المحدود!` 
              : isEGY ? `[ثانية 22-30]: ما تضيعش وقتك أكتر من كدة، دوس على الرابط اللي في البايو واكتشف الحل بنفسك قبل العرض ما يخلص!` 
              : `[ثانية 22-30]: لا تهدر المزيد من الوقت، انقر على الرابط في البايو واكتشف الحل بنفسك قبل انتهاء العرض!`;
              
    const ctaEn = `[Sec 22-30]: Don't waste more time, click the link in bio and discover the solution before the limited offer ends!`;
              
    scriptBody = `${intro}\n\n${body}\n\n${proof}\n\n${cta}`;
    scriptBodyEn = `${introEn}\n\n${bodyEn}\n\n${proofEn}\n\n${ctaEn}`;
    
  } else if (platform.id === 'facebook') {
    // Facebook/Instagram Text + Carousel
    const hookLine = isKSA ? `🔥 ${hookStr}\n\nأغلب الناس في مجالنا يواجهون نفس التحدي، والسبب إنهم يستخدمون طرق تقليدية ما عادت تنفع اليوم.` 
                   : isEGY ? `🔥 ${hookStr}\n\nأغلب الناس في مجالنا عندهم نفس المشكلة دي، والسبب إنهم لسه ماشيين بطرق قديمة مبقتش تجيب همها.` 
                   : `🔥 ${hookStr}\n\nمعظم الأشخاص في هذا المجال يواجهون التحدي ذاته، والسبب هو الاعتماد على أساليب تقليدية لم تعد فعالة اليوم.`;

    const hookLineEn = `🔥 ${hookStrEn}\n\nMost people in our industry face this exact challenge, because they rely on outdated methods.`;

    const bodyLine = isKSA ? `💡 لكن الحل موجود! مع ${product.name_ar}، قدرنا نحل هذي المشكلة بطريقة ذكية وعملية:\n\n✅ [الميزة الأولى]: تخلصك من الجهد اليدوي.\n✅ [الميزة الثانية]: توفر ميزانيتك وتحمي فلوسك.\n✅ [الميزة الثالثة]: تعطيك نتائج ملموسة من أول أسبوع.`
                   : isEGY ? `💡 بس الحل موجود ومضمون! مع ${product.name_ar}، قدرنا نحل المشكلة دي بطريقة ذكية جداً:\n\n✅ [الميزة الأولى]: هتخلصك من التعب والمجهود اليدوي.\n✅ [الميزة الثانية]: هتوفر ميزانيتك وتحافظ على فلوسك.\n✅ [الميزة الثالثة]: هتديك نتيجة على طول من أول أسبوع.`
                   : `💡 لكن الحل أصبح متاحاً! من خلال ${product.name_ar}، تمكنا من حل هذه المعضلة بأسلوب ذكي ومبتكر:\n\n✅ [الميزة الأولى]: تقضي على الجهد اليدوي المكرر.\n✅ [الميزة الثانية]: تحمي ميزانيتك من الهدر.\n✅ [الميزة الثالثة]: تقدم لك نتائج ملموسة من الأسبوع الأول.`;

    const bodyLineEn = `💡 But the solution is here! With ${product.name_en}, we solved this smartly:\n\n✅ [Feature 1]: Eliminates manual effort.\n✅ [Feature 2]: Protects your budget.\n✅ [Feature 3]: Gives tangible results from week one.`;

    const proofLine = isKSA ? `📈 مو بس كلام! [اسم العميل] كان يعاني من نفس الشي بالضبط، وبعد تجربته قدر يحقق [اكتب النتيجة المذهلة هنا].`
                    : isEGY ? `📈 ومش بس كلام! [اسم العميل] كان عنده نفس المشكلة بالظبط، وبعد التجربة قدر يوصل لـ [اكتب النتيجة المذهلة هنا].`
                    : `📈 وهذا ليس مجرد ادعاء! [اسم العميل] كان يعاني من نفس المشكلة، وبعد تجربته حقق [اكتب النتيجة المذهلة هنا].`;

    const proofLineEn = `📈 Not just claims! [Client Name] had the same issue, and after trying it, achieved [Incredible Result].`;

    const ctaLine = isKSA ? `👇 اضغط على الرابط تحت واعرف كل التفاصيل. العرض متاح لفترة جداً محدودة!`
                  : isEGY ? `👇 دوس على الرابط تحت واعرف كل التفاصيل. العرض ده متاح لفترة محدودة جداً!`
                  : `👇 انقر على الرابط أدناه لمعرفة كافة التفاصيل. العرض متاح لفترة محدودة حصرياً!`;

    const ctaLineEn = `👇 Click the link below to get all details. Offer available for a very limited time!`;

    scriptBody = `**السطر الافتتاحي (Hook):**\n${hookLine}\n\n**الفقرة الثانية (العرض والحل):**\n${bodyLine}\n\n**الفقرة الثالثة (الإثبات):**\n${proofLine}\n\n**الدعوة للإجراء (CTA):**\n${ctaLine}`;
    scriptBodyEn = `**Hook:**\n${hookLineEn}\n\n**Body & Solution:**\n${bodyLineEn}\n\n**Social Proof:**\n${proofLineEn}\n\n**Call To Action (CTA):**\n${ctaLineEn}`;
    
  } else {
    // YouTube
    const intro = isKSA ? `[ثانية 0-5]: "${hookStr}"\n[ثانية 5-15]: إذا كنت تتابع هذا الفيديو، فأنا متأكد إنك تبحث عن مخرج لهذي الدوامة اللي تستنزف وقتك وجهدك.` 
                : isEGY ? `[ثانية 0-5]: "${hookStr}"\n[ثانية 5-15]: لو إنت بتتفرج على الفيديو ده، فأنا متأكد إنك بتدور على مخرج من الدوامة دي اللي بتسحب وقتك ومجهودك.` 
                : `[ثانية 0-5]: "${hookStr}"\n[ثانية 5-15]: إذا كنت تشاهد هذا الفيديو الآن، فأنا على يقين أنك تبحث عن مخرج لهذه الدوامة التي تستنزف وقتك وطاقتك.`;

    const introEn = `[Sec 0-5]: "${hookStrEn}"\n[Sec 5-15]: If you are watching this, I'm sure you are looking for a way out of this cycle.`;

    const body = isKSA ? `[ثانية 15-45]: (اشرح المشكلة بعمق وتعاطف)\nالخيبة مو بإنك تفشل، الخيبة إنك تعيد نفس الغلط. لذلك صممنا ${product.name_ar} ليكون هو الحل الجذري.\n[ثانية 45-90]: (استعرض 3 نقاط قوة)\n1. ما يحتاج خبرة مسبقة.\n2. يعطيك اختصار للطريق.\n3. يوفر عليك آلاف الريالات اللي تضيع على الفاضي.` 
               : isEGY ? `[ثانية 15-45]: (اشرح المشكلة بتعاطف)\nالمشكلة مش إنك تغلط، المشكلة إنك تعيد نفس الغلطة. عشان كده عملنا ${product.name_ar} عشان يكون هو الحل النهائي.\n[ثانية 45-90]: (استعرض 3 نقط قوة)\n1. مش محتاج خبرة خالص.\n2. بيديك الخلاصة ويوفر عليك الطريق.\n3. هيوفر لك آلاف الجنيهات اللي بتطير عالفاضي.` 
               : `[ثانية 15-45]: (اشرح المشكلة بعمق)\nالمشكلة ليست في التعثر، بل في تكرار المحاولة بنفس الأدوات الخاطئة. لذلك طوّرنا ${product.name_ar} ليكون حلك الجذري.\n[ثانية 45-90]: (استعرض 3 نقاط قوة)\n1. لا يتطلب خبرة مسبقة.\n2. يوفر لك اختصاراً للطريق.\n3. يحمي أموالك من الهدر.`;

    const bodyEn = `[Sec 15-45]: (Explain problem deeply)\nThe issue isn't failing, it's repeating the same mistake. That's why we built ${product.name_en} as your ultimate solution.\n[Sec 45-90]: (Show 3 strengths)\n1. No prior experience needed.\n2. Gives you a shortcut.\n3. Saves you thousands of wasted dollars.`;

    const cta = isKSA ? `[ثانية 90-120]: (التعامل مع الاعتراضات)\nيمكن تقول الحين: "هل هذا يناسبني شخصياً؟". الجواب موجود في الرابط اللي تحت الفيديو.\n[ثانية 120-150]: اضغط على الرابط الآن، احجز مقعدك أو اطلب نسختك وتأكد إن هذا القرار هو الأفضل لك اليوم.` 
              : isEGY ? `[ثانية 90-120]: (التعامل مع الاعتراضات)\nممكن تكون بتسأل نفسك دلوقتي: "هل ده فعلاً هينفعني؟". الإجابة كلها في الرابط اللي تحت الفيديو.\n[ثانية 120-150]: دوس على الرابط دلوقتي، احجز مكانك أو اطلب نسختك واتأكد إن ده أفضل قرار هتاخده النهاردة.` 
              : `[ثانية 90-120]: (التعامل مع الاعتراضات)\nربما تتساءل الآن: "هل هذا مناسب لظروفي الخاصة؟". الإجابة التفصيلية تجدها في الرابط أسفل الفيديو.\n[ثانية 120-150]: انقر على الرابط الآن، واضمن فرصتك لتغيير مسارك بشكل حقيقي اليوم.`;
              
    const ctaEn = `[Sec 90-120]: (Handle objections)\nYou might ask: "Will this work for me?". The detailed answer is in the link below.\n[Sec 120-150]: Click the link now, secure your spot and make the best decision today.`;
              
    scriptBody = `${intro}\n\n${body}\n\n${cta}`;
    scriptBodyEn = `${introEn}\n\n${bodyEn}\n\n${ctaEn}`;
  }

  // 3. Visuals & CTA
  const visualMap = {
    tiktok: {
      ar: isKSA ? 'فيديو عمودي (9:16) — تصوير بكاميرا الجوال المباشرة لزيادة المصداقية — إضافة نصوص كبيرة ديناميكية على الشاشة — تغيير الزاوية كل 3 ثواني لشد الانتباه.'
        : isEGY ? 'فيديو بالطول (9:16) — تصوير بالموبايل كأنك بتكلم صاحبك لزيادة الثقة — نصوص بتتحرك بسرعة على الشاشة — غير الكادر كل 3 ثواني.'
        : 'فيديو رأسي عالي الوضوح — تحدث مباشرة للكاميرا بأسلوب عفوي — استخدم نصوصاً كبيرة وجذابة — قم بتغيير المشهد كل 3 ثوانٍ.',
      en: "Vertical video (9:16) — Shoot with phone camera for authenticity — Add dynamic text on screen — Change angle every 3 seconds."
    },
    facebook: {
      ar: isKSA ? 'صورة واحدة بتصميم نظيف أو كاروسيل (3-5 صور): الشريحة الأولى تركز على الألم بصورة قوية، الشريحة الثانية تقدم الحل، والأخيرة دعوة صريحة للرابط.'
        : isEGY ? 'صورة واحدة تصميمها نضيف جداً أو كاروسيل: أول صورة تخبط في المشكلة على طول، تاني صورة فيها الحل، والأخيرة فيها الـ CTA.'
        : 'تصميم جرافيك احترافي أو مجموعة صور (Carousel): تبدأ بصورة تعكس المشكلة، تليها صور توضح الحل ببساطة، وتنتهي بدعوة واضحة لاتخاذ إجراء.',
      en: "Clean single image or Carousel (3-5 images): First slide hits the pain point, second slide shows the solution, last slide is a clear CTA."
    },
    youtube: {
      ar: isKSA ? 'فيديو أفقي (16:9) — في أول 5 ثواني لازم يكون وجهك قريب من الكاميرا وتتكلم بحماس — استخدم لقطات جانبية (B-roll) توضح منتجك في الاستخدام — إضاءة سينمائية.'
        : isEGY ? 'فيديو بالعرض (16:9) — أول 5 ثواني لازم تخطف العين، اتكلم بثقة وحماس — دخل لقطات توضيحية (B-roll) للمنتج — اهتم بجودة الصوت والإضاءة.'
        : 'فيديو أفقي بجودة عالية — ابدأ بلقطة قريبة لوجهك لتأسيس الثقة — استخدم لقطات توضيحية (B-Roll) للحل — تأكد من جودة الإضاءة والصوت الاحترافي.',
      en: "Horizontal video (16:9) — First 5 seconds close up speaking enthusiastically — Use B-roll showing product — Cinematic lighting."
    }
  };

  const ctaMap = {
    course: { ar: isKSA ? 'سجل الحين — العرض لأول 50 مشترك بس' : isEGY ? 'سجل دلوقتي — الخصم لأول 50 مشترك بس' : 'سجل الآن — العرض متاح لأول 50 مشتركاً فقط', en: "Register Now — Offer for first 50 only" },
    ecom_product: { ar: isKSA ? 'اطلب الحين + شحن مجاني لفترة محدودة' : isEGY ? 'اطلب دلوقتي + شحن مجاني لفترة محدودة' : 'اطلب الآن واستفد من الشحن المجاني لفترة محدودة', en: "Order Now + Free Shipping for a limited time" },
    saas: { ar: isKSA ? 'ابدأ تجربتك المجانية 14 يوم — بدون بطاقة بنكية' : isEGY ? 'ابدأ تجربتك المجانية 14 يوم — من غير كريدت كارد' : 'ابدأ تجربتك المجانية لمدة 14 يوماً — دون بطاقة ائتمان', en: "Start 14-Day Free Trial — No credit card required" },
    service: { ar: isKSA ? 'احجز مكالمة استشارية مجانية الآن' : isEGY ? 'احجز مكالمة استشارة مجانية دلوقتي' : 'احجز استشارتك المجانية الآن', en: "Book your free consultation call now" },
    coaching: { ar: isKSA ? 'سجل في الجلسة التجريبية قبل اكتمال العدد' : isEGY ? 'احجز الجلسة التجريبية قبل ما العدد يكتمل' : 'سجل في الجلسة التجريبية قبل اكتمال المقاعد', en: "Register for a trial session before seats fill up" },
  };

  const adAngles = [
    { angle_ar: isKSA ? 'زاوية الألم والحل (PAS)' : isEGY ? 'زاوية الوجع والحل (PAS)' : 'زاوية المشكلة والحل (PAS)', 
      desc_ar: isKSA ? `ركز على تضخيم الإحساس بمشكلة (${pain.name_ar})، وبعدين دخل ${product.name_ar} كمنقذ وبطل للقصة.` 
             : isEGY ? `دوس على المشكلة أوي ووضح تعب العميل من (${pain.name_ar})، وبعدين دخل ${product.name_ar} كأنه الحل السحري.`
             : `قم بتضخيم مشكلة (${pain.name_ar}) بشكل عميق، ثم قدم ${product.name_ar} كالحل المنقذ والنهائي.`,
      angle_en: "Problem-Agitate-Solve (PAS)",
      desc_en: `Amplify the pain of (${pain.name_en}), then introduce ${product.name_en} as the hero solution.` },
             
    { angle_ar: isKSA ? 'زاوية المقارنة (قبل وبعد)' : isEGY ? 'زاوية المقارنة (قبل وبعد)' : 'زاوية المقارنة (قبل وبعد)', 
      desc_ar: isKSA ? `سوي مقارنة واضحة: حياة العميل كيف كانت معاناته قبل، وكيف صارت سهلة ومريحة بعد استخدام ${product.name_ar}.`
             : isEGY ? `اعمل مقارنة سريعة: حياة العميل كانت معقدة إزاي قبل، وبقت سهلة وبتنجز إزاي بعد ${product.name_ar}.`
             : `اعرض مقارنة واضحة بين حياة العميل قبل استخدام الحل، والسهولة التي سيحصل عليها بعد استخدام ${product.name_ar}.`,
      angle_en: "Before & After",
      desc_en: `Show a clear comparison of the customer's struggle before, and how easy life is after ${product.name_en}.` },
             
    { angle_ar: isKSA ? 'زاوية رأي العميل (UGC)' : isEGY ? 'زاوية رأي العميل (UGC)' : 'زاوية الدليل الاجتماعي (UGC)', 
      desc_ar: isKSA ? `خل عميل حقيقي أو ممثل يصور سيلفي وهو يحكي قصته وكيف إنه ارتاح من مشكلة ${pain.name_ar} بفضلكم.`
             : isEGY ? `هات فيديو لعميل أو ممثل بيتكلم بتلقائية من موبايله وبيحكي إزاي قدر يخلص من مشكلة ${pain.name_ar} بسببكم.`
             : `استخدم مقطعاً عفوياً لعميل حقيقي يشرح كيف تغيرت تجربته وتخلص من معضلة ${pain.name_ar} بفضل ${product.name_ar}.`,
      angle_en: "User Generated Content (UGC)",
      desc_en: `Use a selfie-style video of a real client talking naturally about how they escaped ${pain.name_en} using your product.` },
             
    { angle_ar: isKSA ? 'زاوية كسر المعتقدات' : isEGY ? 'زاوية كسر الخرافات' : 'زاوية كسر المعتقدات الخاطئة', 
      desc_ar: isKSA ? `"أكبر كذبة صدقناها عن ${product.name_ar} هي..." — اكسر الفكرة الغلط اللي تمنع العميل يشتري.`
             : isEGY ? `"أكبر كذبة منتشرة في السوق عن ${product.name_ar} هي..." — دمر المانع النفسي اللي بيخلي العميل يتردد.`
             : `"أكبر معتقد خاطئ حول ${product.name_ar} هو..." — فند المخاوف التي تمنع العميل من اتخاذ القرار.`,
      angle_en: "Busting Myths",
      desc_en: `"The biggest lie about ${product.name_en} is..." — destroy the psychological barrier stopping the customer.` },
             
    { angle_ar: isKSA ? 'زاوية الاستعجال والفرصة' : isEGY ? 'زاوية الفرصة الضايعة (FOMO)' : 'زاوية الإلحاح والندرة (Urgency)', 
      desc_ar: isKSA ? `اعتمد على الخوف من تفويت الفرصة: "العرض يقفل خلال 48 ساعة فقط!" لتحفيز اللي مترددين.`
             : isEGY ? `العب على الإحساس بتضييع الفرصة: "الخصم ده اخره 48 ساعة بس!" عشان تجيب العميل اللي مكسل.`
             : `استخدم محفز الندرة والإلحاح: "هذا العرض ينتهي خلال 48 ساعة!" لدفع المترددين لاتخاذ إجراء فوري.`,
      angle_en: "Urgency & FOMO",
      desc_en: `Play on the fear of missing out: "This offer closes in 48 hours!" to push hesitant buyers.` },
  ];

  const tipMap = {
    gulf: `💎 نصيحة ذهبية للسوق الخليجي: ركز على جودة الإنتاج العالية في الإعلانات، واللغة الواضحة اللي تعطي انطباع بالثقة (Premium Feel). استخدم الـ UGC بشكل مكثف لأنه الأفضل بالتحويل.`,
    egyptian: `💎 نصيحة ذهبية للسوق المصري: خلي الإعلان سريع، مباشر، وإيقاعه عالي. السر هنا في الـ Hook القوي جداً في أول ثانية لأن المشاهد المصري بيقلب بسرعة لو حس بملل.`,
    standard: `💎 نصيحة ذهبية: اللغة الفصحى ممتازة للمشاريع التي تستهدف كامل الوطن العربي أو الخدمات B2B. احرص على استخدام كلمات بسيطة وقوية وتجنب التكلف اللغوي لتصل الرسالة بسلاسة.`,
    en: `💎 Pro Tip: Ensure your ad matches the platform's native style. Use strong hooks in the first 3 seconds to maximize retention.`
  };

  return {
    hook_ar: hookStr,
    hook_en: hookStrEn,
    script_ar: scriptBody,
    script_en: scriptBodyEn,
    visual_ar: visualMap[platform.id].ar,
    visual_en: visualMap[platform.id].en,
    cta_ar: ctaMap[product.id].ar,
    cta_en: ctaMap[product.id].en,
    ad_angles: adAngles,
    tip_ar: tipMap[dialect.id] || tipMap.standard,
    tip_en: tipMap.en,
  };
};

export const seedAdCreativesV2 = async () => {
  console.log('🌱 Generating Ad Creatives V2 Matrix with Dialects (225 Scenarios)...');
  let count = 0;

  await setDoc(doc(db, COL, 'structure_def'), {
    id: 'structure_def', products, painPoints, platforms, dialects
  });

  for (const product of products) {
    for (const pain of painPoints) {
      for (const platform of platforms) {
        for (const dialect of dialects) {
          const docId = `${product.id}_${pain.id}_${platform.id}_${dialect.id}`;
          const content = generateAd(product, pain, platform, dialect);
          await setDoc(doc(db, COL, docId), {
            id: docId, 
            product: product.id, 
            painPoint: pain.id, 
            platform: platform.id,
            dialect: dialect.id,
            content, 
            updatedAt: new Date().toISOString(),
          });
          count++;
        }
      }
    }
  }
  console.log(`✅ Seeded ${count} Ad Creative Scenarios to '${COL}'`);
  return count;
};
