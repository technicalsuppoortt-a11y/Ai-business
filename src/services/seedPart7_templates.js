import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const WEBSITE_TEMPLATES_COLLECTION = 'tc_website_templates_gallery';

export const TEMPLATES_DATA_PART_1 = [
  // ─── 1. E-COMMERCE STORE ────────────────────────────────────────────────────────
  {
    id: 'tpl_ecommerce',
    name_ar: 'متجر إلكتروني عصري',
    name_en: 'Modern E-commerce Store',
    icon: '🛍️',
    description_ar: 'قالب ممتاز للمتاجر الإلكترونية، يحتوي على واجهة عرض منتجات، آراء عملاء، ونموذج بريدي.',
    description_en: 'Perfect for e-commerce, features a product grid, customer reviews, and a newsletter form.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | {{nicheName}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans antialiased bg-gray-50 text-gray-900">
  
  <!-- Navbar -->
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {{brandLogoHtml}}
      <div class="hidden md:flex space-x-8">
        <a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Home</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Shop</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-medium">About</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
      </div>
      <button style="background-color: {{colorHex}};" class="text-white px-5 py-2 rounded-full font-bold hover:opacity-90 transition">Cart (0)</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header style="background-color: {{secondaryColor}};" class="text-white relative overflow-hidden">
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient({{colorHex}} 2px, transparent 2px); background-size: 30px 30px;"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Discover the Best in <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-lg md:text-xl font-medium max-w-xl mx-auto md:mx-0 mb-8 opacity-90">
          Premium quality products delivered straight to your door. Shop our exclusive collection today and elevate your lifestyle.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button style="background-color: {{colorHex}};" class="text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
            Shop Collection
          </button>
          <button class="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition">
            View Offers
          </button>
        </div>
      </div>
      <div class="md:w-1/2 flex justify-center">
        <div class="w-full max-w-md h-80 rounded-2xl shadow-2xl relative overflow-hidden" style="background: linear-gradient(135deg, {{colorHex}}, {{secondaryColor}});">
          <!-- Placeholder for Product Image -->
          <div class="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl font-bold">Featured Product Image</div>
        </div>
      </div>
    </div>
  </header>

  <!-- Features -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">🚚</div>
          <h3 class="text-xl font-bold mb-2">Free Fast Shipping</h3>
          <p class="text-gray-600">On all orders over $50. Delivered safely to your door within 48 hours.</p>
        </div>
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">⭐</div>
          <h3 class="text-xl font-bold mb-2">Premium Quality</h3>
          <p class="text-gray-600">We source only the finest materials to ensure 100% customer satisfaction.</p>
        </div>
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">↩️</div>
          <h3 class="text-xl font-bold mb-2">30-Day Returns</h3>
          <p class="text-gray-600">Not completely satisfied? Return it within 30 days for a full refund.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Products -->
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Trending Now</h2>
        <p class="text-gray-600 text-lg">Our most popular items this week</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Product 1 -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative">
             <div class="absolute inset-0 flex items-center justify-center text-gray-400">Image</div>
             <div class="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold rounded-full">New</div>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">Premium Item 1</h3>
            <p class="text-gray-500 text-sm mb-4">Category</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">$49.99</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <!-- Repeat for 3 more products (Mocked for brevity) -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400">Image</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">Premium Item 2</h3>
            <p class="text-gray-500 text-sm mb-4">Category</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">$59.99</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400">Image</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">Premium Item 3</h3>
            <p class="text-gray-500 text-sm mb-4">Category</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">$89.99</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400">Image</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">Premium Item 4</h3>
            <p class="text-gray-500 text-sm mb-4">Category</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">$29.99</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter & Footer -->
  <footer style="background-color: {{secondaryColor}};" class="text-white pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-700 pb-12 mb-8">
        <div>
          <h2 class="text-2xl font-bold mb-4">Join Our Newsletter</h2>
          <p class="text-gray-400 mb-6">Get 15% off your first order and exclusive updates.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="Enter your email" class="px-4 py-3 rounded-lg w-full md:w-2/3 text-gray-900 focus:outline-none">
            <button style="background-color: {{colorHex}};" class="px-6 py-3 rounded-lg font-bold hover:opacity-90">Subscribe</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-8">
          <div>
            <h4 class="font-bold mb-4 text-lg">Shop</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">New Arrivals</a></li>
              <li><a href="#" class="hover:text-white transition">Best Sellers</a></li>
              <li><a href="#" class="hover:text-white transition">Sales</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4 text-lg">Support</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">FAQ</a></li>
              <li><a href="#" class="hover:text-white transition">Shipping</a></li>
              <li><a href="#" class="hover:text-white transition">Returns</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-center text-gray-500 text-sm">
        &copy; 2024 {{brandName}}. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | {{nicheName}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800;900&display=swap');
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  
  <!-- Navbar -->
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {{brandLogoHtml}}
      <div class="hidden md:flex space-x-8">
        <a href="#" class="text-gray-600 hover:text-gray-900 font-bold">الرئيسية</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-bold">المتجر</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-bold">من نحن</a>
        <a href="#" class="text-gray-600 hover:text-gray-900 font-bold">تواصل معنا</a>
      </div>
      <button style="background-color: {{colorHex}};" class="text-white px-5 py-2 rounded-full font-bold hover:opacity-90 transition">السلة (0)</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header style="background-color: {{secondaryColor}};" class="text-white relative overflow-hidden">
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient({{colorHex}} 2px, transparent 2px); background-size: 30px 30px;"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 text-center md:text-right mb-12 md:mb-0">
        <h1 class="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
          اكتشف الأفضل في عالم <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-lg md:text-xl font-medium max-w-xl mx-auto md:mx-0 mb-8 opacity-90 leading-relaxed">
          منتجات عالية الجودة تصلك حتى باب المنزل. تسوق مجموعتنا الحصرية اليوم وارتقِ بأسلوب حياتك مع أحدث المنتجات.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button style="background-color: {{colorHex}};" class="text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
            تسوق المجموعة
          </button>
          <button class="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition">
            شاهد العروض
          </button>
        </div>
      </div>
      <div class="md:w-1/2 flex justify-center">
        <div class="w-full max-w-md h-80 rounded-2xl shadow-2xl relative overflow-hidden" style="background: linear-gradient(135deg, {{colorHex}}, {{secondaryColor}});">
          <div class="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl font-bold">صورة المنتج المميز</div>
        </div>
      </div>
    </div>
  </header>

  <!-- Features -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">🚚</div>
          <h3 class="text-xl font-bold mb-2">شحن سريع ومجاني</h3>
          <p class="text-gray-600 font-medium">للطلبات فوق 200 ريال. توصيل آمن حتى باب بيتك خلال 48 ساعة.</p>
        </div>
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">⭐</div>
          <h3 class="text-xl font-bold mb-2">جودة ممتازة</h3>
          <p class="text-gray-600 font-medium">نحن نختار أفضل الخامات لضمان رضا عملائنا بنسبة 100٪.</p>
        </div>
        <div class="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">↩️</div>
          <h3 class="text-xl font-bold mb-2">استرجاع خلال 30 يوم</h3>
          <p class="text-gray-600 font-medium">لست راضياً تماماً؟ قم بإرجاع المنتج خلال 30 يوماً واسترد أموالك.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Products -->
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-black mb-4">الأكثر مبيعاً</h2>
        <p class="text-gray-600 text-lg font-medium">المنتجات الأكثر شعبية لدينا هذا الأسبوع</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Product 1 -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative">
             <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المنتج</div>
             <div class="absolute top-4 left-4 bg-white px-3 py-1 text-xs font-bold rounded-full">جديد</div>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">منتج مميز رقم ١</h3>
            <p class="text-gray-500 text-sm mb-4 font-medium">التصنيف</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">199 ر.س</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <!-- Product 2 -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المنتج</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">منتج مميز رقم ٢</h3>
            <p class="text-gray-500 text-sm mb-4 font-medium">التصنيف</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">249 ر.س</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <!-- Product 3 -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المنتج</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">منتج مميز رقم ٣</h3>
            <p class="text-gray-500 text-sm mb-4 font-medium">التصنيف</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">399 ر.س</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
        <!-- Product 4 -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
          <div class="h-64 bg-gray-200 relative"><div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المنتج</div></div>
          <div class="p-6">
            <h3 class="text-lg font-bold mb-1 group-hover:text-blue-600 transition">منتج مميز رقم ٤</h3>
            <p class="text-gray-500 text-sm mb-4 font-medium">التصنيف</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-black" style="color: {{secondaryColor}};">149 ر.س</span>
              <button class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background-color: {{colorHex}};">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter & Footer -->
  <footer style="background-color: {{secondaryColor}};" class="text-white pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-700 pb-12 mb-8">
        <div>
          <h2 class="text-2xl font-black mb-4">انضم لنشرتنا البريدية</h2>
          <p class="text-gray-400 mb-6 font-medium">احصل على خصم 15% على طلبك الأول وأحدث العروض الحصرية.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="أدخل بريدك الإلكتروني" class="px-4 py-3 rounded-lg w-full md:w-2/3 text-gray-900 focus:outline-none font-medium text-right" dir="rtl">
            <button style="background-color: {{colorHex}};" class="px-6 py-3 rounded-lg font-bold hover:opacity-90 whitespace-nowrap">اشترك الآن</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-8">
          <div>
            <h4 class="font-bold mb-4 text-lg">التسوق</h4>
            <ul class="space-y-2 text-gray-400 font-medium">
              <li><a href="#" class="hover:text-white transition">وصلنا حديثاً</a></li>
              <li><a href="#" class="hover:text-white transition">الأكثر مبيعاً</a></li>
              <li><a href="#" class="hover:text-white transition">التخفيضات</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4 text-lg">الدعم الفني</h4>
            <ul class="space-y-2 text-gray-400 font-medium">
              <li><a href="#" class="hover:text-white transition">الأسئلة الشائعة</a></li>
              <li><a href="#" class="hover:text-white transition">الشحن والتوصيل</a></li>
              <li><a href="#" class="hover:text-white transition">سياسة الاسترجاع</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-center text-gray-500 text-sm font-medium">
        &copy; 2024 {{brandName}}. جميع الحقوق محفوظة.
      </div>
    </div>
  </footer>

</body>
</html>`
  },

  // ─── 2. SAAS / SOFTWARE ────────────────────────────────────────────────────────
  {
    id: 'tpl_saas',
    name_ar: 'تطبيق برمجي (SaaS)',
    name_en: 'Software & SaaS',
    icon: '💻',
    description_ar: 'تصميم تقني مخصص لشركات السوفتوير والبرمجيات، يشمل مميزات وجداول أسعار.',
    description_en: 'A technical design for software companies, includes features and pricing tables.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Software Solution</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">

  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center max-w-7xl mx-auto">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-6 text-white/80">
      <a href="#features" class="hover:text-white transition">Features</a>
      <a href="#pricing" class="hover:text-white transition">Pricing</a>
      <a href="#faq" class="hover:text-white transition">FAQ</a>
    </div>
    <button class="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold hover:shadow-lg transition">Log in</button>
  </nav>

  <!-- Hero Section -->
  <header style="background-color: {{secondaryColor}};" class="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
    <!-- Abstract Shape -->
    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl opacity-50" style="background-color: {{colorHex}};"></div>
    
    <div class="max-w-4xl mx-auto text-center relative z-10">
      <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
        The ultimate tool for <br> <span style="color: {{colorHex}};">{{nicheName}}</span> professionals
      </h1>
      <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
        Automate your workflow, scale your operations, and save 20+ hours a week. Join 10,000+ teams already using {{brandName}}.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button style="background-color: {{colorHex}};" class="text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 shadow-lg shadow-[{{colorHex}}]/30 transition">
          Start 14-Day Free Trial
        </button>
        <button class="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition">
          Book a Demo
        </button>
      </div>
      <p class="text-sm text-slate-400 mt-6">No credit card required • Cancel anytime</p>
    </div>
  </header>

  <!-- Logo Cloud -->
  <div class="py-10 border-b border-slate-200 bg-white">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Trusted by innovative teams worldwide</p>
      <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
        <div class="text-xl font-black">COMPANY 1</div>
        <div class="text-xl font-black">COMPANY 2</div>
        <div class="text-xl font-black">COMPANY 3</div>
        <div class="text-xl font-black">COMPANY 4</div>
      </div>
    </div>
  </div>

  <!-- Features -->
  <section id="features" class="py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 max-w-3xl mx-auto">
        <h2 class="text-4xl font-extrabold text-slate-900 mb-4">Everything you need to succeed</h2>
        <p class="text-xl text-slate-600">Powerful features designed to help you work smarter, not harder.</p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Lightning Fast</h3>
          <p class="text-slate-600 leading-relaxed">Built on a modern technology stack that ensures your data loads instantly without any lag.</p>
        </div>
        <!-- Feature 2 -->
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Bank-Grade Security</h3>
          <p class="text-slate-600 leading-relaxed">Your data is encrypted at rest and in transit. We take your privacy and security seriously.</p>
        </div>
        <!-- Feature 3 -->
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Seamless Integrations</h3>
          <p class="text-slate-600 leading-relaxed">Connects perfectly with the tools you already use, including Slack, Google Workspace, and CRM.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold text-slate-900 mb-4">Simple, transparent pricing</h2>
        <p class="text-xl text-slate-600">No hidden fees. Cancel anytime.</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Starter Plan -->
        <div class="border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold mb-2">Starter</h3>
          <p class="text-slate-500 mb-6">Perfect for small teams and freelancers.</p>
          <div class="mb-6">
            <span class="text-4xl font-extrabold">$29</span><span class="text-slate-500">/mo</span>
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Up to 5 users</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Basic Analytics</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> 24/7 Email Support</li>
          </ul>
          <button class="w-full py-3 rounded-lg font-bold border-2 border-slate-200 hover:border-slate-300 transition">Get Started</button>
        </div>
        
        <!-- Pro Plan -->
        <div class="rounded-2xl p-8 shadow-xl relative" style="border: 2px solid {{colorHex}};">
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style="background-color: {{colorHex}};">Most Popular</div>
          <h3 class="text-2xl font-bold mb-2">Professional</h3>
          <p class="text-slate-500 mb-6">For growing companies needing more power.</p>
          <div class="mb-6">
            <span class="text-4xl font-extrabold">$99</span><span class="text-slate-500">/mo</span>
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Unlimited users</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Advanced Analytics & Reporting</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Priority 24/7 Support</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> Custom Integrations</li>
          </ul>
          <button class="w-full py-3 rounded-lg font-bold text-white transition hover:opacity-90 shadow-lg" style="background-color: {{colorHex}};">Start Free Trial</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
      {{brandLogoHtml}}
      <div class="flex space-x-6">
        <a href="#" class="hover:text-white transition">Privacy Policy</a>
        <a href="#" class="hover:text-white transition">Terms of Service</a>
        <a href="#" class="hover:text-white transition">Contact Us</a>
      </div>
    </div>
    <div class="text-center mt-8 text-sm">
      &copy; 2024 {{brandName}} Inc. All rights reserved.
    </div>
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | حلول برمجية متقدمة</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased">

  <!-- Navbar -->
  <nav class="absolute top-0 w-full z-50 py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center max-w-7xl mx-auto">
    {{brandLogoHtml}}
    <div class="hidden md:flex space-x-6 space-x-reverse text-white/80 font-medium">
      <a href="#features" class="hover:text-white transition">المميزات</a>
      <a href="#pricing" class="hover:text-white transition">الأسعار</a>
      <a href="#faq" class="hover:text-white transition">الأسئلة الشائعة</a>
    </div>
    <button class="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold hover:shadow-lg transition">تسجيل الدخول</button>
  </nav>

  <!-- Hero Section -->
  <header style="background-color: {{secondaryColor}};" class="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
    <div class="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full blur-3xl opacity-50" style="background-color: {{colorHex}};"></div>
    
    <div class="max-w-4xl mx-auto text-center relative z-10">
      <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
        الأداة المتكاملة لمحترفي <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
      </h1>
      <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
        قم بأتمتة مهامك، وسّع نطاق عملك، ووفّر أكثر من 20 ساعة أسبوعياً. انضم لأكثر من 10,000 فريق يستخدم {{brandName}} بنجاح.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button style="background-color: {{colorHex}};" class="text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 shadow-lg shadow-[{{colorHex}}]/30 transition">
          ابدأ تجربتك المجانية (14 يوم)
        </button>
        <button class="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition">
          احجز جلسة تعريفية
        </button>
      </div>
      <p class="text-sm text-slate-400 mt-6 font-medium">لا يتطلب بطاقة ائتمانية • يمكنك الإلغاء متى شئت</p>
    </div>
  </header>

  <!-- Logo Cloud -->
  <div class="py-10 border-b border-slate-200 bg-white">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">يثق بنا الآلاف من رواد الأعمال حول العالم</p>
      <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
        <div class="text-xl font-black">شركة ١</div>
        <div class="text-xl font-black">شركة ٢</div>
        <div class="text-xl font-black">شركة ٣</div>
        <div class="text-xl font-black">شركة ٤</div>
      </div>
    </div>
  </div>

  <!-- Features -->
  <section id="features" class="py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 max-w-3xl mx-auto">
        <h2 class="text-4xl font-black text-slate-900 mb-4">كل ما تحتاجه للنجاح في مكان واحد</h2>
        <p class="text-xl text-slate-600 font-medium">خصائص جبارة مصممة خصيصاً لمساعدتك على العمل بذكاء وليس بجهد.</p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">سرعة البرق</h3>
          <p class="text-slate-600 leading-relaxed font-medium">مبني على أحدث التقنيات البرمجية لضمان تحميل بياناتك وعرضها في أجزاء من الثانية بدون أي بطء.</p>
        </div>
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">أمان بدرجة البنوك</h3>
          <p class="text-slate-600 leading-relaxed font-medium">تشفير متقدم لبياناتك. خصوصيتك وأمان معلومات عملائك هي أولويتنا القصوى.</p>
        </div>
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6" style="background-color: {{colorHex}};">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3">تكامل سلس</h3>
          <p class="text-slate-600 leading-relaxed font-medium">اربط المنصة بسهولة مع أدواتك الحالية مثل Slack، Google Workspace، وأنظمة إدارة العملاء.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black text-slate-900 mb-4">باقات شفافة وبسيطة</h2>
        <p class="text-xl text-slate-600 font-medium">بدون رسوم خفية. يمكنك الإلغاء في أي وقت.</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Starter Plan -->
        <div class="border border-slate-200 rounded-2xl p-8 shadow-sm bg-white">
          <h3 class="text-2xl font-bold mb-2">الباقة الأساسية</h3>
          <p class="text-slate-500 mb-6 font-medium">مثالية للفرق الصغيرة والمستقلين.</p>
          <div class="mb-6 flex items-baseline gap-1">
            <span class="text-4xl font-black">29$</span><span class="text-slate-500 font-medium">/شهرياً</span>
          </div>
          <ul class="space-y-4 mb-8 font-medium">
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> لغاية 5 مستخدمين</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> تحليلات أساسية</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> دعم فني عبر الإيميل</li>
          </ul>
          <button class="w-full py-3 rounded-lg font-bold border-2 border-slate-200 hover:border-slate-300 transition text-slate-700">اشترك الآن</button>
        </div>
        
        <!-- Pro Plan -->
        <div class="rounded-2xl p-8 shadow-xl relative bg-white" style="border: 2px solid {{colorHex}};">
          <div class="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style="background-color: {{colorHex}};">الأكثر طلباً</div>
          <h3 class="text-2xl font-bold mb-2">الباقة الاحترافية</h3>
          <p class="text-slate-500 mb-6 font-medium">للشركات النامية التي تبحث عن أداء أعلى.</p>
          <div class="mb-6 flex items-baseline gap-1">
            <span class="text-4xl font-black">99$</span><span class="text-slate-500 font-medium">/شهرياً</span>
          </div>
          <ul class="space-y-4 mb-8 font-medium">
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> عدد مستخدمين لا محدود</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> تقارير وتحليلات متقدمة</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> أولوية الدعم الفني 24/7</li>
            <li class="flex items-center gap-3"><span style="color: {{colorHex}};">✓</span> ربط برمجيات مخصص (API)</li>
          </ul>
          <button class="w-full py-3 rounded-lg font-bold text-white transition hover:opacity-90 shadow-lg" style="background-color: {{colorHex}};">ابدأ تجربتك المجانية</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
      {{brandLogoHtml}}
      <div class="flex space-x-6 space-x-reverse font-medium">
        <a href="#" class="hover:text-white transition">سياسة الخصوصية</a>
        <a href="#" class="hover:text-white transition">شروط الاستخدام</a>
        <a href="#" class="hover:text-white transition">اتصل بنا</a>
      </div>
    </div>
    <div class="text-center mt-8 text-sm font-medium">
      &copy; 2024 {{brandName}}. جميع الحقوق محفوظة.
    </div>
  </footer>

</body>
</html>`
  },

  // ─── 3. FREELANCE PORTFOLIO ───────────────────────────────────────────────────
  {
    id: 'tpl_portfolio',
    name_ar: 'بورتفوليو للمستقلين',
    name_en: 'Freelance Portfolio',
    icon: '🎨',
    description_ar: 'معرض أعمال شخصي لعرض المهارات، المشاريع السابقة، ونموذج تواصل احترافي لحجز الخدمات.',
    description_en: 'Personal portfolio to showcase skills, past projects, and a booking/contact form.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#fafafa] text-gray-800 font-sans antialiased">
  
  <div class="max-w-5xl mx-auto px-6 lg:px-8">
    
    <!-- Header -->
    <header class="py-12 flex justify-between items-center">
      <div class="text-xl font-bold tracking-tighter" style="color: {{secondaryColor}};">{{brandName}}.</div>
      <nav class="hidden sm:flex gap-6 text-sm font-medium text-gray-500">
        <a href="#work" class="hover:text-gray-900 transition">Work</a>
        <a href="#about" class="hover:text-gray-900 transition">About</a>
        <a href="#contact" class="hover:text-gray-900 transition">Contact</a>
      </nav>
      <a href="#contact" class="text-sm font-bold text-white px-5 py-2 rounded-full transition hover:opacity-90 shadow-md" style="background-color: {{colorHex}};">Let's Talk</a>
    </header>

    <!-- Hero -->
    <main class="py-20 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
      <div class="md:w-3/5">
        <h1 class="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-gray-900 tracking-tight">
          Crafting digital experiences in <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
          Hi, I'm {{brandName}}. I help forward-thinking brands build engaging, high-performance solutions that stand out.
        </p>
        <div class="flex gap-4">
          <a href="#work" class="text-white px-8 py-4 rounded-full font-bold transition hover:shadow-lg hover:-translate-y-1 inline-block" style="background-color: {{secondaryColor}};">View My Work</a>
        </div>
      </div>
      <div class="md:w-2/5 flex justify-end">
        <div class="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white relative" style="background-color: {{colorHex}}20;">
           <!-- Profile Image Placeholder -->
           <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Your Photo</div>
        </div>
      </div>
    </main>

    <!-- Featured Work -->
    <section id="work" class="py-20">
      <div class="flex justify-between items-end mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Selected Works</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Project 1 -->
        <a href="#" class="group block">
          <div class="rounded-3xl overflow-hidden bg-gray-200 aspect-[4/3] mb-6 relative">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center text-gray-400">Project Image</div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Project Alpha</h3>
          <p class="text-gray-500 font-medium">Branding & Strategy</p>
        </a>
        
        <!-- Project 2 -->
        <a href="#" class="group block md:mt-16">
          <div class="rounded-3xl overflow-hidden bg-gray-200 aspect-[4/3] mb-6 relative">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center text-gray-400">Project Image</div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Beta Platform</h3>
          <p class="text-gray-500 font-medium">UI/UX Design</p>
        </a>
      </div>
    </section>

    <!-- Services / Skills -->
    <section class="py-20 border-t border-gray-200">
      <div class="grid md:grid-cols-3 gap-12">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Expertise</h2>
          <p class="text-gray-500 leading-relaxed mb-6">I specialize in creating end-to-end solutions that elevate brands and improve user satisfaction.</p>
        </div>
        <div class="md:col-span-2 grid sm:grid-cols-2 gap-8">
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">Strategy</h4>
            <p class="text-gray-500 text-sm leading-relaxed">Research, competitive analysis, and strategic planning for your business.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">Design</h4>
            <p class="text-gray-500 text-sm leading-relaxed">High-fidelity UI/UX design focusing on conversion and aesthetics.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">Development</h4>
            <p class="text-gray-500 text-sm leading-relaxed">Clean, efficient code that brings designs to life seamlessly.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">Optimization</h4>
            <p class="text-gray-500 text-sm leading-relaxed">Performance tuning and continuous improvement for maximum impact.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section id="contact" class="py-24 my-20 rounded-3xl text-center px-6 relative overflow-hidden" style="background-color: {{secondaryColor}};">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 20px 20px;"></div>
      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Have an idea?</h2>
        <p class="text-lg text-gray-300 mb-10">Let's build something great together. I'm currently available for new projects.</p>
        <a href="mailto:hello@example.com" class="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
          hello@{{brandName}}.com
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 border-t border-gray-200">
      <p>&copy; 2024 {{brandName}}. All rights reserved.</p>
      <div class="flex gap-4 mt-4 md:mt-0">
        <a href="#" class="hover:text-gray-900 transition">LinkedIn</a>
        <a href="#" class="hover:text-gray-900 transition">Twitter</a>
        <a href="#" class="hover:text-gray-900 transition">Dribbble</a>
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
  <title>{{brandName}} | بورتفوليو</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;800;900&display=swap');
    body { font-family: 'Alexandria', sans-serif; }
  </style>
</head>
<body class="bg-[#fafafa] text-gray-800 antialiased">
  
  <div class="max-w-5xl mx-auto px-6 lg:px-8">
    
    <!-- Header -->
    <header class="py-12 flex justify-between items-center">
      <div class="text-xl font-black tracking-tighter" style="color: {{secondaryColor}};">{{brandName}}.</div>
      <nav class="hidden sm:flex gap-6 text-sm font-bold text-gray-500">
        <a href="#work" class="hover:text-gray-900 transition">أعمالي</a>
        <a href="#about" class="hover:text-gray-900 transition">عني</a>
        <a href="#contact" class="hover:text-gray-900 transition">تواصل معي</a>
      </nav>
      <a href="#contact" class="text-sm font-bold text-white px-5 py-2 rounded-full transition hover:opacity-90 shadow-md" style="background-color: {{colorHex}};">لنبدأ مشروعك</a>
    </header>

    <!-- Hero -->
    <main class="py-20 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
      <div class="md:w-3/5 text-center md:text-right">
        <h1 class="text-5xl md:text-6xl font-black leading-tight mb-6 text-gray-900 tracking-tight">
          أصمم تجارب رقمية إبداعية في <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-500 mb-10 max-w-lg leading-relaxed mx-auto md:mx-0 font-medium">
          أهلاً، أنا {{brandName}}. أساعد الشركات الطموحة على بناء حلول تفاعلية ومبتكرة تبرز في السوق وتحقق أهدافها.
        </p>
        <div class="flex gap-4 justify-center md:justify-start">
          <a href="#work" class="text-white px-8 py-4 rounded-full font-bold transition hover:shadow-lg hover:-translate-y-1 inline-block" style="background-color: {{secondaryColor}};">شاهد أعمالي</a>
        </div>
      </div>
      <div class="md:w-2/5 flex justify-center md:justify-end">
        <div class="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white relative" style="background-color: {{colorHex}}20;">
           <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورتك هنا</div>
        </div>
      </div>
    </main>

    <!-- Featured Work -->
    <section id="work" class="py-20">
      <div class="flex justify-between items-end mb-12">
        <h2 class="text-3xl md:text-4xl font-black text-gray-900">مشاريع مختارة</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Project 1 -->
        <a href="#" class="group block">
          <div class="rounded-3xl overflow-hidden bg-gray-200 aspect-[4/3] mb-6 relative">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المشروع</div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">مشروع ألفا</h3>
          <p class="text-gray-500 font-medium">تطوير الهوية واستراتيجية العلامة</p>
        </a>
        
        <!-- Project 2 -->
        <a href="#" class="group block md:mt-16">
          <div class="rounded-3xl overflow-hidden bg-gray-200 aspect-[4/3] mb-6 relative">
            <div class="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold">صورة المشروع</div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">منصة بيتا</h3>
          <p class="text-gray-500 font-medium">تصميم واجهة وتجربة المستخدم (UI/UX)</p>
        </a>
      </div>
    </section>

    <!-- Services / Skills -->
    <section class="py-20 border-t border-gray-200">
      <div class="grid md:grid-cols-3 gap-12">
        <div>
          <h2 class="text-3xl font-black text-gray-900 mb-6">مجالات خبرتي</h2>
          <p class="text-gray-500 leading-relaxed mb-6 font-medium">أتخصص في تقديم حلول متكاملة ترفع من قيمة علامتك التجارية وتحسن من رضا عملائك بشكل ملحوظ.</p>
        </div>
        <div class="md:col-span-2 grid sm:grid-cols-2 gap-8">
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">الاستراتيجية</h4>
            <p class="text-gray-500 text-sm leading-relaxed font-medium">بحث السوق، تحليل المنافسين، والتخطيط الاستراتيجي لعملك.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">التصميم</h4>
            <p class="text-gray-500 text-sm leading-relaxed font-medium">تصميمات بصرية جذابة تركز على رفع معدلات التحويل.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">التطوير</h4>
            <p class="text-gray-500 text-sm leading-relaxed font-medium">كتابة كود برمجي نظيف وسريع يحول التصميم لواقع بكل سلاسة.</p>
          </div>
          <div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-4" style="background-color: {{colorHex}}20; color: {{colorHex}};">✦</div>
            <h4 class="text-lg font-bold mb-2 text-gray-900">التحسين</h4>
            <p class="text-gray-500 text-sm leading-relaxed font-medium">تحسين الأداء والسرعة بشكل مستمر لضمان أعلى تأثير ممكن.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section id="contact" class="py-24 my-20 rounded-3xl text-center px-6 relative overflow-hidden" style="background-color: {{secondaryColor}};">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 20px 20px;"></div>
      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-black text-white mb-6">لديك فكرة لمشروع؟</h2>
        <p class="text-lg text-gray-300 mb-10 font-medium">دعنا نبني شيئاً عظيماً معاً. أنا متاح حالياً لاستقبال مشاريع جديدة.</p>
        <a href="mailto:hello@example.com" class="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition transform hover:-translate-y-1">
          hello@{{brandName}}.com
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 border-t border-gray-200 font-medium">
      <p>&copy; 2024 {{brandName}}. جميع الحقوق محفوظة.</p>
      <div class="flex gap-4 mt-4 md:mt-0">
        <a href="#" class="hover:text-gray-900 transition">لينكد إن</a>
        <a href="#" class="hover:text-gray-900 transition">تويتر</a>
        <a href="#" class="hover:text-gray-900 transition">بيهاينس</a>
      </div>
    </footer>

  </div>
</body>
</html>`
  },

  // ─── 4. REAL ESTATE ──────────────────────────────────────────────────────────
  {
    id: 'tpl_realestate',
    name_ar: 'وساطة وعقارات',
    name_en: 'Real Estate & Properties',
    icon: '🏢',
    description_ar: 'قالب يعكس الثقة والموثوقية، مخصص لعرض العقارات والمشاريع السكنية بدقة.',
    description_en: 'Builds trust and reliability, perfect for showcasing properties and housing projects.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | Real Estate</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans antialiased bg-gray-50 text-gray-800">
  
  <!-- Navigation -->
  <nav class="absolute top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      {{brandLogoHtml}}
      <div class="hidden md:flex space-x-8 text-sm font-semibold text-gray-600 uppercase tracking-wide">
        <a href="#" class="hover:text-gray-900 transition">Buy</a>
        <a href="#" class="hover:text-gray-900 transition">Rent</a>
        <a href="#" class="hover:text-gray-900 transition">Agents</a>
      </div>
      <button style="background-color: {{colorHex}};" class="text-white px-6 py-3 rounded text-sm font-bold shadow-md hover:shadow-lg transition">Contact Agent</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="relative h-screen min-h-[600px] flex items-center justify-center bg-gray-900">
    <div class="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
    <div class="absolute inset-0 flex items-center justify-center opacity-30 text-white font-bold text-4xl">Luxury Property Image Placeholder</div>
    
    <div class="relative z-20 text-center px-4 w-full max-w-4xl">
      <h1 class="text-4xl md:text-6xl font-serif text-white mb-6 font-bold leading-tight drop-shadow-lg">
        Find Your Perfect Home in <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
      </h1>
      <p class="text-xl text-gray-200 mb-10 drop-shadow-md font-light">Exclusive properties, unmatched service, and exceptional living.</p>
      
      <!-- Search Box -->
      <div class="bg-white p-2 rounded-lg flex flex-col md:flex-row shadow-2xl max-w-3xl mx-auto gap-2">
        <input type="text" placeholder="Search by city, neighborhood, or address..." class="flex-1 px-4 py-3 focus:outline-none text-gray-700">
        <button style="background-color: {{colorHex}};" class="text-white px-8 py-3 rounded-md font-bold transition hover:opacity-90">Search</button>
      </div>
    </div>
  </header>

  <!-- Featured Properties -->
  <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h2 class="text-3xl font-serif font-bold text-gray-900 mb-2" style="color: {{secondaryColor}};">Featured Properties</h2>
        <p class="text-gray-500">Discover our hand-picked selection of premium estates.</p>
      </div>
      <a href="#" class="hidden md:block font-bold hover:underline" style="color: {{colorHex}};">View all properties &rarr;</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Property Card 1 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500">Property Image</div>
          <div class="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">FOR SALE</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">$1,250,000</h3>
          <p class="text-gray-500 mb-4 truncate">123 Beverly Hills Blvd, CA</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            <span class="flex items-center gap-1">🛏️ 4 Beds</span>
            <span class="flex items-center gap-1">🚿 3 Baths</span>
            <span class="flex items-center gap-1">📐 3,200 sqft</span>
          </div>
        </div>
      </div>
      
      <!-- Property Card 2 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500">Property Image</div>
          <div class="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">FOR RENT</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">$4,500 <span class="text-sm text-gray-400 font-normal">/mo</span></h3>
          <p class="text-gray-500 mb-4 truncate">45 Downtown Avenue, NY</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            <span class="flex items-center gap-1">🛏️ 2 Beds</span>
            <span class="flex items-center gap-1">🚿 2 Baths</span>
            <span class="flex items-center gap-1">📐 1,100 sqft</span>
          </div>
        </div>
      </div>

      <!-- Property Card 3 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500">Property Image</div>
          <div class="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">FOR SALE</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">$890,000</h3>
          <p class="text-gray-500 mb-4 truncate">78 Pinecrest Drive, TX</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            <span class="flex items-center gap-1">🛏️ 3 Beds</span>
            <span class="flex items-center gap-1">🚿 2.5 Baths</span>
            <span class="flex items-center gap-1">📐 2,400 sqft</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Value Proposition -->
  <section class="py-20 bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-serif font-bold mb-6" style="color: {{secondaryColor}};">Why choose {{brandName}}?</h2>
        <p class="text-gray-600 leading-relaxed mb-8">We bring a wealth of knowledge and expertise about buying and selling real estate. It's not the same everywhere, so you need someone you can trust for up-to-date information.</p>
        
        <ul class="space-y-4">
          <li class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style="background-color: {{colorHex}};">✓</div>
            <div>
              <h4 class="font-bold text-gray-900">Local Market Expertise</h4>
              <p class="text-sm text-gray-500">Deep understanding of local property values.</p>
            </div>
          </li>
          <li class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style="background-color: {{colorHex}};">✓</div>
            <div>
              <h4 class="font-bold text-gray-900">Vast Network</h4>
              <p class="text-sm text-gray-500">Connecting buyers and sellers quickly.</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="md:w-1/2">
        <div class="h-96 bg-gray-200 rounded-xl relative shadow-lg">
           <div class="absolute inset-0 flex items-center justify-center text-gray-500">Agent Team Image</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-300 py-12 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="col-span-1 md:col-span-2">
        {{brandLogoHtml}}
        <p class="mb-4 max-w-sm text-gray-400">Your trusted partner in navigating the complex real estate market. We make buying and selling simple.</p>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-white">Properties</a></li>
          <li><a href="#" class="hover:text-white">Our Agents</a></li>
          <li><a href="#" class="hover:text-white">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4 uppercase tracking-wider">Contact</h4>
        <ul class="space-y-2">
          <li>123 Real Estate Blvd</li>
          <li>Suite 400</li>
          <li>contact@{{brandName}}.com</li>
        </ul>
      </div>
    </div>
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | عقارات ووساطة</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; }
    h1, h2, .font-serif { font-family: 'Amiri', serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-800 antialiased">
  
  <!-- Navigation -->
  <nav class="absolute top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      {{brandLogoHtml}}
      <div class="hidden md:flex space-x-8 space-x-reverse text-sm font-bold text-gray-600 tracking-wide">
        <a href="#" class="hover:text-gray-900 transition">شراء</a>
        <a href="#" class="hover:text-gray-900 transition">إيجار</a>
        <a href="#" class="hover:text-gray-900 transition">وكلاؤنا</a>
      </div>
      <button style="background-color: {{colorHex}};" class="text-white px-6 py-3 rounded text-sm font-bold shadow-md hover:shadow-lg transition">تواصل مع وكيل</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="relative h-screen min-h-[600px] flex items-center justify-center bg-gray-900">
    <div class="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
    <div class="absolute inset-0 flex items-center justify-center opacity-30 text-white font-bold text-4xl">صورة خلفية فاخرة لعقار</div>
    
    <div class="relative z-20 text-center px-4 w-full max-w-4xl mt-10">
      <h1 class="text-5xl md:text-7xl text-white mb-6 font-bold leading-tight drop-shadow-lg">
        اعثر على منزل أحلامك في <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
      </h1>
      <p class="text-xl text-gray-200 mb-10 drop-shadow-md font-medium">عقارات حصرية، خدمة لا تضاهى، ومستوى معيشة استثنائي.</p>
      
      <!-- Search Box -->
      <div class="bg-white p-2 rounded-lg flex flex-col md:flex-row shadow-2xl max-w-3xl mx-auto gap-2">
        <input type="text" placeholder="ابحث بالمدينة، الحي، أو اسم الشارع..." class="flex-1 px-4 py-3 focus:outline-none text-gray-700 font-medium">
        <button style="background-color: {{colorHex}};" class="text-white px-8 py-3 rounded-md font-bold transition hover:opacity-90 text-lg">بحث</button>
      </div>
    </div>
  </header>

  <!-- Featured Properties -->
  <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h2 class="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2" style="color: {{secondaryColor}};">عقارات مميزة</h2>
        <p class="text-gray-500 font-medium">اكتشف تشكيلتنا المختارة بعناية من العقارات الفاخرة.</p>
      </div>
      <a href="#" class="hidden md:block font-bold hover:underline" style="color: {{colorHex}};">شاهد كل العقارات &larr;</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Property Card 1 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">صورة العقار</div>
          <div class="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">للبيع</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">1,250,000 ر.س</h3>
          <p class="text-gray-500 mb-4 truncate font-medium">حي النرجس، الرياض</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4 font-medium">
            <span class="flex items-center gap-1">🛏️ 4 غرف</span>
            <span class="flex items-center gap-1">🚿 3 حمام</span>
            <span class="flex items-center gap-1">📐 350 م²</span>
          </div>
        </div>
      </div>
      
      <!-- Property Card 2 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">صورة العقار</div>
          <div class="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">للإيجار</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">45,000 <span class="text-sm text-gray-400 font-normal">/سنوياً</span></h3>
          <p class="text-gray-500 mb-4 truncate font-medium">داون تاون، دبي</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4 font-medium">
            <span class="flex items-center gap-1">🛏️ 2 غرف</span>
            <span class="flex items-center gap-1">🚿 2 حمام</span>
            <span class="flex items-center gap-1">📐 120 م²</span>
          </div>
        </div>
      </div>

      <!-- Property Card 3 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group">
        <div class="h-60 bg-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">صورة العقار</div>
          <div class="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded shadow" style="background-color: {{colorHex}};">للبيع</div>
        </div>
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-1" style="color: {{secondaryColor}};">890,000 ر.س</h3>
          <p class="text-gray-500 mb-4 truncate font-medium">المدينة الجديدة، التجمع الخامس</p>
          <div class="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4 font-medium">
            <span class="flex items-center gap-1">🛏️ 3 غرف</span>
            <span class="flex items-center gap-1">🚿 2.5 حمام</span>
            <span class="flex items-center gap-1">📐 220 م²</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Value Proposition -->
  <section class="py-20 bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-serif font-bold mb-6" style="color: {{secondaryColor}};">لماذا تختار {{brandName}}؟</h2>
        <p class="text-gray-600 leading-relaxed mb-8 font-medium">نحن نقدم لك ثروة من المعرفة والخبرة في سوق بيع وشراء العقارات. السوق يتغير باستمرار، لذا أنت بحاجة لمستشار تثق به للحصول على أحدث وأدق المعلومات.</p>
        
        <ul class="space-y-4">
          <li class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style="background-color: {{colorHex}};">✓</div>
            <div>
              <h4 class="font-bold text-gray-900">خبرة عميقة بالسوق المحلي</h4>
              <p class="text-sm text-gray-500 font-medium">فهم دقيق لتقييمات العقارات ومستقبل الأحياء السكنية.</p>
            </div>
          </li>
          <li class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style="background-color: {{colorHex}};">✓</div>
            <div>
              <h4 class="font-bold text-gray-900">شبكة علاقات واسعة</h4>
              <p class="text-sm text-gray-500 font-medium">نربط المشترين بالبائعين بسرعة وفعالية عالية.</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="md:w-1/2">
        <div class="h-96 bg-gray-200 rounded-xl relative shadow-lg">
           <div class="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">صورة لفريق العمل</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-300 py-12 text-sm font-medium">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="col-span-1 md:col-span-2">
        {{brandLogoHtml}}
        <p class="mb-4 max-w-sm text-gray-400">شريكك الموثوق في التنقل داخل سوق العقارات المعقد. نحن نجعل عملية البيع والشراء بسيطة وآمنة.</p>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4 tracking-wider">روابط سريعة</h4>
        <ul class="space-y-2">
          <li><a href="#" class="hover:text-white">العقارات</a></li>
          <li><a href="#" class="hover:text-white">وكلاؤنا</a></li>
          <li><a href="#" class="hover:text-white">تواصل معنا</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-4 tracking-wider">تواصل</h4>
        <ul class="space-y-2 text-left" dir="ltr">
          <li>123 Real Estate Blvd</li>
          <li>contact@{{brandName}}.com</li>
        </ul>
      </div>
    </div>
  </footer>

</body>
</html>`
  },

  // ─── 5. APP SHOWCASE ──────────────────────────────────────────────────────────
  {
    id: 'tpl_app',
    name_ar: 'تطبيق جوال',
    name_en: 'Mobile App Showcase',
    icon: '📱',
    description_ar: 'واجهة عصرية لعرض مميزات تطبيق الجوال مع روابط التحميل من المتاجر.',
    description_en: 'Modern UI to showcase your mobile app features with download links.',
    code_en: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | The Best App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-800 font-sans antialiased overflow-x-hidden">
  
  <div style="background: linear-gradient(135deg, {{secondaryColor}}, #0f172a);" class="text-white">
    <!-- Nav -->
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
      {{brandLogoHtml}}
      <button style="background-color: {{colorHex}};" class="px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">Download</button>
    </nav>

    <!-- Hero -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col md:flex-row items-center relative">
      <!-- Glow effect -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[{{colorHex}}] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

      <div class="md:w-1/2 text-center md:text-left relative z-10">
        <h1 class="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          The smarter way to <br> manage <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-300 mb-10 max-w-lg mx-auto md:mx-0">
          Everything you need in one powerful app. Download {{brandName}} today and simplify your daily routine instantly.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button class="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold border border-gray-700 hover:bg-gray-900 transition">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.72 1.63.07 2.81.76 3.63 1.94-3.03 1.83-2.52 5.61.42 6.84-1.12 2.05-1.93 3.01-2.72 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            App Store
          </button>
          <button class="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold border border-gray-700 hover:bg-gray-900 transition">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 20.5l10-6.5-10-6.5v13zm10-6.5l4 2.5 3-2-7-4.5v4z"/></svg>
            Google Play
          </button>
        </div>
      </div>
      <div class="md:w-1/2 mt-16 md:mt-0 flex justify-center relative z-10">
        <!-- Phone Mockup -->
        <div class="w-[280px] h-[580px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
          <div class="absolute top-0 w-full h-6 bg-black rounded-b-xl flex justify-center"><div class="w-20 h-4 bg-gray-900 rounded-b-xl mt-1"></div></div>
          <div class="w-full h-full flex flex-col items-center justify-center" style="background-color: {{colorHex}}20;">
            <div class="text-center">
              <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg" style="background-color: {{colorHex}};">Logo</div>
              <div class="text-white font-bold opacity-50">App Interface</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features (Z-Pattern) -->
  <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-20 max-w-2xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Why users love {{brandName}}</h2>
      <p class="text-gray-500 text-lg">Designed to be incredibly easy to use while packing powerful features under the hood.</p>
    </div>

    <!-- Feature 1 -->
    <div class="flex flex-col md:flex-row items-center gap-12 mb-24">
      <div class="md:w-1/2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-md" style="background-color: {{colorHex}};">✨</div>
        <h3 class="text-3xl font-bold mb-4 text-gray-900">Intuitive Dashboard</h3>
        <p class="text-gray-600 text-lg leading-relaxed mb-6">See everything at a glance. Our beautiful dashboard gives you the insights you need without the clutter.</p>
        <ul class="space-y-3">
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> Real-time updates</li>
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> Customizable widgets</li>
        </ul>
      </div>
      <div class="md:w-1/2 flex justify-center">
         <div class="w-[250px] h-[500px] bg-gray-100 rounded-3xl border-4 border-gray-200 shadow-xl flex items-center justify-center text-gray-400 font-bold">Screenshot</div>
      </div>
    </div>

    <!-- Feature 2 -->
    <div class="flex flex-col md:flex-row-reverse items-center gap-12">
      <div class="md:w-1/2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-md" style="background-color: {{colorHex}};">🚀</div>
        <h3 class="text-3xl font-bold mb-4 text-gray-900">Lightning Fast Sync</h3>
        <p class="text-gray-600 text-lg leading-relaxed mb-6">Never lose your data. Everything syncs instantly across all your devices securely in the cloud.</p>
        <ul class="space-y-3">
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> Offline mode support</li>
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> Bank-level encryption</li>
        </ul>
      </div>
      <div class="md:w-1/2 flex justify-center">
         <div class="w-[250px] h-[500px] bg-gray-100 rounded-3xl border-4 border-gray-200 shadow-xl flex items-center justify-center text-gray-400 font-bold">Screenshot</div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 bg-gray-50 text-center">
    <div class="max-w-3xl mx-auto px-4">
      <h2 class="text-4xl font-extrabold text-gray-900 mb-6">Ready to transform your workflow?</h2>
      <p class="text-xl text-gray-600 mb-10">Join thousands of users who have already upgraded their lives with {{brandName}}.</p>
      <button style="background-color: {{colorHex}};" class="text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:opacity-90 transition transform hover:-translate-y-1">
        Download Now for Free
      </button>
    </div>
  </section>

  <footer class="text-center py-10 text-gray-400 text-sm border-t border-gray-100">
    &copy; 2024 {{brandName}} App. All rights reserved.
  </footer>

</body>
</html>`,
    code_ar: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brandName}} | التطبيق الأفضل</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800;900&display=swap');
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-white text-gray-800 antialiased overflow-x-hidden">
  
  <div style="background: linear-gradient(135deg, {{secondaryColor}}, #0f172a);" class="text-white">
    <!-- Nav -->
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
      {{brandLogoHtml}}
      <button style="background-color: {{colorHex}};" class="px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">تحميل التطبيق</button>
    </nav>

    <!-- Hero -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col md:flex-row items-center relative">
      <!-- Glow effect -->
      <div class="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[{{colorHex}}] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

      <div class="md:w-1/2 text-center md:text-right relative z-10">
        <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
          الطريقة الأذكى لإدارة <br> <span style="color: {{colorHex}};">{{nicheName}}</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-300 mb-10 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
          كل ما تحتاجه في تطبيق واحد جبار. حمّل {{brandName}} اليوم وبسّط روتينك اليومي بضغطة زر.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button class="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-bold border border-gray-700 hover:bg-gray-900 transition">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.72 1.63.07 2.81.76 3.63 1.94-3.03 1.83-2.52 5.61.42 6.84-1.12 2.05-1.93 3.01-2.72 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            App Store
          </button>
          <button class="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-bold border border-gray-700 hover:bg-gray-900 transition">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 20.5l10-6.5-10-6.5v13zm10-6.5l4 2.5 3-2-7-4.5v4z"/></svg>
            Google Play
          </button>
        </div>
      </div>
      <div class="md:w-1/2 mt-16 md:mt-0 flex justify-center relative z-10">
        <!-- Phone Mockup -->
        <div class="w-[280px] h-[580px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
          <div class="absolute top-0 w-full h-6 bg-black rounded-b-xl flex justify-center"><div class="w-20 h-4 bg-gray-900 rounded-b-xl mt-1"></div></div>
          <div class="w-full h-full flex flex-col items-center justify-center" style="background-color: {{colorHex}}20;">
            <div class="text-center">
              <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg" style="background-color: {{colorHex}};">شعار</div>
              <div class="text-white font-bold opacity-50">واجهة التطبيق</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features (Z-Pattern) -->
  <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-20 max-w-2xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">لماذا يعشق المستخدمون {{brandName}}</h2>
      <p class="text-gray-500 text-lg font-medium">تم تصميمه ليكون في غاية السهولة والبساطة، مع امتلاكه لمميزات جبارة في الخلفية.</p>
    </div>

    <!-- Feature 1 -->
    <div class="flex flex-col md:flex-row items-center gap-12 mb-24">
      <div class="md:w-1/2 text-right">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-md mr-0 ml-auto" style="background-color: {{colorHex}};">✨</div>
        <h3 class="text-3xl font-bold mb-4 text-gray-900">لوحة تحكم بديهية</h3>
        <p class="text-gray-600 text-lg leading-relaxed mb-6 font-medium">شاهد كل شيء بلمحة بصر. لوحة التحكم الأنيقة تمنحك الرؤى التي تحتاجها بدون أي فوضى أو تشتيت.</p>
        <ul class="space-y-3 font-medium">
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> تحديثات لحظية ومباشرة</li>
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> تخصيص كامل للواجهة</li>
        </ul>
      </div>
      <div class="md:w-1/2 flex justify-center">
         <div class="w-[250px] h-[500px] bg-gray-100 rounded-3xl border-4 border-gray-200 shadow-xl flex items-center justify-center text-gray-400 font-bold">سكرين شوت للتطبيق</div>
      </div>
    </div>

    <!-- Feature 2 -->
    <div class="flex flex-col md:flex-row-reverse items-center gap-12">
      <div class="md:w-1/2 text-right">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-md mr-0 ml-auto" style="background-color: {{colorHex}};">🚀</div>
        <h3 class="text-3xl font-bold mb-4 text-gray-900">مزامنة بسرعة البرق</h3>
        <p class="text-gray-600 text-lg leading-relaxed mb-6 font-medium">لن تفقد بياناتك أبداً. تتم مزامنة كل شيء فورياً عبر جميع أجهزتك بشكل آمن في السحابة.</p>
        <ul class="space-y-3 font-medium">
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> دعم وضع الأوفلاين</li>
          <li class="flex items-center gap-3 text-gray-600"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style="background-color: {{colorHex}};">✓</div> تشفير بيانات بدرجة البنوك</li>
        </ul>
      </div>
      <div class="md:w-1/2 flex justify-center">
         <div class="w-[250px] h-[500px] bg-gray-100 rounded-3xl border-4 border-gray-200 shadow-xl flex items-center justify-center text-gray-400 font-bold">سكرين شوت للتطبيق</div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 bg-gray-50 text-center">
    <div class="max-w-3xl mx-auto px-4">
      <h2 class="text-4xl font-black text-gray-900 mb-6">هل أنت مستعد للقفزة؟</h2>
      <p class="text-xl text-gray-600 mb-10 font-medium">انضم لآلاف المستخدمين الذين قاموا بترقية حياتهم باستخدام {{brandName}}.</p>
      <button style="background-color: {{colorHex}};" class="text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:opacity-90 transition transform hover:-translate-y-1">
        حمل التطبيق الآن مجاناً
      </button>
    </div>
  </section>

  <footer class="text-center py-10 text-gray-400 text-sm border-t border-gray-100 font-medium">
    &copy; 2024 تطبيق {{brandName}}. جميع الحقوق محفوظة.
  </footer>

</body>
</html>`
  }
];
