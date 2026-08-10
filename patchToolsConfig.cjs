const fs = require('fs');

// 1. Update toolsData.js
const toolsDataFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/data/toolsData.js';
let toolsDataContent = fs.readFileSync(toolsDataFile, 'utf8');

const oldProductSource = `{ key: 'costProductSource', label_en: 'Etsy Top Ideas Generate', label_ar: 'توليد أفكار المنتجات', defaultCost: 20 }`;
const newProductSource = `{ key: 'costProductSource', label_en: 'Etsy Top Ideas Generate', label_ar: 'توليد أفكار المنتجات', defaultCost: 20 },
      { key: 'costBuildMyVersion', label_en: 'Build My Version', label_ar: 'إنشاء نسختي', defaultCost: 10 }`;
toolsDataContent = toolsDataContent.replace(oldProductSource, newProductSource);

const oldProfitCalc = `{ key: 'costProfitCalculator', label_en: 'Smart Profit Estimation', label_ar: 'حساب الأرباح الذكي', defaultCost: 10 }`;
const newProfitCalc = `{ key: 'costDailyFunnel', label_en: 'Daily Funnel Engine', label_ar: 'محرك القمع اليومي', defaultCost: 10 },
      { key: 'costMonthlyGoalPlanner', label_en: 'Monthly Goal Planner', label_ar: 'مخطط الأهداف الشهرية', defaultCost: 10 }`;
toolsDataContent = toolsDataContent.replace(oldProfitCalc, newProfitCalc);
fs.writeFileSync(toolsDataFile, toolsDataContent);


// 2. Update liveAiService.js
const liveAiFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/services/liveAiService.js';
let liveAiContent = fs.readFileSync(liveAiFile, 'utf8');

const oldCostMap = `'product-source': 'costProductSource',`;
const newCostMap = `'product-source': 'costProductSource',
  'build-my-version': 'costBuildMyVersion',
  'profit-calculator': 'costDailyFunnel',
  'profit-calculator-monthly': 'costMonthlyGoalPlanner',
  'daily-funnel': 'costDailyFunnel',
  'monthly-goal-planner': 'costMonthlyGoalPlanner',`;
liveAiContent = liveAiContent.replace(oldCostMap, newCostMap);
fs.writeFileSync(liveAiFile, liveAiContent);


// 3. Update ProfitCalculator.jsx
const profitCalcFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProfitCalculator.jsx';
let profitCalcContent = fs.readFileSync(profitCalcFile, 'utf8');

const oldDailyCall = `const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "profit-calculator",`;
const newDailyCall = `const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "profit-calculator",
          costKey: "costDailyFunnel",`;
profitCalcContent = profitCalcContent.replace(oldDailyCall, newDailyCall);

const oldMonthlyCall = `const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "profit-calculator-monthly",`;
const newMonthlyCall = `const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "profit-calculator-monthly",
          costKey: "costMonthlyGoalPlanner",`;
profitCalcContent = profitCalcContent.replace(oldMonthlyCall, newMonthlyCall);
fs.writeFileSync(profitCalcFile, profitCalcContent);


// 4. Update ProductSource.jsx
const productSourceFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProductSource.jsx';
let productSourceContent = fs.readFileSync(productSourceFile, 'utf8');

const oldCallOpenAi = `      const responseContent = await callOpenAiApi({
        uid: userData?.uid || state?.user?.uid,
        systemPrompt,
        userPrompt,
        jsonMode: true,
        userEmail: state.user?.email
      });`;
const newCallOpenAi = `      const responseContent = await callOpenAiApi({
        uid: userData?.uid || state?.user?.uid,
        systemPrompt,
        userPrompt,
        jsonMode: true,
        userEmail: state.user?.email,
        costKey: "costBuildMyVersion"
      });`;
productSourceContent = productSourceContent.replace(oldCallOpenAi, newCallOpenAi);

const oldDispatchProductSource = `        const liveResult = await dispatchLiveAiAnalysis({
          uid: userData?.uid || state?.user?.uid,
          toolId: 'product-source',`;
const newDispatchProductSource = `        const liveResult = await dispatchLiveAiAnalysis({
          uid: userData?.uid || state?.user?.uid,
          toolId: 'product-source',
          costKey: 'costProductSource',`;
productSourceContent = productSourceContent.replace(oldDispatchProductSource, newDispatchProductSource);

fs.writeFileSync(productSourceFile, productSourceContent);

console.log('Tools correctly patched.');
