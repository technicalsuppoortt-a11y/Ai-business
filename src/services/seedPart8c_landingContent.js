/**
 * seedPart8c_landingContent.js
 * ═══════════════════════════════════════════════════════
 * Modular Landing Page Content Database - Part C
 * Social Proof (Price x Objective) & CTA (Objective x Emotion)
 * ═══════════════════════════════════════════════════════
 */

// ─── SOCIAL PROOF ──────────────────────────────────────
// Key: `${pricePoint}_${objective}`
export const PROOF_SECTIONS = {
  low_ticket_direct_sales: {
    ideas: [
      {
        ar: "⭐️⭐️⭐️⭐️⭐️ (أكثر من 5,000 عميل سعيد)\n'لم أتوقع أن أحصل على هذا الكم من القيمة مقابل هذا السعر البسيط. غير طريقتي في العمل تماماً!' - أحمد، مؤسس شركة ناشئة.",
        en: "⭐️⭐️⭐️⭐️⭐️ (Over 5,000 Happy Customers)\n'I didn't expect this much value for such a low price. It completely changed how I work!' - Ahmed, Startup Founder."
      },
      {
        ar: "🔥 المنتج الأسرع نمواً في فئته: 'لقد جربت الكثير من الأدوات المعقدة، لكن هذا الدليل القصير كان كل ما أحتاجه لحل المشكلة فوراً.' - سارة، مسوقة رقمية.",
        en: "🔥 Fastest growing product in its category: 'I've tried many complex tools, but this short guide was exactly what I needed to solve the problem instantly.' - Sarah, Digital Marketer."
      },
      {
        ar: "💯 انضم لأكثر من 10,000 محترف: 'هذا الاستثمار الصغير عاد عليّ بأرباح أضعاف قيمته في أول أسبوع. لا تتردد.' - محمد، رائد أعمال.",
        en: "💯 Join 10,000+ professionals: 'This tiny investment paid for itself multiple times over in the first week. Don't hesitate.' - Mohammed, Entrepreneur."
      }
    ]
  },
  high_ticket_direct_sales: {
    ideas: [
      {
        ar: "📈 دراسة حالة: كيف ضاعفت شركة X مبيعاتها في 3 أشهر باستخدام {{productName}}.\n'لقد كان قرار الانضمام للبرنامج هو الأفضل لنا هذا العام. الدعم والتوجيه كانا استثنائيين.' - مدير عام شركة X.",
        en: "📈 Case Study: How Company X doubled sales in 3 months using {{productName}}.\n'Joining the program was our best decision this year. The support and guidance were exceptional.' - CEO of Company X."
      },
      {
        ar: "🥇 المئات من قصص النجاح الموثقة: 'الاستثمار بدا كبيراً في البداية، لكن بعد 6 أسابيع فقط استرددنا بالكامل ما دفعناه وزادت أرباحنا الصافية بنسبة 40%.'",
        en: "🥇 Hundreds of documented success stories: 'The investment seemed large at first, but after just 6 weeks we fully recouped our cost and increased net profit by 40%.'"
      },
      {
        ar: "🏢 موثوق من رواد الصناعة: 'لم يكتفوا بإعطائنا استراتيجيات، بل ساعدونا في بناء النظام بالكامل داخل فريقنا. هذا ليس كورساً، بل شراكة نجاح حقيقية.'",
        en: "🏢 Trusted by industry leaders: 'They didn't just give us strategies, they helped us build the entire system within our team. This isn't a course, it's a true success partnership.'"
      }
    ]
  },
  low_ticket_lead_gen: {
    ideas: [
      {
        ar: "📥 تم تحميله أكثر من 50,000 مرة: 'الدليل المجاني الأفضل الذي قرأته هذا العام. طبقته فوراً وحصلت على النتيجة.'",
        en: "📥 Downloaded over 50,000 times: 'The best free guide I read this year. Applied it instantly and got the result.'"
      },
      {
        ar: "🔥 يحصل على تقييم 4.9/5 من القراء: 'معلومات دسمة ومختصرة بدون أي حشو. شكراً على هذه الهدية!'",
        en: "🔥 Rated 4.9/5 by readers: 'Rich, concise information with no fluff. Thanks for this gift!'"
      },
      {
        ar: "💡 'أخيراً، شيء مجاني مفيد حقاً وليس مجرد إعلان متنكر.' - آلاف التعليقات الإيجابية على السوشيال ميديا.",
        en: "💡 'Finally, something free that's actually useful and not just a disguised ad.' - Thousands of positive comments on social media."
      }
    ]
  }
};

