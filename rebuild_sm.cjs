const fs = require('fs');
const jsxPath = 'src/pages/Tools/components/SocialMedia.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// 1. Add `isNewlyGenerated` state after `goalArchitect`
const stateSearch = `const [goalArchitect, setGoalArchitect] = useState("awareness");`;
const stateReplace = `const [goalArchitect, setGoalArchitect] = useState("awareness");\n  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);`;
if (jsx.includes(stateSearch) && !jsx.includes('isNewlyGenerated')) {
    jsx = jsx.replace(stateSearch, stateReplace);
}

// 2. Inject persistence logic right before `const subTools = [`
const persistenceBlock = `
  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('social-media-studio');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        setIsNewlyGenerated(false); // Force bypass typing on load
        
        // Force all loading states to false
        setIsGeneratingArchitect(false);
        setIsGeneratingModal(false);
        setIsGeneratingScript(false);
        setIsGeneratingCaption(false);
        setIsGeneratingRepurpose(false);
        setIsGeneratingQa(false);
        setIsGeneratingIdeas(false);
        setIsGeneratingTrends(false);
        setIsGeneratingAdaptation(false);

        // Hydrate all other states
        if (cached.activeTab !== undefined) setActiveTab(cached.activeTab);
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.platformArchitect !== undefined) setPlatformArchitect(cached.platformArchitect);
        if (cached.goalArchitect !== undefined) setGoalArchitect(cached.goalArchitect);
        if (cached.resultArchitect !== undefined) setResultArchitect(cached.resultArchitect);
        
        if (cached.activeSubTool !== undefined) setActiveSubTool(cached.activeSubTool);
        if (cached.scriptTopic !== undefined) setScriptTopic(cached.scriptTopic);
        if (cached.scriptPlatform !== undefined) setScriptPlatform(cached.scriptPlatform);
        if (cached.scriptTone !== undefined) setScriptTone(cached.scriptTone);
        if (cached.scriptHookStyle !== undefined) setScriptHookStyle(cached.scriptHookStyle);
        if (cached.scriptResult !== undefined) setScriptResult(cached.scriptResult);
        
        if (cached.captionTopic !== undefined) setCaptionTopic(cached.captionTopic);
        if (cached.captionTone !== undefined) setCaptionTone(cached.captionTone);
        if (cached.captionHook !== undefined) setCaptionHook(cached.captionHook);
        if (cached.captionResult !== undefined) setCaptionResult(cached.captionResult);
        
        if (cached.originalContent !== undefined) setOriginalContent(cached.originalContent);
        if (cached.repurposeFormat !== undefined) setRepurposeFormat(cached.repurposeFormat);
        if (cached.repurposeResult !== undefined) setRepurposeResult(cached.repurposeResult);
        
        if (cached.qaQuestion !== undefined) setQaQuestion(cached.qaQuestion);
        if (cached.qaTone !== undefined) setQaTone(cached.qaTone);
        if (cached.qaFormat !== undefined) setQaFormat(cached.qaFormat);
        if (cached.qaResult !== undefined) setQaResult(cached.qaResult);
        
        if (cached.ideasResult !== undefined) setIdeasResult(cached.ideasResult);
        if (cached.viralAdaptation !== undefined) setViralAdaptation(cached.viralAdaptation);
        
        if (cached.energyScore !== undefined) setEnergyScore(cached.energyScore);
        if (cached.selectedMood !== undefined) setSelectedMood(cached.selectedMood);
        if (cached.weeklyPostsCount !== undefined) setWeeklyPostsCount(cached.weeklyPostsCount);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({
      activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
      activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
      captionTopic, captionTone, captionHook, captionResult,
      originalContent, repurposeFormat, repurposeResult,
      qaQuestion, qaTone, qaFormat, qaResult,
      ideasResult, viralAdaptation,
      energyScore, selectedMood, weeklyPostsCount
    });
  }, [
    isLoadedFromCloud, activeTab, analysisMode, platformArchitect, goalArchitect, resultArchitect,
    activeSubTool, scriptTopic, scriptPlatform, scriptTone, scriptHookStyle, scriptResult,
    captionTopic, captionTone, captionHook, captionResult,
    originalContent, repurposeFormat, repurposeResult,
    qaQuestion, qaTone, qaFormat, qaResult,
    ideasResult, viralAdaptation,
    energyScore, selectedMood, weeklyPostsCount
  ]);

  const handleResetSession = () => {
    setActiveTab("architect");
    setAnalysisMode("fast");
    setPlatformArchitect("instagram");
    setGoalArchitect("awareness");
    setResultArchitect("");
    
    setScriptTopic("");
    setScriptResult("");
    setCaptionTopic("");
    setCaptionResult("");
    setOriginalContent("");
    setRepurposeResult("");
    setQaQuestion("");
    setQaResult("");
    
    setEnergyScore(85);
    setSelectedMood("good");
    setWeeklyPostsCount(8);
    
    setIsGeneratingArchitect(false);
    setIsGeneratingScript(false);
    setIsGeneratingCaption(false);
    setIsGeneratingRepurpose(false);
    setIsGeneratingQa(false);
    
    saveResult(null);
  };
  // -------------------------------------

  const subTools = [`;

