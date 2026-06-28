import React from 'react';
import './PlatformExplanation.css';

const PlatformExplanation = ({ videoUrl, title, lang = 'ar' }) => {
    const sections = [
        {
            id: 'analysis',
            icon: '🎯',
            title_ar: 'التحليل والهوية',
            title_en: 'Analysis & Identity',
            desc_ar: 'نقطة الانطلاق. نساعدك في اكتشاف النيش المربح، اختيار اسم براند جذاب، وبناء هوية بصرية كاملة تميزك في السوق.',
            desc_en: 'The starting point. We help you discover a profitable niche, choose a catchy brand name, and build a full visual identity.',
            tools_ar: ['اختيار النيش', 'اسم البراند', 'الهوية البصرية'],
            tools_en: ['Niche Selection', 'Brand Naming', 'Visual Identity']
        },
        {
            id: 'setup',
            icon: '💻',
            title_ar: 'بناء وتجهيز المتجر',
            title_en: 'Store Setup',
            desc_ar: 'نحول أفكارك لواقع. نوفر لك أدوات بناء الموقع، المحتوى التسويقي، الصفحات القانونية، وربط كافة الأنظمة التقنية (بكسل، إيميل) ليكون جاهزاً للبيع.',
            desc_en: 'Turning ideas into reality. We provide website building tools, marketing content, legal pages, and technical integrations (Pixel, Email).',
            tools_ar: ['بناء الموقع', 'محتوى الصفحات', 'أتمتة الإيميل'],
            tools_en: ['Website Building', 'Page Content', 'Email Automation']
        },
        {
            id: 'marketing',
            icon: '📣',
            title_ar: 'المحتوى والتسويق',
            title_en: 'Content & Marketing',
            desc_ar: 'هنا يبدأ النمو الحقيقي. نولد لك أفكار إعلانية إبداعية، خطط تسويق استراتيجية، ومحتوى لمنصات السوشيال ميديا يضمن لك أعلى معدل تحويل.',
            desc_en: 'Where real growth starts. We generate creative ad ideas, strategic marketing plans, and social media content to ensure high conversion.',
            tools_ar: ['أفكار الإعلانات', 'خطة التسويق', 'مصنع المحتوى'],
            tools_en: ['Ad Creative', 'Marketing Plan', 'Content Factory']
        },
        {
            id: 'ops',
            icon: '🤖',
            title_ar: 'الإدارة والتشغيل الذكي',
            title_en: 'Smart Ops & Scaling',
            desc_ar: 'تحكم بمنصتك بذكاء. مساعدك الذكي متاح دائماً، بالإضافة لرادار المنصات وحاسبات الربحية لإدارة الأرقام بدقة واحترافية.',
            desc_en: 'Manage your platform smartly. Your AI assistant is always available, along with platform radar and profit calculators.',
            tools_ar: ['المساعد الذكي', 'حاسبة الأرباح', 'رادار المنصات'],
            tools_en: ['AI Assistant', 'Profit Calculator', 'Platform Radar']
        }
    ];

    return (
        <section className="platform-explanation-section animate-up">
            <div className="pe-container">
                <div className="pe-header">
                    <div className="pe-badge">{lang === 'ar' ? 'رحلة النجاح' : 'Success Journey'}</div>
                    <h2 className="pe-title">{title}</h2>
                    <div className="pe-line"></div>
                </div>

                <div className="pe-video-container">
                    <div className="pe-video-wrapper">
                        <video
                            src={videoUrl}
                            controls
                            className="pe-video-player"
                        />
                    </div>
                    <div className="pe-video-glow"></div>
                </div>

                <div className="pe-content">
                    <div className="pe-grid">
                        {sections.map((section) => (
                            <div key={section.id} className="pe-card">
                                <div className="pe-card-icon">{section.icon}</div>
                                <h3 className="pe-card-title">{lang === 'ar' ? section.title_ar : section.title_en}</h3>
                                <p className="pe-card-desc">{lang === 'ar' ? section.desc_ar : section.desc_en}</p>
                                <div className="pe-card-tags">
                                    {(lang === 'ar' ? section.tools_ar : section.tools_en).map((tool, i) => (
                                        <span key={i} className="pe-tag">{tool}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pe-footer">
                    <div className="pe-footer-card">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
                        <h4>{lang === 'ar' ? 'جاهز للانطلاق؟' : 'Ready to Launch?'}</h4>
                        <p>{lang === 'ar' ? 'كل الأدوات التي تحتاجها لتبدأ مشروعك كترند حقيقي موجودة هنا في مكان واحد.' : 'All the tools you need to start your project as a real trend are here in one place.'}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlatformExplanation;
