/**
 * seedPart8b_landingContent.js
 * ═══════════════════════════════════════════════════════
 * Modular Landing Page Content Database - Part B
 * Problem Agitation (Awareness) & Offer/Benefits (Price x Emotion)
 * ═══════════════════════════════════════════════════════
 */

// ─── PROBLEM AGITATION ──────────────────────────────────
// Key: `${awareness}`
export const PROBLEM_SECTIONS = {
  unaware: {
    ideas: [
      {
        ar: "معظم الـ {{audience}} يعيشون في روتين قاتل. يعملون ساعات طويلة، يبذلون مجهوداً خرافياً، وفي النهاية يجدون أنفسهم في نفس النقطة. الحقيقة المرة هي أنهم ضحايا لأساليب تقليدية أكل عليها الدهر وشرب، ولا يدركون أن العالم قد تجاوز هذه الطرق.",
        en: "Most {{audience}} live in a deadly routine. They work long hours, put in tremendous effort, and end up in the exact same spot. The bitter truth is they are victims of outdated traditional methods, unaware that the world has moved on."
      },
      {
        ar: "هل فكرت يوماً لماذا يحقق البعض نجاحاً هائلاً في {{niche}} بينما يكافح الآخرون فقط للبقاء؟ الفرق ليس في الذكاء أو الحظ. الفرق في أن الناجحين يتجنبون فخاً يقع فيه 90% من المبتدئين دون أن يلاحظوا.",
        en: "Ever wondered why some achieve massive success in {{niche}} while others struggle just to survive? The difference isn't intelligence or luck. The difference is successful people avoid a trap that 90% of beginners fall into without noticing."
      },
      {
        ar: "أنت تبذل أقصى ما لديك، لكن شيئاً ما يعيق تقدمك الخفي. قد تعتقد أن المشكلة في السوق أو في قدراتك، لكن المشكلة الحقيقية تكمن في نظام مكسور تستخدمه كل يوم ولا أحد يخبرك أنه مكسور.",
        en: "You're doing your best, but an invisible barrier is holding you back. You might think the problem is the market or your abilities, but the real issue lies in a broken system you use every day—and no one tells you it's broken."
      }
    ]
  },
  problem_aware: {
    ideas: [
      {
        ar: "أنت تعرف تماماً ما أتحدث عنه. الاستيقاظ كل يوم لتواجه نفس التحدي في {{niche}}، المحاولات الفاشلة، الشعور بالإحباط عندما لا تسير الأمور كما خططت. المشكلة لم تعد في التشخيص، بل في الألم الذي تسببه كل محاولة فاشلة.",
        en: "You know exactly what I'm talking about. Waking up every day to face the same challenge in {{niche}}, the failed attempts, the frustration when things don't go as planned. The problem is no longer the diagnosis; it's the pain each failed attempt brings."
      },
      {
        ar: "كم مرة وعدت نفسك بأن هذه المرة ستكون مختلفة؟ كم دورة حضرت؟ كم مقال قرأت؟ ومع ذلك، العقبة ما زالت موجودة. الاستمرار في نفس الدائرة المغلقة يستنزف طاقتك، وقتك، وأموالك.",
        en: "How many times have you promised yourself this time would be different? How many courses have you taken? Articles you've read? Yet, the obstacle remains. Staying in this closed loop drains your energy, time, and money."
      },
      {
        ar: "لقد أدركت المشكلة، وهذا نصف الحل. لكن النصف الآخر هو الأصعب: إيجاد مخرج لا يكلّفك سنوات من التجربة والخطأ المجهد. الانتظار سيجعل الأمور أسوأ، والتخبط سيزيد من إحباطك.",
        en: "You've recognized the problem, which is half the solution. But the other half is the hardest: finding a way out that doesn't cost you years of exhausting trial and error. Waiting will make it worse, and stumbling will only increase your frustration."
      }
    ]
  },
  solution_aware: {
    ideas: [
      {
        ar: "أنت لست مبتدئاً. أنت تعرف أن هناك حلولاً في السوق لـ {{niche}}. المشكلة الآن هي الحيرة والتشتت. كل شخص يدعي أنه الأفضل، وكل أداة تعدك بالقمر. كيف تميز بين الحل الحقيقي والوهم التسويقي؟",
        en: "You're not a beginner. You know there are solutions in the market for {{niche}}. The problem now is confusion and overwhelm. Everyone claims to be the best, and every tool promises the moon. How do you distinguish between a real solution and marketing hype?"
      },
      {
        ar: "المشكلة لم تعد 'هل يمكن حل هذا؟' بل أصبحت 'أي حل هو الأنسب، الأسرع، والأكثر كفاءة؟'. التجارب الخاطئة مع حلول ضعيفة تكلفك أكثر من مجرد المال؛ إنها تكلفك الثقة في قدرتك على التغلب على التحدي.",
        en: "The problem is no longer 'can this be solved?' but rather 'which solution is the most fitting, fastest, and most efficient?'. Making mistakes with weak solutions costs you more than money; it costs you trust in your ability to overcome the challenge."
      },
      {
        ar: "أنت تبحث عن إبرة في كومة قش. بين عشرات الخيارات لـ {{niche}}، تجد نفسك تضيع وقتاً في المقارنات بدلاً من الإنجاز. تحتاج إلى حل قاطع يُنهي هذه الحيرة ويضعك مباشرة على طريق النتائج.",
        en: "You're looking for a needle in a haystack. Among dozens of options for {{niche}}, you find yourself wasting time comparing instead of achieving. You need a definitive solution that ends this confusion and puts you directly on the path to results."
      }
    ]
  },
  product_aware: {
    ideas: [
      {
        ar: "أنت تعرف {{productName}} وتعرف ما يمكنه فعله. العقبة الوحيدة الآن هي التردد. هل حقاً يستحق الاستثمار؟ ماذا لو لم يناسبني؟ هذا التردد هو الشيء الوحيد الذي يقف بينك وبين النتائج التي تتمناها.",
        en: "You know {{productName}} and what it can do. The only obstacle now is hesitation. Is it really worth the investment? What if it doesn't suit me? This hesitation is the only thing standing between you and the results you desire."
      },
      {
        ar: "المعلومات متوفرة لديك، والمراجعات واضحة. لكنك ما زلت تؤجل اتخاذ القرار. التأجيل المستمر يعني تأجيل أرباحك وتطورك في {{niche}}. كل يوم يمر هو يوم كان يمكن أن تكون فيه في مكان أفضل بكثير.",
        en: "You have the information, and the reviews are clear. But you're still putting off the decision. Continuous procrastination means delaying your profits and growth in {{niche}}. Every day that passes is a day you could have been in a much better place."
      },
      {
        ar: "تساؤلاتك مشروعة. تريد التأكد من أن {{productName}} سيعمل معك كما عمل مع الآخرين. لكن البقاء في منطقة الراحة لن يغير شيئاً. الخوف من اتخاذ الخطوة الأخيرة يمنعك من تجربة التحول الحقيقي.",
        en: "Your questions are valid. You want to be sure {{productName}} will work for you like it did for others. But staying in your comfort zone won't change anything. The fear of taking the final step is preventing you from experiencing true transformation."
      }
    ]
  }
};