if (!jsx.includes('useToolCache(\'social-media-studio\')')) {
    jsx = jsx.replace('  const subTools = [', persistenceBlock);
}

// Ensure useToolCache is imported
if (!jsx.includes('import useToolCache')) {
    jsx = jsx.replace('import React, { useState, useEffect, useRef } from "react";', 'import React, { useState, useEffect, useRef } from "react";\nimport useToolCache from "../../../hooks/useToolCache";');
}
// Ensure RefreshCw is imported from lucide-react
if (!jsx.includes('RefreshCw')) {
    jsx = jsx.replace('Sparkle as SparkleIcon,\n} from "lucide-react";', 'Sparkle as SparkleIcon,\n  RefreshCw\n} from "lucide-react";');
}

// 3. Inject setIsNewlyGenerated(true) into all generating handlers
jsx = jsx.replace(/setIsGenerating([a-zA-Z]+)\(true\);/g, 'setIsGenerating$1(true);\n    setIsNewlyGenerated(true);');

// 4. Modify TypewriterText definition to accept bypass
jsx = jsx.replace(/function TypewriterText\(\{ text, speed = 12 \}\) \{/g, 'function TypewriterText({ text, speed = 12, bypass = false }) {');
jsx = jsx.replace(/if \(hasStreamedRef\.current\) \{\s*setDisplayedText\(text\);\s*return;\s*\}/g, 'if (hasStreamedRef.current || bypass) {\n      setDisplayedText(text);\n      hasStreamedRef.current = true;\n      return;\n    }');
jsx = jsx.replace(/  \}, \[text, speed\]\);/g, '  }, [text, speed, bypass]);');

// 5. Update TypewriterText calls to bypass
jsx = jsx.replace(/<TypewriterText text=\{([^}]+)\}\s*speed=\{([0-9]+)\}\s*\/>/g, '<TypewriterText text={$1} speed={$2} bypass={!isNewlyGenerated} />');

// 6. Inject Reset button into ToolDashboardLayout
const resetSearch = `bottomSections={bottomSections}
    >
      <div className="sm-container"`;

const resetReplace = `bottomSections={bottomSections}
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
          >
            <RefreshCw size={14} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Start Fresh' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>
      <div className="sm-container"`;

if (!jsx.includes('Reset / Start Fresh') && jsx.includes(resetSearch)) {
    jsx = jsx.replace(resetSearch, resetReplace);
}

fs.writeFileSync(jsxPath, jsx);

// Ensure CSS wrappers have max-height and custom scrollbars (this actually stuck from earlier but ensuring it's robust)
const cssPath = 'src/pages/Tools/components/SocialMedia.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('max-height: 500px !important;')) {
    css = css.replace('.sm-showcase-content {\n    background:', '.sm-showcase-content {\n    max-height: 500px !important;\n    overflow-y: auto !important;\n    background:');
    css += `
/* Custom scrollbar for containers */
.sm-showcase-content::-webkit-scrollbar,
.sm-modal-output-scroll::-webkit-scrollbar {
  width: 8px;
}
.sm-showcase-content::-webkit-scrollbar-track,
.sm-modal-output-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 10px;
}
.sm-showcase-content::-webkit-scrollbar-thumb,
.sm-modal-output-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 10px;
}
.sm-showcase-content::-webkit-scrollbar-thumb:hover,
.sm-modal-output-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
`;
    fs.writeFileSync(cssPath, css);
}

console.log("Completely rebuilt SocialMedia persistence and Typewriter logic!");
