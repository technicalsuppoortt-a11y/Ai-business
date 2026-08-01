const fs = require('fs');
const file = 'd:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Tools/components/AnalysisIdentity.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the fetch useEffect
const fetchEffectRegex = /^\s*useEffect\(\(\) => \{\n\s*if\s*\(selectedNiche\)\s*\{\n\s*const\s+currentNicheId\s*=[\s\S]*?\}, \[\s*selectedNiche\?\.id,\s*targetCountry,\s*isGlobalBenchmark\s*\]\);\n/m;
content = content.replace(fetchEffectRegex, '');

// 2. Remove lastFetchedRef declaration
content = content.replace(/  const lastFetchedRef = useRef\(\{ nicheId: null, country: null, global: null \}\);\n/g, '');

// 3. Update handleNicheSelect
const oldHandleNiche = `    setAiData({
      benchmark: null,
      microNiches: [],
      marketOpportunities: null,
      topLeaders: [],
      loading: {
        benchmark: true,
        microNiches: true,
        opportunities: false,
        leaders: false
      },
      error: null
    });
    setLiveAiMicroIdeas([]);`;

const newHandleNiche = `    setAiData({
      benchmark: null,
      microNiches: [],
      marketOpportunities: null,
      topLeaders: [],
      loading: {
        benchmark: false,
        microNiches: false,
        opportunities: false,
        leaders: false
      },
      error: null
    });
    setLiveAiMicroIdeas([]);
    fetchAIData('benchmark', { niche: n });
    fetchAIData('microNiches', { niche: n });`;
content = content.replace(oldHandleNiche, newHandleNiche);

// 4. Update handleTargetCountryChange
const oldTargetCountry = `  const handleTargetCountryChange = (val) => {
    if (val === targetCountry) return;
    setIsChangingMarket(true);
    setTargetCountry(val);
    setTimeout(() => {
      setIsChangingMarket(false);
    }, 1600);
  };`;

const newTargetCountry = `  const handleTargetCountryChange = (val) => {
    if (val === targetCountry) return;
    setIsChangingMarket(true);
    setTargetCountry(val);
    setTimeout(() => {
      setIsChangingMarket(false);
    }, 1600);
    setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
    fetchAIData('benchmark', { country: val });
    fetchAIData('microNiches', { country: val });
  };`;
content = content.replace(oldTargetCountry, newTargetCountry);

// 5. Update global benchmark toggle
const oldGlobalBenchmark = `onClick={() => { setIsGlobalBenchmark(!isGlobalBenchmark); }}`;
const newGlobalBenchmark = `onClick={() => {
                    const nextVal = !isGlobalBenchmark;
                    setIsGlobalBenchmark(nextVal);
                    setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
                    fetchAIData('benchmark', { global: nextVal });
                    fetchAIData('microNiches', { global: nextVal });
                  }}`;
content = content.replace(oldGlobalBenchmark, newGlobalBenchmark);

fs.writeFileSync(file, content);
console.log('Architecture refactored successfully.');
