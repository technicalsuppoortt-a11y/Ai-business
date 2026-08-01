const fs = require('fs');

const path = 'src/pages/Tools/components/ProfitCalculator.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add hook import
if (!code.includes('import useToolCache')) {
  code = code.replace(
    `import React, { useState, useEffect, useRef } from "react";`,
    `import React, { useState, useEffect, useRef } from "react";\nimport useToolCache from "../../../hooks/useToolCache";`
  );
}

// 2. State & Hooks Injection
const targetState = `const [openAccordions, setOpenAccordions] = useState({ 0: true, 1: false });`;
const hookInjection = `const [openAccordions, setOpenAccordions] = useState({ 0: true, 1: false });
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('profit-calculator');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.activeMode) setActiveMode(cached.activeMode);
        if (cached.analysisMode) setAnalysisMode(cached.analysisMode);
        if (cached.salePrice !== undefined) setSalePrice(cached.salePrice);
        if (cached.productCost !== undefined) setProductCost(cached.productCost);
        if (cached.dailyBudget !== undefined) setDailyBudget(cached.dailyBudget);
        if (cached.cpc !== undefined) setCpc(cached.cpc);
        if (cached.cvr !== undefined) setCvr(cached.cvr);
        if (cached.aiInsights) setAiInsights(cached.aiInsights);
        if (cached.aiInsightsMode) setAiInsightsMode(cached.aiInsightsMode);
        if (cached.monthlyBudget !== undefined) setMonthlyBudget(cached.monthlyBudget);
        if (cached.targetMonthlyProfit !== undefined) setTargetMonthlyProfit(cached.targetMonthlyProfit);
        if (cached.customNotes) setCustomNotes(cached.customNotes);
        if (cached.monthlyPlanResult) setMonthlyPlanResult(cached.monthlyPlanResult);
        if (cached.openAccordions) setOpenAccordions(cached.openAccordions);
        setIsNewlyGenerated(false);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions]);
`;
if (!code.includes('useToolCache(')) {
  code = code.replace(targetState, hookInjection);
}

// 3. handleAnalyze explicit save Result injection
// liveMode success
code = code.replace(
  `          setAiInsights(liveResult);
          dispatch({`,
  `          setAiInsights(liveResult);
          setIsNewlyGenerated(true);
          saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights: liveResult, aiInsightsMode: "live", monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
          dispatch({`
);

// fast mode success
code = code.replace(
  `          setAiInsights(insightsText);
          dispatch({`,
  `          setAiInsights(insightsText);
          setIsNewlyGenerated(true);
          saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights: insightsText, aiInsightsMode: "fast", monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
          dispatch({`
);

// 4. handleGenerateMonthlyPlan explicit save
// liveMode success
code = code.replace(
  `          setMonthlyPlanResult(planObj);
          dispatch({
            type: "SAVE_TOOL_RESULT",
            toolId: "profit-calculator-monthly",`,
  `          setMonthlyPlanResult(planObj);
          setIsNewlyGenerated(true);
          saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult: planObj, openAccordions });
          dispatch({
            type: "SAVE_TOOL_RESULT",
            toolId: "profit-calculator-monthly",`
);

// fast mode success
code = code.replace(
  `          setMonthlyPlanResult(planObj);
          dispatch({
            type: "SAVE_TOOL_RESULT",
            toolId: "profit-calculator-monthly",`, // Wait this replace could hit the first one again if not careful! Actually I'll use regex or target it explicitly.
  `          setMonthlyPlanResult(planObj);
          setIsNewlyGenerated(true);
          saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult: planObj, openAccordions });
          dispatch({
            type: "SAVE_TOOL_RESULT",
            toolId: "profit-calculator-monthly",`
); // Note: replace() only replaces the FIRST occurrence. So running it twice will replace both.

// 5. CSS & Typewriter Condition Injection
const styleTarget = `<div className="pcc-container">`;
const styleReplacement = `<style>{\`
  .pcc-insights-body-scroll {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 8px;
  }
  .pcc-insights-body-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .pcc-insights-body-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
  .pcc-insights-body-scroll::-webkit-scrollbar-thumb {
    background: #6366F1;
    border-radius: 8px;
  }
\`}</style>
        <div className="pcc-container">`;
if (!code.includes('pcc-insights-body-scroll')) {
  code = code.replace(styleTarget, styleReplacement);
}

// 6. UI Update for TypewriterText and custom scroll
// First for aiInsights
code = code.replace(
  `{aiInsightsMode === "live" ? (
                        <div className="pcc-insights-body">
                          <TypewriterText text={aiInsights} speed={10} />
                        </div>
                      ) : (
                        <div className="pcc-insights-body">`,
  `{aiInsightsMode === "live" && isNewlyGenerated ? (
                        <div className="pcc-insights-body pcc-insights-body-scroll">
                          <TypewriterText text={aiInsights} speed={10} />
                        </div>
                      ) : (
                        <div className="pcc-insights-body pcc-insights-body-scroll">`
);

// Second for monthlyPlanResult
code = code.replace(
  `{monthlyPlanResult.mode === "live" ? (
                        <div className="pcc-insights-body">
                          <TypewriterText
                            text={monthlyPlanResult.aiStrategy}
                            speed={10}
                          />
                        </div>
                      ) : (
                        <div className="pcc-insights-body">`,
  `{monthlyPlanResult.mode === "live" && isNewlyGenerated ? (
                        <div className="pcc-insights-body pcc-insights-body-scroll">
                          <TypewriterText
                            text={monthlyPlanResult.aiStrategy}
                            speed={10}
                          />
                        </div>
                      ) : (
                        <div className="pcc-insights-body pcc-insights-body-scroll">`
);

fs.writeFileSync(path, code);
console.log('Successfully patched ProfitCalculator!');
