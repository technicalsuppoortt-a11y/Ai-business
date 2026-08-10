const fs = require('fs');

const profitCalcFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProfitCalculator.jsx';
let profitContent = fs.readFileSync(profitCalcFile, 'utf8');

// Replace all instances of isNewlyGenerated with isLiveGenerating
profitContent = profitContent.replace(/isNewlyGenerated/g, 'isLiveGenerating');

// Move setIsLiveGenerating(true) to right before dispatchLiveAiAnalysis in daily mode
profitContent = profitContent.replace(
  /const liveResult = await dispatchLiveAiAnalysis\(\{ uid: userData\?\.uid \|\| state\?\.user\?\.uid, \n          toolId: "profit-calculator",\n          costKey: "costDailyFunnel",/g,
  `setIsLiveGenerating(true);\n        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, \n          toolId: "profit-calculator",\n          costKey: "costDailyFunnel",`
);

// Ensure we don't have it twice (remove it from after)
profitContent = profitContent.replace(
  /        setAiInsights\(liveResult\);\n        setIsLiveGenerating\(true\);/g,
  `        setAiInsights(liveResult);`
);

// Move setIsLiveGenerating(true) to right before dispatchLiveAiAnalysis in monthly mode
profitContent = profitContent.replace(
  /const liveResult = await dispatchLiveAiAnalysis\(\{ uid: userData\?\.uid \|\| state\?\.user\?\.uid, \n          toolId: "profit-calculator-monthly",\n          costKey: "costMonthlyGoalPlanner",/g,
  `setIsLiveGenerating(true);\n        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, \n          toolId: "profit-calculator-monthly",\n          costKey: "costMonthlyGoalPlanner",`
);

// Remove it from after in monthly mode
profitContent = profitContent.replace(
  /        setMonthlyPlanResult\(planObj\);\n        setIsLiveGenerating\(true\);/g,
  `        setMonthlyPlanResult(planObj);`
);

// Also set it to false in finally block in handleAnalyze
profitContent = profitContent.replace(
  /    \} finally \{\n      setIsGenerating\(false\);\n    \}/g,
  `    } finally {\n      setIsGenerating(false);\n      setIsLiveGenerating(false);\n    }`
);

// Also set it to false in finally block in handleMonthlyAnalyze
profitContent = profitContent.replace(
  /    \} finally \{\n      setIsGeneratingMonthly\(false\);\n    \}/g,
  `    } finally {\n      setIsGeneratingMonthly(false);\n      setIsLiveGenerating(false);\n    }`
);


// Wait, if I set setIsLiveGenerating(false) in finally, then the TypewriterText will NOT be rendered because it's false!
// Let me REVERT the finally block addition. I will NOT add it to finally.

fs.writeFileSync(profitCalcFile, profitContent);

// Fix ProductSource.jsx costKey payload exactly
const productSourceFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProductSource.jsx';
let psContent = fs.readFileSync(productSourceFile, 'utf8');

// The previous patch actually WORKED for ProductSource, let's verify if it's there
console.log("ProductSource Build My Version costKey check:");
console.log(psContent.includes('costKey: "costBuildMyVersion"'));

