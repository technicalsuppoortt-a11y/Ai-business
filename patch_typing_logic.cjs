const fs = require('fs');

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state variable
if (!code.includes('isNewlyGeneratedColors')) {
  code = code.replace(
    'const [colorAnalysis, setColorAnalysis] = useState(cached?.colorAnalysis ?? null);',
    'const [colorAnalysis, setColorAnalysis] = useState(cached?.colorAnalysis ?? null);\n  const [isNewlyGeneratedColors, setIsNewlyGeneratedColors] = useState(false);'
  );
}

// 2. Set isNewlyGeneratedColors(true) in color generation
if (!code.includes('setIsNewlyGeneratedColors(true)')) {
  code = code.replace(
    'setColorAnalysis(dbResult);',
    'setColorAnalysis(dbResult);\n            setIsNewlyGeneratedColors(true);'
  );
  
  // Also the fallback color analysis
  code = code.replace(
    'setColorAnalysis({',
    'setIsNewlyGeneratedColors(true);\n            setColorAnalysis({'
  );
}

// 3. Reset state on setActiveTab
if (!code.includes('setIsNewlyGeneratedColors(false)')) {
  code = code.replace(/onClick=\{\(\) => setActiveTab\("([^"]+)"\)\}/g, 'onClick={() => { setIsNewlyGeneratedColors(false); setActiveTab("$1"); }}');
}

// 4. Update TypingText props
if (!code.includes('isCached={analysisMode')) {
  code = code.replace(/<TypingText/g, "<TypingText isCached={analysisMode === 'fast' || !isNewlyGeneratedColors}");
}

fs.writeFileSync(path, code);
console.log('Successfully patched AnalysisIdentity with conditional typing logic!');
