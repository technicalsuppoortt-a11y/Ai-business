import { db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const contentMap = {
    "instagram": {
        "awareness": {
            "strategy_ar": "التركيز الكامل على Reels الصوتية (Trending Audio) والمحتوى البصري الجذاب الذي يسهل مشاركته (Shareable). الانستجرام حالياً يفضل المحتوى الذي يبقي المستخدم أطول فترة ممكنة.",
            "strategy_en": "Full focus on audio Reels (Trending Audio) and highly visual shareable content. Instagram currently favors content that retains viewers the longest.",
            "bio_ar": "✨ {brandName} | دليلك الأفضل في {niche}\n🚀 نساعدك على تحقيق أهدافك بسرعة\n👇 اكتشف محتوانا المجاني يومياً",
            "bio_en": "✨ {brandName} | Your ultimate guide in {niche}\\n🚀 Helping you achieve your goals fast\\n👇 Discover our free daily content",
            "tips_ar": [
                "استخدم 3-5 هاشتاقات محددة جداً",
                "نشر Reels مدتها 5-7 ثواني مع نصوص قابلة للقراءة (Read Caption)",
                "الرد السريع على أول تعليقات لرفع التفاعل الأولي"
            ],
            "tips_en": [
                "Use 3-5 highly specific hashtags",
                "Post 5-7 second Reels with readable text (Read Caption)",
                "Reply quickly to early comments to boost initial engagement"
            ],
            "ideas_ar": [
                "Reel: '3 أخطاء تدمر نتائجك في {niche} وكيف تتجنبها' (فيديو سريع مع موسيقى تريند).",
                "Carousel: 'دليلك الشامل للبدء في {niche} من الصفر' (تصميم جذاب من 5 صفحات).",
                "Reel: 'كيف وفرت 10 ساعات أسبوعياً باستخدام هذه الأداة في {niche}'.",
                "Post: اقتباس قوي ومثير للجدل يخص {niche} لتشجيع المشاركة (Shares).",
                "Story: كواليس عمل {brandName} وكيف نبني محتوانا، مع ملصق تصويت (Poll)."
            ],
            "ideas_en": [
                "Reel: '3 mistakes destroying your {niche} results and how to avoid them' (Fast video with trending audio).",
                "Carousel: 'Your ultimate guide to starting in {niche} from scratch' (Attractive 5-slide design).",
                "Reel: 'How I saved 10 hours a week using this {niche} tool'.",
                "Post: A strong and controversial quote about {niche} to encourage shares.",
                "Story: Behind the scenes of {brandName} and how we build our content, with a poll sticker."
            ]
        },
        "engagement": {
            "strategy_ar": "بناء علاقة عميقة عبر الستوريز (Stories) واللايف (Live)، وطرح أسئلة تثير النقاش في التعليقات. الهدف تحويل المتابعين العابرين إلى جمهور وفي.",
            "strategy_en": "Build a deep connection through Stories and Live sessions, and ask discussion-provoking questions in the comments. The goal is to turn casual followers into a loyal audience.",
            "bio_ar": "🤝 {brandName} | مجتمع {niche} الأول\n💡 نناقش، نتعلم، ونتطور معاً\n👇 شاركنا رأيك في آخر بوست",
            "bio_en": "🤝 {brandName} | The #1 {niche} community\\n💡 We discuss, learn, and grow together\\n👇 Share your thoughts on our latest post",
            "tips_ar": [
                "استخدم ملصقات التفاعل (Q&A, Polls) يومياً في الستوري",
                "رد على التعليقات بأسئلة مفتوحة لإطالة المحادثة",
                "انشر محتوى 'خلف الكواليس' لتبدو كعلامة تجارية إنسانية"
            ],
            "tips_en": [
                "Use interactive stickers (Q&A, Polls) daily in Stories",
                "Reply to comments with open-ended questions to prolong conversations",
                "Post 'Behind the scenes' content to appear as a humanized brand"
            ],
            "ideas_ar": [
                "Post: 'ما هو التحدي الأكبر الذي يواجهك حالياً في {niche}؟' (صورة بسيطة مع سؤال واضح).",
                "Story: 'اسألني أي شيء (AMA) عن {niche}' مع مشاركة الإجابات كفيديو.",
                "Reel: الرد على تعليق من أحد المتابعين بفيديو تفصيلي (Video Reply).",
                "Carousel: مقارنة بين طريقتين مشهورتين في {niche} وطلب رأي الجمهور في التعليقات.",
                "Live: بث مباشر لمدة 15 دقيقة أسبوعياً لمناقشة أحدث التطورات في {niche}."
            ],
            "ideas_en": [
                "Post: 'What is your biggest current challenge in {niche}?' (Simple image with a clear question).",
                "Story: 'Ask Me Anything (AMA) about {niche}' and share answers via video.",
                "Reel: Video reply to a follower's comment with a detailed explanation.",
                "Carousel: A comparison between two popular methods in {niche} asking for the audience's opinion.",
                "Live: A 15-minute weekly live stream discussing the latest {niche} updates."
            ]
        },
        "leads": {
            "strategy_ar": "استخدام الـ 'Lead Magnets' (هدايا مجانية) في الـ Bio والترويج لها بقوة في الـ Reels والـ Stories باستخدام أدوات الأتمتة (مثل ManyChat).",
            "strategy_en": "Use 'Lead Magnets' (free gifts) in your Bio and promote them heavily in Reels and Stories using automation tools (like ManyChat).",
            "bio_ar": "🎁 {brandName} | خبراء {niche}\n📚 حمل الدليل المجاني الشامل من هنا 👇\n🔗 [رابط الـ Lead Magnet]",
            "bio_en": "🎁 {brandName} | {niche} Experts\\n📚 Download the comprehensive free guide here 👇\\n🔗 [Lead Magnet Link]",
            "tips_ar": [
                "استخدم ManyChat: 'علق بكلمة X ليصلك الرابط على الخاص'",
                "ركز على القيمة المقدمة في الهدية المجانية",
                "اجعل عملية التسجيل (Opt-in) من خطوة واحدة فقط"
            ],
            "tips_en": [
                "Use ManyChat: 'Comment X to get the link in your DMs'",
                "Focus on the value provided in the free gift",
                "Make the Opt-in process just one single step"
            ],
            "ideas_ar": [
                "Reel: 'اكتشفت سر في {niche} سيغير طريقتك.. علق بـ (سر) لأرسل لك الدليل المجاني'.",
                "Story: عرض لنتيجة مذهلة لأحد العملاء مع دعوة لتحميل 'كتاب خطوات النجاح'.",
                "Carousel: '5 أدوات مجانية في {niche}'.. الأداة الأقوى موجودة في الرابط في البايو.",
                "Post: إعلان مباشر عن قالب أو ملف PDF مجاني يحل مشكلة عاجلة لجمهورك.",
                "Reel: فيديو تعليمي ينقص خطوة أخيرة.. 'الخطوة الأخيرة في الكتيب المجاني بالبايو'."
            ],
            "ideas_en": [
                "Reel: 'I discovered a secret in {niche} that will change everything.. Comment (Secret) and I will send you the free guide'.",
                "Story: Showcase an amazing client result with a CTA to download the 'Success Steps Book'.",
                "Carousel: '5 free tools in {niche}'.. The most powerful tool is in the bio link.",
                "Post: Direct announcement of a free PDF or template that solves an urgent problem.",
                "Reel: A tutorial missing one final step.. 'The final step is in the free booklet in my bio'."
            ]
        },
        "sales": {
            "strategy_ar": "البيع غير المباشر (Soft Selling) عبر إثبات القيمة، مراجعات العملاء (Testimonials)، وإطلاق عروض محدودة الوقت (FOMO).",
            "strategy_en": "Soft selling by proving value, sharing client testimonials, and launching limited-time offers (FOMO).",
            "bio_ar": "🛍️ {brandName} | الحل الأسرع في {niche}\n⭐ أكثر من 1000 عميل سعيد\n🛒 احصل على عرض اليوم من هنا 👇",
            "bio_en": "🛍️ {brandName} | The fastest solution in {niche}\\n⭐ Over 1000 happy clients\\n🛒 Get today's offer here 👇",
            "tips_ar": [
                "أضف روابط المنتجات مباشرة عبر Instagram Shopping",
                "استخدم الـ Urgency (باقي 24 ساعة على العرض)",
                "انشر قصص نجاح حقيقية (Before & After)"
            ],
            "tips_en": [
                "Add product links directly via Instagram Shopping",
                "Use Urgency (Only 24 hours left on the offer)",
                "Post authentic success stories (Before & After)"
            ],
            "ideas_ar": [
                "Reel: دراسة حالة سريعة.. 'كيف ساعدنا [اسم العميل] على تحقيق [نتيجة] في 10 أيام'.",
                "Story: خصم فلاش (Flash Sale) لمدة 24 ساعة فقط على خدمات {niche} عبر رابط الستوري.",
                "Carousel: 'لماذا يفشل 90% في {niche}؟'.. الشريحة الأخيرة تروج لمنتجك كحل أكيد.",
                "Post: صورة احترافية للمنتج/الخدمة مع مراجعة (Review) قوية من عميل في الكابشن.",
                "Live: شرح مباشر لكيفية استخدام منتجك وحل مشكلات العملاء، مع كود خصم حصري للحضور."
            ],
            "ideas_en": [
                "Reel: Quick case study.. 'How we helped [Client Name] achieve [Result] in 10 days'.",
                "Story: Flash Sale for 24 hours only on {niche} services via the story link.",
                "Carousel: 'Why do 90% fail in {niche}?'.. The final slide promotes your product as the ultimate fix.",
                "Post: Professional photo of the product/service with a strong client review in the caption.",
                "Live: Direct demonstration of how to use your product to solve problems, with an exclusive discount code for attendees."
            ]
        }
    },
    "tiktok": {
        "awareness": {
            "strategy_ar": "محتوى عفوي، سريع الإيقاع، ومبني على التريندات (Trends) والتحديات. تيك توك يكافئ الفيديوهات التي تكسر النمطية في أول ثانيتين.",
            "strategy_en": "Spontaneous, fast-paced content based on trends and challenges. TikTok rewards videos that break the pattern in the first two seconds.",
            "bio_ar": "🔥 {brandName} | أسرار {niche}\n🎬 فيديوهات يومية ستغير تفكيرك\n👇 انضم لعائلتنا",
            "bio_en": "🔥 {brandName} | {niche} Secrets\\n🎬 Daily videos that will change your mindset\\n👇 Join our family",
            "tips_ar": [
                "استخدم الـ Hook البصري والصوتي في أول ثانية",
                "الموسيقى التريند ترفع فرصك بنسبة 60%",
                "انشر 2-3 مرات يومياً في البداية لتسريع الانتشار"
            ],
            "tips_en": [
                "Use a visual and audio Hook in the very first second",
                "Trending music increases your chances by 60%",
                "Post 2-3 times daily in the beginning to accelerate reach"
            ],
            "ideas_ar": [
                "فيديو POV: 'وجهة نظرك عندما تكتشف هذا السر في {niche} لأول مرة'.",
                "مشاركة أداة سحرية أو موقع غير معروف يسهل العمل في {niche}.",
                "تحدي سريع: 'جرب هذه الخدعة في {niche} وأخبرني بالنتيجة'.",
                "فيديو (Green Screen) للتعليق على خبر أو تريند جديد في مجالك.",
                "سلسلة: 'أشياء كنت أتمنى معرفتها قبل الدخول في {niche} - الجزء 1'."
            ],
            "ideas_en": [
                "POV Video: 'Your POV when you discover this {niche} secret for the first time'.",
                "Sharing a magical tool or unknown website that makes {niche} work easier.",
                "Quick challenge: 'Try this {niche} trick and tell me the result'.",
                "Green Screen video commenting on a new news or trend in your field.",
                "Series: 'Things I wish I knew before starting in {niche} - Part 1'."
            ]
        },
        "engagement": {
            "strategy_ar": "الاعتماد على خاصية الرد على التعليقات بفيديو، واستطلاعات الرأي، وبناء شخصية (Persona) قريبة من المتابع لكسر الحاجز الرسمي.",
            "strategy_en": "Rely on the video reply feature for comments, polls, and building a relatable persona to break the formal barrier.",
            "bio_ar": "💬 {brandName} | نتحدث لغة {niche}\nأقرأ كل تعليقاتكم 👁️\n👇 اسألني أي شيء",
            "bio_en": "💬 {brandName} | We speak the {niche} language\\nI read all your comments 👁️\\n👇 Ask me anything",
            "tips_ar": [
                "رد على التعليقات السلبية والإيجابية بفيديو (Video Reply)",
                "استخدم ميزة الـ Duet و Stitch مع صناع محتوى آخرين",
                "اطرح أسئلة جدلية في نهاية الفيديو"
            ],
            "tips_en": [
                "Reply to positive and negative comments with a Video Reply",
                "Use the Duet and Stitch features with other creators",
                "Ask controversial questions at the end of the video"
            ],
            "ideas_ar": [
                "الرد بفيديو على تعليق متكرر: 'أكثر سؤال يوصلني عن {niche}.. وهذا الرد'.",
                "Stitch مع فيديو مشهور في مجالك وتصحيح معلومة خاطئة فيه بأسلوب مهذب.",
                "سرد قصة شخصية (Storytime): 'كيف بدأت في {niche} وأكبر خطأ ارتكبته'.",
                "فيديو يطلب رأي المتابعين: 'أنا محتار بين هاتين الطريقتين في {niche}، أنتم مع أي فريق؟'.",
                "تحدي للمتابعين: 'أوقف الفيديو في اللحظة المناسبة لتكتشف مستواك في {niche}'."
            ],
            "ideas_en": [
                "Video reply to a frequent comment: 'The most asked question I get about {niche}.. Here is the answer'.",
                "Stitch with a popular video in your field and politely correct a misconception.",
                "Storytime: 'How I started in {niche} and my biggest mistake'.",
                "Video asking followers: 'I am torn between these two {niche} methods, which team are you on?'.",
                "Challenge for followers: 'Pause the video at the right moment to discover your {niche} level'."
            ]
        },
        "leads": {
            "strategy_ar": "توجيه الزيارات الكثيفة (Traffic) من تيك توك إلى رابط البايو باستخدام هدايا مجانية مغرية لا يمكن رفضها.",
            "strategy_en": "Direct heavy traffic from TikTok to the bio link using irresistible free gifts.",
            "bio_ar": "🎁 {brandName} | هديتك بانتظارك\nدليل {niche} المجاني ⬇️\n🔗 [رابط الهبوط]",
            "bio_en": "🎁 {brandName} | Your gift is waiting\\nFree {niche} guide ⬇️\\n🔗 [Landing Page Link]",
            "tips_ar": [
                "يجب أن يكون لديك 1000 متابع لوضع رابط في البايو",
                "اجعل الـ Call to Action واضحاً جداً في نهاية الفيديو",
                "ثبت (Pin) الفيديو الذي يحتوي على شرح الهدية المجانية"
            ],
            "tips_en": [
                "You must have 1000 followers to put a link in the bio",
                "Make the Call to Action extremely clear at the end of the video",
                "Pin the video that explains the free gift"
            ],
            "ideas_ar": [
                "فيديو سريع: 'طريقة سرية لتوفير المال في {niche}.. جمعت كل الطرق في ملف PDF مجاني في البايو'.",
                "شرح مشكلة معقدة ثم القول: 'إذا أردت الحل الكامل خطوة بخطوة، الرابط في البايو'.",
                "عرض قالب أو تشيك ليست (Checklist) على الشاشة: 'يمكنك تحميل هذا القالب مجاناً من الرابط'.",
                "فيديو بأسلوب (اكتشاف): 'لم أصدق أن هذه الأداة مجانية.. الرابط في بايو حسابي'.",
                "سلسلة تعليمية تنتهي بـ: 'الجزء الأهم والمفصل موجود في النشرة البريدية، سجل مجاناً'."
            ],
            "ideas_en": [
                "Quick video: 'A secret way to save money in {niche}.. I collected all methods in a free PDF in my bio'.",
                "Explain a complex problem then say: 'If you want the full step-by-step solution, the link is in the bio'.",
                "Show a template or checklist on screen: 'You can download this template for free from the link'.",
                "Discovery style video: 'I couldn\\'t believe this tool is free.. The link is in my bio'.",
                "Educational series ending with: 'The most detailed part is in the newsletter, sign up for free'."
            ]
        },
        "sales": {
            "strategy_ar": "بيع المنتجات من خلال المراجعات الصادقة (Honest Reviews)، وإظهار التغيير قبل وبعد (Transformations) باستخدام إيقاع سريع.",
            "strategy_en": "Sell products through honest reviews, showing transformations (before and after) using a fast pace.",
            "bio_ar": "🛍️ {brandName} | منتجات {niche}\nتغيير حقيقي مضمون 💯\nاطلب الآن من هنا 👇",
            "bio_en": "🛍️ {brandName} | {niche} Products\\nReal change guaranteed 💯\\nOrder now from here 👇",
            "tips_ar": [
                "لا تبدو كإعلان تقليدي، كن طبيعياً (UGC style)",
                "ركز على المشكلة ثم قدم منتجك كحل سحري",
                "استخدم ميزة TikTok Shop إن كانت متاحة في بلدك"
            ],
            "tips_en": [
                "Do not sound like a traditional ad, be natural (UGC style)",
                "Focus on the problem then introduce your product as the magical solution",
                "Use TikTok Shop feature if available in your country"
            ],
            "ideas_ar": [
                "فيديو 'فتح صندوق' (Unboxing) أو استعراض سريع لمنتجك الرقمي من الداخل.",
                "فيديو 'كيف تغيرت حياتي/حياة عميلي': عرض المشكلة ثم إظهار النتيجة بفضل منتج {brandName}.",
                "الرد على سؤال: 'هل هذا المنتج يستحق؟' مع إثبات عملي ونتائج حقيقية.",
                "تغليف أو تجهيز طلب عميل (Packing Orders) مع سرد قصة العميل (يعطي مصداقية كبيرة).",
                "عرض خصم خاص لمتابعي تيك توك فقط باستخدام كود حصري (TikTok20)."
            ],
            "ideas_en": [
                "Unboxing video or a quick internal review of your digital product.",
                "Video: 'How my/client\\'s life changed': Show the problem then the result thanks to the {brandName} product.",
                "Answering a question: 'Is this product worth it?' with practical proof and real results.",
                "Packing Orders video while telling a client\\'s story (adds massive credibility).",
                "Offer a special discount for TikTok followers only using an exclusive code (TikTok20)."
            ]
        }
    },
    "linkedin": {
        "awareness": {
            "strategy_ar": "بناء القيادة الفكرية (Thought Leadership). لينكد إن منصة مهنية، المحتوى هنا يجب أن يعتمد على الداتا، الخبرات العملية، والسرد القصصي المهني.",
            "strategy_en": "Build Thought Leadership. LinkedIn is a professional platform, content here must rely on data, practical experiences, and professional storytelling.",
            "bio_ar": "🚀 {brandName} | نمكّن المحترفين في {niche} | نشارك رؤى، استراتيجيات، وأخبار الصناعة",
            "bio_en": "🚀 {brandName} | Empowering {niche} professionals | Sharing insights, strategies, and industry news",
            "tips_ar": [
                "المنشورات النصية الطويلة (Text-only) مع مسافات بيضاء تحقق وصولاً عالياً",
                "تجنب الروابط الخارجية في صلب المنشور، ضعها في أول تعليق",
                "انشر في أوقات العمل الرسمية (صباحاً)"
            ],
            "tips_en": [
                "Long text-only posts with white space achieve high reach",
                "Avoid external links in the main post, put them in the first comment",
                "Post during official working hours (mornings)"
            ],
            "ideas_ar": [
                "مقال قصير: '3 اتجاهات ستغير مستقبل {niche} في العام القادم'.",
                "سرد قصة تحدي مهني واجهته في {niche} وكيف تغلبتم عليه (Hero Journey).",
                "مشاركة إحصائية صادمة أو دراسة حديثة عن {niche} مع إضافة تحليلك الشخصي.",
                "منشور تعريفي عن قيم ورؤية {brandName} ولماذا دخلتم هذا المجال.",
                "سلسلة نصائح مهنية أسبوعية: '#نصيحة_الاثنين للمهتمين بـ {niche}'."
            ],
            "ideas_en": [
                "Short article: '3 trends that will change the future of {niche} next year'.",
                "Tell a story about a professional challenge in {niche} and how you overcame it (Hero Journey).",
                "Share a shocking statistic or recent study about {niche} adding your personal analysis.",
                "Introductory post about {brandName}\\'s vision and values and why you entered this field.",
                "Weekly professional tips series: '#MondayTip for {niche} enthusiasts'."
            ]
        },
        "engagement": {
            "strategy_ar": "النقاشات المهنية العميقة. اطرح أسئلة حول بيئة العمل، المنهجيات، وشجع الخبراء الآخرين على مشاركة آرائهم في التعليقات.",
            "strategy_en": "Deep professional discussions. Ask questions about the work environment, methodologies, and encourage other experts to share their opinions in the comments.",
            "bio_ar": "🤝 {brandName} | ملتقى خبراء {niche} | شاركنا النقاش لتطوير الصناعة معاً",
            "bio_en": "🤝 {brandName} | {niche} Experts Hub | Join the discussion to develop the industry together",
            "tips_ar": [
                "استخدم استطلاعات الرأي (Polls) فهي تحصل على وصول وتفاعل ضخم جداً",
                "اعمل 'Tag' لخبراء في المجال لسؤالهم عن رأيهم",
                "الرد على التعليقات يجب أن يكون دقيقاً ومهنياً"
            ],
            "tips_en": [
                "Use Polls as they get massive reach and engagement",
                "Tag industry experts asking for their opinion",
                "Replies to comments must be accurate and professional"
            ],
            "ideas_ar": [
                "استطلاع رأي (Poll): 'ما هي الأداة الأهم بالنسبة لك في {niche}؟' مع خيارات واضحة.",
                "منشور 'Unpopular Opinion' (رأي غير شائع) في {niche} لفتح باب النقاش الجدلي المهني.",
                "سؤال مباشر للمجتمع: 'كيف تتعاملون مع مشكلة [مشكلة شائعة] في {niche}؟'.",
                "الاحتفاء بإنجاز بسيط لفريق العمل وسؤال المتابعين عن إنجازاتهم هذا الأسبوع.",
                "نشر 'دراسة حالة' مصغرة وطلب رأي الخبراء في طرق بديلة للحل."
            ],
            "ideas_en": [
                "Poll: 'What is the most important tool for you in {niche}?' with clear options.",
                "Unpopular Opinion post in {niche} to open a professional debate.",
                "Direct question to the community: 'How do you handle [common problem] in {niche}?'.",
                "Celebrating a small team achievement and asking followers about their achievements this week.",
                "Publishing a mini case study and asking experts for alternative solutions."
            ]
        },
        "leads": {
            "strategy_ar": "تقديم محتوى عالي القيمة (B2B Lead Generation) مثل التقارير، القوالب، والأدلة الشاملة مقابل الإيميل المهني.",
            "strategy_en": "Provide high-value content (B2B Lead Generation) like reports, templates, and comprehensive guides in exchange for a professional email.",
            "bio_ar": "📊 {brandName} | خبراء {niche} | 📥 حمل تقريرنا السنوي الشامل مجاناً من الرابط أدناه",
            "bio_en": "📊 {brandName} | {niche} Experts | 📥 Download our comprehensive annual report for free from the link below",
            "tips_ar": [
                "استخدم ملفات الـ PDF المباشرة (Carousel Documents) فهي جذابة جداً",
                "قدم 'تشيك ليست' أو 'قوالب جاهزة' يحتاجها المحترفون في عملهم اليومي",
                "اطلب من الناس التعليق بكلمة مهتم لإرسال الدليل لهم (يضاعف الوصول)"
            ],
            "tips_en": [
                "Use direct PDF files (Carousel Documents) as they are highly attractive",
                "Offer a 'checklist' or 'ready templates' that professionals need in their daily work",
                "Ask people to comment 'interested' to send them the guide (multiplies reach)"
            ],
            "ideas_ar": [
                "مشاركة 3 صفحات من تقرير شامل، وكتابة 'علق بـ (تقرير) لأرسل لك النسخة الكاملة الـ 50 صفحة'.",
                "نشر وثيقة (PDF Carousel) بعنوان: 'الدليل المرجعي الكامل للبدء في {niche}'.",
                "الإعلان عن 'ويبينار' (Webinar) مجاني لحل مشكلة معقدة في {niche} مع رابط التسجيل.",
                "منشور يقدم 'قالب Excel' أو 'Notion Template' مجاني يسهل عمل المحترفين.",
                "مشاركة أداة داخلية طورتموها في {brandName} وعرض مشاركتها مجاناً مع من يعلق."
            ],
            "ideas_en": [
                "Share 3 pages of a comprehensive report and write 'Comment (Report) and I will send you the full 50-page version'.",
                "Publish a PDF Carousel titled: 'The complete reference guide to starting in {niche}'.",
                "Announce a free Webinar solving a complex {niche} problem with a registration link.",
                "Post offering a free 'Excel Template' or 'Notion Template' that makes professionals\\' work easier.",
                "Share an internal tool developed at {brandName} and offer it for free to anyone who comments."
            ]
        },
        "sales": {
            "strategy_ar": "البيع في لينكد إن هو 'Social Selling'. التركيز على بناء الثقة (Trust) وعرض دراسات الحالة والعائد على الاستثمار (ROI) لخدماتك.",
            "strategy_en": "Selling on LinkedIn is 'Social Selling'. Focus on building trust, showcasing case studies and ROI for your services.",
            "bio_ar": "💼 {brandName} | نساعد الشركات على مضاعفة نتائج {niche} | 📈 احجز استشارة مجانية",
            "bio_en": "💼 {brandName} | We help companies double their {niche} results | 📈 Book a free consultation",
            "tips_ar": [
                "تحدث بلغة الأرقام والعوائد (وفرنا X، حققنا Y)",
                "استخدم رسائل InMail بذكاء وبدون إزعاج مباشر (Spam)",
                "اربط خدمتك بحل مشكلة تقليل التكاليف أو زيادة الإيرادات"
            ],
            "tips_en": [
                "Speak the language of numbers and returns (We saved X, we achieved Y)",
                "Use InMail smartly without direct spamming",
                "Link your service to solving the problem of reducing costs or increasing revenue"
            ],
            "ideas_ar": [
                "دراسة حالة B2B تفصيلية: 'كيف ساعدنا [شركة] على زيادة مبيعاتها بـ 30% خلال 3 أشهر عبر {niche}'.",
                "منشور يبرز 'تكلفة عدم اتخاذ قرار' وكيف أن تجاهل {niche} يكلف الشركات الملايين.",
                "عرض باقة خدمات مخصصة للشركات (B2B) مع التركيز على الـ ROI المباشر.",
                "مشاركة شهادة (Testimonial) قوية من مدير تنفيذي (CEO) أو مدير تسويق تعامل معكم.",
                "منشور 'Soft Pitch': 'لدينا سعة لاستقبال 3 عملاء جدد هذا الشهر لخدمات {niche}.. تواصل معي على الخاص'."
            ],
            "ideas_en": [
                "Detailed B2B case study: 'How we helped [Company] increase sales by 30% in 3 months via {niche}'.",
                "Post highlighting the 'cost of inaction' and how ignoring {niche} costs companies millions.",
                "Offer a custom B2B service package focusing on direct ROI.",
                "Share a strong testimonial from a CEO or Marketing Manager you worked with.",
                "Soft Pitch post: 'We have capacity for 3 new clients this month for {niche} services.. DM me'."
            ]
        }
    },
    "twitter": {
        "awareness": {
            "strategy_ar": "المحتوى السريع، الـ Threads (السلاسل القيمة)، والتعليق على الأحداث الرائجة (Newsjacking). تويتر يحب المعلومات المركزة.",
            "strategy_en": "Fast content, Threads (valuable chains), and Newsjacking. Twitter loves condensed information.",
            "bio_ar": "🐦 {brandName} | نغرد بأهم أسرار وأخبار {niche} | 🧵 سلاسل أسبوعية مكثفة",
            "bio_en": "🐦 {brandName} | Tweeting the top secrets and news of {niche} | 🧵 Intensive weekly threads",
            "tips_ar": [
                "كتابة الـ Threads (سلسلة تغريدات) هي أقوى طريقة للنمو",
                "استخدم أداة لجدولة التغريدات لتنشر 3-5 مرات يومياً",
                "كن دقيقاً ومباشراً (No Fluff)"
            ],
            "tips_en": [
                "Writing Threads is the most powerful way to grow",
                "Use a scheduling tool to tweet 3-5 times daily",
                "Be precise and direct (No Fluff)"
            ],
            "ideas_ar": [
                "ثريد (Thread): '10 أسرار لا يخبرك بها الخبراء عن {niche}'.",
                "تغريدة سريعة تلخص قاعدة ذهبية في {niche} في سطرين فقط.",
                "ربط خبر تريند عالمي بمجال {niche} وكتابة تحليل سريع.",
                "مشاركة قائمة بأهم 5 أدوات نستخدمها يومياً في {brandName}.",
                "تغريدة اقتباس (Quote Tweet) لمقال أو خبر مهم مع إضافة رأيك المهني المختصر."
            ],
            "ideas_en": [
                "Thread: '10 secrets experts won\\'t tell you about {niche}'.",
                "Quick tweet summarizing a golden rule in {niche} in just two lines.",
                "Linking a global trending news to the {niche} field with quick analysis.",
                "Sharing a list of the top 5 tools we use daily at {brandName}.",
                "Quote Tweet an important article or news adding your brief professional opinion."
            ]
        },
        "engagement": {
            "strategy_ar": "الميمز المهنية، التغريدات القصيرة المثيرة للجدل، والمشاركة في نقاشات الحسابات الكبيرة (Reply Strategy).",
            "strategy_en": "Professional memes, controversial short tweets, and participating in discussions on large accounts (Reply Strategy).",
            "bio_ar": "💬 {brandName} | مساحة نقاش مفتوحة لعشاق {niche} | شاركنا رأيك!",
            "bio_en": "💬 {brandName} | Open discussion space for {niche} lovers | Share your opinion!",
            "tips_ar": [
                "الردود الذكية على حسابات المشاهير في مجالك تجلب لك متابعين",
                "استخدم استطلاعات الرأي السريعة",
                "لا تكن جاداً 100%، تويتر يحب السخرية المهنية (Memes)"
            ],
            "tips_en": [
                "Smart replies on industry influencers\\' accounts bring you followers",
                "Use quick polls",
                "Don\\'t be 100% serious, Twitter loves professional sarcasm (Memes)"
            ],
            "ideas_ar": [
                "استطلاع رأي: 'هل تفضل [خيار 1] أو [خيار 2] في {niche} ولماذا؟'.",
                "تغريدة ساخرة (Meme) عن معاناة العاملين أو المهتمين بـ {niche}.",
                "سؤال مفتوح: 'لو رجع بك الزمن، ما هو الشيء الذي لن تفعله في {niche}؟'.",
                "تغريدة 'Hot Take': 'رأي غير مرغوب فيه: [خيار شائع] هو مضيعة للوقت، والبديل هو [خيارك]'.",
                "طلب مساعدة/اقتراحات: 'أبحث عن كتاب ممتاز في {niche}.. ما هي ترشيحاتكم؟'."
            ],
            "ideas_en": [
                "Poll: 'Do you prefer [Option 1] or [Option 2] in {niche} and why?'.",
                "Meme tweet about the struggles of workers or enthusiasts in {niche}.",
                "Open question: 'If you could go back in time, what is the one thing you wouldn\\'t do in {niche}?'.",
                "Hot Take tweet: 'Unpopular opinion: [Popular option] is a waste of time, the alternative is [Your option]'.",
                "Asking for help/suggestions: 'Looking for an excellent book on {niche}.. what are your recommendations?'."
            ]
        },
        "leads": {
            "strategy_ar": "هدايا تويتر (Auto-DM). 'علق بكلمة كذا أو ريتويت وسأرسل لك الرابط في الخاص'. هذه الاستراتيجية أثبتت نجاحاً مرعباً.",
            "strategy_en": "Twitter giveaways (Auto-DM). 'Comment a specific word or retweet and I will DM you the link'. This strategy is frighteningly successful.",
            "bio_ar": "🎁 {brandName} | خبراء {niche} | 📥 احصل على دليلك المجاني المثبت في أول تغريدة",
            "bio_en": "🎁 {brandName} | {niche} Experts | 📥 Get your free guide pinned in the first tweet",
            "tips_ar": [
                "ثبت (Pin) التغريدة التي تحتوي على الـ Lead Magnet",
                "استخدم أدوات الأتمتة (مثل Hypefury) لإرسال الرسائل تلقائياً لمن يعمل ريتويت",
                "اجعل الهدية ذات قيمة عالية جداً لتستحق الريتويت"
            ],
            "tips_en": [
                "Pin the tweet containing the Lead Magnet",
                "Use automation tools (like Hypefury) to send automated DMs to retweeters",
                "Make the gift extremely valuable to deserve a retweet"
            ],
            "ideas_ar": [
                "ثريد يبدأ بـ: 'جمعت لك 50 موقعاً خفياً في {niche}.. ريتويت وتابعني وسأرسل لك القائمة كاملة PDF'.",
                "تغريدة: 'أنهيت للتو كتابة دليل شامل لـ {niche}.. من يريده يضع نقطة (.).",
                "ثريد يشرح جزء من المشكلة، وفي النهاية الرابط لتحميل الحل الكامل كقالب Notion.",
                "توزيع 'قائمة مهام' (Cheat Sheet) مجانية مقابل التسجيل في النشرة البريدية.",
                "الإعلان عن تحدي مجاني لمدة 5 أيام عبر الإيميل لتحسين مهارات {niche}."
            ],
            "ideas_en": [
                "Thread starting with: 'I collected 50 hidden websites in {niche}.. Retweet, follow me and I will DM the full PDF list'.",
                "Tweet: 'Just finished writing a comprehensive guide for {niche}.. whoever wants it reply with a dot (.).",
                "Thread explaining part of the problem, ending with a link to download the full solution as a Notion template.",
                "Distributing a free Cheat Sheet in exchange for signing up to the newsletter.",
                "Announcing a 5-day free email challenge to improve {niche} skills."
            ]
        },
        "sales": {
            "strategy_ar": "بناء جمهور مهتم (Build in Public) ثم البيع المباشر أو الترويج للخدمات عبر سلاسل التغريدات (Threads) المبنية على إثبات القيمة.",
            "strategy_en": "Build in Public then direct selling or promoting services via Threads built on proving value.",
            "bio_ar": "🛒 {brandName} | نساعدك على إتقان {niche} بأسرع الطرق | 🚀 تصفح خدماتنا بالرابط",
            "bio_en": "🛒 {brandName} | The ultimate {niche} tools | See our latest offers in the pinned tweet",
            "tips_ar": [
                "البيع على تويتر يعتمد على الثقة المسبقة",
                "اكتب ثريد يعلم المتابع شيئاً، وفي آخر تغريدة ضع رابط الشراء (Call to action)",
                "استخدم خصومات خاصة لمجتمع تويتر"
            ],
            "tips_en": [
                "Use the 'Build in Public' approach (sharing numbers, failures, and successes)",
                "Promote your product at the end of every successful Thread",
                "Offer exclusive discounts for Twitter followers"
            ],
            "ideas_ar": [
                "ثريد تعليمي تفصيلي ينتهي بـ: 'إذا أردت توفير كل هذا الوقت، يمكنك شراء القالب الجاهز من هنا'.",
                "مشاركة أرباح أو نتائج (Build in Public) وكيف حققتها باستخدام الأداة التي تبيعها.",
                "إعلان فلاش (Flash Sale): 'بمناسبة وصولنا 10K متابع، خصم 50% على دورة {niche} لأول 50 شخص'.",
                "تغريدة تبرز مشكلة قوية (Pain Point) وتضع رابط منتجك كعلاج جذري لها.",
                "إعادة تغريد (Retweet) لرسائل شكر من عملائك وإضافة رابط الشراء لمن يريد الانضمام."
            ],
            "ideas_en": [
                "A thread documenting the journey of building a product or service from scratch to the first sale.",
                "A tweet demonstrating a common mistake clients make, followed by a link to your service as the solution.",
                "Highlighting a major client win achieved through your {niche} expertise.",
                "Answering common objections to your service publicly to build transparency.",
                "A direct tweet announcing a limited-time offer for your most popular service."
            ]
        }
    },
    "facebook": {
        "awareness": {
            "strategy_ar": "الفيسبوك ممتاز للوصول للفئات العمرية الأكبر (30+) وتكوين مجتمعات (Groups). ركز على المحتوى التعليمي البسيط والفيديوهات (Facebook Watch).",
            "strategy_en": "Community building through Facebook Groups and engaging visual posts on pages. Facebook favors posts that generate discussions and shares among friends.",
            "bio_ar": "📘 {brandName} | صفحتك الرسمية لتعلم وإتقان {niche} | معلومات يومية مبسطة",
            "bio_en": "📘 {brandName} | Your community for {niche} excellence\\n🌍 Join our growing family for daily insights",
            "tips_ar": [
                "أنشئ 'جروب فيسبوك' مرتبط بالصفحة لزيادة الوصول العضوي (Organic)",
                "الفيديوهات المربعة أو الطولية تعمل بشكل ممتاز",
                "استخدم الصور الجذابة مع نصوص مريحة للعين"
            ],
            "tips_en": [
                "Focus on highly relatable or emotional content that people want to share",
                "Use Facebook Live to connect directly with your audience",
                "Leverage Facebook Groups for deeper community engagement"
            ],
            "ideas_ar": [
                "فيديو 3 دقائق: 'الأساسيات الخمسة للنجاح في {niche} لعام 2024'.",
                "صورة إنفوجرافيك بسيطة تلخص عملية معقدة في {niche}.",
                "مقال قصير في بوست يصحح مفاهيم خاطئة شائعة جداً في المجال.",
                "مشاركة قصة ملهمة لشخص نجح في {niche} من الصفر.",
                "بوست يطلب من الناس الانضمام للـ Group الخاص بالبراند للاستفادة من شروحات حصرية."
            ],
            "ideas_en": [
                "Post an inspiring story related to {niche} that encourages shares.",
                "Create a visually appealing infographic explaining a complex {niche} concept.",
                "Host a weekly Facebook Live session answering common {niche} questions.",
                "Share a relatable meme or joke about {niche} to boost engagement.",
                "Post a 'Did you know?' fact about {niche} with an engaging visual."
            ]
        },
        "engagement": {
            "strategy_ar": "استخدام الجروبات بشكل أساسي. طرح أسئلة، عمل مسابقات، والمناقشة المستمرة مع الجمهور لزيادة تفاعل خوارزمية فيسبوك.",
            "strategy_en": "Fostering a sense of belonging. Encourage members to share their own experiences and reply to comments promptly to boost the algorithm.",
            "bio_ar": "💬 {brandName} | مجتمعنا يكبر بكم | شاركنا تجاربك وأسئلتك في {niche}",
            "bio_en": "💬 {brandName} | Let's talk about {niche}\\n👇 Share your thoughts and experiences with us",
            "tips_ar": [
                "الفيسبوك يحب التعليقات الطويلة، اطرح أسئلة تتطلب شرحاً",
                "ردودك على التعليقات ترفع البوست للأعلى مجدداً (Bumping)",
                "استخدم البث المباشر (FB Live) من حين لآخر"
            ],
            "tips_en": [
                "Ask open-ended questions in your posts",
                "Reply to comments with questions to keep the conversation going",
                "Create interactive polls and quizzes"
            ],
            "ideas_ar": [
                "سؤال للنقاش: 'ما هو أصعب جزء واجهته عند محاولة تعلم {niche}؟'.",
                "مسابقة بسيطة: 'أفضل تعليق يشرح هذا المصطلح في {niche} سيفوز باستشارة مجانية'.",
                "بوست (Fill in the blank): 'لو كان بإمكاني تغيير شيء واحد في {niche} لكان _____'.",
                "صورة Meme أو كاريكاتير عن موقف يمر به كل المهتمين بالمجال.",
                "بث مباشر (Live Q&A) للرد على استفسارات الجروب بشكل مباشر."
            ],
            "ideas_en": [
                "Post a question: 'What was your biggest win in {niche} this week?'",
                "Share a controversial topic in {niche} and ask for opinions.",
                "Host a 'Caption this' contest with a funny image related to {niche}.",
                "Run a weekly challenge and ask followers to post their results in the comments.",
                "Share a behind-the-scenes photo and ask followers to guess what you're working on."
            ]
        },
        "leads": {
            "strategy_ar": "الاعتماد على Facebook Ads و Lead Generation Forms، بالإضافة إلى الترويج للهدايا المجانية في الجروبات المهتمة.",
            "strategy_en": "Utilize Facebook Lead Ads and targeted posts offering high-value resources in exchange for email sign-ups.",
            "bio_ar": "🎁 {brandName} | خطوتك الأولى تبدأ هنا | 📥 حمل الكتيب المجاني من الرابط",
            "bio_en": "🎁 {brandName} | Elevate your {niche} skills\\n📥 Click below to get your free resource toolkit",
            "tips_ar": [
                "إعلانات الـ Lead Generation داخل فيسبوك تعطي نتائج قوية وممتازة التكلفة",
                "اطرح قيمة الهدية بوضوح تام",
                "اطلب من المتابعين عمل 'Share' لتعم الفائدة"
            ],
            "tips_en": [
                "Use Facebook Lead Ads for seamless opt-ins",
                "Offer a highly relevant and valuable freebie",
                "Promote your lead magnet in Facebook Groups (following group rules)"
            ],
            "ideas_ar": [
                "إعلان فيديو بأسلوب المشكلة/الحل: 'تعاني من X؟ حمل هذا الدليل المجاني لحلها'.",
                "بوست في الجروب: 'عملت شيت إكسيل يحسب كل شيء في {niche}.. من يريده يكتب (أنا)'.",
                "الإعلان عن 'ورشة عمل مجانية' (Free Masterclass) تطلب التسجيل بالبريد.",
                "عرض جزء من كورس مدفوع مجاناً مقابل التسجيل.",
                "مشاركة 'كوبون خصم حصري' لمن يسجل في النشرة البريدية عبر رابط الصفحة."
            ],
            "ideas_en": [
                "Post a teaser of a comprehensive {niche} guide with a link to download.",
                "Host a free webinar and promote it through Facebook Events.",
                "Share a success story and offer the exact template used for free via email.",
                "Run a giveaway where entry requires signing up for your newsletter.",
                "Create a post offering a free 15-minute consultation for the first 10 commenters."
            ]
        },
        "sales": {
            "strategy_ar": "إعلانات التحويل (Conversion Ads) وإعادة الاستهداف (Retargeting) باستخدام بيكسل فيسبوك، بالإضافة إلى بناء عروض مقنعة بالصور والفيديو.",
            "strategy_en": "Combine organic relationship building with targeted Facebook Ads. Use social proof and clear calls to action.",
            "bio_ar": "🛍️ {brandName} | كل ما تحتاجه للنجاح في {niche} | 🛒 تسوق الآن واحصل على عروضنا",
            "bio_en": "🛍️ {brandName} | Premium {niche} solutions\\n⭐ Trusted by experts\\n👇 Shop our latest offers",
            "tips_ar": [
                "إعادة الاستهداف لمن زار موقعك ولم يشتري هي أرخص طريقة للمبيعات",
                "استخدم الـ Carousel Ads لعرض مميزات منتجك المتعددة",
                "أضف أزرار (Call to Action) واضحة مثل 'Shop Now'"
            ],
            "tips_en": [
                "Use Facebook Pixel to retarget website visitors",
                "Showcase customer testimonials and reviews prominently",
                "Run flash sales or limited-time offers exclusively for your Facebook followers"
            ],
            "ideas_ar": [
                "إعلان Carousel يعرض 5 مميزات للمنتج مع زر شراء مباشر.",
                "إعلان فيديو لشهادة عميل حقيقي (Video Testimonial) يثني على الخدمة/المنتج.",
                "بوست مبيعات (Direct Response) يبدأ بـ 'تخيل لو كان بإمكانك تحقيق X في Y أيام..'.",
                "عرض محدود بمناسبة العطلات (Black Friday, العيد) مع تصميم ملفت للانتباه.",
                "إعلان إعادة استهداف للمتخلين عن السلة: 'نسيت شيئاً؟ استخدم هذا الكود لإتمام طلبك بخصم 10%'."
            ],
            "ideas_en": [
                "Post a video testimonial from a satisfied client highlighting the ROI.",
                "Announce a special weekend sale with a clear CTA and link.",
                "Share a detailed case study showing the 'before and after' of using your service.",
                "Host a Live Q&A specifically about your product/service and offer a discount code.",
                "Post a carousel highlighting the top 3 features of your product and how they solve specific {niche} problems."
            ]
        }
    },
    "youtube": {
        "awareness": {
            "strategy_ar": "يوتيوب هو محرك بحث (Search Engine). ركز على محتوى (كيف تفعل كذا - How to) والكلمات المفتاحية (SEO) لجلب زيارات مستمرة لسنوات.",
            "strategy_en": "Search Engine Optimization (SEO) focused content. YouTube is the second largest search engine, so focus on 'How-to' and educational videos.",
            "bio_ar": "▶️ {brandName} | المصدر الأول لتعلم {niche} | فيديو جديد كل أسبوع 🔔",
            "bio_en": "▶️ {brandName} | Master {niche} with our weekly tutorials\\n🔔 Subscribe for new videos every week",
            "tips_ar": [
                "الـ Thumbnail (الصورة المصغرة) والعنوان هما 80% من نجاح الفيديو",
                "ركز على جودة الصوت أكثر من الصورة",
                "اهتم بأول 30 ثانية (الـ Hook) لمنع المشاهد من الخروج"
            ],
            "tips_en": [
                "Optimize video titles, descriptions, and tags for search",
                "Create eye-catching thumbnails (High CTR)",
                "Focus on the first 15 seconds to hook the viewer"
            ],
            "ideas_ar": [
                "فيديو: 'الدليل الشامل للمبتدئين في {niche} لعام 2024'.",
                "فيديو: '5 أخطاء تدمر عملك في {niche} وكيفية تجنبها'.",
                "مراجعة (Review) لأشهر أدوات أو برامج تستخدم في هذا المجال.",
                "شرح تفصيلي (Step-by-Step Tutorial) لكيفية إنجاز مهمة معينة بدقة.",
                "يوتيوب شورتس (Shorts) تقتطع أهم اللحظات من فيديوهاتك الطويلة لزيادة الوعي السريع."
            ],
            "ideas_en": [
                "'How to start in {niche} for beginners (Complete Guide)'.",
                "'Top 5 mistakes to avoid in {niche}'.",
                "A comprehensive review of the best tools for {niche}.",
                "'What is {niche}? Explained in 5 minutes'.",
                "A vlog-style video showing a day in the life of a {niche} professional."
            ]
        },
        "engagement": {
            "strategy_ar": "بناء ولاء المشاهدين من خلال طلب التعليقات، عمل سلاسل طويلة، والرد على تعليقاتهم بفيديوهات مخصصة، والـ Community Tab.",
            "strategy_en": "Building a loyal subscriber base. Encourage likes, comments, and subscriptions throughout the video, and use the Community Tab.",
            "bio_ar": "💬 {brandName} | نحن هنا لنرد على كل أسئلتكم حول {niche} | اشترك وشاركنا رأيك",
            "bio_en": "💬 {brandName} | Join the {niche} conversation\\n👇 Drop your questions in the comments",
            "tips_ar": [
                "اطلب من المشاهدين الاشتراك وتفعيل الجرس في منتصف الفيديو وليس فقط في آخره",
                "استخدم تبويب المنتدى (Community Tab) لطرح استطلاعات رأي",
                "ثبت تعليقاً سؤالياً في كل فيديو لتحفيز النقاش"
            ],
            "tips_en": [
                "Ask viewers to comment their opinion or answer a specific question",
                "Use the YouTube Community Tab for polls and updates",
                "Heart and reply to early comments"
            ],
            "ideas_ar": [
                "نهاية الفيديو: 'ما هو التحدي الأكبر الذي تواجهونه الآن؟ اكتبوه في التعليقات وسأجيب بفيديو كامل'.",
                "بوست في المنتدى (Community Tab): صورة لـ Setup عملك وسؤالهم عن رأيهم.",
                "استطلاع رأي في المنتدى: 'ما هو الموضوع الذي تريدون أن نغطيه الأسبوع القادم؟'.",
                "فيديو (Q&A) يجمع أفضل الأسئلة من التعليقات السابقة ويجيب عليها.",
                "عمل بث مباشر (Live Stream) شهري للإجابة الحية على المتابعين."
            ],
            "ideas_en": [
                "Host a live Q&A session to interact directly with subscribers.",
                "Post a poll on the Community Tab asking what video they want next.",
                "Create a video responding to the most frequently asked questions in the comments.",
                "Pin a comment with a question to encourage discussion.",
                "Do a 'subscriber shoutout' at the end of your videos."
            ]
        },
        "leads": {
            "strategy_ar": "وضع روابط للـ Lead Magnets في أول سطر من صندوق الوصف (Description) وفي التعليق المثبت (Pinned Comment) وذكرها داخل الفيديو.",
            "strategy_en": "Driving traffic from video descriptions and pinned comments to landing pages using lead magnets mentioned in the video.",
            "bio_ar": "📥 {brandName} | دليلك المجاني لـ {niche} متوفر في روابط القناة وفي وصف كل فيديو",
            "bio_en": "🎁 {brandName} | Get our free {niche} resources\\n🔗 Links to downloads in every video description",
            "tips_ar": [
                "يجب الإشارة لفظياً للرابط: 'بالمناسبة، تركت لكم دليلاً مجانياً في الوصف..'",
                "استخدم شاشات النهاية (End Screens) والبطاقات (Cards) بذكاء",
                "اجعل اسم الرابط جذاباً وليس مجرد رابط مبهم"
            ],
            "tips_en": [
                "Mention the free resource multiple times in the video",
                "Place the link in the top line of the description and in a pinned comment",
                "Use YouTube Cards and End Screens to direct viewers"
            ],
            "ideas_ar": [
                "فيديو يشرح استراتيجية، ثم: 'لتحميل القالب الذي استخدمته في الشرح، الرابط في أول تعليق'.",
                "فيديو بعنوان: 'أدوات مجانية ستغير حياتك في {niche}'.. وربطها بقائمة بريدية للحصول عليها.",
                "عمل دورة مجانية من 3 أجزاء على يوتيوب، الجزء الرابع والمتقدم متاح بالبريد فقط.",
                "مراجعة لكتاب مهم وتوفير ملخص PDF مجاني في الوصف.",
                "دعوة المشاهدين للتسجيل في 'ويبينار مباشر مجاني' سيقام الأسبوع القادم."
            ],
            "ideas_en": [
                "Create a tutorial video and offer the template used as a free download.",
                "Host a free masterclass and require email registration to attend.",
                "Review a complex strategy and offer a simplified cheat sheet in the description.",
                "Offer a free mini-course via email to those who click the link.",
                "Promote a relevant newsletter subscription at the end of your educational videos."
            ]
        },
        "sales": {
            "strategy_ar": "الترويج للمنتجات المدفوعة بشكل طبيعي داخل الفيديوهات (Native Integration) وبناء مسارات قمع بيعي (Funnels) تبدأ من يوتيوب.",
            "strategy_en": "In-depth product reviews, case studies, and tutorials that demonstrate the value of your product or service, leading to a strong CTA.",
            "bio_ar": "🛒 {brandName} | ارتق بمستواك في {niche} الآن | تصفح الكورسات والمنتجات من روابطنا",
            "bio_en": "🛍️ {brandName} | Elevate your {niche} game\\n🔗 Check out our premium courses and tools",
            "tips_ar": [
                "لا تجعل الفيديو كله إعلاناً، قدم 80% قيمة و 20% ترويج",
                "قدم كود خصم حصري لمشتركي يوتيوب فقط تتبع به المبيعات",
                "اربط المنتجات بمشكلة حقيقية واجهت الجمهور في بداية الفيديو"
            ],
            "tips_en": [
                "Integrate soft pitches naturally into educational content",
                "Create dedicated 'sales' videos for launches or major updates",
                "Use trackable links to measure conversion from YouTube"
            ],
            "ideas_ar": [
                "فيديو دراسة حالة (Case Study) يشرح كيف استخدمت منتجك لحل مشكلة، مع رابط الشراء.",
                "إعلان قصير (Sponsorship Read) في منتصف الفيديو لمنتجك الخاص: 'هذا الفيديو برعاية كورسنا الجديد...'.",
                "مقارنة بين الطريقة المجانية البطيئة والطريقة المدفوعة (منتجك) السريعة لإنجاز العمل.",
                "فيديو بعنوان: 'كيف تكسب أول 1000$ في {niche}' مع الترويج للأداة المساعدة الخاصة بك.",
                "استخدام ميزة YouTube Shopping (إن توفرت) لعرض منتجات المتجر مباشرة تحت الفيديو."
            ],
            "ideas_en": [
                "A detailed walkthrough of your product/service showing exactly how it works.",
                "A video highlighting a customer success story and the results they achieved.",
                "A comparison video showing why your solution is better than alternatives.",
                "Announce a new feature or service launch with a special introductory offer.",
                "Host a live webinar selling a high-ticket {niche} service or course."
            ]
        }
    },
    "pinterest": {
        "awareness": {
            "strategy_ar": "بينتريست هو محرك بحث بصري. التركيز على الـ Pins الطولية الجذابة (Infographics/Aesthetics) المرتبطة بكلمات مفتاحية لتحويل الترافيك.",
            "strategy_en": "Visual discovery and SEO. Pinterest is a visual search engine. Focus on high-quality, inspiring, and informative Pins.",
            "bio_ar": "📌 {brandName} | إلهام وأفكار وإرشادات في عالم {niche} | احفظ الـ Pins التي تعجبك",
            "bio_en": "📌 {brandName} | Inspiring your {niche} journey\\n✨ Discover ideas, tips, and inspiration",
            "tips_ar": [
                "الصور الطولية (بنسبة 2:3) هي الأفضل للحصول على مشاهدات",
                "تأكد من استخدام الكلمات المفتاحية الدقيقة في العنوان والوصف",
                "صمم Pins نصوصها كبيرة וواضحة لتقرأ من الهاتف"
            ],
            "tips_en": [
                "Use vertical images (2:3 aspect ratio) for maximum visibility",
                "Optimize Pin titles and descriptions with keywords",
                "Create organized Boards relevant to different aspects of your niche"
            ],
            "ideas_ar": [
                "إنفوجرافيك طولي: '7 خطوات للبدء في {niche} من الصفر'.",
                "تصميم (Before & After) يبرز نتيجة ممتازة في مجالك.",
                "قائمة بصرية: 'أهم 10 مصادر لتعلم {niche} مجاناً'.",
                "تصميم يبرز 'خرافات شائعة vs حقائق' في مجالك.",
                "لوحة (Board) متكاملة تجمع كل مصادر الإلهام والأفكار لـ {niche}."
            ],
            "ideas_en": [
                "Create an infographic summarizing key {niche} statistics.",
                "Design a visually appealing 'Top 10 Tips for {niche}' Pin.",
                "Share an inspiring quote related to {niche} with beautiful typography.",
                "Create a 'Step-by-Step Guide' Pin with multiple images.",
                "Post a high-quality lifestyle image related to your {niche}."
            ]
        },
        "engagement": {
            "strategy_ar": "بينتريست يعتمد على الـ Saves (الاحتفاظ) و الـ Clicks (النقرات) أكثر من التعليقات. اصنع محتوى يود الناس الاحتفاظ به للعودة إليه لاحقاً.",
            "strategy_en": "Encouraging saves (repins) and clicks. The more your Pins are saved, the more Pinterest distributes them.",
            "bio_ar": "💡 {brandName} | أفكار {niche} التي ستحتاج العودة إليها | احفظ ما يلهمك",
            "bio_en": "💬 {brandName} | Save your favorite {niche} ideas\\n👇 Explore our boards",
            "tips_ar": [
                "انشر 'Idea Pins' (مشابهة للستوريز) لأنها تحصل على وصول خوارزمي عالي",
                "نظم المحتوى في لوحات (Boards) واضحة الأسماء (SEO)",
                "اطلب من الناس في التصميم 'احفظ هذا للرجوع إليه'"
            ],
            "tips_en": [
                "Design Pins that solve a problem or offer actionable advice",
                "Use text overlays on images to clearly communicate value",
                "Engage with other creators' content in your niche"
            ],
            "ideas_ar": [
                "Idea Pin من 5 صفحات تشرح خدعة سريعة (Hack) في {niche}.",
                "تصميم يطرح سؤالاً مرئياً مع طلب اختيار الإجابة وحفظ الـ Pin.",
                "تجميعة (Checklist) مرئية جذابة يسهل على المستخدم حفظها لعمله.",
                "صورة اقتباس ملهم ومصمم باحترافية شديدة يشجع على المشاركة.",
                "فيديو قصير (Video Pin) يعرض لمحة سريعة (Sneak Peek) لمشروع."
            ],
            "ideas_en": [
                "Create a 'Checklist' Pin that users will want to save for later.",
                "Design a 'This or That' Pin to encourage engagement in comments.",
                "Share a highly detailed 'How-To' Pin that requires users to click through for the full steps.",
                "Create a series of related Pins and link them together in a Board.",
                "Post Idea Pins (similar to stories) to show behind-the-scenes processes."
            ]
        },
        "leads": {
            "strategy_ar": "ربط كل Pin برابط هبوط (Landing Page) يقدم قيمة مجانية. بينتريست هو ملك جلب الزيارات المجانية للمدونات والمواقع.",
            "strategy_en": "Using Pins as a gateway to landing pages. Offer valuable resources that users must click through to access.",
            "bio_ar": "📥 {brandName} | احصل على قوالب ومصادر {niche} المجانية | الرابط في الـ Pins",
            "bio_en": "🎁 {brandName} | Free {niche} resources\\n🔗 Click the link in our bio to download",
            "tips_ar": [
                "دائماً ضع الرابط الخاص بصفحة التسجيل في الـ Pin",
                "استخدم نصوصاً جذابة على الصورة (Clickbait إيجابي: 'السر الذي غير نتائجنا')",
                "انشر باستمرار (5-10 مرات يومياً) باستخدام أدوات جدولة كـ Tailwind"
            ],
            "tips_en": [
                "Ensure the Pin directly relates to the lead magnet on the landing page",
                "Use clear Call-to-Actions (CTAs) on the Pin image itself",
                "Create multiple Pins with different designs leading to the same landing page"
            ],
            "ideas_ar": [
                "صورة غلاف لكتاب إلكتروني مجاني مع زر وهمي 'حمل الآن' يوجه للرابط.",
                "Pin يعرض مشكلة ويقول: 'اضغط هنا لقراءة المقال أو تحميل الدليل الشامل'.",
                "إنفوجرافيك ناقص (يغطي 3 نقاط فقط) ويطلب الضغط على الرابط لمعرفة الباقي.",
                "فيديو قصير يظهر لك استخدام 'شيت مجاني' ويدعو لتحميله من الرابط.",
                "تصميم يبرز نتيجة قوية مع نص: 'اكتشف الاستراتيجية المجانية خطوة بخطوة بالرابط'."
            ],
            "ideas_en": [
                "Design a Pin promoting a free {niche} eBook with a 'Download Now' button on the image.",
                "Create a Pin showcasing a free template and link to the opt-in page.",
                "Promote a free email course with an eye-catching graphic.",
                "Share a preview of a comprehensive guide and link to the full gated version.",
                "Offer a free printable related to {niche} and require an email to download."
            ]
        },
        "sales": {
            "strategy_ar": "استخدام الـ Product Pins وتوجيه المستخدمين المهتمين بصرياً مباشرة لصفحة الشراء بتصاميم أنيقة وعروض مباشرة.",
            "strategy_en": "Product Pins and visual storytelling. Showcase your products in real-life scenarios and use Rich Pins for up-to-date pricing.",
            "bio_ar": "🛍️ {brandName} | أدوات وقوالب {niche} الاحترافية | تسوق الآن لتطوير عملك",
            "bio_en": "🛍️ {brandName} | Shop the best in {niche}\\n✨ Upgrade your life today",
            "tips_ar": [
                "المنتجات الرقمية والقوالب تباع بكثرة عبر بينتريست",
                "أظهر كيف سيبدو منتجك أو نتيجته في حياة العميل (Lifestyle Photos)",
                "تأكد من تفعيل Rich Pins لمتجرك ليظهر السعر تلقائياً"
            ],
            "tips_en": [
                "Use Product Pins to show price and availability directly on Pinterest",
                "Create lifestyle images showing your product in use",
                "Run Promoted Pins (ads) for high-converting products"
            ],
            "ideas_ar": [
                "تصميم جمالي يظهر منتجك الرقمي (Mockup) على شاشة آيباد أو كمبيوتر.",
                "Pin يعرض 'أفضل استثمار قمت به في {niche}' وتوجيه الزائر لمنتجك المدفوع.",
                "إعلان لخصم موسمي مع تصميم مبهج يربط مباشرة بصفحة المنتج.",
                "عرض لنتائج حقيقية لأحد عملائك باستخدام منتجك مع رابط الشراء.",
                "دليل هدايا (Gift Guide) أو أدوات يضم منتجاتك كأفضل توصيات للمهتمين بـ {niche}."
            ],
            "ideas_en": [
                "Create a 'Shop the Look' Pin featuring multiple products.",
                "Share a high-quality product photo with a direct link to purchase.",
                "Design a Pin highlighting the benefits and features of your premium service.",
                "Promote a seasonal sale or discount code specifically for Pinterest users.",
                "Show a before-and-after transformation achieved using your product."
            ]
        }
    },
    "snapchat": {
        "awareness": {
            "strategy_ar": "محتوى حصري ويومي يعتمد على العفوية الشديدة (Behind the Scenes). سناب شات يركز على اللحظة واليوميات السريعة.",
            "strategy_en": "Authentic, raw, and behind-the-scenes content. Snapchat is about in-the-moment sharing and connecting with a younger demographic.",
            "bio_ar": "👻 {brandName} | يوميات وأسرار {niche} من خلف الكواليس | تابعنا يومياً",
            "bio_en": "👻 {brandName} | The real {niche} experience\\n✨ Daily snaps from behind the scenes",
            "tips_ar": [
                "استخدم الفلاتر والنصوص العفوية",
                "تحدث للكاميرا مباشرة وكأنك تتحدث لصديق",
                "النشر اليومي المستمر هو مفتاح سناب شات"
            ],
            "tips_en": [
                "Post consistently throughout the day to stay top-of-mind",
                "Use Geofilters and Lenses to increase local visibility",
                "Keep content raw and unpolished for authenticity"
            ],
            "ideas_ar": [
                "يوم في حياة خبير في {niche} (سلسلة سنابات قصيرة).",
                "تجهيز بيئة العمل أو المكتب في الصباح.",
                "مشاركة لحظات 'أخطاء العمل' (Bloopers) لكسر الرسمية.",
                "التعليق السريع على خبر عاجل في مجالك وأنت تشرب القهوة.",
                "استخدام فلاتر طريفة لتقديم نصيحة جادة لكسر الملل."
            ],
            "ideas_en": [
                "Share a 'Day in the Life' series of a {niche} professional.",
                "Post quick, unedited tips and tricks throughout the day.",
                "Show the behind-the-scenes process of creating a product or service.",
                "Host a 'takeover' where a team member or influencer runs the account for a day.",
                "Share exclusive sneak peeks of upcoming projects or launches."
            ]
        },
        "engagement": {
            "strategy_ar": "الرد المباشر على رسائل المتابعين (Private Replies)، واستخدام الستيكرز التفاعلية والمسابقات السريعة.",
            "strategy_en": "Interactive storytelling. Use Snapchat's native tools (polls, questions, AR lenses) to interact directly with followers.",
            "bio_ar": "💬 {brandName} | نرد على أسئلتكم يومياً عبر الخاص | شاركونا تجاربكم",
            "bio_en": "💬 {brandName} | Let's chat about {niche}\\n👇 Snap us your questions",
            "tips_ar": [
                "اطلب من الناس التقاط صورة للشاشة (Screenshot) للتفاعل",
                "أظهر الرسائل الخاصة (بدون أسماء) وأجب عليها علناً",
                "اصنع عدسات (Lenses) مخصصة لبراندك إن أمكن"
            ],
            "tips_en": [
                "Use the 'Reply' feature to have direct conversations with followers",
                "Create custom AR Lenses related to your brand for users to play with",
                "Encourage screenshotting of valuable snaps"
            ],
            "ideas_ar": [
                "سناب مكتوب فيه: 'صور الشاشة (Screenshot) إذا كنت تتفق مع هذا الرأي'.",
                "فتح باب الأسئلة (Q&A) والإجابة عليها في سنابات متتالية.",
                "تحدي سريع: 'أول 5 أشخاص يرسلون لي صورة لعملهم سأعطيهم تقييم سريع'.",
                "نشر قصة نجاح أحد المتابعين وتشجيع الباقين.",
                "سؤال المتابعين عن رأيهم في موضوع معين ونشر أفضل الردود."
            ],
            "ideas_en": [
                "Host a Q&A session where you reply to snaps with video answers.",
                "Create a snap with a poll or quiz related to {niche}.",
                "Run a contest where followers have to snap you a specific photo to enter.",
                "Share a 'Tap to reveal' sequence of snaps.",
                "Ask followers for feedback on a new idea or design."
            ]
        },
        "leads": {
            "strategy_ar": "استخدام ميزة الروابط المرفقة (Swipe Up / Attach Link) في السنابات لتقديم محتوى مجاني وعروض سريعة الحصرية.",
            "strategy_en": "Exclusive offers and swipe-up links (if available). Provide value that requires users to take action.",
            "bio_ar": "📥 {brandName} | اسحب للأعلى (Swipe Up) للحصول على أفضل الهدايا المجانية في {niche}",
            "bio_en": "🎁 {brandName} | Exclusive {niche} perks\\n🔗 Swipe up on our snaps for freebies",
            "tips_ar": [
                "لا تنس وضع سهم متحرك يشير للأسفل لحث الناس على رفع الشاشة",
                "اجعل الهدية تبدو وكأنها 'سر' حصري لمتابعي سناب شات فقط",
                "استخدم عنصر الوقت (متاح لـ 24 ساعة فقط)"
            ],
            "tips_en": [
                "Use the 'Swipe Up' feature (if eligible) to link directly to landing pages",
                "Offer Snapchat-exclusive lead magnets",
                "Create a sense of urgency since snaps disappear"
            ],
            "ideas_ar": [
                "سناب يتحدث عن مشكلة، وينتهي بـ 'ارفع الشاشة لتحميل الحل كملف PDF'.",
                "كود خصم خفي لمتابعي سناب شات يوضع كصورة ويطلب تصوير الشاشة للحصول عليه.",
                "دعوة لجروب تيليجرام أو واتساب حصري لمن يرفع الشاشة.",
                "عرض نتيجة مذهلة سريعة: 'الطريقة بالتفصيل في الرابط أسفل الشاشة'.",
                "سناب عفوي: 'رتبت لكم أهم 5 مصادر مجانية لـ {niche} في رابط واحد.. اسحب للأعلى'."
            ],
            "ideas_en": [
                "Share a snap offering a free {niche} guide and ask users to screenshot or swipe up.",
                "Promote a flash webinar and provide the registration link.",
                "Offer a secret discount code or freebie only available for 24 hours.",
                "Share a teaser of premium content and direct users to your website to see the rest.",
                "Run a Snapchat-exclusive giveaway requiring an email sign-up."
            ]
        },
        "sales": {
            "strategy_ar": "إعلانات سناب شات (Snap Ads) موجهة للجمهور الأصغر سناً بأسلوب 'شاهد ما اشتريت' وعروض الـ FOMO الحقيقية.",
            "strategy_en": "Flash sales, exclusive discounts, and urgent CTAs. Capitalize on the ephemeral nature of Snapchat to drive immediate action.",
            "bio_ar": "🛒 {brandName} | أسرع عروض {niche} تجدها هنا | اسحب للأعلى للشراء",
            "bio_en": "🛍️ {brandName} | {niche} deals you can't miss\\n⏳ Offers disappear in 24 hours",
            "tips_ar": [
                "الفيديوهات يجب أن تكون عمودية بالكامل ومصممة خصيصاً لسناب شات",
                "استخدم محتوى بصناعة المستخدمين (UGC) يبدو كأنه سناب طبيعي وليس إعلان",
                "اجعل العرض لا يقاوم ومحدود جداً"
            ],
            "tips_en": [
                "Create urgency with limited-time offers",
                "Use clear and direct CTAs on your snaps",
                "Showcase real customers using your products (UGC)"
            ],
            "ideas_ar": [
                "فيديو UCG: 'هذا ما حدث عندما جربت [اسم المنتج] من {brandName}.. (ارفع الشاشة)'.",
                "إعلان ترويجي لخصم نهاية الأسبوع يختفي بانقضاء الـ 24 ساعة.",
                "عرض 'صندوق المفاجآت' (Mystery Box) أو 'باندل' (Bundle) حصري للمشاهدين.",
                "تجربة حية للمنتج الرقمي على الموبايل تبرز مدى سهولة استخدامه.",
                "استخدام ميزة الكتالوج (Catalog Sales) إذا كان لديك متجر إلكتروني."
            ],
            "ideas_en": [
                "Announce a 24-hour flash sale exclusively for Snapchat followers.",
                "Share a snap of a new product drop with a swipe-up link to purchase.",
                "Offer a 'Snapchat only' discount code.",
                "Post a quick video testimonial from a satisfied customer.",
                "Show a 'Before and After' result and link to the service that achieved it."
            ]
        }
    }
};

export const seedSocialPresence = async () => {
  console.log('⏳ Generating & Seeding Social Presence Matrix...');
  try {
    const docRef = doc(db, 'tc_social_presence_matrix', 'all_platforms');
    await setDoc(docRef, contentMap);
    console.log('✅ Successfully seeded Social Presence Matrix');
    alert('✅ تم تحديث بيانات استراتيجيات السوشيال ميديا بنجاح!');
  } catch (error) {
    console.error('❌ Error seeding Social Presence:', error);
    alert('❌ حدث خطأ أثناء تحديث البيانات.');
  }
};
