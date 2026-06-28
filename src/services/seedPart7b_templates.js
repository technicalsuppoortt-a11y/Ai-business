import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { WEBSITE_TEMPLATES_COLLECTION } from './seedPart7_templates';

export const TEMPLATES_DATA_PART_2 = [
  // ─── 6. FITNESS & GYM ─────────────────────────────────────────────────────────
  {
    id: 'tpl_fitness',
    name_ar: 'لياقة بدنية (Fitness & Gym)',
    name_en: 'Fitness & Gym',
    icon: '🏋️',
    description_ar: 'قالب حيوي داكن لمدربي اللياقة والنوادي، يحتوي على جداول التدريب وقصص النجاح.',
    description_en: 'Dark and energetic theme for fitness trainers and gyms. Includes programs and success stories.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Fitness Training</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0a0a] text-white font-sans antialiased overflow-x-hidden">
  
  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center max-w-7xl mx-auto">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-8 uppercase font-bold text-sm tracking-widest text-gray-400">
      <a href="#" class="hover:text-white transition">Programs</a>
      <a href="#" class="hover:text-white transition">Results</a>
      <a href="#" class="hover:text-white transition">Pricing</a>
    </div>
    <button style="background-color: {{colorHex}};" class="text-black px-6 py-2 rounded font-black uppercase tracking-wider hover:bg-white hover:text-black transition">Join Now</button>
  </nav>

  <!-- Hero -->
  <header class="relative h-screen min-h-[700px] flex items-center bg-[#111]">
    <!-- Background Image Overlay -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-black opacity-70 mix-blend-multiply"></div>
      <div class="absolute inset-0 flex items-center justify-center text-gray-700 font-black text-6xl uppercase tracking-widest opacity-20">Gym Image</div>
    </div>
    
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div class="max-w-3xl">
        <div class="inline-block px-4 py-1 border-2 font-bold uppercase tracking-widest text-xs mb-6" style="border-color: {{colorHex}}; color: {{colorHex}};">Dominate Your Goals</div>
        <h1 class="text-6xl md:text-8xl font-black uppercase italic leading-[0.9] mb-8">
          Transform <br> Your Body <br> <span class="text-transparent" style="-webkit-text-stroke: 2px {{colorHex}};">in 90 Days</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10 max-w-xl font-medium">
          Elite personal training designed for {{nicheName}}. Stop guessing and start seeing real results with our proven systems.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <button style="background-color: {{colorHex}};" class="text-black px-10 py-5 font-black uppercase text-lg tracking-wider hover:bg-white transition transform hover:scale-105">
            Start Your Journey
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Features Strip -->
  <div style="background-color: {{colorHex}};" class="text-black py-4 overflow-hidden border-y-4 border-white border-opacity-10">
    <div class="flex justify-around items-center font-black uppercase tracking-widest text-sm md:text-base">
      <span>✦ Expert Coaches</span>
      <span>✦ Custom Plans</span>
      <span class="hidden md:inline">✦ 24/7 Access</span>
      <span class="hidden lg:inline">✦ Real Results</span>
    </div>
  </div>

  <!-- Programs -->
  <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-black uppercase italic mb-4">Choose Your <span style="color: {{colorHex}};">Weapon</span></h2>
      <p class="text-gray-400">Programs tailored exactly to what you need.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Program 1 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">01</div>
        <h3 class="text-2xl font-black uppercase mb-4">Fat Loss Shred</h3>
        <p class="text-gray-400 mb-8 font-medium">A high-intensity program designed to melt away body fat while preserving lean muscle mass.</p>
        <ul class="space-y-3 mb-8 text-gray-300">
          <li class="flex items-center gap-3">✓ 4 Days / Week</li>
          <li class="flex items-center gap-3">✓ HIIT + Lifting</li>
          <li class="flex items-center gap-3">✓ Custom Meal Plan</li>
        </ul>
        <button class="w-full py-4 font-black uppercase tracking-wider border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">Select Plan</button>
      </div>
      <!-- Program 2 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">02</div>
        <h3 class="text-2xl font-black uppercase mb-4">Muscle Builder</h3>
        <p class="text-gray-400 mb-8 font-medium">Hypertrophy focused training block to pack on serious size and strength.</p>
        <ul class="space-y-3 mb-8 text-gray-300">
          <li class="flex items-center gap-3">✓ 5 Days / Week</li>
          <li class="flex items-center gap-3">✓ Heavy Compound Lifts</li>
          <li class="flex items-center gap-3">✓ Bulking Macros</li>
        </ul>
        <button class="w-full py-4 font-black uppercase tracking-wider border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">Select Plan</button>
      </div>
      <!-- Program 3 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">03</div>
        <h3 class="text-2xl font-black uppercase mb-4">1-on-1 Coaching</h3>
        <p class="text-gray-400 mb-8 font-medium">Total accountability. We work with you daily to ensure you never miss a step.</p>
        <ul class="space-y-3 mb-8 text-gray-300">
          <li class="flex items-center gap-3">✓ Daily Check-ins</li>
          <li class="flex items-center gap-3">✓ Form Corrections</li>
          <li class="flex items-center gap-3">✓ 24/7 WhatsApp Access</li>
        </ul>
        <button class="w-full py-4 font-black uppercase tracking-wider border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">Select Plan</button>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-24 bg-[#111] border-y border-gray-800 text-center relative overflow-hidden">
    <div class="absolute inset-0 opacity-10" style="background-image: repeating-linear-gradient(45deg, {{colorHex}} 0, {{colorHex}} 2px, transparent 2px, transparent 10px);"></div>
    <div class="max-w-3xl mx-auto px-4 relative z-10">
      <h2 class="text-5xl font-black uppercase italic mb-6">No More Excuses.</h2>
      <p class="text-xl text-gray-400 mb-10">Stop waiting for Monday. Your transformation starts the moment you decide to take action.</p>
      <button style="background-color: {{colorHex}};" class="text-black px-12 py-5 font-black uppercase text-xl tracking-wider hover:bg-white transition transform hover:scale-105">
        Join {{brandName}} Today
      </button>
    </div>
  </section>

  <footer class="text-center py-8 text-gray-600 font-bold uppercase tracking-widest text-sm">
    &copy; 2024 {{brandName}} FITNESS. ALL RIGHTS RESERVED.
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | تدريب لياقة بدنية</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Changa:wght@400;700;800&display=swap');
    body { font-family: 'Changa', sans-serif; }
  </style>
</head>
<body class="bg-[#0a0a0a] text-white antialiased overflow-x-hidden">
  
  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center max-w-7xl mx-auto">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-8 space-x-reverse font-bold text-sm text-gray-400">
      <a href="#" class="hover:text-white transition">برامجنا</a>
      <a href="#" class="hover:text-white transition">النتائج</a>
      <a href="#" class="hover:text-white transition">الأسعار</a>
    </div>
    <button style="background-color: {{colorHex}};" class="text-black px-6 py-2 rounded font-extrabold hover:bg-white hover:text-black transition">اشترك الآن</button>
  </nav>

  <!-- Hero -->
  <header class="relative h-screen min-h-[700px] flex items-center bg-[#111]">
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-black opacity-70 mix-blend-multiply"></div>
      <div class="absolute inset-0 flex items-center justify-center text-gray-700 font-black text-6xl opacity-20">صورة صالة رياضية أو مدرب</div>
    </div>
    
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-right">
      <div class="max-w-3xl ml-auto mr-0">
        <div class="inline-block px-4 py-1 border-2 font-bold text-sm mb-6" style="border-color: {{colorHex}}; color: {{colorHex}};">اسحق أهدافك</div>
        <h1 class="text-6xl md:text-8xl font-black leading-[1.1] mb-8">
          حوّل <br> جسمك بالكامل <br> <span class="text-transparent" style="-webkit-text-stroke: 2px {{colorHex}};">في ٩٠ يوماً</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10 max-w-xl font-medium ml-auto mr-0">
          تدريب شخصي احترافي مصمم خصيصاً لمجال {{nicheName}}. توقف عن التخمين وابدأ في رؤية نتائج حقيقية مع أنظمتنا المجربة.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-start">
          <button style="background-color: {{colorHex}};" class="text-black px-10 py-5 font-black text-lg hover:bg-white transition transform hover:scale-105">
            ابدأ رحلة التغيير
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Features Strip -->
  <div style="background-color: {{colorHex}};" class="text-black py-4 overflow-hidden border-y-4 border-white border-opacity-10">
    <div class="flex justify-around items-center font-extrabold text-sm md:text-lg">
      <span>✦ مدربون محترفون</span>
      <span>✦ خطط مخصصة</span>
      <span class="hidden md:inline">✦ متابعة يومية</span>
      <span class="hidden lg:inline">✦ نتائج حقيقية</span>
    </div>
  </div>

  <!-- Programs -->
  <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-black mb-4">اختر <span style="color: {{colorHex}};">سلاحك</span></h2>
      <p class="text-gray-400 text-lg">برامج تدريبية مصممة خصيصاً لتناسب هدفك بدقة.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Program 1 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl font-black">01</div>
        <h3 class="text-2xl font-black mb-4">حرق الدهون (Shred)</h3>
        <p class="text-gray-400 mb-8 font-medium">برنامج عالي الكثافة مصمم لإذابة دهون الجسم مع الحفاظ على الكتلة العضلية.</p>
        <ul class="space-y-3 mb-8 text-gray-300 font-medium">
          <li class="flex items-center gap-3 text-right">✓ 4 أيام / أسبوع</li>
          <li class="flex items-center gap-3 text-right">✓ كارديو + أوزان</li>
          <li class="flex items-center gap-3 text-right">✓ نظام غذائي مخصص</li>
        </ul>
        <button class="w-full py-4 font-black border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">اختر البرنامج</button>
      </div>
      <!-- Program 2 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl font-black">02</div>
        <h3 class="text-2xl font-black mb-4">البناء العضلي (Bulk)</h3>
        <p class="text-gray-400 mb-8 font-medium">تدريب يركز على التضخيم وزيادة القوة بشكل ملحوظ باستخدام الأوزان الحرة.</p>
        <ul class="space-y-3 mb-8 text-gray-300 font-medium">
          <li class="flex items-center gap-3 text-right">✓ 5 أيام / أسبوع</li>
          <li class="flex items-center gap-3 text-right">✓ رفع أوزان ثقيلة</li>
          <li class="flex items-center gap-3 text-right">✓ ماكروز التضخيم</li>
        </ul>
        <button class="w-full py-4 font-black border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">اختر البرنامج</button>
      </div>
      <!-- Program 3 -->
      <div class="bg-[#111] p-8 border border-gray-800 hover:border-[{{colorHex}}] transition group relative overflow-hidden">
        <div class="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl font-black">03</div>
        <h3 class="text-2xl font-black mb-4">كوتشينج 1-لـ-1</h3>
        <p class="text-gray-400 mb-8 font-medium">التزام تام ومساءلة يومية. نعمل معك خطوة بخطوة لضمان وصولك لهدفك بدون أخطاء.</p>
        <ul class="space-y-3 mb-8 text-gray-300 font-medium">
          <li class="flex items-center gap-3 text-right">✓ متابعة يومية</li>
          <li class="flex items-center gap-3 text-right">✓ تصحيح التكنيك (الفورم)</li>
          <li class="flex items-center gap-3 text-right">✓ تواصل واتساب 24/7</li>
        </ul>
        <button class="w-full py-4 font-black border-2 border-gray-700 group-hover:bg-[{{colorHex}}] group-hover:text-black group-hover:border-transparent transition">اختر البرنامج</button>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-24 bg-[#111] border-y border-gray-800 text-center relative overflow-hidden">
    <div class="absolute inset-0 opacity-10" style="background-image: repeating-linear-gradient(45deg, {{colorHex}} 0, {{colorHex}} 2px, transparent 2px, transparent 10px);"></div>
    <div class="max-w-3xl mx-auto px-4 relative z-10">
      <h2 class="text-5xl font-black mb-6">لا مزيد من الأعذار.</h2>
      <p class="text-xl text-gray-400 mb-10 font-medium">توقف عن انتظار يوم السبت القادم. تحولك الحقيقي يبدأ في اللحظة التي تقرر فيها أخذ خطوة.</p>
      <button style="background-color: {{colorHex}};" class="text-black px-12 py-5 font-black text-xl hover:bg-white transition transform hover:scale-105">
        انضم لـ {{brandName}} اليوم
      </button>
    </div>
  </section>

  <footer class="text-center py-8 text-gray-600 font-bold text-sm">
    &copy; 2024 {{brandName}} للياقة البدنية. جميع الحقوق محفوظة.
  </footer>

</body>
</html>`
  },

  // ─── 7. DIGITAL PRODUCTS & COURSES ────────────────────────────────────────────
  {
    id: 'tpl_digital_products',
    name_ar: 'المنتجات الرقمية والكورسات',
    name_en: 'Digital Products & Courses',
    icon: '📚',
    description_ar: 'قالب مصمم لتحويل الزوار إلى مشترين للكورسات أو الكتب الإلكترونية، مع التركيز على ضمان الاسترجاع وآراء الطلاب.',
    description_en: 'High-converting layout for courses or e-books with money-back guarantee and student reviews.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Digital Masterclass</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  
  <!-- Banner -->
  <div style="background-color: {{secondaryColor}};" class="text-white text-center py-2 text-sm font-bold">
    🎉 Special Launch Offer: Get 50% Off Today Only!
  </div>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
    
    <!-- Logo -->
    {{brandLogoHtml}}
    
    <!-- Hero Text -->
    <h1 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
      Master <span style="background-color: {{colorHex}}20; color: {{colorHex}}; padding: 0 10px;">{{nicheName}}</span> in 30 Days Without Overwhelm
    </h1>
    <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
      The complete, step-by-step blueprint used by 5,000+ students to go from absolute beginner to confident expert.
    </p>

    <!-- Product Mockup Video/Image -->
    <div class="w-full bg-white rounded-2xl shadow-2xl overflow-hidden aspect-video relative border border-gray-200 mb-12 group cursor-pointer">
      <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <span class="text-gray-400 font-bold text-2xl">Course Video / Book Cover Placeholder</span>
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
          <div class="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-500 border-b-8 border-b-transparent ml-1"></div>
        </div>
      </div>
    </div>

    <!-- CTA & Trust -->
    <button style="background-color: {{colorHex}};" class="w-full md:w-auto px-12 py-5 rounded-xl font-bold text-white text-xl shadow-lg hover:-translate-y-1 transition transform mb-6">
      Get Instant Access - $97
    </button>
    <div class="flex items-center justify-center gap-2 text-sm text-gray-500 font-bold mb-16">
      <span>🔒 Secure SSL Checkout</span>
      <span>•</span>
      <span>⭐ 4.9/5 Average Rating</span>
    </div>

    <!-- Inside the course -->
    <section class="text-left bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-16">
      <h2 class="text-3xl font-bold mb-8">What You'll Discover Inside:</h2>
      <ul class="space-y-6">
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1" style="background-color: {{secondaryColor}};">1</div>
          <div>
            <h4 class="text-xl font-bold mb-1">The Core Fundamentals</h4>
            <p class="text-gray-600">Everything you need to know before you start to avoid common pitfalls.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1" style="background-color: {{secondaryColor}};">2</div>
          <div>
            <h4 class="text-xl font-bold mb-1">Advanced Strategies</h4>
            <p class="text-gray-600">The secret tactics used by the top 1% in the industry.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1" style="background-color: {{secondaryColor}};">3</div>
          <div>
            <h4 class="text-xl font-bold mb-1">Execution Templates</h4>
            <p class="text-gray-600">Done-for-you templates so you can plug and play immediately.</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Guarantee -->
    <section class="bg-[#FFFDF0] p-8 md:p-12 rounded-3xl border border-yellow-200 text-center mb-16">
      <div class="text-5xl mb-6">🏆</div>
      <h2 class="text-2xl font-bold mb-4">Iron-Clad 30-Day Money Back Guarantee</h2>
      <p class="text-gray-700 leading-relaxed max-w-xl mx-auto">
        I am so confident in the value of this product that if you don't see results within 30 days of implementing the strategies, I will refund your money. No questions asked.
      </p>
    </section>

    <footer class="text-sm text-gray-500 pb-10">
      <p>&copy; 2024 {{brandName}}. All rights reserved.</p>
      <div class="mt-2 space-x-4">
        <a href="#" class="underline">Terms</a>
        <a href="#" class="underline">Privacy</a>
        <a href="#" class="underline">Support</a>
      </div>
    </footer>
  </div>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | منتج رقمي</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  
  <!-- Banner -->
  <div style="background-color: {{secondaryColor}};" class="text-white text-center py-2 text-sm font-bold">
    🎉 عرض إطلاق حصري: احصل على خصم 50% اليوم فقط!
  </div>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
    
    <!-- Logo -->
    {{brandLogoHtml}}
    
    <!-- Hero Text -->
    <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
      احترف <span style="background-color: {{colorHex}}20; color: {{colorHex}}; padding: 0 10px; border-radius: 8px;">{{nicheName}}</span> في 30 يوماً فقط بدون تشتت
    </h1>
    <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
      الخريطة الكاملة والمجربة خطوة بخطوة والتي استخدمها أكثر من 5,000 طالب للانتقال من الصفر للاحتراف والثقة.
    </p>

    <!-- Product Mockup Video/Image -->
    <div class="w-full bg-white rounded-2xl shadow-2xl overflow-hidden aspect-video relative border border-gray-200 mb-12 group cursor-pointer">
      <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <span class="text-gray-400 font-bold text-2xl">صورة غلاف الكتاب أو فيديو الكورس</span>
      </div>
      <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition pr-2">
           <!-- Play icon arabic direction -->
          <div class="w-0 h-0 border-t-8 border-t-transparent border-r-[12px] border-r-red-500 border-b-8 border-b-transparent"></div>
        </div>
      </div>
    </div>

    <!-- CTA & Trust -->
    <button style="background-color: {{colorHex}};" class="w-full md:w-auto px-12 py-5 rounded-xl font-bold text-white text-xl shadow-lg hover:-translate-y-1 transition transform mb-6">
      احصل على الدخول الفوري - 97$
    </button>
    <div class="flex items-center justify-center gap-3 text-sm text-gray-500 font-bold mb-16">
      <span>🔒 دفع إلكتروني آمن 100%</span>
      <span>•</span>
      <span>⭐ تقييم 4.9/5 من المتدربين</span>
    </div>

    <!-- Inside the course -->
    <section class="text-right bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-16">
      <h2 class="text-3xl font-black mb-8">ماذا ستكتشف بالداخل؟</h2>
      <ul class="space-y-6">
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold" style="background-color: {{secondaryColor}};">1</div>
          <div>
            <h4 class="text-xl font-bold mb-1">الأساسيات الجوهرية</h4>
            <p class="text-gray-600 font-medium">كل ما تحتاج لمعرفته قبل البدء لتجنب الأخطاء الشائعة المكلفة والمحبطة.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold" style="background-color: {{secondaryColor}};">2</div>
          <div>
            <h4 class="text-xl font-bold mb-1">استراتيجيات متقدمة</h4>
            <p class="text-gray-600 font-medium">التكتيكات السرية التي يستخدمها أفضل 1% في هذا المجال لتحقيق نتائج مبهرة.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold" style="background-color: {{secondaryColor}};">3</div>
          <div>
            <h4 class="text-xl font-bold mb-1">قوالب التنفيذ الفورية</h4>
            <p class="text-gray-600 font-medium">قوالب (Done-for-you) جاهزة للنسخ واللصق لتنفيذ ما تعلمته فوراً.</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Guarantee -->
    <section class="bg-[#FFFDF0] p-8 md:p-12 rounded-3xl border border-yellow-200 text-center mb-16">
      <div class="text-5xl mb-6">🏆</div>
      <h2 class="text-2xl font-black mb-4">ضمان ذهبي لاسترجاع الأموال 100% لمدة 30 يوماً</h2>
      <p class="text-gray-700 leading-relaxed max-w-xl mx-auto font-medium">
        أنا واثق جداً من القيمة الموجودة في هذا المنتج، لدرجة أنك إذا طبقته ولم تحصل على أية نتائج خلال أول 30 يوماً، سأقوم برد أموالك بالكامل بدون سؤال واحد. المخاطرة صفر!
      </p>
    </section>

    <footer class="text-sm text-gray-500 pb-10 font-medium">
      <p>&copy; 2024 {{brandName}}. جميع الحقوق محفوظة.</p>
      <div class="mt-2 space-x-4 space-x-reverse">
        <a href="#" class="underline">الشروط والأحكام</a>
        <a href="#" class="underline">سياسة الخصوصية</a>
        <a href="#" class="underline">الدعم الفني</a>
      </div>
    </footer>
  </div>

</body>
</html>`
  },

  // ─── 8. RESTAURANT & CAFE ─────────────────────────────────────────────────────
  {
    id: 'tpl_restaurant',
    name_ar: 'مطعم وكافيه',
    name_en: 'Restaurant & Cafe',
    icon: '🍽️',
    description_ar: 'تصميم يفتح الشهية مخصص للمطاعم، يتضمن المنيو، صور الأطباق، وحجز الطاولات.',
    description_en: 'Appetizing design for restaurants, includes a menu, gallery, and table booking.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Fine Dining</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-stone-50 text-stone-800 font-sans antialiased">

  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-8 font-medium">
      <a href="#menu" class="hover:text-[{{colorHex}}] transition">Menu</a>
      <a href="#story" class="hover:text-[{{colorHex}}] transition">Our Story</a>
      <a href="#book" class="hover:text-[{{colorHex}}] transition">Reservations</a>
    </div>
    <button style="background-color: {{colorHex}};" class="text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition">Book a Table</button>
  </nav>

  <!-- Hero Background -->
  <header class="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-stone-900">
    <div class="absolute inset-0 bg-black opacity-60 z-10"></div>
    <div class="absolute inset-0 flex items-center justify-center opacity-40 text-white font-bold text-4xl">Restaurant Background Image</div>
    
    <div class="relative z-20 text-center px-4 max-w-3xl">
      <div class="uppercase tracking-[0.3em] mb-4 text-sm font-bold text-white opacity-80">Experience the taste of {{nicheName}}</div>
      <h1 class="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
        A Culinary <br><span class="italic text-[{{colorHex}}]">Masterpiece</span>
      </h1>
      <button style="background-color: {{secondaryColor}};" class="text-white px-8 py-4 font-bold tracking-widest uppercase text-sm border border-transparent hover:bg-transparent hover:border-white transition">
        View Menu
      </button>
    </div>
  </header>

  <!-- About / Story -->
  <section id="story" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
    <div class="md:w-1/2">
      <div class="w-full h-[500px] bg-stone-200 rounded-t-[100px] rounded-b-xl relative overflow-hidden shadow-xl border-4 border-white">
        <div class="absolute inset-0 flex items-center justify-center text-stone-400 font-bold">Chef Image</div>
      </div>
    </div>
    <div class="md:w-1/2">
      <h2 class="text-4xl font-serif mb-6" style="color: {{secondaryColor}};">Our Story</h2>
      <p class="text-stone-600 text-lg leading-relaxed mb-6">
        Since 1998, {{brandName}} has been serving authentic {{nicheName}} cuisine with a modern twist. Our executive chef uses only locally-sourced, organic ingredients to craft dishes that delight the senses.
      </p>
      <p class="text-stone-600 text-lg leading-relaxed mb-8">
        We believe dining is not just about food, but about the experience, the ambiance, and the memories created around the table.
      </p>
      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" class="h-12 opacity-50">
    </div>
  </section>

  <!-- Featured Menu -->
  <section id="menu" class="py-24 bg-stone-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-serif mb-4" style="color: {{secondaryColor}};">Discover Our Menu</h2>
        <p class="text-stone-500 uppercase tracking-widest text-sm font-bold">Carefully crafted selections</p>
      </div>

      <div class="grid md:grid-cols-2 gap-x-16 gap-y-12">
        <!-- Item 1 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-xl font-bold font-serif text-stone-800">Truffle Risotto</h3>
            <span class="text-lg font-bold" style="color: {{colorHex}};">$32</span>
          </div>
          <p class="text-stone-500 italic">Arborio rice, black truffle paste, parmesan crisps</p>
        </div>
        <!-- Item 2 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-xl font-bold font-serif text-stone-800">Wagyu Beef Ribeye</h3>
            <span class="text-lg font-bold" style="color: {{colorHex}};">$85</span>
          </div>
          <p class="text-stone-500 italic">12oz grass-fed beef, roasted asparagus, red wine jus</p>
        </div>
        <!-- Item 3 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-xl font-bold font-serif text-stone-800">Pan-Seared Scallops</h3>
            <span class="text-lg font-bold" style="color: {{colorHex}};">$28</span>
          </div>
          <p class="text-stone-500 italic">Cauliflower purée, crispy pancetta, microgreens</p>
        </div>
        <!-- Item 4 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-xl font-bold font-serif text-stone-800">Chocolate Lava Cake</h3>
            <span class="text-lg font-bold" style="color: {{colorHex}};">$14</span>
          </div>
          <p class="text-stone-500 italic">Valrhona chocolate, vanilla bean ice cream, berry coulis</p>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button class="bg-stone-900 text-white px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-stone-800 transition">View Full Menu</button>
      </div>
    </div>
  </section>

  <!-- Booking -->
  <section id="book" class="py-24 text-center px-4" style="background-color: {{secondaryColor}};">
    <h2 class="text-4xl font-serif text-white mb-6">Reserve Your Table</h2>
    <p class="text-stone-300 mb-10 max-w-xl mx-auto">Join us for an unforgettable dining experience. For parties larger than 6, please contact us directly.</p>
    
    <div class="bg-white p-4 rounded-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
      <input type="date" class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
      <select class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
        <option>2 People</option>
        <option>3 People</option>
        <option>4 People</option>
      </select>
      <select class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
        <option>19:00</option>
        <option>19:30</option>
        <option>20:00</option>
      </select>
      <button style="background-color: {{colorHex}};" class="text-white px-8 py-3 font-bold rounded hover:opacity-90 transition">Find Table</button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-stone-900 text-stone-400 py-16 text-center">
    {{brandLogoHtml}}
    <p class="mb-2">123 Culinary Lane, Food District, NY</p>
    <p class="mb-8">Reservations: (555) 123-4567</p>
    <div class="flex justify-center gap-6 mb-8 text-sm uppercase tracking-widest font-bold">
      <a href="#" class="hover:text-white transition">Instagram</a>
      <a href="#" class="hover:text-white transition">Facebook</a>
      <a href="#" class="hover:text-white transition">TripAdvisor</a>
    </div>
    <p class="text-xs">&copy; 2024 {{brandName}}. All rights reserved.</p>
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | مطعم وكافيه</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; }
    h1, h2, .font-serif { font-family: 'Aref Ruqaa', serif; }
  </style>
</head>
<body class="bg-stone-50 text-stone-800 antialiased">

  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-8 space-x-reverse font-bold">
      <a href="#menu" class="hover:text-[{{colorHex}}] transition">قائمة الطعام (المنيو)</a>
      <a href="#story" class="hover:text-[{{colorHex}}] transition">قصتنا</a>
      <a href="#book" class="hover:text-[{{colorHex}}] transition">الحجوزات</a>
    </div>
    <button style="background-color: {{colorHex}};" class="text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition rounded">احجز طاولة</button>
  </nav>

  <!-- Hero Background -->
  <header class="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-stone-900">
    <div class="absolute inset-0 bg-black opacity-60 z-10"></div>
    <div class="absolute inset-0 flex items-center justify-center opacity-40 text-white font-bold text-4xl">صورة خلفية لمطعم فخم</div>
    
    <div class="relative z-20 text-center px-4 max-w-3xl">
      <div class="mb-4 text-lg font-bold text-white opacity-80">اكتشف المذاق الأصيل لـ {{nicheName}}</div>
      <h1 class="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight">
        تحفة فنية <br><span class="text-[{{colorHex}}]">في كل طبق</span>
      </h1>
      <button style="background-color: {{secondaryColor}};" class="text-white px-10 py-4 font-bold text-lg border border-transparent hover:bg-transparent hover:border-white transition rounded">
        استعرض المنيو
      </button>
    </div>
  </header>

  <!-- About / Story -->
  <section id="story" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
    <div class="md:w-1/2">
      <div class="w-full h-[500px] bg-stone-200 rounded-t-[100px] rounded-b-xl relative overflow-hidden shadow-xl border-4 border-white">
        <div class="absolute inset-0 flex items-center justify-center text-stone-400 font-bold">صورة الشيف أو المطبخ</div>
      </div>
    </div>
    <div class="md:w-1/2">
      <h2 class="text-5xl font-serif mb-6" style="color: {{secondaryColor}};">قصتنا</h2>
      <p class="text-stone-600 text-lg leading-relaxed mb-6 font-medium">
        منذ عام 1998، يقدم {{brandName}} المأكولات الأصيلة الخاصة بـ {{nicheName}} بلمسة عصرية. الشيف الخاص بنا يستخدم فقط مكونات عضوية ومحلية لابتكار أطباق تأسر حواسك.
      </p>
      <p class="text-stone-600 text-lg leading-relaxed mb-8 font-medium">
        نحن نؤمن أن تناول الطعام ليس مجرد طعام يسد الجوع، بل هو تجربة متكاملة، أجواء دافئة، وذكريات جميلة تُصنع حول الطاولة.
      </p>
      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" class="h-12 opacity-50 mr-auto ml-0 block">
    </div>
  </section>

  <!-- Featured Menu -->
  <section id="menu" class="py-24 bg-stone-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-5xl font-serif mb-4" style="color: {{secondaryColor}};">اكتشف المنيو</h2>
        <p class="text-stone-500 text-lg font-bold">أطباق مميزة مختارة بعناية</p>
      </div>

      <div class="grid md:grid-cols-2 gap-x-16 gap-y-12">
        <!-- Item 1 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-2xl font-bold font-serif text-stone-800">ريزوتو الترافل</h3>
            <span class="text-xl font-black" style="color: {{colorHex}};">120 ر.س</span>
          </div>
          <p class="text-stone-500 font-medium">أرز أربوريو، معجون الكمأة السوداء، وبارميزان مقرمش</p>
        </div>
        <!-- Item 2 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-2xl font-bold font-serif text-stone-800">ستيك واغيو ريب آي</h3>
            <span class="text-xl font-black" style="color: {{colorHex}};">280 ر.س</span>
          </div>
          <p class="text-stone-500 font-medium">ستيك بقري مغذى على العشب، هليون محمص، صوص خاص</p>
        </div>
        <!-- Item 3 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-2xl font-bold font-serif text-stone-800">محار مقلي (Scallops)</h3>
            <span class="text-xl font-black" style="color: {{colorHex}};">95 ر.س</span>
          </div>
          <p class="text-stone-500 font-medium">مهروس القرنبيط، بانسيتا مقرمشة، وأعشاب طازجة</p>
        </div>
        <!-- Item 4 -->
        <div class="border-b border-stone-200 pb-4">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="text-2xl font-bold font-serif text-stone-800">كيكة لافا الشوكولاتة</h3>
            <span class="text-xl font-black" style="color: {{colorHex}};">45 ر.س</span>
          </div>
          <p class="text-stone-500 font-medium">شوكولاتة فاخرة، آيس كريم الفانيليا، صوص التوت</p>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button class="bg-stone-900 text-white px-8 py-4 font-bold text-lg hover:bg-stone-800 transition rounded">استعراض المنيو كاملاً</button>
      </div>
    </div>
  </section>

  <!-- Booking -->
  <section id="book" class="py-24 text-center px-4" style="background-color: {{secondaryColor}};">
    <h2 class="text-5xl font-serif text-white mb-6">احجز طاولتك الآن</h2>
    <p class="text-stone-300 mb-10 max-w-xl mx-auto font-medium">انضم إلينا لتجربة طعام لا تُنسى. للمجموعات التي تزيد عن 6 أشخاص، يرجى الاتصال بنا مباشرة.</p>
    
    <div class="bg-white p-4 rounded-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 font-medium">
      <input type="date" class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
      <select class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
        <option>شخصان</option>
        <option>3 أشخاص</option>
        <option>4 أشخاص</option>
      </select>
      <select class="flex-1 p-3 bg-stone-50 border border-stone-200 rounded focus:outline-none">
        <option>7:00 مساءً</option>
        <option>8:30 مساءً</option>
        <option>10:00 مساءً</option>
      </select>
      <button style="background-color: {{colorHex}};" class="text-white px-10 py-3 font-bold text-lg rounded hover:opacity-90 transition">تأكيد الحجز</button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-stone-900 text-stone-400 py-16 text-center font-medium">
    {{brandLogoHtml}}
    <p class="mb-2">طريق المطاعم، حي الذواقة، الرياض</p>
    <p class="mb-8">للحجوزات الهاتفية: 920012345</p>
    <div class="flex justify-center gap-6 mb-8 font-bold">
      <a href="#" class="hover:text-white transition">إنستجرام</a>
      <a href="#" class="hover:text-white transition">فيسبوك</a>
      <a href="#" class="hover:text-white transition">تريب أدفايزر</a>
    </div>
    <p class="text-xs">&copy; 2024 {{brandName}}. جميع الحقوق محفوظة.</p>
  </footer>

</body>
</html>`
  },

  // ─── 9. WEBINAR / EVENT ───────────────────────────────────────────────────────
  {
    id: 'tpl_webinar',
    name_ar: 'الفعاليات والويبنار',
    name_en: 'Event & Webinar',
    icon: '🎤',
    description_ar: 'صفحة تسجيل عالية التحويل للويبنار، تشمل مؤقت تنازلي، ماذا ستتعلم، ومعلومات المتحدث.',
    description_en: 'High-converting registration page with countdown, learnings list, and speaker bio.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Masterclass | {{brandName}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  
  <!-- Banner -->
  <div class="bg-red-600 text-white text-center py-2 text-sm font-bold animate-pulse">
    🚨 WARNING: Only 45 seats remaining for this exclusive live training!
  </div>

  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-16">
    
    <!-- Left Col (Copy) -->
    <div class="lg:w-3/5">
      <div class="inline-block px-3 py-1 bg-gray-200 text-gray-700 font-bold text-xs uppercase rounded-md mb-6">Free Live Masterclass</div>
      <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
        How To Scale Your <span style="color: {{colorHex}};">{{nicheName}}</span> Business To 6-Figures In 90 Days
      </h1>
      <p class="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
        Join {{brandName}}'s founder for an exclusive 60-minute training where you'll discover the exact blueprint we use to generate consistent, predictable revenue.
      </p>

      <h3 class="text-2xl font-bold mb-4">In this free training, you will learn:</h3>
      <ul class="space-y-4 mb-10">
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700"><strong>The #1 Mistake</strong> that 99% of beginners make (and how you can avoid it entirely).</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700"><strong>The "3-Step Framework"</strong> to automate your client acquisition so you never have to hunt for leads again.</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700"><strong>Live Q&A Session:</strong> Ask your specific questions directly at the end of the presentation.</span>
        </li>
      </ul>

      <!-- Speaker Profile -->
      <div class="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-xs">Photo</div>
        <div>
          <h4 class="font-bold text-xl mb-1">Hosted by {{brandName}}</h4>
          <p class="text-gray-500 text-sm">Industry Expert & 7-Figure Earner</p>
        </div>
      </div>
    </div>

    <!-- Right Col (Form) -->
    <div class="lg:w-2/5">
      <div class="bg-white p-8 rounded-2xl shadow-2xl border-t-8 sticky top-8" style="border-top-color: {{secondaryColor}};">
        <h3 class="text-2xl font-bold mb-2 text-center">Save Your Seat!</h3>
        <p class="text-gray-500 text-center mb-6">Enter your details below to register.</p>
        
        <!-- Fake Countdown -->
        <div class="flex justify-center gap-2 mb-8 text-center">
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">02</div><div class="text-[10px] text-gray-500 uppercase">Days</div></div>
          <div class="font-bold text-xl mt-2">:</div>
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">14</div><div class="text-[10px] text-gray-500 uppercase">Hrs</div></div>
          <div class="font-bold text-xl mt-2">:</div>
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">35</div><div class="text-[10px] text-gray-500 uppercase">Mins</div></div>
        </div>

        <form>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">First Name</label>
            <input type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[{{colorHex}}]" placeholder="John">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[{{colorHex}}]" placeholder="john@example.com">
          </div>
          <button style="background-color: {{colorHex}};" class="w-full text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:opacity-90 transition transform hover:-translate-y-1">
            Register Now
          </button>
        </form>
        <p class="text-xs text-gray-400 text-center mt-4">We respect your privacy. No spam.</p>
      </div>
    </div>
  </main>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ماستر كلاس مجاني | {{brandName}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800;900&display=swap');
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  
  <!-- Banner -->
  <div class="bg-red-600 text-white text-center py-2 text-sm font-bold animate-pulse">
    🚨 تنبيه: يتبقى 45 مقعداً فقط لهذا التدريب المباشر الحصري!
  </div>

  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-16">
    
    <!-- Left Col (Copy) -->
    <div class="lg:w-3/5">
      <div class="inline-block px-3 py-1 bg-gray-200 text-gray-700 font-bold text-xs rounded-md mb-6">دورة مجانية مباشرة (لايف)</div>
      <h1 class="text-4xl md:text-5xl font-black leading-tight mb-6">
        كيف تضاعف أرباحك في <span style="color: {{colorHex}};">{{nicheName}}</span> إلى 6 أرقام خلال 90 يوماً
      </h1>
      <p class="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
        انضم لمؤسس {{brandName}} في تدريب حصري لمدة 60 دقيقة، حيث ستكتشف الخريطة الدقيقة التي نستخدمها لتوليد إيرادات مستمرة ومضمونة شهرياً.
      </p>

      <h3 class="text-2xl font-black mb-4">في هذا التدريب المجاني، ستتعلم:</h3>
      <ul class="space-y-4 mb-10">
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700 font-medium"><strong>الخطأ رقم ١</strong> الذي يقع فيه 99% من المبتدئين (وكيف يمكنك تجنبه تماماً لتسريع نجاحك).</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700 font-medium"><strong>نظام "الـ 3 خطوات"</strong> لأتمتة عملية جلب العملاء حتى لا تضطر للبحث عنهم مرة أخرى.</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-1 font-bold text-sm" style="background-color: {{colorHex}};">✓</div>
          <span class="text-lg text-gray-700 font-medium"><strong>جلسة أسئلة مباشرة:</strong> اسأل أي سؤال خاص بمشروعك وسنجيبك في نهاية العرض المباشر.</span>
        </li>
      </ul>

      <!-- Speaker Profile -->
      <div class="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-xs">صورتك</div>
        <div>
          <h4 class="font-black text-xl mb-1">تقديم: الخبير في {{brandName}}</h4>
          <p class="text-gray-500 text-sm font-medium">مستشار أعمال وخبير في صناعة المحتوى</p>
        </div>
      </div>
    </div>

    <!-- Right Col (Form) -->
    <div class="lg:w-2/5">
      <div class="bg-white p-8 rounded-2xl shadow-2xl border-t-8 sticky top-8" style="border-top-color: {{secondaryColor}};">
        <h3 class="text-2xl font-black mb-2 text-center">احجز مقعدك المجاني!</h3>
        <p class="text-gray-500 text-center mb-6 font-medium">أدخل بياناتك بالأسفل للتسجيل وسيصلك رابط الحضور.</p>
        
        <!-- Fake Countdown -->
        <div class="flex justify-center gap-2 mb-8 text-center" dir="ltr">
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">02</div><div class="text-[10px] text-gray-500 font-bold">يوم</div></div>
          <div class="font-bold text-xl mt-2">:</div>
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">14</div><div class="text-[10px] text-gray-500 font-bold">ساعة</div></div>
          <div class="font-bold text-xl mt-2">:</div>
          <div class="bg-gray-100 p-2 rounded w-14"><div class="font-bold text-xl">35</div><div class="text-[10px] text-gray-500 font-bold">دقيقة</div></div>
        </div>

        <form>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">الاسم الأول</label>
            <input type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[{{colorHex}}]" placeholder="أحمد">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني (الإيميل)</label>
            <input type="email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[{{colorHex}}]" placeholder="ahmed@example.com">
          </div>
          <button style="background-color: {{colorHex}};" class="w-full text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:opacity-90 transition transform hover:-translate-y-1">
            سجل الآن مجاناً
          </button>
        </form>
        <p class="text-xs text-gray-400 text-center mt-4 font-medium">نحن نحترم خصوصيتك. لن نرسل لك أي رسائل مزعجة.</p>
      </div>
    </div>
  </main>

</body>
</html>`
  },

  // ─── 10. CONSULTING / AGENCY ──────────────────────────────────────────────────
  {
    id: 'tpl_consulting',
    name_ar: 'استشارات ووكالات الأعمال',
    name_en: 'Consulting & Agencies',
    icon: '💼',
    description_ar: 'قالب رسمي يبرز الاحترافية، مصمم لشركات الاستشارات لجدولة المواعيد وعرض دراسات الحالة.',
    description_en: 'Corporate design focused on lead generation and booking consultation calls.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Consulting</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
  
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
      {{brandLogoHtml}}
      <button style="background-color: {{colorHex}};" class="text-white px-6 py-3 rounded text-sm font-bold shadow hover:opacity-90 transition">Book Consultation</button>
    </div>
  </nav>

  <header class="bg-white py-20 border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h1 class="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 leading-tight">
        Scale your <span style="color: {{colorHex}};">{{nicheName}}</span> business with certainty.
      </h1>
      <p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
        Stop guessing. We provide data-driven strategies and hands-on consulting to help you break through your revenue ceiling.
      </p>
      <div class="flex justify-center gap-4">
        <button style="background-color: {{secondaryColor}};" class="text-white px-8 py-4 rounded font-bold text-lg hover:opacity-90 transition shadow-lg">
          Book a Discovery Call
        </button>
      </div>
      <p class="mt-6 text-sm text-gray-400 font-medium uppercase tracking-wider">Trusted by 50+ industry leaders</p>
    </div>
  </header>

  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-3 gap-12 text-center md:text-left border-t border-gray-200 pt-16 mt-16 first:border-0 first:pt-0 first:mt-0">
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};">$10M+</h3>
          <p class="text-gray-500 font-bold">Revenue Generated For Clients</p>
        </div>
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};">98%</h3>
          <p class="text-gray-500 font-bold">Client Retention Rate</p>
        </div>
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};">4.9/5</h3>
          <p class="text-gray-500 font-bold">Average Satisfaction Score</p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900">How we work</h2>
        <p class="text-gray-600 text-lg mb-8">Our proven 3-phase methodology ensures that nothing is left to chance. We audit, strategy, and execute alongside your team.</p>
        
        <div class="space-y-6">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">1</div>
            <div>
              <h4 class="font-bold text-xl mb-1">Deep Audit</h4>
              <p class="text-gray-500">We analyze your current operations, find bottlenecks, and identify immediate growth opportunities.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">2</div>
            <div>
              <h4 class="font-bold text-xl mb-1">Strategic Roadmap</h4>
              <p class="text-gray-500">We design a custom, step-by-step action plan tailored specifically to your business goals.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">3</div>
            <div>
              <h4 class="font-bold text-xl mb-1">Execution & Scale</h4>
              <p class="text-gray-500">We don't just hand you a PDF. We work directly with you to implement the strategy and measure results.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="md:w-1/2">
        <div class="bg-gray-100 p-8 rounded-xl border border-gray-200">
           <h3 class="font-bold text-2xl mb-6 text-center">Request an Audit</h3>
           <form class="space-y-4">
             <input type="text" placeholder="Full Name" class="w-full p-3 border border-gray-300 rounded focus:border-[{{colorHex}}] focus:outline-none">
             <input type="email" placeholder="Work Email" class="w-full p-3 border border-gray-300 rounded focus:border-[{{colorHex}}] focus:outline-none">
             <input type="text" placeholder="Company Website" class="w-full p-3 border border-gray-300 rounded focus:border-[{{colorHex}}] focus:outline-none">
             <button style="background-color: {{colorHex}};" class="w-full text-white font-bold p-4 rounded mt-4 hover:opacity-90 transition">Submit Request</button>
           </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 py-12 text-center text-gray-500 text-sm">
    {{brandLogoHtml}}
    <p>&copy; 2024 {{brandName}} Consulting. All rights reserved.</p>
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | استشارات أعمال</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800;900&display=swap');
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
      {{brandLogoHtml}}
      <button style="background-color: {{colorHex}};" class="text-white px-6 py-3 rounded text-sm font-bold shadow hover:opacity-90 transition">احجز استشارتك</button>
    </div>
  </nav>

  <header class="bg-white py-20 border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h1 class="text-5xl md:text-6xl font-black mb-6 tracking-tight text-gray-900 leading-tight">
        وسّع نطاق عملك في <span style="color: {{colorHex}};">{{nicheName}}</span> بثقة تامة.
      </h1>
      <p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
        توقف عن تجربة الحلول العشوائية. نحن نقدم لك استراتيجيات مبنية على الأرقام واستشارات عملية لمساعدتك على كسر سقف إيراداتك الحالي.
      </p>
      <div class="flex justify-center gap-4">
        <button style="background-color: {{secondaryColor}};" class="text-white px-10 py-4 rounded font-bold text-lg hover:opacity-90 transition shadow-lg">
          احجز مكالمة استكشافية مجانية
        </button>
      </div>
      <p class="mt-6 text-sm text-gray-400 font-bold uppercase">يثق بنا أكثر من 50 رائداً في هذا القطاع</p>
    </div>
  </header>

  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-3 gap-12 text-center md:text-right border-t border-gray-200 pt-16 mt-16 first:border-0 first:pt-0 first:mt-0">
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};" dir="ltr">+10M$</h3>
          <p class="text-gray-500 font-bold">إيرادات حققناها لعملائنا</p>
        </div>
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};" dir="ltr">98%</h3>
          <p class="text-gray-500 font-bold">معدل الاحتفاظ بالعملاء (الولاء)</p>
        </div>
        <div>
          <h3 class="text-5xl font-black mb-2" style="color: {{colorHex}};" dir="ltr">4.9/5</h3>
          <p class="text-gray-500 font-bold">متوسط تقييم الرضا من العملاء</p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-black mb-6 text-gray-900">كيف نعمل؟ (منهجيتنا)</h2>
        <p class="text-gray-600 text-lg mb-8 font-medium">تضمن لك منهجيتنا المجربة المكونة من 3 مراحل عدم ترك أي شيء للصدفة. نحن نقوم بالتدقيق، رسم الاستراتيجية، والتنفيذ جنباً إلى جنب مع فريقك.</p>
        
        <div class="space-y-6">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">1</div>
            <div>
              <h4 class="font-bold text-xl mb-1">تدقيق عميق للمشروع</h4>
              <p class="text-gray-500 font-medium">نقوم بتحليل عملياتك الحالية، واكتشاف نقاط الضعف، وتحديد فرص النمو الفورية القابلة للتطبيق.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">2</div>
            <div>
              <h4 class="font-bold text-xl mb-1">خارطة طريق استراتيجية</h4>
              <p class="text-gray-500 font-medium">نصمم خطة عمل مخصصة (خطوة بخطوة) مصممة خصيصاً لتناسب أهداف عملك وحجمه.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">3</div>
            <div>
              <h4 class="font-bold text-xl mb-1">التنفيذ والتوسع</h4>
              <p class="text-gray-500 font-medium">نحن لا نعطيك ملف PDF وحسب. بل نعمل مباشرة معك لتنفيذ الاستراتيجية وتتبع النتائج باستمرار.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="md:w-1/2">
        <div class="bg-gray-100 p-8 rounded-xl border border-gray-200">
           <h3 class="font-black text-2xl mb-6 text-center">اطلب مراجعة مجانية لعملك</h3>
           <form class="space-y-4">
             <input type="text" placeholder="الاسم الكامل" class="w-full p-4 border border-gray-300 rounded font-medium focus:border-[{{colorHex}}] focus:outline-none">
             <input type="email" placeholder="البريد الإلكتروني للعمل" class="w-full p-4 border border-gray-300 rounded font-medium focus:border-[{{colorHex}}] focus:outline-none">
             <input type="text" placeholder="رابط موقع الشركة (اختياري)" class="w-full p-4 border border-gray-300 rounded font-medium focus:border-[{{colorHex}}] focus:outline-none text-left" dir="ltr">
             <button style="background-color: {{colorHex}};" class="w-full text-white font-bold text-lg p-4 rounded mt-4 hover:opacity-90 transition">إرسال الطلب</button>
           </form>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 py-12 text-center text-gray-500 text-sm font-medium">
    {{brandLogoHtml}}
    <p>&copy; 2024 {{brandName}} للاستشارات الإدارية. جميع الحقوق محفوظة.</p>
  </footer>

</body>
</html>`
  }
];