// ─── CALL TO ACTION (CTA) ──────────────────────────────
// Key: `${objective}_${emotion}`
export const CTA_SECTIONS = {
  // ══════ DIRECT SALES ══════
  direct_sales_urgency: {
    ideas: [
      {
        ar: "⏳ ماذا تنتظر؟ الخصم ينتهي في منتصف الليل. اضغط هنا واحصل على نسختك الآن قبل ارتفاع السعر!\n[ زر: أريد هذا العرض الآن ⬅️ ]",
        en: "⏳ What are you waiting for? The discount ends at midnight. Click here and grab your copy now before the price goes up!\n[ Button: I Want This Offer Now ⬅️ ]"
      },
      {
        ar: "🚨 النسخ المتوفرة بهذا السعر توشك على النفاد. لا تفوّت هذه الفرصة لبدء التغيير.\n[ زر: اشتري الآن ووفر 50% 🛒 ]",
        en: "🚨 Copies at this price are running out fast. Don't miss this chance to start the change.\n[ Button: Buy Now & Save 50% 🛒 ]"
      },
      {
        ar: "⚠️ كل دقيقة تتردد فيها هي أرباح تضيع منك. القرار الآن بيدك.\n[ زر: ابدأ فوراً 🚀 ]",
        en: "⚠️ Every minute you hesitate is lost profits. The decision is in your hands now.\n[ Button: Start Instantly 🚀 ]"
      }
    ]
  },
  direct_sales_empathetic: {
    ideas: [
      {
        ar: "💚 خذ خطوتك الأولى بأمان تام. نحن نضمن لك الرضا الكامل أو استرداد أموالك بنسبة 100%. نحن هنا لدعمك.\n[ زر: انضم إلينا اليوم مجاناً من المخاطر 🛡️ ]",
        en: "💚 Take your first step with total safety. We guarantee full satisfaction or 100% money back. We're here to support you.\n[ Button: Join Us Risk-Free Today 🛡️ ]"
      },
      {
        ar: "🤝 نعلم أن التغيير قد يكون مخيفاً، لكنك لست وحدك. ابدأ معنا ودعنا نساعدك في تحقيق أهدافك.\n[ زر: ابدأ رحلتك بثقة ✨ ]",
        en: "🤝 We know change can be scary, but you're not alone. Start with us and let us help you achieve your goals.\n[ Button: Start Your Journey Confidently ✨ ]"
      },
      {
        ar: "🌱 لا تدع التجارب السابقة تحبطك. جرّب هذه الطريقة المجربة ونعدك أنك سترى النور في نهاية النفق.\n[ زر: أريد التغيير الآن 💖 ]",
        en: "🌱 Don't let past experiences get you down. Try this proven method and we promise you'll see the light.\n[ Button: I Want The Change Now 💖 ]"
      }
    ]
  },
  // ══════ LEAD GEN ══════
  lead_gen_logical: {
    ideas: [
      {
        ar: "📊 احصل على التقرير المجاني المكون من 20 صفحة، والذي يحلل السوق بالأرقام ويوجهك للخطوات الصحيحة.\n[ زر: حمّل التقرير المجاني بصيغة PDF 📥 ]",
        en: "📊 Get the free 20-page report analyzing the market by numbers and guiding you to the right steps.\n[ Button: Download Free PDF Report 📥 ]"
      },
      {
        ar: "📈 أرسل لنا بريدك الإلكتروني لنرسل لك ملف Excel الذي نستخدمه شخصياً لمضاعفة إنتاجيتنا.\n[ زر: أرسل لي الملف الآن 📊 ]",
        en: "📈 Drop your email and we'll send you the exact Excel sheet we use to double our productivity.\n[ Button: Send Me The File Now 📊 ]"
      },
      {
        ar: "🧠 لا تعتمد على التخمين. احصل على الدليل المبني على تحليل مئات الحملات الناجحة.\n[ زر: اكتشف الأرقام والحقائق 🔍 ]",
        en: "🧠 Don't rely on guesswork. Get the guide based on analyzing hundreds of successful campaigns.\n[ Button: Discover Numbers & Facts 🔍 ]"
      }
    ]
  },
  // ══════ BOOKING / CONSULTATION ══════
  booking_aspirational: {
    ideas: [
      {
        ar: "🌟 هل أنت مستعد للانتقال بالبزنس الخاص بك إلى مستوى الملايين؟ احجز مكالمتك الاستراتيجية المجانية لنرسم لك خارطة الطريق.\n[ زر: احجز جلستك الاستراتيجية الآن 📅 ]",
        en: "🌟 Ready to take your business to the millions level? Book your free strategic call so we can map out your journey.\n[ Button: Book Your Strategy Session Now 📅 ]"
      },
      {
        ar: "💎 لا ترضَ بالنمو البطيء. تحدث مع خبراء النمو لدينا لترى كيف يمكننا تسريع وصولك للقمة.\n[ زر: تحدث مع خبير نمو 🚀 ]",
        en: "💎 Don't settle for slow growth. Speak with our growth experts to see how we can accelerate your path to the top.\n[ Button: Talk to a Growth Expert 🚀 ]"
      },
      {
        ar: "🏆 أفضل استثمار تفعله اليوم هو 30 دقيقة تركز فيها على تطوير أعمالك. جدول مكالمة لترى الإمكانيات غير المحدودة.\n[ زر: أريد استكشاف إمكانياتي 🌐 ]",
        en: "🏆 The best investment today is 30 minutes focusing on your business growth. Schedule a call to see unlimited potential.\n[ Button: I Want to Explore My Potential 🌐 ]"
      }
    ]
  }
};
