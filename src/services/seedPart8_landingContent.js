/**
 * seedPart8_landingContent.js
 * ═══════════════════════════════════════════════════════
 * Modular Landing Page Content Database
 * 4 Dimensions: Objective × Awareness × PricePoint × EmotionalDriver
 * Each section has 3 ideas (ar + en) for rich variety
 * ═══════════════════════════════════════════════════════
 */

// ─── HERO SECTIONS ──────────────────────────────────────
// Key: `${awareness}_${emotion}`
export const HERO_SECTIONS = {
  // ══════ UNAWARE ══════
  unaware_urgency: {
    ideas: [
      {
        headline_ar: "⏰ هل تعلم أن {{percent}}% من {{audience}} يخسرون فرصاً ذهبية كل يوم دون أن يشعروا؟",
        headline_en: "⏰ Did you know {{percent}}% of {{audience}} lose golden opportunities daily without realizing?",
        sub_ar: "الوقت ينفد. اكتشف ما لا يريدك المنافسون أن تعرفه عن {{niche}}.",
        sub_en: "Time is running out. Discover what competitors don't want you to know about {{niche}}."
      },
      {
        headline_ar: "🚨 تحذير: {{audience}} الذين يتجاهلون هذا السر يخسرون آلاف الدولارات شهرياً",
        headline_en: "🚨 Warning: {{audience}} ignoring this secret are losing thousands monthly",
        sub_ar: "في الدقائق القادمة، ستكتشف الحقيقة المخفية التي ستغير نظرتك لـ {{niche}} للأبد.",
        sub_en: "In the next few minutes, you'll discover a hidden truth that will change your view of {{niche}} forever."
      },
      {
        headline_ar: "⚡ الفرصة التي لن تتكرر: اكتشف لماذا يتحرك الأذكياء الآن في {{niche}}",
        headline_en: "⚡ A once-in-a-lifetime chance: See why smart people are moving NOW in {{niche}}",
        sub_ar: "العالم يتغير بسرعة. من لا يتكيف اليوم، سيجد نفسه متأخراً غداً.",
        sub_en: "The world is changing fast. Those who don't adapt today will be left behind tomorrow."
      }
    ]
  },
  unaware_aspirational: {
    ideas: [
      {
        headline_ar: "🌟 تخيل حياتك عندما تصبح من أنجح {{audience}} في {{niche}}",
        headline_en: "🌟 Imagine your life when you become one of the most successful {{audience}} in {{niche}}",
        sub_ar: "النجاح ليس حلماً بعيداً. إنه نظام واضح يمكنك البدء فيه اليوم.",
        sub_en: "Success isn't a distant dream. It's a clear system you can start today."
      },
      {
        headline_ar: "💎 من الصفر إلى القمة: الطريق الذي سلكه أنجح {{audience}} في العالم",
        headline_en: "💎 From zero to the top: The path the most successful {{audience}} took",
        sub_ar: "كل رحلة عظيمة بدأت بخطوة واحدة. هذه خطوتك.",
        sub_en: "Every great journey started with one step. This is yours."
      },
      {
        headline_ar: "🏆 ماذا لو أخبرتك أن هناك طريقة لتكون في الـ 1% الأفضل من {{audience}}؟",
        headline_en: "🏆 What if I told you there's a way to be in the top 1% of {{audience}}?",
        sub_ar: "الفرق بين العادي والاستثنائي هو معرفة واحدة. اكتشفها الآن.",
        sub_en: "The difference between ordinary and extraordinary is one insight. Discover it now."
      }
    ]
  },
  unaware_logical: {
    ideas: [
      {
        headline_ar: "📊 الأرقام لا تكذب: {{percent}}% من {{audience}} لا يستغلون هذه الفرصة في {{niche}}",
        headline_en: "📊 Numbers don't lie: {{percent}}% of {{audience}} aren't leveraging this opportunity in {{niche}}",
        sub_ar: "دراسة حديثة تكشف أن معظم الناس يفوتون فرصة مؤكدة. هل أنت منهم؟",
        sub_en: "A recent study reveals most people are missing a guaranteed opportunity. Are you one of them?"
      },
      {
        headline_ar: "🔬 حقائق صادمة عن {{niche}} يجب أن يعرفها كل {{audience}}",
        headline_en: "🔬 Shocking facts about {{niche}} every {{audience}} must know",
        sub_ar: "البيانات واضحة. من يفهم هذه الأرقام يتقدم، ومن يتجاهلها يتراجع.",
        sub_en: "The data is clear. Those who understand these numbers advance; those who ignore them fall behind."
      },
      {
        headline_ar: "📈 تحليل: لماذا ينمو سوق {{niche}} بنسبة {{percent}}% سنوياً وكيف تستفيد",
        headline_en: "📈 Analysis: Why the {{niche}} market grows {{percent}}% yearly and how to benefit",
        sub_ar: "الفرصة موجودة في الأرقام. دعنا نوضحها لك بالتفصيل.",
        sub_en: "The opportunity is in the numbers. Let us break it down for you."
      }
    ]
  },
  unaware_empathetic: {
    ideas: [
      {
        headline_ar: "💙 نعلم أنك تعمل بجد... لكن هل تشعر أن النتائج لا تعكس جهدك؟",
        headline_en: "💙 We know you work hard... but do results reflect your effort?",
        sub_ar: "لست وحدك. آلاف من {{audience}} يشعرون بنفس الشيء. لكن هناك طريقة أفضل.",
        sub_en: "You're not alone. Thousands of {{audience}} feel the same. But there's a better way."
      },
      {
        headline_ar: "🤗 هل سبق وشعرت أن {{niche}} معقد جداً ولا تعرف من أين تبدأ؟",
        headline_en: "🤗 Ever felt {{niche}} is too complex and don't know where to start?",
        sub_ar: "نفهم إحساسك تماماً. لهذا السبب صممنا شيئاً يجعل كل شيء واضحاً وبسيطاً.",
        sub_en: "We totally understand. That's why we designed something to make everything clear and simple."
      },
      {
        headline_ar: "🌱 الخطوة الأولى هي الأصعب. دعنا نمشيها معك في {{niche}}",
        headline_en: "🌱 The first step is hardest. Let us walk it with you in {{niche}}",
        sub_ar: "لا حاجة للمعاناة وحدك. نحن هنا لنرشدك بكل خطوة.",
        sub_en: "No need to struggle alone. We're here to guide you every step."
      }
    ]
  },

  // ══════ PROBLEM AWARE ══════
  problem_aware_urgency: {
    ideas: [
      {
        headline_ar: "🔥 مشكلتك في {{niche}} لن تحل نفسها — وكل يوم تأخير يكلفك أكثر",
        headline_en: "🔥 Your {{niche}} problem won't solve itself — every day you delay costs more",
        sub_ar: "أنت تعرف المشكلة. الآن حان وقت الحل قبل فوات الأوان.",
        sub_en: "You know the problem. Now it's time for the solution before it's too late."
      },
      {
        headline_ar: "⏳ كل يوم بدون حل = خسارة حقيقية. {{audience}}، الوقت ليس في صالحك",
        headline_en: "⏳ Every day without a solution = real loss. {{audience}}, time is not on your side",
        sub_ar: "المشكلة لن تختفي وحدها. لكن الحل أقرب مما تتخيل.",
        sub_en: "The problem won't disappear on its own. But the solution is closer than you think."
      },
      {
        headline_ar: "🚨 توقف عن تجاهل المشكلة! {{audience}} الأذكياء يتحركون الآن",
        headline_en: "🚨 Stop ignoring the problem! Smart {{audience}} are acting NOW",
        sub_ar: "لا تنتظر حتى تتفاقم الأمور. الحل متاح أمامك الآن.",
        sub_en: "Don't wait for things to worsen. The solution is right in front of you."
      }
    ]
  },
  problem_aware_aspirational: {
    ideas: [
      {
        headline_ar: "✨ تخيل لو تخلصت من هذه المشكلة نهائياً... كيف ستتغير حياتك في {{niche}}؟",
        headline_en: "✨ Imagine eliminating this problem forever... how would your {{niche}} life change?",
        sub_ar: "الحل ليس بعيداً. إنه على بعد خطوة واحدة من حياة مختلفة تماماً.",
        sub_en: "The solution isn't far. It's one step away from a completely different life."
      },
      {
        headline_ar: "🚀 من المعاناة إلى الإتقان: حوّل مشكلتك في {{niche}} إلى نقطة قوة",
        headline_en: "🚀 From struggle to mastery: Turn your {{niche}} problem into a strength",
        sub_ar: "أعظم قصص النجاح بدأت من أكبر التحديات. قصتك تبدأ اليوم.",
        sub_en: "The greatest success stories began from the biggest challenges. Yours starts today."
      },
      {
        headline_ar: "💪 حان وقت التغيير. {{audience}} مثلك يستحقون نتائج أفضل",
        headline_en: "💪 Time for change. {{audience}} like you deserve better results",
        sub_ar: "لا تقبل بأقل مما تستحق. الحل الذي تحتاجه موجود هنا.",
        sub_en: "Don't settle for less. The solution you need is right here."
      }
    ]
  },
  problem_aware_logical: {
    ideas: [
      {
        headline_ar: "📉 هذه المشكلة تكلفك {{price}} شهرياً في {{niche}}. إليك الحل بالأرقام",
        headline_en: "📉 This problem costs you {{price}}/month in {{niche}}. Here's the solution by numbers",
        sub_ar: "حسبناها لك: الاستمرار بدون حل أغلى بكثير من الحل نفسه.",
        sub_en: "We did the math: continuing without a solution is far more expensive than the solution itself."
      },
      {
        headline_ar: "🔍 تحليل: لماذا {{percent}}% من {{audience}} يفشلون في حل هذه المشكلة (والحل)",
        headline_en: "🔍 Analysis: Why {{percent}}% of {{audience}} fail to solve this (and the fix)",
        sub_ar: "ليست المشكلة في جهدك. المشكلة في الطريقة. إليك الطريقة الصحيحة.",
        sub_en: "It's not your effort. It's the method. Here's the right approach."
      },
      {
        headline_ar: "📊 دراسة حالة: كيف حوّل {{audience}} هذه المشكلة إلى أرباح في {{niche}}",
        headline_en: "📊 Case study: How {{audience}} turned this problem into profits in {{niche}}",
        sub_ar: "النتائج موثقة ومثبتة. اطلع عليها الآن.",
        sub_en: "Results are documented and proven. See them now."
      }
    ]
  },
  problem_aware_empathetic: {
    ideas: [
      {
        headline_ar: "😔 نعرف كم هو محبط أن تواجه هذه المشكلة في {{niche}} يومياً",
        headline_en: "😔 We know how frustrating it is to face this {{niche}} problem daily",
        sub_ar: "مررنا بنفس التجربة. لهذا صممنا حلاً يزيل هذا الإحباط من جذوره.",
        sub_en: "We've been there. That's why we designed a solution to eliminate this frustration."
      },
      {
        headline_ar: "🫂 لست مضطراً للاستمرار في المعاناة. {{audience}} يستحقون حلاً حقيقياً",
        headline_en: "🫂 You don't have to keep struggling. {{audience}} deserve a real solution",
        sub_ar: "نفهم ألمك جيداً، ونعدك أن الراحة أقرب مما تعتقد.",
        sub_en: "We understand your pain, and we promise relief is closer than you think."
      },
      {
        headline_ar: "💚 أنت في المكان الصحيح. هنا يبدأ حل مشكلتك في {{niche}}",
        headline_en: "💚 You're in the right place. This is where your {{niche}} problem gets solved",
        sub_ar: "كل شخص يستحق فرصة ثانية. دعنا نساعدك تبدأ من جديد بثقة.",
        sub_en: "Everyone deserves a second chance. Let us help you start fresh with confidence."
      }
    ]
  },

  // ══════ SOLUTION AWARE ══════
  solution_aware_urgency: {
    ideas: [
      {
        headline_ar: "⚡ جربت حلولاً كثيرة؟ هذا الحل مختلف تماماً — والعرض ينتهي قريباً",
        headline_en: "⚡ Tried many solutions? This one is totally different — and the offer ends soon",
        sub_ar: "لا تضيع وقتاً أكثر على حلول لا تنجح. اغتنم الفرصة الآن.",
        sub_en: "Don't waste more time on solutions that don't work. Seize this opportunity now."
      },
      {
        headline_ar: "🏃 المنافسون يتحولون لهذا الحل بسرعة. لا تكن آخر من يعرف",
        headline_en: "🏃 Competitors are switching fast. Don't be the last to know",
        sub_ar: "السوق يتحرك. من لا يتبنى هذا الحل الآن سيخسر ميزته التنافسية.",
        sub_en: "The market is moving. Those who don't adopt this solution now lose their edge."
      },
      {
        headline_ar: "🔥 الحل الوحيد الذي يحقق نتائج فعلية في {{niche}} — متاح لفترة محدودة",
        headline_en: "🔥 The only solution delivering real results in {{niche}} — available for limited time",
        sub_ar: "ليس كل الحلول متساوية. هذا هو الاستثناء الذي يستحق تجربتك.",
        sub_en: "Not all solutions are equal. This is the exception worth your trial."
      }
    ]
  },
  solution_aware_aspirational: {
    ideas: [
      {
        headline_ar: "🌟 أنت تعرف أن الحل موجود. الآن حان وقت اختيار الأفضل لمستقبلك",
        headline_en: "🌟 You know the solution exists. Now choose the best for your future",
        sub_ar: "لا تستقر على الجيد عندما يمكنك الحصول على الأفضل في {{niche}}.",
        sub_en: "Don't settle for good when you can have the best in {{niche}}."
      },
      {
        headline_ar: "💎 هذا ليس مجرد حل. إنه ترقية كاملة لحياتك في {{niche}}",
        headline_en: "💎 This isn't just a solution. It's a complete upgrade for your {{niche}} life",
        sub_ar: "انضم لآلاف {{audience}} الذين ارتقوا بمستواهم إلى مرحلة جديدة تماماً.",
        sub_en: "Join thousands of {{audience}} who elevated to an entirely new level."
      },
      {
        headline_ar: "🚀 الحل الذي يختاره المحترفون في {{niche}}. ألا تستحق أنت نفس المستوى؟",
        headline_en: "🚀 The solution professionals choose in {{niche}}. Don't you deserve the same?",
        sub_ar: "ارتقِ إلى مستوى النخبة مع أداة صُممت للطموحين مثلك.",
        sub_en: "Rise to elite level with a tool designed for ambitious people like you."
      }
    ]
  },
  solution_aware_logical: {
    ideas: [
      {
        headline_ar: "📊 قارنّا جميع الحلول في {{niche}}. إليك لماذا هذا الحل يتفوق بنسبة {{percent}}%",
        headline_en: "📊 We compared all {{niche}} solutions. Here's why this one wins by {{percent}}%",
        sub_ar: "أرقام حقيقية، نتائج مثبتة، ومقارنة شفافة تتحدث عن نفسها.",
        sub_en: "Real numbers, proven results, and a transparent comparison that speaks for itself."
      },
      {
        headline_ar: "🔬 لماذا هذا الحل وليس غيره؟ إليك {{number}} أسباب مثبتة بالبيانات",
        headline_en: "🔬 Why this solution and not others? Here are {{number}} data-backed reasons",
        sub_ar: "لا نطلب منك الثقة العمياء. نعطيك الأدلة لتقرر بنفسك.",
        sub_en: "We don't ask for blind trust. We give you evidence to decide yourself."
      },
      {
        headline_ar: "📈 ROI مضمون: كل {{price}} تستثمرها هنا تعود بـ {{multiplier}}× في {{niche}}",
        headline_en: "📈 Guaranteed ROI: Every {{price}} invested returns {{multiplier}}× in {{niche}}",
        sub_ar: "استثمار ذكي مبني على أرقام حقيقية وليس وعود فارغة.",
        sub_en: "A smart investment built on real numbers, not empty promises."
      }
    ]
  },
  solution_aware_empathetic: {
    ideas: [
      {
        headline_ar: "💙 نعلم أنك جربت حلولاً كثيرة وخاب أملك. هذه المرة ستكون مختلفة",
        headline_en: "💙 We know you've tried many solutions and were disappointed. This time is different",
        sub_ar: "صممنا هذا الحل خصيصاً لمن تعب من التجارب الفاشلة.",
        sub_en: "We designed this solution specifically for those tired of failed attempts."
      },
      {
        headline_ar: "🤝 لا نريدك أن تقامر مرة أخرى. لذلك نمنحك ضماناً كاملاً",
        headline_en: "🤝 We don't want you to gamble again. That's why we offer a full guarantee",
        sub_ar: "ثقتك أهم من أي بيع. جرّب بدون أي مخاطرة.",
        sub_en: "Your trust matters more than any sale. Try without any risk."
      },
      {
        headline_ar: "💚 الحل الذي تمنيت لو وجدته من البداية — مصمم بحب لـ {{audience}}",
        headline_en: "💚 The solution you wish you'd found from the start — designed with love for {{audience}}",
        sub_ar: "كل تفصيل فيه مبني على تجربة أشخاص مثلك مروا بنفس المعاناة.",
        sub_en: "Every detail built from the experience of people like you who went through the same struggle."
      }
    ]
  },

  // ══════ PRODUCT AWARE ══════
  product_aware_urgency: {
    ideas: [
      {
        headline_ar: "🔥 أنت تعرف {{productName}} — لكن هل تعرف أن العرض ينتهي خلال {{hours}} ساعة؟",
        headline_en: "🔥 You know {{productName}} — but did you know the offer ends in {{hours}} hours?",
        sub_ar: "هذا أفضل سعر ستراه. لا تفوّت الفرصة.",
        sub_en: "This is the best price you'll see. Don't miss it."
      },
      {
        headline_ar: "⏰ آخر فرصة للحصول على {{productName}} بخصم {{percent}}% قبل إغلاق العرض",
        headline_en: "⏰ Last chance to get {{productName}} at {{percent}}% off before the offer closes",
        sub_ar: "أنت تعرف القيمة. الآن اغتنم السعر قبل أن يعود للأصل.",
        sub_en: "You know the value. Now grab the price before it goes back up."
      },
      {
        headline_ar: "🚨 المقاعد محدودة! سجّل الآن في {{productName}} قبل اكتمال العدد",
        headline_en: "🚨 Limited seats! Register now for {{productName}} before it's full",
        sub_ar: "الطلب عالي والأماكن تنفد بسرعة. احجز مكانك الآن.",
        sub_en: "Demand is high and spots are filling fast. Secure yours now."
      }
    ]
  },
  product_aware_aspirational: {
    ideas: [
      {
        headline_ar: "🏆 انضم لعائلة {{productName}} — حيث يتحول {{audience}} العاديون إلى محترفين",
        headline_en: "🏆 Join the {{productName}} family — where ordinary {{audience}} become pros",
        sub_ar: "كن جزءاً من مجتمع النخبة الذي يغير قواعد اللعبة في {{niche}}.",
        sub_en: "Be part of the elite community changing the game in {{niche}}."
      },
      {
        headline_ar: "💎 {{productName}}: ليس مجرد منتج. إنه تذكرتك للنجاح في {{niche}}",
        headline_en: "💎 {{productName}}: Not just a product. It's your ticket to {{niche}} success",
        sub_ar: "أنت تعرف ما تريد. هذا هو المفتاح.",
        sub_en: "You know what you want. This is the key."
      },
      {
        headline_ar: "⭐ {{productName}} — الخيار الأول لأكثر من {{number}} عميل ناجح",
        headline_en: "⭐ {{productName}} — The #1 choice of {{number}}+ successful clients",
        sub_ar: "انضم للقادة الذين سبقوك واختاروا التميز.",
        sub_en: "Join the leaders who came before you and chose excellence."
      }
    ]
  },
  product_aware_logical: {
    ideas: [
      {
        headline_ar: "📊 {{productName}}: {{number}} عميل، {{percent}}% رضا، و{{multiplier}}× عائد استثمار",
        headline_en: "📊 {{productName}}: {{number}} clients, {{percent}}% satisfaction, {{multiplier}}× ROI",
        sub_ar: "الأرقام تتحدث. اتخذ قرارك بناءً على البيانات.",
        sub_en: "Numbers speak. Make your decision based on data."
      },
      {
        headline_ar: "🔍 مقارنة شفافة: {{productName}} مقابل البدائل — من يفوز؟",
        headline_en: "🔍 Transparent comparison: {{productName}} vs alternatives — who wins?",
        sub_ar: "لا كلام إنشائي. فقط حقائق وأرقام تساعدك تقرر.",
        sub_en: "No fluff. Just facts and numbers to help you decide."
      },
      {
        headline_ar: "💰 حاسبة العائد: كم ستربح عندما تستخدم {{productName}} في {{niche}}؟",
        headline_en: "💰 ROI Calculator: How much will you earn using {{productName}} in {{niche}}?",
        sub_ar: "أدخل أرقامك وشاهد النتائج المتوقعة بنفسك.",
        sub_en: "Enter your numbers and see the expected results yourself."
      }
    ]
  },
  product_aware_empathetic: {
    ideas: [
      {
        headline_ar: "💙 {{productName}} صُمم لأشخاص مثلك — {{audience}} الذين يستحقون الأفضل",
        headline_en: "💙 {{productName}} was designed for people like you — {{audience}} who deserve the best",
        sub_ar: "نعرف رحلتك. {{productName}} هو الرفيق الذي كنت تبحث عنه.",
        sub_en: "We know your journey. {{productName}} is the companion you've been looking for."
      },
      {
        headline_ar: "🫂 لا تخف من اتخاذ القرار. {{productName}} معك في كل خطوة",
        headline_en: "🫂 Don't be afraid to decide. {{productName}} is with you every step",
        sub_ar: "دعم كامل، ضمان 100%، ومجتمع يساندك. لن تكون وحيداً أبداً.",
        sub_en: "Full support, 100% guarantee, and a community backing you. You'll never be alone."
      },
      {
        headline_ar: "🌟 {{productName}} ليس مجرد أداة. إنه شريكك الحقيقي في رحلة {{niche}}",
        headline_en: "🌟 {{productName}} isn't just a tool. It's your real partner in your {{niche}} journey",
        sub_ar: "نهتم بنجاحك كما نهتم بمنتجنا. هذا وعدنا.",
        sub_en: "We care about your success as much as our product. That's our promise."
      }
    ]
  }
};
