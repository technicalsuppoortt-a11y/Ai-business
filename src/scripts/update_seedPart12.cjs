const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../services/seedPart12_freelanceAI.js');
let content = fs.readFileSync(file, 'utf8');

// I will modify generateMainScript
content = content.replace(
  /const generateMainScript = \(goal, channel, client, tone\) => {[\s\S]*?return `\$\{opening\}\\n\\n\$\{body\}\\n\\n\$\{cta\}`;/g,
  `const generateMainScript = (goal, channel, client, tone, lang = 'ar') => {
  let opening = ''; let body = ''; let cta = '';

  const clientPainPointsAr = {
    local: 'صعوبة في جذب الزوار الفعليين للمكان وزيادة الوعي المحلي.',
    ecom: 'ارتفاع تكلفة الاستحواذ على العميل (CAC) وانخفاض معدل التحويل.',
    tech: 'الحاجة إلى واجهة مستخدم احترافية أو نمو سريع في قاعدة المستخدمين.',
    creator: 'عدم وجود وقت كافٍ للمونتاج أو إدارة السوشيال ميديا بشكل يحقق أرباح.'
  };

  const clientPainPointsEn = {
    local: 'Struggling with foot traffic and local awareness.',
    ecom: 'High Customer Acquisition Cost (CAC) and low conversion rates.',
    tech: 'Need for a professional UI or rapid user base scaling.',
    creator: 'Lack of time for editing or managing social media profitably.'
  };

  if (tone.id === 'formal') {
    opening = lang === 'en' 
      ? \`Hello,\\n\\nI analyzed the performance of [Company Name] in the (\${client.name_en}) sector, and noticed significant untapped potential.\`
      : \`مرحباً بك،\\n\\nلقد قمت بتحليل أداء [اسم شركة العميل] في قطاع الـ (\${client.name_ar})، ولاحظت إمكانيات كبيرة غير مستغلة.\`;
    body = lang === 'en'
      ? \`Based on our experience, your biggest challenge is \${clientPainPointsEn[client.id]} Through a structured strategy, we can improve this metric significantly in 30 days.\`
      : \`بناءً على خبرتنا، التحدي الأكبر الذي يواجهكم هو \${clientPainPointsAr[client.id]} من خلال استراتيجية منظمة، يمكننا تحسين هذا المؤشر بنسبة ملحوظة خلال 30 يوماً.\`;
    cta = lang === 'en'
      ? \`Do you have 10 minutes this week to discuss an initial action plan?\\nBest regards.\`
      : \`هل لديك 10 دقائق هذا الأسبوع لمناقشة خطة العمل المبدئية؟\\nتحياتي.\`;
  } else if (tone.id === 'friendly') {
    opening = lang === 'en'
      ? \`Hi there! 👋\\n\\nI have been following [Project Name] recently and I absolutely love what you are doing in the (\${client.name_en}) space!\`
      : \`أهلاً بك!\\n\\nكنت أتابع حسابات [اسم مشروع العميل] مؤخراً وأعجبت جداً بما تقدمونه في مجال الـ (\${client.name_ar})!\`;
    body = lang === 'en'
      ? \`I know exactly that the current challenge lies in \${clientPainPointsEn[client.id]} I have helped similar projects overcome this hurdle with very simple and inexpensive steps.\`
      : \`أعرف تماماً أن التحدي الحالي يكمن في \${clientPainPointsAr[client.id]} لقد ساعدت مشاريع مشابهة لتجاوز هذه العقبة بخطوات بسيطة جداً وغير مكلفة.\`;
    cta = lang === 'en'
      ? \`How about a quick chat about some ideas you can apply immediately? (No strings attached).\`
      : \`ما رأيك أن ندردش سريعاً حول بعض الأفكار التي يمكنك تطبيقها فوراً؟ (بدون أي التزام من طرفك).\`;
  } else if (tone.id === 'direct') {
    opening = lang === 'en' ? \`Hi,\\nI will not waste your time.\` : \`مرحباً،\\nلن أضيع وقتك.\`;
    body = lang === 'en'
      ? \`If you are suffering from \${clientPainPointsEn[client.id]}, I have a ready-made system to solve this problem for your (\${client.name_en}) in less than two weeks.\`
      : \`إذا كنت تعاني من \${clientPainPointsAr[client.id]}، لدي النظام الجاهز لحل هذه المشكلة لـ (\${client.name_ar}) الخاصة بك في أقل من أسبوعين.\`;
    cta = lang === 'en'
      ? \`Click here to schedule a call and see the results yourself.\`
      : \`اضغط هنا لتحديد موعد مكالمة لترى النتائج بعينك.\`;
  } else {
    opening = lang === 'en'
      ? \`Hello,\\n\\nLast year, I worked with a \${client.name_en} facing your exact same problem...\`
      : \`مرحباً،\\n\\nفي العام الماضي، عملت مع \${client.name_ar} كان يواجه نفس مشكلتك بالضبط..\`;
    body = lang === 'en'
      ? \`They were struggling with \${clientPainPointsEn[client.id]} but after a slight strategy tweak, we saw a massive jump in numbers.\\n\\nThe secret was building an automated system running behind the scenes.\`
      : \`كانوا يعانون من \${clientPainPointsAr[client.id]} ولكن بعد تغيير بسيط في الاستراتيجية، رأينا قفزة هائلة في الأرقام.\\n\\nالسر كان يكمن في بناء سيستم يعمل بشكل تلقائي خلف الكواليس.\`;
    cta = lang === 'en'
      ? \`Would you like me to share the full story and how you can replicate the same result?\`
      : \`هل تود أن أشاركك القصة كاملة وكيف يمكنك استنساخ نفس النتيجة؟\`;
  }

  if (goal.id === 'close') {
    opening = lang === 'en'
      ? \`Hi [Name],\\nHope you are doing well. Just wanted to make sure you received the proposal for (\${client.name_en}).\`
      : \`مرحباً [الاسم]،\\nأتمنى أن تكون بخير. أردت فقط التأكد أنك استلمت المقترح المالي الخاص بـ (\${client.name_ar}).\`;
    body = lang === 'en'
      ? \`We are ready to start immediately solving the \${clientPainPointsEn[client.id]} problem and start delivering results.\`
      : \`نحن جاهزون للبدء فوراً في حل مشكلة \${clientPainPointsAr[client.id]} والبدء في تحقيق النتائج.\`;
    cta = lang === 'en'
      ? \`Are there any questions or hurdles preventing us from starting this week?\`
      : \`هل هناك أي استفسارات أو عقبات تمنعنا من بدء العمل هذا الأسبوع؟\`;
  }

  return \`\${opening}\\n\\n\${body}\\n\\n\${cta}\`;`
);

content = content.replace(
  /const generateFollowUpSequence = \(goal, tone\) => {[\s\S]*?return `\*\*المتابعة الأولى \(بعد 3 أيام\):\*\*\\n\$\{fu1\}\\n\\n\*\*المتابعة الثانية \(بعد 7 أيام\):\*\*\\n\$\{fu2\}\\n\\n\*\*المتابعة الثالثة المباشرة \(الانسحاب - بعد 14 يوم\):\*\*\\n\$\{fu3\}`;/g,
  `const generateFollowUpSequence = (goal, tone, lang = 'ar') => {
  if (goal.id === 'retain') {
    return lang === 'en'
      ? \`**Monthly Follow-up:**\\nHi [Name], here is last months report. We achieved excellent numbers! Shall we discuss the upcoming expansion plan?\`
      : \`**متابعة شهرية:**\\nمرحباً [الاسم]، هذا تقرير الشهر الماضي. لقد حققنا أرقاماً ممتازة! هل نناقش خطة التوسع القادمة؟\`;
  }

  let fu1 = ''; let fu2 = ''; let fu3 = '';

  if (tone.id === 'friendly') {
    fu1 = lang === 'en' 
      ? \`Hi [Name]! I know your schedule is super busy. Just wanted to bump my previous message to the top of your inbox.\\nCheers!\`
      : \`أهلاً [الاسم]! أعرف أن جدولك مزدحم جداً. أردت فقط إعادة رسالتي السابقة لأعلى صندوق الوارد الخاص بك.\\nتحياتي!\`;
    fu2 = lang === 'en'
      ? \`Hi again, I came across an article/tool today that instantly reminded me of you and I think it will help you a lot. Link: [Add useful link]\`
      : \`مرحباً مجدداً، لقد صادفت مقالاً/أداة اليوم تذكرتكم بها فوراً وأعتقد أنها ستساعدكم كثيراً. الرابط: [أضف رابط مفيد]\`;
    fu3 = lang === 'en'
      ? \`Looks like it's not a good time right now. I will stop following up for now, but I am always here if you need any help in the future. Best of luck!\`
      : \`يبدو أن الوقت غير مناسب الآن. سأتوقف عن المتابعة حالياً، ولكنني دائماً هنا إذا احتجتم لأي مساعدة في المستقبل. كل التوفيق!\`;
  } else if (tone.id === 'direct') {
    fu1 = lang === 'en'
      ? \`Hi [Name], did you get a chance to look at my previous message? I am ready to start.\`
      : \`مرحباً [الاسم]، هل ألقيت نظرة على رسالتي السابقة؟ أنا جاهز للبدء.\`;
    fu2 = lang === 'en'
      ? \`To save both our time, is this project still a priority for you this quarter?\`
      : \`لتوفير وقتك ووقتي، هل هذا المشروع ما زال من ضمن أولوياتك هذا الربع؟\`;
    fu3 = lang === 'en'
      ? \`Since I haven't received a reply, I will assume you went in another direction. Please let me know if plans change.\`
      : \`بما أنني لم أتلقَ رداً، سأفترض أنكم اتجهتم في طريق آخر. أرجو إعلامي إن تغيرت الخطط.\`;
  } else {
    fu1 = lang === 'en'
      ? \`Hello, sending this as a quick follow-up to my previous email. Did you have a chance to review it?\`
      : \`مرحباً، أرسل هذه الرسالة للمتابعة السريعة بخصوص الإيميل السابق. هل كان لديكم فرصة لمراجعته؟\`;
    fu2 = lang === 'en'
      ? \`I wanted to share a quick Case Study with you of a client who achieved similar results to what we aspire to achieve with you.\`
      : \`أردت مشاركة دراسة حالة (Case Study) سريعة معنا لعميل حقق نتائج مشابهة لما نطمح لتحقيقه معكم.\`;
    fu3 = lang === 'en'
      ? \`This will be my last message for now. I wish you all the best in your upcoming projects.\`
      : \`هذه ستكون رسالتي الأخيرة حالياً. أتمنى لكم كل التوفيق في مشاريعكم القادمة.\`;
  }

  return lang === 'en'
    ? \`**Follow-up 1 (After 3 days):**\\n\${fu1}\\n\\n**Follow-up 2 (After 7 days):**\\n\${fu2}\\n\\n**Follow-up 3 (Breakup - After 14 days):**\\n\${fu3}\`
    : \`**المتابعة الأولى (بعد 3 أيام):**\\n\${fu1}\\n\\n**المتابعة الثانية (بعد 7 أيام):**\\n\${fu2}\\n\\n**المتابعة الثالثة المباشرة (الانسحاب - بعد 14 يوم):**\\n\${fu3}\`;`
);

content = content.replace(
  /const generateObjectionHandling = \(client\) => {[\s\S]*?};/g,
  `const generateObjectionHandling = (client, lang = 'ar') => {
  if (lang === 'en') {
    return \`### 🛡️ Objection Handling Matrix for (\${client.name_en})\\n\\n\` +
           \`**Objection 1: "The price is too high"**\\n\` +
           \`- *Strategic Reply:* "I understand budget is an important factor. But the cost of not solving the [Client Pain] problem right now costs you much more than the service value. The price reflects the expected ROI. Shall we review the scope to see what can be trimmed without affecting the final result?"\\n\\n\` +
           \`**Objection 2: "I want to see your portfolio first"**\\n\` +
           \`- *Strategic Reply:* "Absolutely! You can check my work here [Link]. But remember, what you see are results for other companies in different circumstances. What matters most is the custom strategy we will build specifically for your project."\\n\\n\` +
           \`**Objection 3: "I will think about it and get back to you"**\\n\` +
           \`- *Strategic Reply:* "Excellent, take your time. Just so I don't leave you confused, what part of the proposal makes you hesitate or needs more thought? Is it the price, the timeline, or the execution mechanism?"\`;
  }
  return \`### 🛡️ مصفوفة الرد على الاعتراضات لـ (\${client.name_ar})\\n\\n\` +
         \`**الاعتراض 1: "السعر غالي جداً"**\\n\` +
         \`- *الرد الاستراتيجي:* "أتفهم أن الميزانية عامل مهم. ولكن تكلفة عدم حل مشكلة [ألم العميل] حالياً تكلفك أكثر بكثير من قيمة الخدمة. السعر يعكس حجم العائد المتوقع (ROI). هل نراجع نطاق العمل لنرى ما يمكن تقليصه دون المساس بالنتيجة النهائية؟"\\n\\n\` +
         \`**الاعتراض 2: "أريد رؤية معرض أعمالك أولاً"**\\n\` +
         \`- *الرد الاستراتيجي:* "بالتأكيد! يمكنك الاطلاع على أعمالي هنا [رابط]. ولكن تذكر، ما تراه هو نتائج لشركات أخرى بظروف مختلفة. الأهم هو الاستراتيجية المخصصة التي سنبنيها خصيصاً لمشروعك أنت."\\n\\n\` +
         \`**الاعتراض 3: "سأفكر في الأمر وأرد عليك"**\\n\` +
         \`- *الرد الاستراتيجي:* "ممتاز، خذ وقتك بالكامل. لكي لا أتركك في حيرة، ما هو أكثر جزء في المقترح يجعلك متردداً أو تحتاج للتفكير فيه؟ هل هو السعر، أم الوقت، أم آلية التنفيذ؟"\`;
};`
);

content = content.replace(
  /const generatePsychologicalHook = \(client\) => {[\s\S]*?return `### 🎣 الزاوية النفسية \(الخطاف السري\)\\n\\nالسر في إقناع هذا العميل هو: \$\{hooks\[client\.id\]\}`;/g,
  `const generatePsychologicalHook = (client, lang = 'ar') => {
  const hooksAr = {
    local: 'اللعب على وتر **"خسارة العملاء للمنافسين في نفس الشارع/المنطقة"**. الأنشطة المحلية تكره رؤية المنافسين يخطفون الزبائن.',
    ecom: 'اللعب على وتر **"الأموال المهدرة في الإعلانات بدون مبيعات (ROAS)"**. أصحاب المتاجر يرتعبون من حرق الميزانية بدون عائد.',
    tech: 'اللعب على وتر **"معدل حرق الكاش (Burn Rate) وسرعة النمو"**. الشركات الناشئة تبحث دائماً عن النمو السريع لإرضاء المستثمرين.',
    creator: 'اللعب على وتر **"الإرهاق والاحتراق الوظيفي (Burnout)"**. صناع المحتوى يعملون 24 ساعة ويريدون استعادة حياتهم ووقتهم.'
  };
  const hooksEn = {
    local: 'Playing the **"losing clients to competitors on the same street/area"** chord. Local businesses hate seeing competitors steal customers.',
    ecom: 'Playing the **"wasted ad spend with no sales (ROAS)"** chord. Store owners are terrified of burning budget with no return.',
    tech: 'Playing the **"Burn Rate and rapid growth"** chord. Startups are always looking for rapid growth to satisfy investors.',
    creator: 'Playing the **"Burnout and exhaustion"** chord. Creators work 24/7 and want to reclaim their lives and time.'
  };
  if (lang === 'en') return \`### 🎣 Psychological Hook\\n\\nThe secret to convincing this client is: \${hooksEn[client.id]}\`;
  return \`### 🎣 الزاوية النفسية (الخطاف السري)\\n\\nالسر في إقناع هذا العميل هو: \${hooksAr[client.id]}\`;`
);

content = content.replace(
  /const generateFreelanceMatrix = \(goal, channel, client, tone\) => {[\s\S]*?};/,
  `const generateFreelanceMatrix = (goal, channel, client, tone) => {
  const subject = generateSubjectLine(goal, channel, client, tone);
  return {
    subject_en: subject,
    subject_ar: subject,
    script_ar: generateMainScript(goal, channel, client, tone, 'ar'),
    script_en: generateMainScript(goal, channel, client, tone, 'en'),
    followups_ar: generateFollowUpSequence(goal, tone, 'ar'),
    followups_en: generateFollowUpSequence(goal, tone, 'en'),
    objections_ar: generateObjectionHandling(client, 'ar'),
    objections_en: generateObjectionHandling(client, 'en'),
    hook_ar: generatePsychologicalHook(client, 'ar'),
    hook_en: generatePsychologicalHook(client, 'en')
  };
};`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Modified seedPart12_freelanceAI.js');
