import React, { useState, useRef, useEffect } from "react";
import useToolCache from "../../../hooks/useToolCache";
import { useToast } from "../../../context/ToastContext";
import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  Sparkles,
  X,
  ArrowUpRight,
  Zap,
  Info,
  RefreshCw,
} from "lucide-react";
import ToolDashboardLayout from "./ToolDashboardLayout";
import "./ExternalTools.css";

const CATEGORIES_META = {
  all: { ar: "كل الأدوات", en: "All Tools" },
  strategy: { ar: "استراتيجية وأعمال", en: "Strategy & Ops" },
  writing: { ar: "كتابة ومحادثة", en: "Writing & Chat" },
  design: { ar: "تصميم وصور", en: "Design & Art" },
  video: { ar: "فيديو وأفاتار", en: "Video & Avatar" },
  audio: { ar: "صوت وموسيقى", en: "Audio & Voice" },
  productivity: { ar: "إنتاجية وأتمتة", en: "Productivity" },
  code: { ar: "برمجة وتطوير", en: "Code & Dev" },
  search: { ar: "بحث ومصادر", en: "Search & Research" },
};

const EXTERNAL_TOOLS_DATA = [
  {
    id: "upklick",
    name: "Upklick",
    category: "strategy",
    url: "https://upklick-eight.vercel.app/",
    logo: "https://upklick-eight.vercel.app/best_logo_dark.png",
    desc_ar:
      "المنصة المتكاملة لبناء الاستراتيجيات التجارية والمواقع والهويات البصرية بالذكاء الاصطناعي.",
    desc_en:
      "The all-in-one platform to build business strategies, websites, and visual identities with AI.",
    help_ar:
      "تساعدك في تخطيط مشروعك، اختيار الاسم واللوجو، توليد المحتوى التسويقي وأتمتة العمليات بالكامل.",
    help_en:
      "Helps you plan your project, choose brand name and logo, generate marketing content, and automate workflows completely.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "writing",
    url: "https://chatgpt.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=chatgpt.com",
    desc_ar:
      "الرائد في محادثات الذكاء الاصطناعي، ممتاز لكتابة المحتوى، البرمجة، وتوليد الأفكار.",
    desc_en:
      "The leader in AI conversation, excellent for content writing, coding, and brainstorming.",
    help_ar:
      "يمكنك استخدامه في صياغة رسائل البريد، كتابة المقالات، حل المشاكل البرمجية المعقدة، أو حتى كمساعد شخصي لتنظيم يومك.",
    help_en:
      "Use it for drafting emails, writing articles, solving complex coding issues, or as a personal assistant to organize your day.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "writing",
    url: "https://gemini.google.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=gemini.google.com",
    desc_ar:
      "ذكاء جوجل المتطور، مدمج مع تطبيقات جوجل ويدعم تحليل البيانات والملفات بشكل ضخم.",
    desc_en:
      "Google’s advanced AI, integrated with Google Apps and supports massive data and file analysis.",
    help_ar:
      "مثالي إذا كنت تستخدم Drive و Gmail، حيث يمكنه تلخيص ملفاتك وجداول بياناتك مباشرة وتقديم إجابات دقيقة بناءً عليها.",
    help_en:
      "Perfect if you use Drive and Gmail; it can summarize your files and spreadsheets directly and provide accurate answers based on them.",
  },
  {
    id: "claude",
    name: "Claude AI",
    category: "writing",
    url: "https://claude.ai",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=claude.ai",
    desc_ar:
      "مشهور بقدراته الفائقة في التحليل الأدبي والكتابة الطبيعية والتعامل مع النصوص الطويلة جداً.",
    desc_en:
      "Famous for its superior literary analysis, natural writing, and handling very long texts.",
    help_ar:
      "استخدمه إذا كان لديك كتاب كامل أو تقرير ضخم تريد تلخيصه، أو إذا كنت تبحث عن كتابة إبداعية تشبه أسلوب البشر تماماً.",
    help_en:
      "Use it if you have an entire book or a massive report to summarize, or if you want creative writing that mimics human style perfectly.",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "search",
    url: "https://perplexity.ai",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=perplexity.ai",
    desc_ar:
      "محرك بحث ذكي يقدم إجابات موثقة بالمصادر والروابط المباشرة من الويب.",
    desc_en:
      "A smart search engine that provides cited answers and direct links from across the web.",
    help_ar:
      "بديل رائع لجوجل عندما تبحث عن معلومات دقيقة وحديثة مع معرفة مصدر المعلومة الأصلي لضمان المصداقية.",
    help_en:
      "A great alternative to Google when searching for accurate, up-to-date information while knowing the original source for credibility.",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "design",
    url: "https://www.midjourney.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=midjourney.com",
    desc_ar:
      "أقوى أداة لتوليد الصور الفنية والواقعية بجودة مذهلة تنافس المصورين المحترفين.",
    desc_en:
      "The most powerful tool for generating artistic and photorealistic images with stunning quality.",
    help_ar:
      "يساعدك في تصميم لوجوهات، خلفيات، صور للمنتجات، أو أي عمل فني تتخيله بدقة سينمائية غير مسبوقة.",
    help_en:
      "Helps you design logos, backgrounds, product photos, or any artwork you imagine with unprecedented cinematic precision.",
  },
  {
    id: "canva",
    name: "Canva Magic",
    category: "design",
    url: "https://canva.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=canva.com",
    desc_ar:
      "منصة التصميم الشهيرة التي أصبحت تدعم عشرات أدوات الذكاء الاصطناعي للتعديل والإنشاء.",
    desc_en:
      "The famous design platform that now supports dozens of AI tools for editing and creation.",
    help_ar:
      "يمكنك تحويل النص إلى صور، إزالة الخلفيات بضغطة زر، أو حتى كتابة محتوى كامل لتصميماتك السوشيال ميديا.",
    help_en:
      "Convert text to images, remove backgrounds with one click, or even write entire content for your social media designs.",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "audio",
    url: "https://elevenlabs.io",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=elevenlabs.io",
    desc_ar:
      "رائد تحويل النص إلى صوت واقعي جداً مع إمكانية استنساخ الأصوات بدقة مذهلة.",
    desc_en:
      "Leader in text-to-speech with incredibly realistic voices and high-precision voice cloning.",
    help_ar:
      "مفيد جداً لإنشاء فيديوهات يوتيوب، بودكاست، أو كتب صوتية دون الحاجة لتسجيل صوتك بنفسك.",
    help_en:
      "Very useful for creating YouTube videos, podcasts, or audiobooks without having to record your own voice.",
  },
  {
    id: "heygen",
    name: "HeyGen",
    category: "video",
    url: "https://heygen.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=heygen.com",
    desc_ar:
      "إنشاء فيديوهات لشخصيات تتحدث بذكاء اصطناعي مع مزامنة الشفاه وترجمة الفيديوهات.",
    desc_en:
      "Create AI talking avatar videos with lip-sync and video translation capabilities.",
    help_ar:
      "يمكنك تصوير فيديو بنفسك وجعل الذكاء الاصطناعي يترجمه لأي لغة أخرى مع تغيير حركة فمك لتناسب اللغة الجديدة.",
    help_en:
      "You can film a video of yourself and have AI translate it into any language while changing your lip movement to match the new language.",
  },
  {
    id: "runway",
    name: "Runway Gen-2",
    category: "video",
    url: "https://runwayml.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=runwayml.com",
    desc_ar: "أداة احترافية لتحويل النصوص والصور إلى فيديوهات سينمائية متحركة.",
    desc_en:
      "A professional tool for converting text and images into animated cinematic videos.",
    help_ar:
      "استخدمها لإنشاء مقاطع فيديو ترويجية لمنتجاتك أو تجربة تأثيرات بصرية معقدة في ثوانٍ معدودة.",
    help_en:
      "Use it to create promotional video clips for your products or experiment with complex visual effects in seconds.",
  },
  {
    id: "suno",
    name: "Suno AI",
    category: "audio",
    url: "https://suno.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=suno.com",
    desc_ar:
      "توليد أغاني كاملة (كلمات، لحن، وصوت) بمجرد وصف بسيط لنوع الموسيقى.",
    desc_en:
      "Generate full songs (lyrics, melody, and vocals) with just a simple description of the music style.",
    help_ar:
      "يمكنك إنشاء موسيقى أصلية لمشروعك، أو أغنية مخصصة بمناسبة معينة، أو حتى فواصل موسيقية لفيديوهاتك.",
    help_en:
      "Create original music for your project, a custom song for a special occasion, or even musical interludes for your videos.",
  },
  {
    id: "grammarly",
    name: "Grammarly",
    category: "writing",
    url: "https://grammarly.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=grammarly.com",
    desc_ar:
      "المساعد الأشهر لتصحيح القواعد الإنجليزية وتحسين أسلوب الكتابة والاحترافية.",
    desc_en:
      "The most famous assistant for correcting English grammar and improving writing style and professionalism.",
    help_ar:
      "يضمن أن مراسلاتك مع العملاء الأجانب خالية من الأخطاء وتظهر بشكل احترافي ومقنع.",
    help_en:
      "Ensures your correspondence with foreign clients is error-free and appears professional and persuasive.",
  },
  {
    id: "deepl",
    name: "DeepL",
    category: "writing",
    url: "https://deepl.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=deepl.com",
    desc_ar:
      "أدق مترجم آلي في العالم، يتفوق على ترجمة جوجل في فهم السياق والمعاني الدقيقة.",
    desc_en:
      "The world’s most accurate machine translator, surpassing Google Translate in understanding context and nuances.",
    help_ar:
      "مثالي لترجمة المستندات القانونية أو التقنية حيث تكون الدقة متناهية الأهمية لتجنب سوء الفهم.",
    help_en:
      "Perfect for translating legal or technical documents where extreme accuracy is critical to avoid misunderstandings.",
  },
  {
    id: "gamma",
    name: "Gamma App",
    category: "design",
    url: "https://gamma.app",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=gamma.app",
    desc_ar:
      "إنشاء عروض تقديمية (PowerPoint) ومواقع ويب كاملة في ثوانٍ بمجرد كتابة العنوان.",
    desc_en:
      "Create professional presentations (PowerPoint) and entire websites in seconds just by typing a title.",
    help_ar:
      "بدلاً من قضاء ساعات في تصميم Slides، فقط اكتب الموضوع وسيقوم Gamma بإنشاء عرض مبهر ومنظم لك.",
    help_en:
      "Instead of spending hours designing slides, just type the topic and Gamma will create a stunning, organized presentation for you.",
  },
  {
    id: "notion",
    name: "Notion AI",
    category: "productivity",
    url: "https://notion.so",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=notion.so",
    desc_ar:
      "دمج الذكاء الاصطناعي داخل مساحة عملك لتلخيص الملاحظات وكتابة التقارير وتنظيم المهام.",
    desc_en:
      "Integrate AI within your workspace to summarize notes, write reports, and organize tasks.",
    help_ar:
      "يساعدك في تحويل ملاحظات الاجتماعات العشوائية إلى قائمة مهام مرتبة أو مسودة مقال جاهزة للنشر.",
    help_en:
      "Helps you turn scattered meeting notes into an organized task list or a draft article ready for publishing.",
  },
  {
    id: "zapier",
    name: "Zapier Central",
    category: "productivity",
    url: "https://zapier.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=zapier.com",
    desc_ar:
      "ربط آلاف التطبيقات ببعضها وأتمتة المهام المتكررة باستخدام الذكاء الاصطناعي.",
    desc_en:
      "Connect thousands of apps and automate repetitive tasks using AI logic.",
    help_ar:
      'يمكنك مثلاً جعل النظام يرسل رداً تلقائياً للعميل على واتساب بمجرد وصول إيميل جديد يحتوي على كلمة "طلب".',
    help_en:
      'For example, you can have the system automatically send a WhatsApp reply to a client as soon as a new email containing "order" arrives.',
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    category: "design",
    url: "https://leonardo.ai",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=leonardo.ai",
    desc_ar:
      "منصة متكاملة لتوليد الصور وتعديلها مع نماذج مخصصة للألعاب والتصاميم ثلاثية الأبعاد.",
    desc_en:
      "A comprehensive platform for generating and editing images with custom models for games and 3D designs.",
    help_ar:
      "يقدم تحكماً كبيراً في النتائج ويسمح لك بتدريب نماذجك الخاصة لإنتاج صور بأسلوبك الفريد باستمرار.",
    help_en:
      "Offers great control over results and allows you to train your own models to consistently produce images in your unique style.",
  },
  {
    id: "quillbot",
    name: "QuillBot",
    category: "writing",
    url: "https://quillbot.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=quillbot.com",
    desc_ar:
      "أفضل أداة لإعادة صياغة النصوص (Paraphrasing) لتحسين التدفق اللغوي وتجنب الاقتباس.",
    desc_en:
      "The best tool for paraphrasing text to improve flow and avoid plagiarism.",
    help_ar:
      "إذا كان لديك نص وتريد قوله بأسلوب مختلف أو أكثر احترافية، كويل بوت هو خيارك الأول.",
    help_en:
      "If you have text and want to say it in a different or more professional style, QuillBot is your first choice.",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "code",
    url: "https://github.com/features/copilot",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=github.com",
    desc_ar:
      "مساعد البرمجين الأذكى، يكتب معك الكود ويقترح حلولاً برمجية كاملة في الوقت الفعلي.",
    desc_en:
      "The smartest coding assistant; writes code with you and suggests full programming solutions in real-time.",
    help_ar:
      "يوفر على المبرمجين ما يصل لـ 50% من وقت الكتابة اليدوية ويساعد في اكتشاف الأخطاء قبل حدوثها.",
    help_en:
      "Saves programmers up to 50% of manual typing time and helps detect bugs before they happen.",
  },
  {
    id: "otter",
    name: "Otter.ai",
    category: "productivity",
    url: "https://otter.ai",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=otter.ai",
    desc_ar:
      "تحويل تسجيلات الاجتماعات والمحاضرات إلى نصوص مكتوبة مع تحديد المتحدثين وتلخيص النقاط.",
    desc_en:
      "Convert meeting and lecture recordings into written text with speaker identification and point summarization.",
    help_ar:
      "سجل أي اجتماع زووم وسيقوم Otter بكتابة كل ما قيل وتلخيص القرارات الهامة التي تم اتخاذها.",
    help_en:
      "Record any Zoom meeting and Otter will transcribe everything said and summarize important decisions made.",
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    category: "design",
    url: "https://firefly.adobe.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=adobe.com",
    desc_ar:
      "الذكاء الاصطناعي من أدوبي، مدمج في فوتوشوب للتعديل السحري على الصور.",
    desc_en:
      "Adobe’s AI, integrated into Photoshop for magical image editing and generation.",
    help_ar:
      "يمكنك إضافة أشياء للصورة، تغيير ملابس الشخص، أو توسيع خلفية الصورة بضغطة زر وبشكل واقعي جداً.",
    help_en:
      "You can add objects to a photo, change a person's clothes, or expand a background with one click and very realistically.",
  },
  {
    id: "pika",
    name: "Pika Labs",
    category: "video",
    url: "https://pika.art",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=pika.art",
    desc_ar:
      "منصة مبتكرة لتحريك الصور وتحويل الوصف النصي إلى فيديوهات قصيرة مبهرة.",
    desc_en:
      "An innovative platform for animating images and converting text descriptions into stunning short videos.",
    help_ar:
      "ممتازة لإنشاء تأثيرات بصرية سينمائية صغيرة أو جعل الشعارات (Logos) تتحرك بشكل جذاب.",
    help_en:
      "Excellent for creating small cinematic visual effects or making logos move attractively.",
  },
  {
    id: "synthesia",
    name: "Synthesia",
    category: "video",
    url: "https://synthesia.io",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=synthesia.io",
    desc_ar:
      "رائد إنشاء الفيديوهات التعليمية باستخدام مقدمين (Avatars) واقعيين بـ 120 لغة.",
    desc_en:
      "Leader in creating educational videos using realistic avatars in 120+ languages.",
    help_ar:
      "أنشئ فيديوهات تدريبية لموظفيك أو شرحاً لمنتجك دون الحاجة لكاميرا، ميكروفون، أو استوديو تصوير.",
    help_en:
      "Create training videos for your employees or product explainers without needing a camera, microphone, or studio.",
  },
  {
    id: "clickup",
    name: "ClickUp AI",
    category: "productivity",
    url: "https://clickup.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=clickup.com",
    desc_ar:
      "إدارة مشاريع مدعومة بالذكاء الاصطناعي لكتابة المهام وتلخيص تقدم الفريق.",
    desc_en:
      "AI-powered project management to write tasks and summarize team progress.",
    help_ar:
      "يغنيك عن قراءة مئات التعليقات؛ فقط اطلب من الذكاء الاصطناعي تلخيص ما حدث في المشروع اليوم.",
    help_en:
      "Saves you from reading hundreds of comments; just ask the AI to summarize what happened in the project today.",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "code",
    url: "https://huggingface.co",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=huggingface.co",
    desc_ar:
      "المكتبة الأكبر في العالم لنماذج الذكاء الاصطناعي الجاهزة والمفتوحة المصدر.",
    desc_en:
      "The world’s largest library for ready-to-use, open-source AI models.",
    help_ar:
      "إذا كنت مطوراً، هذا هو مكانك لاكتشاف أحدث النماذج وتجربتها مجاناً في مشاريعك الخاصة.",
    help_en:
      "If you are a developer, this is your place to discover and test the latest models for free in your own projects.",
  },
  {
    id: "murf",
    name: "Murf AI",
    category: "audio",
    url: "https://murf.ai",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=murf.ai",
    desc_ar:
      "تحويل النص إلى تعليق صوتي (Voiceover) احترافي بجودة استوديو وتنوع كبير في الأصوات.",
    desc_en:
      "Convert text to professional studio-quality voiceovers with a wide variety of voices.",
    help_ar:
      "مثالي للإعلانات التجارية والعروض التوضيحية التي تتطلب صوتاً قوياً ومقنعاً يشد المستمع.",
    help_en:
      "Perfect for commercials and demos that require a strong, persuasive voice to capture the listener.",
  },
  {
    id: "poe",
    name: "Poe",
    category: "writing",
    url: "https://poe.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=poe.com",
    desc_ar:
      "منصة واحدة تتيح لك الوصول لجميع موديلات الذكاء الاصطناعي (GPT-4, Claude, Llama) في مكان واحد.",
    desc_en:
      "A single platform giving you access to all major AI models (GPT-4, Claude, Llama) in one place.",
    help_ar:
      "بدلاً من الاشتراك في كل موقع على حدة، يمكنك تجربة ومقارنة أداء الموديلات المختلفة من واجهة واحدة.",
    help_en:
      "Instead of subscribing to each site separately, you can test and compare different models from one interface.",
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    category: "search",
    url: "https://notebooklm.google.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=google.com",
    desc_ar:
      "أداة ذكية من جوجل لتحليل ملفاتك الشخصية وتحويلها إلى قاعدة معرفية تفاعلية.",
    desc_en:
      "A smart tool from Google to analyze your personal files and turn them into an interactive knowledge base.",
    help_ar:
      'ارفع مصادرك وكتبك، وسيقوم بالرد على أسئلتك بناءً عليها فقط، بل ويمكنه توليد "بودكاست" صوتي يشرح ملفاتك.',
    help_en:
      "Upload your sources and books; it will answer questions based only on them, and can even generate an audio podcast explaining your files.",
  },
  {
    id: "capcut",
    name: "CapCut AI",
    category: "video",
    url: "https://capcut.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=capcut.com",
    desc_ar:
      "محرر الفيديو الأكثر شعبية الذي يستخدم الذكاء الاصطناعي لإضافة ترجمة آلية وتأثيرات سينمائية.",
    desc_en:
      "The most popular video editor using AI for auto-captions, cinematic effects, and smart editing.",
    help_ar:
      "استخدم ميزة Auto-Captions لإضافة ترجمة جذابة لفيديوهاتك في ثوانٍ، أو ميزة Background Removal لإزالة الخلفية.",
    help_en:
      "Use Auto-Captions to add engaging subtitles to your videos in seconds, or Background Removal for your clips.",
  },
  {
    id: "ollama",
    name: "Ollama",
    category: "code",
    url: "https://ollama.com",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=ollama.com",
    desc_ar:
      "أفضل أداة لتشغيل نماذج الذكاء الاصطناعي الكبيرة (LLMs) محلياً على جهازك الخاص دون إنترنت.",
    desc_en:
      "The best tool to run Large Language Models (LLMs) locally on your own machine without an internet connection.",
    help_ar:
      "إذا كنت تهتم بخصوصية بياناتك جداً، أولاما يسمح لك بمحادثة الذكاء الاصطناعي على جهازك الشخصي فقط.",
    help_en:
      "If you care deeply about data privacy, Ollama allows you to chat with AI exclusively on your personal device.",
  },
  {
    id: "sora",
    name: "OpenAI Sora",
    category: "video",
    url: "https://openai.com/sora",
    logo: "https://www.google.com/s2/favicons?sz=128&domain=openai.com",
    desc_ar:
      "المستقبل في توليد الفيديو من النص، يخلق مشاهد واقعية تماماً تصل مدتها لدقيقة كاملة.",
    desc_en:
      "The future of text-to-video generation, creating fully realistic scenes up to a minute long.",
    help_ar:
      "ترقب إطلاقها العام، حيث ستغير مفهوم صناعة الأفلام والمحتوى المرئي بضغطة زر واحدة.",
    help_en:
      "Watch for its public release; it will redefine filmmaking and visual content creation with a single click.",
  },
];

