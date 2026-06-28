import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, collection } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
  authDomain: "event-upklick.firebaseapp.com",
  projectId: "event-upklick",
  storageBucket: "event-upklick.firebasestorage.app",
  messagingSenderId: "430249494103",
  appId: "1:430249494103:web:816e0c03a70d8bf2bb8512"
});
const db = getFirestore(app);

const CONTENT_FRAMEWORKS = [
  {id:'pas',name:'PAS',nameAr:'مشكلة → تضخيم → حل',description:'ابدأ بالمشكلة، ضخّمها عاطفياً، ثم قدّم الحل',steps:['حدد المشكلة بوضوح','وضّح الألم والعواقب','قدّم الحل كبطل القصة'],bestFor:'إعلانات، صفحات هبوط، بوستات بيعية',example:'تصرف ساعات على التصميم؟ → كل ساعة = فلوس ضايعة → أداتنا تختصرها لدقائق',platform:['all'],niches:['all'],goal:'conversion'},
  {id:'aida',name:'AIDA',nameAr:'انتباه → اهتمام → رغبة → فعل',description:'تدرّج من جذب الانتباه إلى دفع الفعل',steps:['اجذب الانتباه بعنوان قوي','اخلق اهتمام بمعلومة مثيرة','ابنِ رغبة بفوائد واضحة','ادعُ للفعل بـ CTA واضح'],bestFor:'إعلانات وكل المحتوى التسويقي',example:'[هوك مثير] → هل تعرف إن...؟ → تخيل لو...! → ابدأ الآن مجاناً',platform:['all'],niches:['all'],goal:'conversion'},
  {id:'storyselling',name:'StorySelling',nameAr:'البيع بالقصة',description:'استخدم قصة حقيقية أو واقعية لتوصيل رسالتك البيعية',steps:['ابدأ بلحظة مؤثرة','اسرد التحدي','أظهر التحول','اربط بالمنتج/الخدمة'],bestFor:'بوستات سوشال ميديا، إيميلات، فيديوهات',example:'قبل 6 أشهر كنت... → واجهت... → ثم اكتشفت... → والنتيجة...',platform:['instagram','linkedin','tiktok'],niches:['all'],goal:'trust'},
  {id:'edutainment',name:'Edutainment',nameAr:'تعليم + ترفيه',description:'علّم جمهورك شيء مفيد بطريقة ممتعة ومسلية',steps:['ابدأ بهوك مثير','قدّم معلومة واحدة واضحة','اختم بسؤال أو CTA خفيف'],bestFor:'Reels, TikTok, Stories',example:'3 أخطاء في الشعار... [بطريقة فكاهية]',platform:['tiktok','instagram'],niches:['all'],goal:'engagement'},
  {id:'listicle',name:'Listicle',nameAr:'قائمة مرقمة',description:'محتوى منظم بأرقام — سهل الاستهلاك وعالي المشاركة',steps:['عنوان واضح بالرقم','كل نقطة = فائدة محددة','آخر نقطة = الأقوى','CTA في النهاية'],bestFor:'كاروسيل، بوستات، مقالات',example:'7 أدوات AI ستغير طريقة شغلك في 2026',platform:['instagram','linkedin'],niches:['all'],goal:'engagement'},
  {id:'comparison',name:'Before/After',nameAr:'قبل وبعد',description:'أظهر التحول بشكل بصري وواضح — أقوى أنواع المحتوى',steps:['صورة/حالة "قبل" واضحة','صورة/حالة "بعد" مثيرة','وضّح ماذا تغير','CTA'],bestFor:'كل المنصات — خصوصاً البصرية',example:'الموقع قبل التصميم → بعد التصميم [صور]',platform:['instagram','tiktok'],niches:['design','fitness','beauty','home'],goal:'trust'},
  {id:'contrarian',name:'Contrarian',nameAr:'الرأي المخالف',description:'خالف الرأي الشائع — يولّد نقاش ويزيد الانتشار',steps:['اذكر الاعتقاد الشائع','قل "أنا أختلف" أو "هذا غلط"','قدّم رأيك بأدلة','ادعُ للنقاش'],bestFor:'LinkedIn, Twitter — بناء Authority',example:'الكل يقول "المحتوى ملك"... أنا أقول المحتوى بدون استراتيجية = ضياع',platform:['linkedin','twitter'],niches:['marketing','business'],goal:'authority'},
];

