const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

let states = [];

traverse(ast, {
  FunctionDeclaration(p) {
    if (p.node.id && p.node.id.name === 'AnalysisIdentity') {
      p.traverse({
        CallExpression(callPath) {
          let current = callPath.parentPath;
          let isTopLevel = false;
          while (current) {
            if (current.node === p.node.body) {
              isTopLevel = true;
              break;
            }
            if (current.isFunction() && current.node !== p.node) break;
            current = current.parentPath;
          }
          if (!isTopLevel) return;
          if (callPath.node.callee.name === 'useState') {
            const declarator = callPath.parentPath;
            if (declarator.isVariableDeclarator() && declarator.node.id.type === 'ArrayPattern') {
              const stateName = declarator.node.id.elements[0].name;
              const setterName = declarator.node.id.elements[1].name;
              states.push({ name: stateName, setter: setterName });
            }
          }
        }
      });
    }
  }
});

const stateNames = states.map(s => s.name).join(', ');
const hydrationLines = states.map(s => `        if (cached.${s.name} !== undefined) ${s.setter}(cached.${s.name});`).join('\n');

// 1. Replace the existing hydration and autosave block
const startIdx = code.indexOf('const hydratedRef = useRef(false);');
const endMarker = '}, [isLoadedFromCloud, activeTab, analysisMode';
const endIdxFull = code.indexOf(']', code.indexOf(endMarker)) + 2;

const newBlock = `const hydratedRef = useRef(false);

  // 1. Hydrate state asynchronously when cache loads
  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
${hydrationLines}

        // Special handling for aiData subfields
        if (cached.aiData !== undefined || cached.marketOpportunities !== undefined || cached.top10Leaders !== undefined) {
          setAiData(prev => ({
             ...prev, 
             ...(cached.aiData || {}),
             marketOpportunities: cached.marketOpportunities || cached.aiData?.marketOpportunities || prev.marketOpportunities,
             topLeaders: cached.top10Leaders || cached.aiData?.topLeaders || prev.topLeaders
          }));
        }
      }
      console.log("🔥 CACHE LOADED:", cached);
    }
  }, [isLoadedFromCloud, cached]);

  // 2. Safe Auto-save (only runs after hydration)
  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    
    const timeout = setTimeout(() => {
      const payloadToSave = { 
        ${stateNames},
        marketOpportunities: aiData?.marketOpportunities || null,
        top10Leaders: aiData?.topLeaders || []
      };
      saveResult(payloadToSave);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, ${stateNames}]);
`;

code = code.slice(0, startIdx) + newBlock + code.slice(endIdxFull);

// 2. Remove the clearing of setGeneratedNames inside the selectedStyle useEffect
code = code.replace(/setGeneratedNames\(null\);\s*\n\s*\}\,\s*\[selectedStyle\]\)\;/, '}, [selectedStyle]);');

// 3. Inject explicit saveResult inside handleGenerateNames
const nameSaveInjection = `setGeneratedNames(results);
          // EXPLICIT SAVE FOR BRAND NAMES
          setTimeout(() => {
            saveResult({ ...cached, namingCategory, selectedStyle, nameLanguage, selectedCatalogs, generatedNames: results });
          }, 100);`;
code = code.replace(/setGeneratedNames\(results\);/g, nameSaveInjection);

// 4. Also inside handleGenerateIdentity, inject explicit saveResult!
const identitySaveInjection = `setIsAnalyzingColors(false);
      // EXPLICIT SAVE FOR VISUAL IDENTITY
      setTimeout(() => {
        saveResult({ ...cached, colorAnalysis: apiResponse, primaryColor: newPrimary, secondaryColor: newSecondary, accentColor: newAccent, headingFont: newFont, bodyTextColor: newBodyColor, heroBgColor: newHeroBg, buttonBgColor: newPrimary, cardBgColor: newCardBg, cardBorderColor: newAccent });
      }, 100);`;
code = code.replace(/setIsAnalyzingColors\(false\);/g, identitySaveInjection);

fs.writeFileSync(path, code);
console.log('AnalysisIdentity explicitly patched!');
