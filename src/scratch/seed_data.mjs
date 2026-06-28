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

const OFFERS = [
  {id:'tripwire',name:'Tripwire Offer',nameAr:'عرض نقطة الدخول',priceRange:'$7-47',description:'منتج رقمي بسعر منخفض جداً — هدفه كسر حاجز الشراء الأول',psychology:'العميل اللي يدفع $7 أسهل يدفع $97 لاحقاً — كسر حاجز الدفع الأول هو الأصعب',bestFor:['ai','marketing','business','coding'],audience:'beginner',conversionRate:'عالي جداً',risk:'منخفض'},
  {id:'lowticket',name:'Low Ticket',nameAr:'منتج رقمي منخفض',priceRange:'$27-97',description:'كتاب إلكتروني، كورس صغير، أو أداة بسيطة',psychology:'يبني الثقة الأولى ويثبت القيمة — العميل يشوف نتيجة سريعة فيكمل معك',bestFor:['all'],audience:'beginner',conversionRate:'متوسط-عالي',risk:'منخفض'},
  {id:'midticket',name:'Mid Ticket',nameAr:'خدمة متوسطة',priceRange:'$200-500',description:'استشارة، خدمة مخصصة، أو كورس شامل',psychology:'العميل يدفع مقابل خبرة محددة ونتيجة واضحة',bestFor:['business','marketing','design','coding'],audience:'intermediate',conversionRate:'متوسط',risk:'متوسط'},
  {id:'premium',name:'Premium Package',nameAr:'باقة بريميوم',priceRange:'$500-2000',description:'خدمة شاملة مع متابعة ونتائج مضمونة',psychology:'يجذب العملاء الجادين — يدفعون مقابل النتيجة مش الوقت',bestFor:['business','marketing','design','coding','health'],audience:'intermediate',conversionRate:'منخفض-متوسط',risk:'متوسط'},
  {id:'subscription',name:'Subscription',nameAr:'اشتراك شهري',priceRange:'$29-199/شهر',description:'قيمة مستمرة مع دخل متكرر ومستقر',psychology:'يخلق التزام + مجتمع + عادة استخدام — أصعب يلغي من يشتري',bestFor:['ai','coding','marketing','fitness','health'],audience:'all',conversionRate:'متوسط',risk:'منخفض بعد البداية'},
  {id:'transformation',name:'Transformation',nameAr:'برنامج تحول',priceRange:'$2000-10000',description:'رحلة تحول كاملة من A إلى Z مع متابعة مكثفة',psychology:'العميل يشتري النسخة الأفضل من نفسه — مش المنتج',bestFor:['fitness','health','business'],audience:'advanced',conversionRate:'منخفض',risk:'مرتفع'},
  {id:'guarantee',name:'Pay for Results',nameAr:'ادفع عند النتيجة',priceRange:'مرتفع ومتغير',description:'ادفع فقط عند تحقق النتيجة المحددة',psychology:'يزيل المخاطرة بالكامل — الثقة الفورية',bestFor:['marketing','business','coding'],audience:'advanced',conversionRate:'عالي',risk:'مرتفع على المقدم'},
  {id:'bundle',name:'Bundle',nameAr:'حزمة قيمة',priceRange:'متغير',description:'مجموعة منتجات/خدمات بسعر أقل من المفرد',psychology:'إحساس "صفقة العمر" — القيمة المدركة أعلى بكثير من السعر',bestFor:['all'],audience:'all',conversionRate:'عالي',risk:'منخفض'},
];

