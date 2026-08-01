const fs = require('fs');
const path = require('path');

const file = path.join('src', 'pages', 'Tools', 'components', 'AnalysisIdentity.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add lastFetchedRef right before hydratedRef
if (!content.includes('const lastFetchedRef = useRef')) {
  content = content.replace(
    'const hydratedRef = useRef(false);',
    'const lastFetchedRef = useRef({ nicheId: null, country: null, global: null });\n  const hydratedRef = useRef(false);'
  );
}

// 2. Add hydration logic for lastFetchedRef
const hydrateSearch = 'if (cached.selectedNiche !== undefined) setSelectedNiche(cached.selectedNiche);';
const hydrateReplace = `if (cached.selectedNiche !== undefined) {
          setSelectedNiche(cached.selectedNiche);
          if (cached.selectedNiche) {
            lastFetchedRef.current = {
              nicheId: cached.selectedNiche.id,
              country: cached.targetCountry !== undefined ? cached.targetCountry : targetCountry,
              global: isGlobalBenchmark
            };
          }
        }`;
if (content.includes(hydrateSearch)) {
  content = content.replace(hydrateSearch, hydrateReplace);
}

// 3. Replace the fetch useEffect
const oldFetchEffect = `  useEffect(() => {
    if (selectedNiche) {
      fetchAIData('benchmark');
      fetchAIData('microNiches');
      setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
    }
  }, [selectedNiche?.id, targetCountry, isGlobalBenchmark]);`;

const newFetchEffect = `  useEffect(() => {
    if (selectedNiche) {
      const currentNicheId = selectedNiche.id;
      const currentCountry = targetCountry;
      const currentGlobal = isGlobalBenchmark;
      
      const last = lastFetchedRef.current;
      if (last.nicheId === currentNicheId && last.country === currentCountry && last.global === currentGlobal) {
        return; // Skip fetch if we already have this data (e.g. from hydration)
      }
      
      lastFetchedRef.current = { nicheId: currentNicheId, country: currentCountry, global: currentGlobal };

      fetchAIData('benchmark');
      fetchAIData('microNiches');
      setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
    }
  }, [selectedNiche?.id, targetCountry, isGlobalBenchmark]);`;

if (content.includes("fetchAIData('benchmark');\n      fetchAIData('microNiches');")) {
  // It might be formatted slightly differently, use a regex
  const effectRegex = /useEffect\(\(\) => \{\s+if\s*\(selectedNiche\)\s*\{\s+fetchAIData\('benchmark'\);\s+fetchAIData\('microNiches'\);\s+setAiData[\s\S]*?\}\s*\}, \[[^\]]+\]\);/g;
  content = content.replace(effectRegex, newFetchEffect);
}

fs.writeFileSync(file, content);
console.log('Done fixing fetch wipe bug.');
