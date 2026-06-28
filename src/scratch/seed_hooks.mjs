import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
  authDomain: "event-upklick.firebaseapp.com",
  projectId: "event-upklick",
  storageBucket: "event-upklick.firebasestorage.app",
  messagingSenderId: "430249494103",
  appId: "1:430249494103:web:816e0c03a70d8bf2bb8512"
});
const db = getFirestore(app);

const HOOKS = [
  // ===== CURIOSITY =====
  {text:'ليش 90% من البراندات تفشل في أول سنة؟',emotion:'curiosity',tone:'questioning',platform:'all',audience:'beginner',goal:'awareness',viralScore:8,niches:['all']},
  {text:'الشيء الوحيد اللي يفرق بين البراند الناجح والفاشل...',emotion:'curiosity',tone:'mysterious',platform:'instagram',audience:'all',goal:'engagement',viralScore:9,niches:['all']},
  {text:'لو عرفت هالمعلومة من سنة، كان وفرت على نفسي $10,000',emotion:'curiosity',tone:'personal',platform:'all',audience:'intermediate',goal:'authority',viralScore:7,niches:['all']},
  {text:'3 أشياء ما حد يقولك عنها قبل ما تبدأ مشروعك',emotion:'curiosity',tone:'insider',platform:'tiktok',audience:'beginner',goal:'awareness',viralScore:9,niches:['business','marketing']},
  {text:'السر اللي يخلي عميلك يشتري بدون ما تبيعه',emotion:'curiosity',tone:'mysterious',platform:'all',audience:'intermediate',goal:'conversion',viralScore:8,niches:['marketing','business']},
  {text:'فيه خطأ واحد يدمر أي براند جديد — وأغلبكم يسويه',emotion:'curiosity',tone:'warning',platform:'all',audience:'beginner',goal:'awareness',viralScore:9,niches:['all']},
  // ===== SHOCK =====
  {text:'توقفت عن التسويق تماماً... والمبيعات تضاعفت',emotion:'shock',tone:'contrarian',platform:'linkedin',audience:'advanced',goal:'authority',viralScore:9,niches:['marketing','business']},
  {text:'حذفت 80% من المحتوى... وهذا اللي صار',emotion:'shock',tone:'bold',platform:'instagram',audience:'all',goal:'engagement',viralScore:8,niches:['marketing','design']},
  {text:'العميل اللي رفضته صار أكبر مصدر دخل لي',emotion:'shock',tone:'storytelling',platform:'linkedin',audience:'intermediate',goal:'trust',viralScore:7,niches:['business','coding']},
  {text:'أنفقت $5000 على إعلانات وما جاني ولا عميل — ثم اكتشفت السبب',emotion:'shock',tone:'personal',platform:'all',audience:'intermediate',goal:'awareness',viralScore:9,niches:['marketing','business']},
  // ===== AUTHORITY =====
  {text:'بعد 500+ عميل، هذي الـ 3 أسرار اللي ما حد يقولها',emotion:'authority',tone:'expert',platform:'all',audience:'all',goal:'trust',viralScore:8,niches:['all']},
  {text:'7 سنوات في التسويق علمتني شيء واحد مهم',emotion:'authority',tone:'storytelling',platform:'linkedin',audience:'intermediate',goal:'trust',viralScore:7,niches:['marketing']},
  {text:'كل عميل سألني هالسؤال... وجوابي غيّر نتائجهم',emotion:'authority',tone:'expert',platform:'all',audience:'all',goal:'conversion',viralScore:7,niches:['business','marketing']},
  {text:'الاستراتيجية اللي رفعت مبيعاتي 340% في 90 يوم',emotion:'authority',tone:'data',platform:'linkedin',audience:'advanced',goal:'authority',viralScore:8,niches:['marketing','business']},
  // ===== EMOTIONAL =====
  {text:'في يوم قررت أوقف كل شي وأبدأ من الصفر',emotion:'emotional',tone:'storytelling',platform:'instagram',audience:'all',goal:'connection',viralScore:9,niches:['all']},
  {text:'أول مرة حسيت إني فعلاً بنيت شي يستاهل',emotion:'emotional',tone:'personal',platform:'all',audience:'beginner',goal:'inspiration',viralScore:7,niches:['all']},
  {text:'رسالة من عميل خلتني أبكي — هذا ليش أسوي اللي أسويه',emotion:'emotional',tone:'vulnerable',platform:'instagram',audience:'all',goal:'connection',viralScore:9,niches:['coaching','health','fitness']},
  {text:'كنت خايف أبدأ... لكن الخوف الحقيقي هو إنك ما تبدأ',emotion:'emotional',tone:'motivational',platform:'all',audience:'beginner',goal:'inspiration',viralScore:7,niches:['all']},
  // ===== CHALLENGE =====
  {text:'جرب هالشي لمدة 7 أيام وشوف الفرق بنفسك',emotion:'challenge',tone:'direct',platform:'tiktok',audience:'beginner',goal:'engagement',viralScore:9,niches:['fitness','health','beauty']},
  {text:'تحدي: اسوِ هالشي لمدة 30 يوم وقولي النتيجة',emotion:'challenge',tone:'bold',platform:'tiktok',audience:'all',goal:'engagement',viralScore:9,niches:['fitness','health']},
  {text:'لو ما تقدر تجاوب على هالسؤال — براندك في خطر',emotion:'challenge',tone:'provocative',platform:'all',audience:'intermediate',goal:'awareness',viralScore:8,niches:['marketing','business']},
  // ===== LUXURY/PREMIUM =====
  {text:'الفرق بين براند يبيع بـ$10 وبراند يبيع بـ$1000 هو...',emotion:'luxury',tone:'premium',platform:'all',audience:'advanced',goal:'positioning',viralScore:8,niches:['fashion','beauty','design']},
  {text:'العملاء الأغنياء ما يشترون المنتج — يشترون هالشي',emotion:'luxury',tone:'insider',platform:'linkedin',audience:'advanced',goal:'positioning',viralScore:8,niches:['fashion','beauty','business']},
  // ===== NICHE-SPECIFIC: FITNESS =====
  {text:'التمرين اللي يحرق دهون أكثر من الكارديو بـ3 مرات',emotion:'curiosity',tone:'data',platform:'tiktok',audience:'all',goal:'engagement',viralScore:9,niches:['fitness']},
  {text:'توقف عن هالعادة الغذائية — وشوف جسمك كيف يتغير',emotion:'challenge',tone:'direct',platform:'instagram',audience:'all',goal:'engagement',viralScore:8,niches:['fitness','health']},
  // ===== NICHE-SPECIFIC: CODING =====
  {text:'الأداة اللي وفرت علي 10 ساعات أسبوعياً في البرمجة',emotion:'curiosity',tone:'expert',platform:'all',audience:'intermediate',goal:'awareness',viralScore:7,niches:['coding','ai']},
  {text:'3 مكتبات ما تعرفها ممكن تغير طريقة شغلك تماماً',emotion:'curiosity',tone:'insider',platform:'all',audience:'intermediate',goal:'authority',viralScore:7,niches:['coding']},
  // ===== NICHE-SPECIFIC: AI =====
  {text:'هالأداة الذكية تسوي في 5 دقائق اللي يحتاج منك 5 ساعات',emotion:'shock',tone:'data',platform:'tiktok',audience:'all',goal:'awareness',viralScore:9,niches:['ai']},
  {text:'مستقبل البزنس: اللي ما يستخدم AI بيتأخر 10 سنوات',emotion:'authority',tone:'warning',platform:'linkedin',audience:'all',goal:'awareness',viralScore:8,niches:['ai','business']},
  // ===== NICHE-SPECIFIC: BEAUTY =====
  {text:'المكوّن اللي تتجاهله وهو السر وراء بشرة صافية',emotion:'curiosity',tone:'insider',platform:'instagram',audience:'all',goal:'engagement',viralScore:8,niches:['beauty','health']},
  {text:'روتين 3 خطوات بس... لكن النتيجة مذهلة',emotion:'curiosity',tone:'minimal',platform:'tiktok',audience:'beginner',goal:'engagement',viralScore:9,niches:['beauty']},
  // ===== NICHE-SPECIFIC: FASHION =====
  {text:'5 قطع ملابس تخليك تبان أغلى بدون ما تصرف كثير',emotion:'curiosity',tone:'premium',platform:'instagram',audience:'all',goal:'engagement',viralScore:8,niches:['fashion']},
  {text:'غلطة الستايل اللي يسويها 90% من الناس بدون ما يدرون',emotion:'curiosity',tone:'warning',platform:'tiktok',audience:'all',goal:'awareness',viralScore:8,niches:['fashion']},
  // ===== NICHE-SPECIFIC: HOME =====
  {text:'غيّرت 3 أشياء في بيتي وصار يبان كأنه من مجلة',emotion:'shock',tone:'personal',platform:'instagram',audience:'all',goal:'engagement',viralScore:8,niches:['home']},
  // ===== NICHE-SPECIFIC: ELECTRONICS =====
  {text:'الجهاز اللي ندمت إني ما اشتريته من زمان',emotion:'emotional',tone:'personal',platform:'tiktok',audience:'all',goal:'engagement',viralScore:7,niches:['electronics']},
];

async function seed() {
  console.log('Seeding hooks...');
  const batch = writeBatch(db);
  HOOKS.forEach((hook, i) => {
    const ref = doc(collection(db, 'hooks'));
    batch.set(ref, { ...hook, createdAt: Date.now(), order: i });
  });
  await batch.commit();
  console.log(`✅ Seeded ${HOOKS.length} hooks`);
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
