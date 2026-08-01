const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const fileMapping = {
  'LandingPageContent.jsx': 'landing-page-content',
  'LegalPages.jsx': 'legal-pages',
  'SocialIntegration.jsx': 'social-integration',
  'ProductSource.jsx': 'product-source',
  'ProfitCalculator.jsx': 'profit-calculator',
  'SocialMedia.jsx': 'social-media',
  'MarketingPlan.jsx': 'marketing-plan',
  'AdCreative.jsx': 'ad-creative',
  'CampaignLaunch.jsx': 'campaign-launch',
  'SmartAIAssistant.jsx': 'smart-ai-assistant',
  'FreelanceProfile.jsx': 'freelance-profile',
  'PlatformRadar.jsx': 'platform-radar',
  'FreelancePricing.jsx': 'freelance-pricing',
  'SkillsCrafter.jsx': 'skills-crafting',
  'PortfolioBuilder.jsx': 'portfolio-builder',
  'ProposalSniper.jsx': 'proposal-sniper',
  'InterviewPrep.jsx': 'interview-prep',
  'SalesTemplates.jsx': 'sales-templates',
  'BrandLibrary.jsx': 'brand-library',
  'ExternalTools.jsx': 'external-tools'
};

for (const [filename, toolId] of Object.entries(fileMapping)) {
  const path = `src/pages/Tools/components/${filename}`;
  if (!fs.existsSync(path)) continue;

  let code = fs.readFileSync(path, 'utf8');
  if (code.includes('useToolCache')) {
    console.log(`Skipping ${filename}, already has useToolCache.`);
    continue;
  }

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });

  let mainFuncName = filename.replace('.jsx', '');
  let mainFuncPath = null;
  let states = [];
  let injectionLine = -1; // Line number to inject the cache block
  
  traverse(ast, {
    FunctionDeclaration(p) {
      if (p.node.id && p.node.id.name === mainFuncName) {
        mainFuncPath = p;
        
        // Find the first return statement to inject BEFORE it
        p.traverse({
          ReturnStatement(retPath) {
            if (injectionLine === -1 && retPath.parentPath.node === p.node.body) {
              injectionLine = retPath.node.loc.start.line;
            }
          }
        });

        // Find all useState calls inside the main function body
        p.traverse({
          CallExpression(callPath) {
            // Only consider top-level calls in the component (not nested inside functions/callbacks)
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
                
                // Get the raw string for the default value
                const arg = callPath.node.arguments[0];
                let defaultValStr = 'null';
                if (arg) {
                  defaultValStr = code.substring(arg.start, arg.end);
                }

                states.push({
                  name: stateName,
                  setter: setterName,
                  defaultVal: defaultValStr
                });
              }
            }
          }
        });
      }
    }
  });

  if (!mainFuncPath || injectionLine === -1 || states.length === 0) {
    console.log(`Could not parse or find states for ${filename}`);
    continue;
  }

  const lines = code.split('\n');
  
  // 1. Inject import
  const importToolCache = `import useToolCache from "../../../hooks/useToolCache";`;
  let importInserted = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import React')) {
      lines.splice(i + 1, 0, importToolCache);
      importInserted = true;
      break;
    }
  }

  // Also add RefreshCw if needed
  let refreshCwInserted = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('from "lucide-react"')) {
      if (!lines[i].includes('RefreshCw')) {
        lines[i] = lines[i].replace('{', '{ RefreshCw,');
      }
      refreshCwInserted = true;
      break;
    }
  }

  // Adjust injection line for the added imports
  let actualInjectionLine = injectionLine - 1 + (importInserted ? 1 : 0);

  // 2. Build cache block
  const stateNames = states.map(s => s.name).join(', ');
  const hydrationLines = states.map(s => `        if (cached.${s.name} !== undefined) ${s.setter}(cached.${s.name});`).join('\n');
  const resetLines = states.map(s => `    ${s.setter}(${s.defaultVal});`).join('\n');

  const cacheBlock = `
  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('${toolId}');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
${hydrationLines}
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ ${stateNames} });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, ${stateNames}]);

  const handleResetSession = () => {
${resetLines}
    saveResult(null);
  };
  // -------------------------------------
`;

  lines.splice(actualInjectionLine, 0, cacheBlock);

  // 3. Inject Reset Button right after <ToolDashboardLayout ...>
  let newCode = lines.join('\n');
  
  const buttonCode = `
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
          >
            <RefreshCw size={14} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Start Fresh' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>`;

  const toolLayoutRegex = /<ToolDashboardLayout[^>]*>/;
  const match = toolLayoutRegex.exec(newCode);
  if (match) {
    newCode = newCode.slice(0, match.index + match[0].length) + buttonCode + newCode.slice(match.index + match[0].length);
  } else {
    const returnRegex = /return\s*\(\s*<div[^>]*>/;
    const divMatch = returnRegex.exec(newCode);
    if (divMatch) {
      newCode = newCode.slice(0, divMatch.index + divMatch[0].length) + buttonCode + newCode.slice(divMatch.index + divMatch[0].length);
    } else {
      console.log(`Could not find insertion point for reset button in ${filename}`);
    }
  }

  fs.writeFileSync(path, newCode);
  console.log(`Successfully patched ${filename}`);
}