const BRAND_NAMES = [
  // SHORT & BOLD
  {name:'Vex',style:'short',styleAr:'قصير وجريء',feeling:'قوة، سرعة',audience:'عام',suitableFor:'تقني أو startup',niches:['coding','ai','electronics']},
  {name:'Kova',style:'short',styleAr:'قصير وجريء',feeling:'حداثة، ابتكار',audience:'شباب',suitableFor:'SaaS أو تطبيق',niches:['ai','coding']},
  {name:'Nyx',style:'short',styleAr:'قصير وجريء',feeling:'غموض، تميز',audience:'عام',suitableFor:'براند فاخر',niches:['fashion','beauty']},
  {name:'Flux',style:'short',styleAr:'قصير وجريء',feeling:'تغيير، ديناميكية',audience:'محترفين',suitableFor:'وكالة أو SaaS',niches:['marketing','business']},
  // PREMIUM
  {name:'Lumière',style:'premium',styleAr:'فاخر وراقي',feeling:'نور، فخامة فرنسية',audience:'راقي',suitableFor:'براند عناية أو أزياء',niches:['beauty','fashion']},
  {name:'Aether',style:'premium',styleAr:'فاخر وراقي',feeling:'علو، نقاء، تميز',audience:'محترفين',suitableFor:'تقني فاخر',niches:['ai','coding','electronics']},
  {name:'Meridian',style:'premium',styleAr:'فاخر وراقي',feeling:'دقة، اتجاه، ريادة',audience:'B2B',suitableFor:'استشارات أو وكالة',niches:['business','marketing']},
  {name:'Velour',style:'premium',styleAr:'فاخر وراقي',feeling:'نعومة، فخامة ملموسة',audience:'راقي',suitableFor:'أزياء أو ديكور',niches:['fashion','home']},
  // ARABIC
  {name:'صفوة',style:'arabic',styleAr:'عربي أصيل',feeling:'تميز، اختيار النخبة',audience:'عربي',suitableFor:'خدمات استشارية',niches:['business','marketing']},
  {name:'بيان',style:'arabic',styleAr:'عربي أصيل',feeling:'وضوح، بلاغة، تواصل',audience:'عربي',suitableFor:'محتوى أو تعليم',niches:['marketing','business']},
  {name:'رونق',style:'arabic',styleAr:'عربي أصيل',feeling:'جمال، أناقة طبيعية',audience:'عربي',suitableFor:'عناية أو أزياء',niches:['beauty','fashion']},
  {name:'مسار',style:'arabic',styleAr:'عربي أصيل',feeling:'رحلة، توجيه، هدف',audience:'عربي',suitableFor:'كوتشينج أو تعليم',niches:['business','health','fitness']},
  {name:'أثير',style:'arabic',styleAr:'عربي أصيل',feeling:'سمو، خفة، تميز',audience:'عربي',suitableFor:'تقنية أو إبداع',niches:['ai','design','coding']},
  // STARTUP
  {name:'Stacko',style:'startup',styleAr:'ستارت أب',feeling:'بناء، طبقات، نمو',audience:'مطورين',suitableFor:'أداة تقنية',niches:['coding','ai']},
  {name:'Zestly',style:'startup',styleAr:'ستارت أب',feeling:'طاقة، حيوية، متعة',audience:'شباب',suitableFor:'تطبيق أو خدمة',niches:['fitness','health','beauty']},
  {name:'Crisp',style:'startup',styleAr:'ستارت أب',feeling:'وضوح، نظافة، دقة',audience:'محترفين',suitableFor:'SaaS أو أداة',niches:['marketing','business','design']},
  // EMOTIONAL
  {name:'Bloom',style:'emotional',styleAr:'عاطفي ومؤثر',feeling:'نمو، ازدهار، تفتح',audience:'نساء',suitableFor:'عناية أو صحة',niches:['beauty','health','fitness']},
  {name:'Haven',style:'emotional',styleAr:'عاطفي ومؤثر',feeling:'أمان، راحة، ملاذ',audience:'عائلات',suitableFor:'ديكور أو صحة',niches:['home','health']},
  {name:'Ember',style:'emotional',styleAr:'عاطفي ومؤثر',feeling:'شرارة، بداية، دفء',audience:'عام',suitableFor:'إبداع أو تعليم',niches:['design','business','marketing']},
  // BOLD
  {name:'Titan',style:'bold',styleAr:'جريء ومباشر',feeling:'قوة، ضخامة، هيمنة',audience:'رجال',suitableFor:'لياقة أو تقنية',niches:['fitness','electronics']},
  {name:'Apex',style:'bold',styleAr:'جريء ومباشر',feeling:'قمة، الأفضل، ريادة',audience:'طموحين',suitableFor:'استشارات أو تدريب',niches:['business','marketing','fitness']},
  {name:'Forge',style:'bold',styleAr:'جريء ومباشر',feeling:'صناعة، بناء، قوة',audience:'محترفين',suitableFor:'تقنية أو صناعة',niches:['coding','ai','electronics']},
];

