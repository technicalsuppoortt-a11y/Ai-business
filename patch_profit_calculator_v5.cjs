const fs = require('fs');

const path = 'src/pages/Tools/components/ProfitCalculator.jsx';
let code = fs.readFileSync(path, 'utf8').replace(/\r/g, '');

// 1. handleAnalyze live success - add setIsNewlyGenerated(true) and saveResult
let searchLiveDaily = `        setAiInsights(liveResult);
        dispatch({`;
let replaceLiveDaily = `        setAiInsights(liveResult);
        setIsNewlyGenerated(true);
        saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights: liveResult, aiInsightsMode: "live", monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
        dispatch({`;
code = code.replace(searchLiveDaily, replaceLiveDaily);

// 2. handleAnalyze fast success
let searchFastDaily = `          setAiInsights(text);
          dispatch({`;
let replaceFastDaily = `          setAiInsights(text);
          setIsNewlyGenerated(true);
          saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights: text, aiInsightsMode: "fast", monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult, openAccordions });
          dispatch({`;
code = code.replace(searchFastDaily, replaceFastDaily);

// 3. handleGenerateMonthlyPlan live success
let searchMonthlyLive = `        setMonthlyPlanResult(planObj);
        dispatch({`;
let replaceMonthlyLive = `        setMonthlyPlanResult(planObj);
        setIsNewlyGenerated(true);
        saveResult({ activeMode, analysisMode, salePrice, productCost, dailyBudget, cpc, cvr, aiInsights, aiInsightsMode, monthlyBudget, targetMonthlyProfit, customNotes, monthlyPlanResult: planObj, openAccordions });
        dispatch({`;
code = code.replace(searchMonthlyLive, replaceMonthlyLive);

// 4. handleGenerateMonthlyPlan fast success (because replace replaces the first instance)
code = code.replace(searchMonthlyLive, replaceMonthlyLive);

// 5. Typewriter conditions (daily)
let searchDailyType = `{aiInsightsMode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText text={aiInsights} speed={10} />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {aiInsights.split("\\n").map((line, i) => (`;
let replaceDailyType = `{aiInsightsMode === "live" && isNewlyGenerated ? (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        <TypewriterText text={aiInsights} speed={10} />
                      </div>
                    ) : (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        {aiInsights.split("\\n").map((line, i) => (`;
code = code.replace(searchDailyType, replaceDailyType);

// 6. Typewriter conditions (monthly)
let searchMonthlyType = `{monthlyPlanResult.mode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText
                          text={monthlyPlanResult.aiStrategy}
                          speed={10}
                        />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {monthlyPlanResult.aiStrategy`;
let replaceMonthlyType = `{monthlyPlanResult.mode === "live" && isNewlyGenerated ? (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        <TypewriterText
                          text={monthlyPlanResult.aiStrategy}
                          speed={10}
                        />
                      </div>
                    ) : (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        {monthlyPlanResult.aiStrategy`;
code = code.replace(searchMonthlyType, replaceMonthlyType);

// 7. Skeleton Loading
let searchAnimate = `          {/* AI Outputs Panel Expansion (Typewriter streaming ONLY when mode === 'live') */}
          <AnimatePresence>
            {(aiInsights || monthlyPlanResult) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                style={{ overflow: "hidden" }}
              >
                {activeMode === "daily" && aiInsights && (`;
let replaceAnimate = `          {/* AI Outputs Panel Expansion (Typewriter streaming ONLY when mode === 'live') */}
          <AnimatePresence>
            {(aiInsights || monthlyPlanResult || isGenerating || isGeneratingMonthly) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                style={{ overflow: "hidden" }}
              >
                {isGenerating || isGeneratingMonthly ? (
                  <div className={\`pcc-insights-stage \${isGeneratingMonthly ? 'green' : ''}\`} style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: "24px", height: "24px", borderRadius: "50%", background: isGeneratingMonthly ? "rgba(52, 211, 153, 0.2)" : "rgba(96, 165, 250, 0.2)" }} />
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }} style={{ width: "120px", height: "16px", borderRadius: "4px", background: isGeneratingMonthly ? "rgba(52, 211, 153, 0.1)" : "rgba(96, 165, 250, 0.1)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: "100%", height: "12px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)" }} />
                      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} style={{ width: "95%", height: "12px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)" }} />
                      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: "85%", height: "12px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)" }} />
                      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} style={{ width: "90%", height: "12px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.05)" }} />
                    </div>
                  </div>
                ) : (
                  <>
                {activeMode === "daily" && aiInsights && (`;
code = code.replace(searchAnimate, replaceAnimate);

let searchAnimateEnd = `                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Accordions */}`;
let replaceAnimateEnd = `                    )}
                  </div>
                )}
                </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Accordions */}`;
code = code.replace(searchAnimateEnd, replaceAnimateEnd);

fs.writeFileSync(path, code);
console.log('Patch V5 applied!');
