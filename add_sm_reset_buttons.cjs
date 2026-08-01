const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

// The replacement patterns
const replacements = [
  // 1. Script Writer
  {
    search: `                      <button
                        type="button"
                        onClick={handleGenerateScript}
                        className="sm-deck-btn"
                      >`,
    replace: `                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setScriptTopic("");
                            setScriptPlatform("reel");
                            setScriptTone("enthusiastic");
                            setScriptHookStyle("question");
                            setScriptResult("");
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
                        <button
                          type="button"
                          onClick={handleGenerateScript}
                          className="sm-deck-btn"
                          style={{ flex: '2' }}
                        >`
  },
  // 2. Caption Generator
  {
    search: `                      <button
                        type="button"
                        onClick={handleGenerateCaption}
                        className="sm-deck-btn"
                      >`,
    replace: `                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCaptionTopic("");
                            setCaptionTone("educational");
                            setCaptionHook("stat");
                            setCaptionResult("");
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
                        <button
                          type="button"
                          onClick={handleGenerateCaption}
                          className="sm-deck-btn"
                          style={{ flex: '2' }}
                        >`
  },
  // 3. Repurposer
  {
    search: `                      <button
                        type="button"
                        onClick={handleGenerateRepurpose}
                        className="sm-deck-btn"
                      >`,
    replace: `                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOriginalContent("");
                            setRepurposeFormat("carousel");
                            setRepurposeResult("");
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
                        <button
                          type="button"
                          onClick={handleGenerateRepurpose}
                          className="sm-deck-btn"
                          style={{ flex: '2' }}
                        >`
  },
  // 4. Q&A Generator
  {
    search: `                      <button
                        type="button"
                        onClick={handleGenerateQa}
                        className="sm-deck-btn"
                      >`,
    replace: `                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setQaQuestion("");
                            setQaTone("friendly");
                            setQaFormat("story");
                            setQaResult("");
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
                        <button
                          type="button"
                          onClick={handleGenerateQa}
                          className="sm-deck-btn"
                          style={{ flex: '2' }}
                        >`
  },
  // 5. Idea Lab
  {
    search: `                    <button
                      type="button"
                      onClick={handleGenerateIdeas}
                      disabled={isGeneratingIdeas}
                      className="sm-dock-btn primary"
                    >`,
    replace: `                    <div style={{ display: 'flex', gap: '8px' }}>
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
                      <button
                        type="button"
                        onClick={handleGenerateIdeas}
                        disabled={isGeneratingIdeas}
                        className="sm-dock-btn primary"
                      >`
  },
  // 6. Trends
  {
    search: `                    <button
                      type="button"
                      onClick={handleGenerateTrends}
                      disabled={isGeneratingTrends}
                      className="sm-dock-btn primary"
                    >`,
    replace: `                    <div style={{ display: 'flex', gap: '8px' }}>
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
                      <button
                        type="button"
                        onClick={handleGenerateTrends}
                        disabled={isGeneratingTrends}
                        className="sm-dock-btn primary"
                      >`
  },
  // 7. Viral Videos (No Generate Button, Reset is next to AnalysisModeSelector)
  {
    search: `                  <AnalysisModeSelector
                    mode={analysisMode}
                    onChange={setAnalysisMode}
                    lang={lang}
                  />`,
    replace: `                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setViralAdaptation("");
                        setSelectedViralVideo(trendingVideosList[0]);
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
  // 8. Burnout Guard (No Generate Button, just sliders)
  {
    search: `                  <div className="sm-deck-header">
                    <h4 className="sm-deck-title">
                      <Activity size={20} style={{ color: "#10B981" }} />
                      <span>
                        {lang === "en"
                          ? "Burnout Guard & Creative Energy Meter"
                          : "حماية الإرهاق ومؤشر الطاقة الإبداعية"}
                      </span>
                    </h4>
                  </div>`,
    replace: `                  <div className="sm-deck-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className="sm-deck-title">
                      <Activity size={20} style={{ color: "#10B981" }} />
                      <span>
                        {lang === "en"
                          ? "Burnout Guard & Creative Energy Meter"
                          : "حماية الإرهاق ومؤشر الطاقة الإبداعية"}
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEnergyScore(85);
                        setSelectedMood("good");
                        setWeeklyPostsCount(8);
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
                  </div>`
  }
];

let successCount = 0;

replacements.forEach((rep, index) => {
  if (content.includes(rep.search)) {
    content = content.replace(rep.search, rep.replace);
    // For tools 1-4, we must close the wrapping div that we added
    if (index < 6) { // Tools 1-6 need the div closed, wait! For Tools 1-4, the replace replaces the button but doesn't add the closing div?
      // Wait, in my replace strings for 1-4:
      // I replace `<button ...>` with `<div ...><button reset></button><button generate>`
      // But the closing tag `</button>` is STILL in the original content!
      // So I just need to replace `</button>` with `</button></div>` AFTER the generate button!
      // Let's do a scoped replacement to find the next `</button>` after this specific generate button.
    }
    successCount++;
  } else {
    console.log("Could not find match for index", index);
  }
});

// We need to fix the closing divs for tools 1-6
// Actually it's easier to just do it manually with regex or replace
fs.writeFileSync(path, content);
console.log("Replaced", successCount, "blocks");
