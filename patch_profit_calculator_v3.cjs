const fs = require('fs');

const path = 'src/pages/Tools/components/ProfitCalculator.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. handleAnalyze live success
code = code.replace(
  `        setAiInsights(liveResult);\n        dispatch({`,
  `        setAiInsights(liveResult);\n        setIsNewlyGenerated(true);\n        dispatch({`
);

// 2. handleAnalyze fast success
code = code.replace(
  `          setAiInsights(text);\n          dispatch({`,
  `          setAiInsights(text);\n          setIsNewlyGenerated(true);\n          dispatch({`
);

// 3. handleGenerateMonthlyPlan live success
code = code.replace(
  `        setMonthlyPlanResult(planObj);\n        dispatch({`,
  `        setMonthlyPlanResult(planObj);\n        setIsNewlyGenerated(true);\n        dispatch({`
);

// 4. handleGenerateMonthlyPlan fast success
// (Because replace only does the FIRST occurrence, we can just run it again to catch the second one, or use a global regex)
code = code.replace(
  /        setMonthlyPlanResult\(planObj\);\n        dispatch\(\{/g,
  `        setMonthlyPlanResult(planObj);\n        setIsNewlyGenerated(true);\n        dispatch({`
);


// 5. CSS custom scrollbar injection
code = code.replace(
  `      <div className="pcc-3d-canvas" dir={isRtl ? "rtl" : "ltr"}>`,
  `      <style>{\`
        .pcc-custom-scroll {
          max-height: 500px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .pcc-custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .pcc-custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .pcc-custom-scroll::-webkit-scrollbar-thumb {
          background: #6366F1;
          border-radius: 8px;
        }
      \`}</style>
      <div className="pcc-3d-canvas" dir={isRtl ? "rtl" : "ltr"}>`
);

// 6. Typewriter conditionals
code = code.replace(
  `{aiInsightsMode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText text={aiInsights} speed={10} />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {aiInsights.split("\\n").map((line, i) => (`,
  `{aiInsightsMode === "live" && isNewlyGenerated ? (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        <TypewriterText text={aiInsights} speed={10} />
                      </div>
                    ) : (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        {aiInsights.split("\\n").map((line, i) => (`
);

code = code.replace(
  `{monthlyPlanResult.mode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText
                          text={monthlyPlanResult.aiStrategy}
                          speed={10}
                        />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {monthlyPlanResult.aiStrategy`,
  `{monthlyPlanResult.mode === "live" && isNewlyGenerated ? (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        <TypewriterText
                          text={monthlyPlanResult.aiStrategy}
                          speed={10}
                        />
                      </div>
                    ) : (
                      <div className="pcc-insights-body pcc-custom-scroll">
                        {monthlyPlanResult.aiStrategy`
);

// 7. Skeleton loading
code = code.replace(
  `          {/* AI Outputs Panel Expansion (Typewriter streaming ONLY when mode === 'live') */}
          <AnimatePresence>
            {(aiInsights || monthlyPlanResult) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                style={{ overflow: "hidden" }}
              >
                {activeMode === "daily" && aiInsights && (`,
  `          {/* AI Outputs Panel Expansion (Typewriter streaming ONLY when mode === 'live') */}
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
                {activeMode === "daily" && aiInsights && (`
);

// We need to close the empty fragment we opened for the skeleton loader.
// The easiest way is to find the end of the AnimatePresence block that wraps the outputs.
// The block ends right before {/* Drawer Accordions */}
code = code.replace(
  `                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Accordions */}`,
  `                    )}
                  </div>
                )}
                </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Accordions */}`
);

fs.writeFileSync(path, code);
console.log('Patch V3 Applied!');
