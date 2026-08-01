const fs = require('fs');

// 1. Patch MarketingPlan.jsx
const jsxPath = 'src/pages/Tools/components/MarketingPlan.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// a. Fix Hydration & Save payload
const hydrationSearch = `  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.budget !== undefined) setBudget(cached.budget);
        if (cached.duration !== undefined) setDuration(cached.duration);
        if (cached.goal !== undefined) setGoal(cached.goal);
        if (cached.clientLevel !== undefined) setClientLevel(cached.clientLevel);
        if (cached.isGenerating !== undefined) setIsGenerating(cached.isGenerating);
        if (cached.result !== undefined) setResult(cached.result);
        if (cached.currentStep !== undefined) setCurrentStep(cached.currentStep);
        if (cached.loadingBadgeIndex !== undefined) setLoadingBadgeIndex(cached.loadingBadgeIndex);
        if (cached.activeStrategyTab !== undefined) setActiveStrategyTab(cached.activeStrategyTab);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ analysisMode, budget, duration, goal, clientLevel, isGenerating, result, currentStep, loadingBadgeIndex, activeStrategyTab });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, budget, duration, goal, clientLevel, isGenerating, result, currentStep, loadingBadgeIndex, activeStrategyTab]);`;

const hydrationReplace = `  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.budget !== undefined) setBudget(cached.budget);
        if (cached.duration !== undefined) setDuration(cached.duration);
        if (cached.goal !== undefined) setGoal(cached.goal);
        if (cached.clientLevel !== undefined) setClientLevel(cached.clientLevel);
        if (cached.result !== undefined) setResult(cached.result);
        if (cached.currentStep !== undefined) setCurrentStep(cached.currentStep);
        if (cached.activeStrategyTab !== undefined) setActiveStrategyTab(cached.activeStrategyTab);
        
        setIsGenerating(false);
        setLoadingBadgeIndex(0);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({ analysisMode, budget, duration, goal, clientLevel, result, currentStep, activeStrategyTab });
  }, [isLoadedFromCloud, analysisMode, budget, duration, goal, clientLevel, result, currentStep, activeStrategyTab]);`;

if (jsx.includes(hydrationSearch)) {
    jsx = jsx.replace(hydrationSearch, hydrationReplace);
}

// b. Wrap Output Container
const stageRegex = /(<motion\.div\s+key="strategy-stage"[^>]*?)(\s*initial)/s;
if (stageRegex.test(jsx)) {
    // We add a wrapper around it, or just add the class to it.
    // wait, if I just add the class to motion.div, it works better.
    // Let's find its className.
    const classNameRegex = /(<motion\.div\s+key="strategy-stage"[^>]*?className="mp-strategy-stage")([^>]*?>)/s;
    if (classNameRegex.test(jsx)) {
        jsx = jsx.replace(classNameRegex, '$1 mp-custom-scroll" style={{ maxHeight: \'600px\', overflowY: \'auto\' }}$2');
    } else {
        // if className is not there, we just add it before initial
        jsx = jsx.replace(stageRegex, '$1 className="mp-custom-scroll" style={{ maxHeight: \'600px\', overflowY: \'auto\' }}$2');
    }
}

fs.writeFileSync(jsxPath, jsx);

// 2. Patch MarketingPlan.css
const cssPath = 'src/pages/Tools/components/MarketingPlan.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.mp-custom-scroll')) {
    css += `
/* Custom Scrollbar */
.mp-custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.mp-custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 10px;
}
.mp-custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 10px;
}
.mp-custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
`;
    fs.writeFileSync(cssPath, css);
}

console.log("Patched MarketingPlan.jsx & css!");