// ─── OFFER & BENEFITS ──────────────────────────────────
// Key: `${pricePoint}_${emotion}`
export const OFFER_SECTIONS = {
  // ══════ LOW TICKET ══════
  low_ticket_urgency: {
    ideas: [
      {
        ar: "احصل على {{productName}} الآن بسعر فنجان قهوة! ☕\n- حل سريع لـ {{mainBenefit}}.\n- تطبيق فوري في 10 دقائق.\n- توفير مئات الدولارات من الأخطاء.\n(العرض ينتهي الليلة!)",
        en: "Get {{productName}} now for the price of a coffee! ☕\n- Quick fix for {{mainBenefit}}.\n- Instant implementation in 10 mins.\n- Save hundreds on mistakes.\n(Offer ends tonight!)"
      },
      {
        ar: "لا تدع السعر يخدعك! هذا الدليل السريع سيختصر عليك شهوراً. احصل عليه بخصم 80% الآن לפני انتهاء الكمية المخصصة للخصم.",
        en: "Don't let the price fool you! This quick guide will save you months. Get it at 80% off now before the discounted batch runs out."
      },
      {
        ar: "استثمار بسيط = نتائج فورية. احصل على {{productName}} المخصص لـ {{audience}} بفرصة لن تتكرر بهذا السعر المضحك.",
        en: "Tiny investment = instant results. Get {{productName}} tailored for {{audience}} with an opportunity that won't repeat at this absurd price."
      }
    ]
  },
  low_ticket_logical: {
    ideas: [
      {
        ar: "لماذا تدفع الكثير؟ {{productName}} يقدم لك الخلاصة المباشرة لـ {{mainBenefit}} بأقل تكلفة ممكنة.\n- ميزة 1: قوالب جاهزة للنسخ واللصق.\n- ميزة 2: قائمة مراجعة تمنع الأخطاء.\n- ميزة 3: وصول مدى الحياة.",
        en: "Why pay more? {{productName}} gives you the direct essence of {{mainBenefit}} at the lowest possible cost.\n- Benefit 1: Copy-paste templates.\n- Benefit 2: Error-preventing checklist.\n- Benefit 3: Lifetime access."
      },
      {
        ar: "المعادلة بسيطة: ادفع أقل، واحصل على حل مركز يحل عقدتك في {{niche}} خطوة بخطوة. عائد استثمارك سيتحقق من أول استخدام.",
        en: "The equation is simple: pay less, get a focused solution that untangles your {{niche}} knot step-by-step. Your ROI will be realized on the first use."
      },
      {
        ar: "بدلاً من التجربة والخطأ، هذا الدليل القصير يعطيك الخطوات الدقيقة 1، 2، 3. تكلفة بسيطة مقابل وقت طويل توفره.",
        en: "Instead of trial and error, this short guide gives you the exact 1, 2, 3 steps. A small cost for massive time saved."
      }
    ]
  },
  // (Adding a few for Mid and High Ticket)
  mid_ticket_aspirational: {
    ideas: [
      {
        ar: "برنامج {{productName}} المتكامل صُمم ليرتقي بك. لا يقتصر الأمر على {{mainBenefit}}، بل يمنحك نظاماً كاملاً يجعلك تتفوق في سوق {{niche}} وتتميز عن منافسيك.\n- مكتبة شاملة.\n- دعم مستمر.\n- مجتمع حصري.",
        en: "The comprehensive {{productName}} program is designed to elevate you. It's not just about {{mainBenefit}}, it gives you a complete system to dominate the {{niche}} market and stand out.\n- Comprehensive library.\n- Ongoing support.\n- Exclusive community."
      },
      {
        ar: "هذه فرصتك للانتقال من الهواية إلى الاحتراف الفعلي. {{productName}} هو الجسر الذي سيعبر بك نحو مستوى دخل ونجاح جديد تماماً.",
        en: "This is your chance to move from amateur to true professional. {{productName}} is the bridge that will take you to a completely new level of income and success."
      },
      {
        ar: "استثمر في نفسك. {{productName}} يقدم لك الأدوات، الاستراتيجيات، والخرائط الذهنية التي يستخدمها كبار اللاعبين في مجالك.",
        en: "Invest in yourself. {{productName}} provides the tools, strategies, and mind maps used by the top players in your field."
      }
    ]
  },
  high_ticket_logical: {
    ideas: [
      {
        ar: "نحن لا نبيع كورس، نحن نبيع نتيجة مضمونة. برنامج {{productName}} هو استثمار عالي العائد يقدم:\n- توجيه 1-إلى-1 لضمان تطبيقك لـ {{mainBenefit}}.\n- تدقيق مستمر لمشروعك.\n- أصول جاهزة توفر لك آلاف الدولارات من تكاليف التطوير.",
        en: "We don't sell a course, we sell a guaranteed result. The {{productName}} program is a high-yield investment offering:\n- 1-on-1 guidance to ensure you achieve {{mainBenefit}}.\n- Continuous audits of your project.\n- Done-for-you assets saving you thousands in development costs."
      },
      {
        ar: "الأرقام واضحة: عملاؤنا يعوضون قيمة استثمارهم في البرنامج خلال أول 45 يوماً. إذا كنت جاداً في السيطرة على {{niche}}، فهذا هو الطريق الأكثر كفاءة وأماناً.",
        en: "The numbers are clear: our clients recoup their investment in the first 45 days. If you are serious about dominating {{niche}}, this is the most efficient and safe path."
      },
      {
        ar: "تحليل الاستثمار: بدلاً من توظيف وكالة بمبلغ ضخم شهرياً، {{productName}} ينقل لك المعرفة والأنظمة داخل شركتك لتعمل كآلة لا تتوقف.",
        en: "Investment analysis: Instead of hiring an expensive agency monthly, {{productName}} transfers the knowledge and systems in-house to run like an unstoppable machine."
      }
    ]
  }
};