export default function ExternalTools() {
  const toast = useToast();
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || "ar";
  const baseLang = lang?.startsWith("en") ? "en" : "ar";
  const isRtl = lang?.startsWith("ar");

  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
  };

  const closePopup = () => {
    setSelectedTool(null);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const filteredTools = EXTERNAL_TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const nameMatch = tool.name.toLowerCase().includes(query);
    const descArMatch = tool.desc_ar?.toLowerCase().includes(query);
    const descEnMatch = tool.desc_en?.toLowerCase().includes(query);
    const helpArMatch = tool.help_ar?.toLowerCase().includes(query);
    const helpEnMatch = tool.help_en?.toLowerCase().includes(query);
    return (
      matchesCategory &&
      (nameMatch || descArMatch || descEnMatch || helpArMatch || helpEnMatch)
    );
  });

  // --- STATE PERSISTENCE & HYDRATION ---
  const {
    cachedData: cached,
    isLoadingCache,
    saveResult,
  } = useToolCache(userData?.uid, "external-tools");
  const isLoadedFromCloud = !isLoadingCache;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.selectedTool !== undefined)
          setSelectedTool(cached.selectedTool);
        if (cached.searchQuery !== undefined)
          setSearchQuery(cached.searchQuery);
        if (cached.selectedCategory !== undefined)
          setSelectedCategory(cached.selectedCategory);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ selectedTool, searchQuery, selectedCategory });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, selectedTool, searchQuery, selectedCategory]);

  const handleResetSession = () => {
    setSelectedTool(null);
    setSearchQuery("");
    setSelectedCategory("all");
    saveResult(null);
  };
  // -------------------------------------

  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="external-tools"
        title={
          lang === "en"
            ? "Top 31 AI Tools & Platforms"
            : "أفضل 31 أداة ومنصة للذكاء الاصطناعي"
        }
        subtitle={
          lang === "en"
            ? "Loading saved workspace..."
            : "جاري تحميل مساحة العمل..."
        }
        accentColor="#6366F1"
      >
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Sleek Skeleton Loader */}
          <div
            style={{
              height: "400px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "20px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="external-tools"
      title={
        lang === "en"
          ? "Top 31 AI Tools & Platforms"
          : "أفضل 31 أداة ومنصة للذكاء الاصطناعي"
      }
      subtitle={
        lang === "en"
          ? "A curated spatial catalog of the world's top AI ecosystems to power your business growth."
          : "دليل تفاعلي متقدم لأبرز وأقوى منصات الذكاء الاصطناعي العالمية لتسريع نمو مشروعك."
      }
      accentColor="#6366F1"
      timeEstimate="∞"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "15px 20px 0 20px",
        }}
      ></div>
      {/* Advanced Control & Filter Section */}
      <div className="et-control-panel">
        <div className="et-search-bar-row">
          <div className="et-search-input-wrapper">
            <Search size={18} className="et-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Search tools by name, description, or feature..."
                  : "ابحث عن أي أداة بالاسم، الوصف، أو الوظيفة..."
              }
              className="et-search-input"
            />
            {searchQuery && (
              <button
                className="et-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="et-results-badge">
            <Sparkles size={14} />
            <span>
              {lang === "en"
                ? `${filteredTools.length} of ${EXTERNAL_TOOLS_DATA.length} Tools`
                : `${filteredTools.length} من ${EXTERNAL_TOOLS_DATA.length} أداة`}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="et-categories-wrapper">
          <div className="et-categories-bar">
            {Object.keys(CATEGORIES_META).map((catKey) => {
              const meta = CATEGORIES_META[catKey];
              const isActive = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`et-cat-tab ${isActive ? "active" : ""}`}
                >
                  {meta[baseLang]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tools Grid / Empty State */}
      {filteredTools.length === 0 ? (
        <div className="et-empty-state">
          <div className="et-empty-icon">🔍</div>
          <h3>
            {lang === "en"
              ? "No Matching AI Tools Found"
              : "لم نجد أي أداة تطابق بحثك"}
          </h3>
          <p>
            {lang === "en"
              ? "Try adjusting your search terms or select a different category filter."
              : "جرب تغيير كلمات البحث أو اختر تفضيل فئة آخر من الشريط الأعلى."}
          </p>
          <button className="et-reset-btn" onClick={handleResetFilters}>
            <RefreshCw size={15} />
            {lang === "en" ? "Reset Filters" : "إعادة ضبط الفلاتر"}
          </button>
        </div>
      ) : (
        <div className="et-grid">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="et-card-wrapper">
              <div
                className={`et-card ${tool.id === "upklick" ? "et-featured-card" : ""}`}
                onClick={() => handleToolClick(tool)}
              >
                <div className="et-card-top-bar">
                  <span className="et-cat-badge">
                    {CATEGORIES_META[tool.category]?.[baseLang] || tool.category}
                  </span>
                  {/* {tool.id === "upklick" && (
                    <span className="et-featured-badge">
                      ★{" "}
                      {lang === "en" ? "Featured Platform" : "منصتنا المتميزة"}
                    </span>
                  )} */}
                </div>

                <div className="et-card-inner">
                  <div
                    className="et-logo-container"
                    style={
                      tool.id === "upklick"
                        ? {
                            background: "#0d1220",
                            width: "64px",
                            height: "64px",
                            padding: "4px",
                          }
                        : {}
                    }
                  >
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      onError={(e) => {
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/2103/2103633.png";
                      }}
                      style={
                        tool.id === "upklick"
                          ? {
                              transform: "scale(2.4)",
                              transformOrigin: "center",
                            }
                          : {}
                      }
                    />
                  </div>
                  <div className="et-info">
                    <h3 className="et-name">{tool.name}</h3>
                    <p className="et-desc">
                      {lang === "en" ? tool.desc_en : tool.desc_ar}
                    </p>
                  </div>
                </div>

                <div className="et-card-footer">
                  <span className="et-quick-view-hint">
                    <Info size={12} />
                    {lang === "en"
                      ? "Click card for guide"
                      : "اضغط للتفاصيل والدليل"}
                  </span>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="et-go-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lang === "en" ? "Visit Website" : "زيارة الموقع"}
                    <ArrowUpRight size={14} className="et-btn-icon" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Popup Modal */}
      {selectedTool &&
        createPortal(
          <div className="et-popup-overlay" onClick={closePopup}>
            <div
              className={`et-popup ${lang === "en" ? "et-popup-ltr" : "et-popup-rtl"}`}
              dir={lang === "en" ? "ltr" : "rtl"}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="et-popup-accent-line" />
              <button
                className="et-close-btn"
                onClick={closePopup}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="et-popup-header">
                <div
                  className="et-popup-logo"
                  style={
                    selectedTool.id === "upklick"
                      ? {
                          background: "#0d1220",
                          width: "80px",
                          height: "80px",
                          padding: "6px",
                        }
                      : {}
                  }
                >
                  <img
                    src={selectedTool.logo}
                    alt={selectedTool.name}
                    onError={(e) => {
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/2103/2103633.png";
                    }}
                    style={
                      selectedTool.id === "upklick"
                        ? { transform: "scale(2.4)", transformOrigin: "center" }
                        : {}
                    }
                  />
                </div>
                <div className="et-popup-title-group">
                  <div className="et-popup-meta-row">
                    <span className="et-cat-badge">
                      {CATEGORIES_META[selectedTool.category]?.[baseLang]}
                    </span>
                    {selectedTool.id === "upklick" && (
                      <span className="et-featured-badge">
                        ★{" "}
                        {lang === "en" ? "Official Platform" : "المنصة الرسمية"}
                      </span>
                    )}
                  </div>
                  <h2>{selectedTool.name}</h2>
                  <a
                    href={selectedTool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="et-popup-link"
                  >
                    <ExternalLink size={13} />
                    <span>
                      {selectedTool.url
                        .replace("https://", "")
                        .replace(/\/$/, "")}
                    </span>
                  </a>
                </div>
              </div>

              <div className="et-popup-content">
                <div className="et-popup-card">
                  <h4>
                    <Sparkles size={16} className="et-section-icon" />
                    {lang === "en"
                      ? "What is this platform?"
                      : "ما هو هذا الموقع؟"}
                  </h4>
                  <p>
                    {lang === "en"
                      ? selectedTool.desc_en
                      : selectedTool.desc_ar}
                  </p>
                </div>

                <div className="et-popup-card et-popup-card-highlight">
                  <h4>
                    <Zap size={16} className="et-section-icon" />
                    {lang === "en"
                      ? "How can it help your business?"
                      : "كيف يمكن أن يساعدك؟"}
                  </h4>
                  <p>
                    {lang === "en"
                      ? selectedTool.help_en
                      : selectedTool.help_ar}
                  </p>
                </div>

                <a
                  href={selectedTool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="et-popup-action-btn"
                >
                  <span>
                    {lang === "en"
                      ? "Explore Tool Now"
                      : "استكشف هذه الأداة الآن"}
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ToolDashboardLayout>
  );
}
