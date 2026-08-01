const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const regexes = [
  // 1. Script Writer
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateScript\}\s+className="sm-deck-btn"\s*>\s*<Wand2[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setScriptTopic("");
                          setScriptPlatform("reel");
                          setScriptTone("enthusiastic");
                          setScriptHookStyle("question");
                          setScriptResult("");
                          saveResult(null);
                        }}
                        className="sm-deck-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none',
                          flex: '1'
                        }}
                      >
                        <RotateCcw size={18} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 2. Caption Generator
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateCaption\}\s+className="sm-deck-btn"\s*>\s*<Sparkles[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCaptionTopic("");
                          setCaptionTone("educational");
                          setCaptionHook("stat");
                          setCaptionResult("");
                          saveResult(null);
                        }}
                        className="sm-deck-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none',
                          flex: '1'
                        }}
                      >
                        <RotateCcw size={18} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 3. Repurposer
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateRepurpose\}\s+className="sm-deck-btn"\s*>\s*<Repeat[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOriginalContent("");
                          setRepurposeFormat("carousel");
                          setRepurposeResult("");
                          saveResult(null);
                        }}
                        className="sm-deck-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none',
                          flex: '1'
                        }}
                      >
                        <RotateCcw size={18} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 4. Q&A Generator
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateQa\}\s+className="sm-deck-btn"\s*>\s*<Send[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setQaQuestion("");
                          setQaTone("friendly");
                          setQaFormat("story");
                          setQaResult("");
                          saveResult(null);
                        }}
                        className="sm-deck-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none',
                          flex: '1'
                        }}
                      >
                        <RotateCcw size={18} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 5. Idea Lab
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateIdeas\}\s+disabled=\{isGeneratingIdeas\}\s+className="sm-dock-btn primary"\s*>\s*<Sparkles[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedIdeas([]);
                          setIdeasResult(
                            lang === "en"
                              ? [
                                  {
                                    id: 1,
                                    text: \`How to start a \${nicheField} business from scratch in 2026\`,
                                    tag: "Educational",
                                    type: "Carousel",
                                  },
                                  {
                                    id: 2,
                                    text: \`5 Fatal mistakes destroying your ad profit and how to solve them\`,
                                    tag: "Viral",
                                    type: "Short Reel",
                                  },
                                  {
                                    id: 3,
                                    text: \`Behind the scenes of managing and scaling live ad campaigns\`,
                                    tag: "Story",
                                    type: "Behind Scenes",
                                  },
                                ]
                              : [
                                  {
                                    id: 1,
                                    text: \`كيف تبدأ بيزنس \${nicheField} من الصفر في 2026\`,
                                    tag: "تعليمي",
                                    type: "كاروسيل",
                                  },
                                  {
                                    id: 2,
                                    text: \`5 أخطاء قاتلة تدمر أرباح إعلاناتك وكيف تحلها\`,
                                    tag: "فيرال",
                                    type: "ريل قصير",
                                  },
                                  {
                                    id: 3,
                                    text: \`كواليس إدارة وتوسيع حملات إعلانية شغالة حالياً\`,
                                    tag: "قصة",
                                    type: "كواليس",
                                  },
                                ]
                          );
                          saveResult(null);
                        }}
                        className="sm-dock-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none'
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 6. Trends
  {
    find: /<button\s+type="button"\s+onClick=\{handleGenerateTrends\}\s+disabled=\{isGeneratingTrends\}\s+className="sm-dock-btn primary"\s*>\s*<Sparkles[\s\S]*?<\/button>/,
    replace: `<div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTrendingHashtags([
                            {
                              tag: "#ترند_توضيحي",
                              category: "hot",
                              label: "نار نار",
                              growth: "+340%",
                            },
                            {
                              tag: "#ترند_صاعد",
                              category: "rising",
                              label: "صاعد بقوة",
                              growth: "+180%",
                            },
                          ]);
                          setTrendingAudios([
                            {
                              title: "Cyber Pulse Ambient Beat",
                              creator: "Trend Beats",
                              uses: "45.2K",
                            },
                          ]);
                          saveResult(null);
                        }}
                        className="sm-dock-btn"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          boxShadow: 'none'
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                      </button>
                      $$&
                    </div>`
  },
  // 7. Viral Videos
  {
    find: /<AnalysisModeSelector[\s\S]*?\/>/,
    replace: `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    $$&
                    <button
                      type="button"
                      onClick={() => {
                        setViralAdaptation("");
                        setSelectedViralVideo(trendingVideosList[0]);
                        saveResult(null);
                      }}
                      className="sm-dock-btn"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: 'none',
                        height: 'fit-content'
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                    </button>
                  </div>`
  },
  // 8. Burnout Guard
  {
    find: /<div className="sm-deck-header">\s*<h4 className="sm-deck-title">[\s\S]*?<\/h4>\s*<\/div>/,
    replace: (match) => {
      // Reconstruct with flex layout
      return match.replace(
        '<div className="sm-deck-header">',
        '<div className="sm-deck-header" style={{ display: \'flex\', justifyContent: \'space-between\', alignItems: \'center\' }}>'
      ).replace(
        '</h4>',
        `</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEnergyScore(85);
                        setSelectedMood("good");
                        setWeeklyPostsCount(8);
                        saveResult(null);
                      }}
                      className="sm-dock-btn"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: 'none',
                        height: 'fit-content'
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>{lang === 'en' ? 'Reset' : 'إعادة ضبط'}</span>
                    </button>`
      );
    }
  }
];

let successCount = 0;
regexes.forEach((r, i) => {
  if (r.find.test(content)) {
    if (typeof r.replace === 'function') {
      content = content.replace(r.find, r.replace);
    } else {
      content = content.replace(r.find, (match) => {
        return r.replace.replace('$$&', match);
      });
    }
    successCount++;
  } else {
    console.log("Failed to match regex", i + 1);
  }
});

fs.writeFileSync(path, content);
console.log("Replaced", successCount, "blocks");
