const fs = require('fs');
const path = require('path');

const file = path.join('src', 'pages', 'Tools', 'components', 'AnalysisIdentity.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('useToolCache')) {
  content = content.replace(
    'import TypingText from "../../../components/common/TypingText";',
    'import TypingText from "../../../components/common/TypingText";\nimport useToolCache from "../../../hooks/useToolCache";'
  );
}

// 2. Add hook call
if (!content.includes(`useToolCache("analysis-identity")`)) {
  content = content.replace(
    'export default function AnalysisIdentity() {',
    'export default function AnalysisIdentity() {\n  const { cached, isCached, saveResult } = useToolCache("analysis-identity");'
  );
}

// 3. Patch useStates
const patches = [
  ['const [activeTab, setActiveTab] = useState("niche");', 'const [activeTab, setActiveTab] = useState(cached?.activeTab ?? "niche");'],
  ['const [analysisMode, setAnalysisMode] = useState("fast");', 'const [analysisMode, setAnalysisMode] = useState(cached?.analysisMode ?? "fast");'],
  ['const [microNicheMode, setMicroNicheMode] = useState("fast");', 'const [microNicheMode, setMicroNicheMode] = useState(cached?.microNicheMode ?? "fast");'],
  ['const [selectedNiche, setSelectedNiche] = useState(null);', 'const [selectedNiche, setSelectedNiche] = useState(cached?.selectedNiche ?? null);'],
  ['const [targetCountry, setTargetCountry] = useState("sa");', 'const [targetCountry, setTargetCountry] = useState(cached?.targetCountry ?? "sa");'],
  ['const [customNicheInput, setCustomNicheInput] = useState("");', 'const [customNicheInput, setCustomNicheInput] = useState(cached?.customNicheInput ?? "");'],
  ['const [aiData, setAiData] = useState({', 'const [aiData, setAiData] = useState(cached?.aiData ?? {'],
  ['const [nicheAnalysis, setNicheAnalysis] = useState(null);', 'const [nicheAnalysis, setNicheAnalysis] = useState(cached?.nicheAnalysis ?? null);'],
  ['const [liveAiMicroIdeas, setLiveAiMicroIdeas] = useState([]);', 'const [liveAiMicroIdeas, setLiveAiMicroIdeas] = useState(cached?.liveAiMicroIdeas ?? []);'],
  ['const [namingCategory, setNamingCategory] = useState("ecom");', 'const [namingCategory, setNamingCategory] = useState(cached?.namingCategory ?? "ecom");'],
  ['const [generatedNames, setGeneratedNames] = useState(null);', 'const [generatedNames, setGeneratedNames] = useState(cached?.generatedNames ?? null);'],
  ['const [colorAnalysis, setColorAnalysis] = useState(null);', 'const [colorAnalysis, setColorAnalysis] = useState(cached?.colorAnalysis ?? null);'],
  ['const [brandNiches, setBrandNiches] = useState(null);', 'const [brandNiches, setBrandNiches] = useState(cached?.brandNiches ?? null);']
];

for (const [oldLine, newLine] of patches) {
  content = content.replace(oldLine, newLine);
}

// 4. Add useEffect auto-save
const useEffectCode = `
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveResult({
        activeTab, analysisMode, microNicheMode, selectedNiche, targetCountry,
        customNicheInput, aiData, nicheAnalysis, liveAiMicroIdeas,
        namingCategory, generatedNames, colorAnalysis, brandNiches
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeTab, analysisMode, microNicheMode, selectedNiche, targetCountry, customNicheInput, aiData, nicheAnalysis, liveAiMicroIdeas, namingCategory, generatedNames, colorAnalysis, brandNiches]);
`;

if (!content.includes('saveResult({')) {
  // inject after the useStates block, just before the first effect
  content = content.replace(
    'useEffect(() => {\n    if (state.targetCountry) {',
    useEffectCode + '\n  useEffect(() => {\n    if (state.targetCountry) {'
  );
}

// 5. TypingText isCached prop
content = content.replace(/<TypingText\s/g, '<TypingText isCached={isCached} ');

fs.writeFileSync(file, content);
console.log('AnalysisIdentity patched.');