const AD_STRATEGIES = [
  {id:'awareness-video',type:'Video Ad',typeAr:'إعلان فيديو توعوي',objective:'Awareness',duration:'15-30 ثانية',structure:{hook:'2-3 ثواني — مشكلة صادمة أو سؤال',body:'10-20 ثانية — الحل بوضوح',cta:'3-5 ثواني — خطوة واحدة واضحة'},budget:'$10-30/يوم',bestPlatform:['tiktok','instagram','facebook'],kpi:'CPM, Video Views, Reach',niches:['all'],tip:'أول 3 ثواني = 80% من النجاح'},
  {id:'retargeting',type:'Retargeting',typeAr:'إعادة الاستهداف',objective:'Conversion',duration:'يعتمد',structure:{hook:'ناديهم باسمهم: "لسه تفكر؟"',body:'عرض محدود أو شهادة عميل',cta:'CTA مباشر ومُلحّ'},budget:'$5-15/يوم',bestPlatform:['facebook','instagram','google'],kpi:'ROAS, CPA, Conversion Rate',niches:['all'],tip:'إعلانات الـ Retargeting تحقق 3-5x أعلى تحويل'},
  {id:'ugc-ad',type:'UGC Ad',typeAr:'إعلان محتوى مستخدم',objective:'Trust + Conversion',duration:'30-60 ثانية',structure:{hook:'شخص حقيقي يتكلم عن تجربته',body:'القصة + النتيجة',cta:'جرب بنفسك'},budget:'$15-50/يوم',bestPlatform:['tiktok','instagram'],kpi:'CTR, Conversion Rate',niches:['beauty','fitness','health','fashion','electronics'],tip:'UGC يتفوق على الإعلانات الرسمية بـ 4x في الثقة'},
  {id:'lead-magnet',type:'Lead Magnet Ad',typeAr:'إعلان مغناطيس العملاء',objective:'Lead Generation',duration:'15-30 ثانية',structure:{hook:'هل تعاني من [مشكلة]؟',body:'حمّل الدليل المجاني',cta:'اضغط واحصل مجاناً'},budget:'$10-25/يوم',bestPlatform:['facebook','instagram','linkedin'],kpi:'CPL, Lead Quality',niches:['business','marketing','ai','coding','health'],tip:'الهدية المجانية القيّمة = أرخص طريقة لبناء قائمة عملاء'},
  {id:'carousel',type:'Carousel Ad',typeAr:'إعلان كاروسيل',objective:'Engagement + Conversion',duration:'5-8 صور',structure:{hook:'أول صورة — هوك بصري قوي',body:'كل صورة = فائدة واحدة',cta:'آخر صورة — CTA واضح'},budget:'$10-30/يوم',bestPlatform:['instagram','facebook','linkedin'],kpi:'CTR, Engagement Rate',niches:['all'],tip:'الكاروسيل يحقق 3x engagement مقارنة بالصور العادية'},
];

const PSYCHOLOGY_TRIGGERS = [
  {id:'scarcity',name:'الندرة',nameEn:'Scarcity',description:'لما الشي محدود — الرغبة تزيد',example:'باقي 3 أماكن فقط | العرض ينتهي خلال 24 ساعة',useIn:'عروض، إعلانات، صفحات هبوط',power:'مرتفع جداً',niches:['all']},
  {id:'social-proof',name:'الإثبات الاجتماعي',nameEn:'Social Proof',description:'الناس تتبع الناس — أرقام وشهادات تبني ثقة فورية',example:'انضم لـ 5,000+ عميل راضي | شوف رأي عملائنا',useIn:'صفحات هبوط، إعلانات، بروفايل',power:'مرتفع',niches:['all']},
  {id:'reciprocity',name:'المعاملة بالمثل',nameEn:'Reciprocity',description:'اعطِ أولاً — العميل يحس بالتزام يرد الجميل',example:'دليل مجاني، استشارة مجانية، محتوى قيّم',useIn:'lead magnets، محتوى، أول تواصل',power:'مرتفع',niches:['all']},
  {id:'authority',name:'السلطة',nameEn:'Authority',description:'الخبير يُصدَّق — أثبت خبرتك وسيشتري الناس',example:'خبرة 10 سنوات | معتمد من... | درّبت 500+ شخص',useIn:'بروفايل، عن الشركة، محتوى',power:'مرتفع',niches:['all']},
  {id:'loss-aversion',name:'الخوف من الخسارة',nameEn:'Loss Aversion',description:'الناس تخاف تخسر أكثر ما تحب تكسب',example:'لا تفوّت الفرصة | كل يوم بدون هالأداة = فلوس ضايعة',useIn:'إعلانات، إيميلات، متابعة',power:'مرتفع جداً',niches:['all']},
  {id:'anchoring',name:'التثبيت السعري',nameEn:'Price Anchoring',description:'اعرض السعر العالي أولاً — السعر الحقيقي يبان رخيص',example:'القيمة $500 → سعرك اليوم $97 فقط',useIn:'صفحات مبيعات، عروض',power:'مرتفع',niches:['all']},
  {id:'curiosity-gap',name:'فجوة الفضول',nameEn:'Curiosity Gap',description:'ابدأ بمعلومة ناقصة — العقل يحتاج يكملها',example:'الشيء الوحيد اللي يفرق بين البراند الناجح والفاشل هو...',useIn:'هوكات، عناوين، فيديوهات',power:'مرتفع',niches:['all']},
  {id:'story-bias',name:'تأثير القصة',nameEn:'Story Bias',description:'القصة أقوى من الحقائق — الدماغ يتذكر القصص 22x أكثر',example:'قبل 6 أشهر كنت مفلس... اليوم دخلي $5K/شهر',useIn:'محتوى، إعلانات، صفحات مبيعات',power:'مرتفع جداً',niches:['all']},
];

async function seed() {
  console.log('Seeding content_frameworks...');
  let batch = writeBatch(db);
  CONTENT_FRAMEWORKS.forEach((c, i) => { batch.set(doc(collection(db, 'content_frameworks')), { ...c, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${CONTENT_FRAMEWORKS.length} content frameworks`);

  console.log('Seeding ad_strategies...');
  batch = writeBatch(db);
  AD_STRATEGIES.forEach((a, i) => { batch.set(doc(collection(db, 'ad_strategies')), { ...a, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${AD_STRATEGIES.length} ad strategies`);

  console.log('Seeding psychology_triggers...');
  batch = writeBatch(db);
  PSYCHOLOGY_TRIGGERS.forEach((p, i) => { batch.set(doc(collection(db, 'psychology_triggers')), { ...p, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${PSYCHOLOGY_TRIGGERS.length} psychology triggers`);

  console.log('\n🎉 ALL DONE!');
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