const GROWTH = [
  {id:'referral',title:'نظام الإحالات',titleEn:'Referral System',icon:'🤝',description:'حوّل كل عميل راضي لمصدر عملاء جدد — خصم 10-15% لكل إحالة',impact:'مرتفع',timeToResult:'2-4 أسابيع',cost:'منخفض',difficulty:'سهل',bestFor:['all'],phase:'scale'},
  {id:'organic',title:'المحتوى العضوي',titleEn:'Organic Content',icon:'🌱',description:'3-5 بوستات أسبوعياً — محتوى قيمة حقيقية يجذب جمهور بدون إعلانات',impact:'طويل المدى',timeToResult:'2-6 أشهر',cost:'مجاني',difficulty:'متوسط',bestFor:['all'],phase:'growth'},
  {id:'retainer',title:'عملاء اشتراك شهري',titleEn:'Retainer Clients',icon:'🔄',description:'حوّل مشاريع لمرة واحدة لاشتراكات شهرية — دخل متكرر ومستقر',impact:'مرتفع جداً',timeToResult:'1-3 أشهر',cost:'منخفض',difficulty:'متوسط',bestFor:['coding','design','marketing','business'],phase:'scale'},
  {id:'community',title:'بناء مجتمع',titleEn:'Community Building',icon:'👥',description:'Telegram أو Discord — قيمة مجانية تبني ولاء ثم تبيع',impact:'مرتفع',timeToResult:'3-6 أشهر',cost:'منخفض',difficulty:'متوسط',bestFor:['all'],phase:'growth'},
  {id:'email',title:'التسويق بالبريد',titleEn:'Email Marketing',icon:'📧',description:'تسلسلات بريدية أوتوماتيكية — تبيع وأنت نائم',impact:'مرتفع',timeToResult:'1-2 شهر',cost:'منخفض',difficulty:'متوسط',bestFor:['all'],phase:'growth'},
  {id:'collab',title:'التعاون والشراكات',titleEn:'Collaborations',icon:'🤲',description:'شارك مع براندات مكملة — وصول لجمهور جاهز بدون إعلانات',impact:'متوسط-مرتفع',timeToResult:'2-4 أسابيع',cost:'مجاني',difficulty:'سهل',bestFor:['all'],phase:'growth'},
  {id:'ugc',title:'محتوى المستخدمين',titleEn:'UGC Content',icon:'📸',description:'خلّي عملاءك ينشرون عنك — أقوى من أي إعلان',impact:'مرتفع',timeToResult:'1-3 أشهر',cost:'منخفض',difficulty:'متوسط',bestFor:['beauty','fashion','fitness','home','electronics'],phase:'scale'},
  {id:'seo',title:'تحسين محركات البحث',titleEn:'SEO',icon:'🔍',description:'ترتيب في Google — زيارات مجانية مستمرة بدون إعلانات',impact:'طويل المدى',timeToResult:'3-12 شهر',cost:'متوسط',difficulty:'صعب',bestFor:['coding','ai','business','marketing','health'],phase:'growth'},
];

