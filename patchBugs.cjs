const fs = require('fs');

// 1. Fix ProfitCalculator.jsx
const profitCalcFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProfitCalculator.jsx';
let profitContent = fs.readFileSync(profitCalcFile, 'utf8');

profitContent = profitContent.replace(/const \[isNewlyGenerated, setIsNewlyGenerated\] = useState\(false\);/g, `const [isLiveGenerating, setIsLiveGenerating] = useState(false);

  // Fix Typewriter Effect on Stored Data
  useEffect(() => {
    setIsLiveGenerating(false);
    return () => setIsLiveGenerating(false);
  }, [activeMode]);`);

profitContent = profitContent.replace(/setIsNewlyGenerated/g, 'setIsLiveGenerating');

// Fix the TypewriterText conditional rendering in ProfitCalculator
const typewriterRegex1 = /<TypewriterText text=\{aiInsights\} speed=\{12\} \/>/g;
const typewriterReplacement1 = `{isLiveGenerating ? <TypewriterText text={aiInsights} speed={12} /> : <div style={{ color: "#F8FAFC", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{aiInsights.split('\\n').map((line, idx) => <p key={idx} style={{ margin: "0 0 6px 0" }}>{line.replace(/\\*/g, "")}</p>)}</div>}`;
profitContent = profitContent.replace(typewriterRegex1, typewriterReplacement1);

const typewriterRegex2 = /<TypewriterText text=\{monthlyPlanResult\} speed=\{12\} \/>/g;
const typewriterReplacement2 = `{isLiveGenerating ? <TypewriterText text={monthlyPlanResult} speed={12} /> : <div style={{ color: "#F8FAFC", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{monthlyPlanResult.split('\\n').map((line, idx) => <p key={idx} style={{ margin: "0 0 6px 0" }}>{line.replace(/\\*/g, "")}</p>)}</div>}`;
profitContent = profitContent.replace(typewriterRegex2, typewriterReplacement2);

fs.writeFileSync(profitCalcFile, profitContent);


// 2. Fix ProductSource.jsx
const productSourceFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/ProductSource.jsx';
let psContent = fs.readFileSync(productSourceFile, 'utf8');

// Precisely replace callOpenAiApi payload
const targetPayload = `      const responseContent = await callOpenAiApi({
        uid: userData?.uid || state?.user?.uid,
        systemPrompt,
        userPrompt,
        jsonMode: true,
        userEmail: state.user?.email
      });`;
const fixedPayload = `      const responseContent = await callOpenAiApi({
        uid: userData?.uid || state?.user?.uid,
        systemPrompt,
        userPrompt,
        jsonMode: true,
        userEmail: state.user?.email,
        costKey: "costBuildMyVersion"
      });`;
psContent = psContent.replace(targetPayload, fixedPayload);
fs.writeFileSync(productSourceFile, psContent);


// 3. Fix liveAiService.js
const liveAiFile = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/services/liveAiService.js';
let liveContent = fs.readFileSync(liveAiFile, 'utf8');

// Remove duplicate 'profit-calculator' key mapping
liveContent = liveContent.replace(/      'profit-calculator': 'costProfitCalculator',\n/g, '');
fs.writeFileSync(liveAiFile, liveContent);

console.log("Bug fixes applied successfully.");