const CASE_STUDIES = [
  {id:'freelancer-brand',title:'مصمم UI من الصفر إلى $3K/شهر',niche:'design',category:'digital',avatar:'🧑‍💻',
    story:'أحمد — مصمم UI بدأ من غرفته بلابتوب مستعمل',
    phases:[
      {phase:'البداية',duration:'شهر 1-2',actions:['حدد تخصص: UI/UX للتطبيقات','بنى بورتفوليو من 5 مشاريع وهمية','فتح حسابات على 3 منصات فريلانس'],result:'3 عملاء صغار بأسعار منخفضة'},
      {phase:'النمو',duration:'شهر 3-4',actions:['رفع الأسعار 50%','بدأ ينشر محتوى تعليمي','بنى قائمة بريدية'],result:'عميلين ثابتين + 5 مشاريع'},
      {phase:'التوسع',duration:'شهر 5-6',actions:['أطلق باقة شهرية','بنى فريق صغير (مساعد)','ركز على LinkedIn'],result:'$3,000/شهر دخل ثابت'}
    ],
    mistake:'ضيّع 3 أشهر بدون تخصص — يقبل أي شغل بأي سعر',
    lesson:'التخصص الدقيق = أسعار أعلى + عملاء أفضل + تسويق أسهل',
    metrics:{revenue:'$3,000/شهر',clients:7,timeline:'6 أشهر'}},
  {id:'fitness-coach',title:'مدربة لياقة من 200 متابع إلى 50K',niche:'fitness',category:'ecommerce',avatar:'💪',
    story:'سارة — مدربة لياقة بدأت بـ 200 متابع على إنستقرام',
    phases:[
      {phase:'البداية',duration:'شهر 1-3',actions:['Reels يومية — تمارين سريعة','قبل/بعد من عملائها','محتوى تحفيزي بسيط'],result:'5K متابع + 3 عملاء'},
      {phase:'النمو',duration:'شهر 4-6',actions:['أطلقت تحدي 30 يوم مجاني','بنت مجتمع Telegram','بدأت تبيع برنامج تدريبي'],result:'20K متابع + $5K/شهر'},
      {phase:'التوسع',duration:'شهر 7-12',actions:['أطلقت كورس أونلاين','شراكات مع براندات مكملات','وظفت مساعدة'],result:'50K متابع + $8K/شهر'}
    ],
    mistake:'حاولت تبيع من أول يوم بدون بناء ثقة',
    lesson:'اعطِ قيمة 90 يوم ثم ابدأ البيع — الثقة أولاً',
    metrics:{revenue:'$8,000/شهر',followers:'50K',timeline:'12 شهر'}},
  {id:'skincare-brand',title:'براند سكينكير من فكرة إلى 1000 طلب',niche:'beauty',category:'ecommerce',avatar:'✨',
    story:'نورا — أسست براند عناية بالبشرة محلي من شقتها',
    phases:[
      {phase:'البداية',duration:'شهر 1-2',actions:['بحث عن مورد White Label','تصميم تغليف فاخر','إطلاق بـ 3 منتجات فقط'],result:'50 طلب أول شهر'},
      {phase:'النمو',duration:'شهر 3-4',actions:['UGC content من العملاء','إعلانات Instagram بسيطة','توسيع لـ 5 منتجات'],result:'300 طلب/شهر'},
      {phase:'التوسع',duration:'شهر 5-8',actions:['شراكات مع influencers','إطلاق اشتراك شهري','دخول منصات بيع'],result:'1000 طلب في الشهر 8'}
    ],
    mistake:'أنفقت $5K على إعلانات قبل ما تبني محتوى عضوي',
    lesson:'المحتوى العضوي أولاً — الإعلانات تضخم ما ينجح فقط',
    metrics:{revenue:'$15,000/شهر',orders:'1000/شهر',timeline:'8 أشهر'}},
];

async function seed() {
  console.log('Seeding offers...');
  let batch = writeBatch(db);
  OFFERS.forEach((o, i) => { batch.set(doc(collection(db, 'offers')), { ...o, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${OFFERS.length} offers`);

  console.log('Seeding brand_names...');
  batch = writeBatch(db);
  BRAND_NAMES.forEach((n, i) => { batch.set(doc(collection(db, 'brand_names')), { ...n, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${BRAND_NAMES.length} brand names`);

  console.log('Seeding growth_strategies...');
  batch = writeBatch(db);
  GROWTH.forEach((g, i) => { batch.set(doc(collection(db, 'growth_strategies')), { ...g, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${GROWTH.length} growth strategies`);

  console.log('Seeding case_studies...');
  batch = writeBatch(db);
  CASE_STUDIES.forEach((c, i) => { batch.set(doc(collection(db, 'case_studies')), { ...c, createdAt: Date.now(), order: i }); });
  await batch.commit();
  console.log(`✅ ${CASE_STUDIES.length} case studies`);

  console.log('\n🎉 ALL DONE!');
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
