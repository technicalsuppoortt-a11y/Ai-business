const fs = require('fs');

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
  if (!fs.existsSync(path)) {
    console.log(`Skipping ${filename}, file not found.`);
    continue;
  }
  
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  if (content.includes('useToolCache')) {
    console.log(`Skipping ${filename}, already has useToolCache.`);
    continue;
  }

  // 1. Add import
  const importToolCache = `import useToolCache from "../../../hooks/useToolCache";\n`;
  content = content.replace(/import React.*?;\n/, match => match + importToolCache);
  
  // Also add RefreshCw to lucide-react imports if not there
  if (content.includes('lucide-react') && !content.includes('RefreshCw')) {
    content = content.replace(/import \{([\s\S]*?)\} from "lucide-react";/, (match, group1) => {
      return `import { RefreshCw, ${group1} } from "lucide-react";`;
    });
  }

  // 2. Find main function start
  const mainFuncRegex = new RegExp(`export default function ${filename.replace('.jsx', '')}\\(.*?\\) \\{`);
  const mainFuncMatch = content.match(mainFuncRegex);
  if (!mainFuncMatch) {
    console.log(`Could not find main function in ${filename}`);
    continue;
  }

  // 3. Extract all useStates inside the component
  // We'll just look for useStates after the main function starts, up until the first return statement?
  // Or just globally, but some might be inside sub-components.
  // Most files have sub-components defined BEFORE the main component.
  const mainFuncIndex = mainFuncMatch.index;
  const contentAfterMain = content.substring(mainFuncIndex);
  
  // Let's find the first `return (` which is typically the end of hooks
  const firstReturnIndex = contentAfterMain.indexOf('  return (');
  if (firstReturnIndex === -1) {
    console.log(`Could not find main return in ${filename}`);
    continue;
  }

  const hooksSection = contentAfterMain.substring(0, firstReturnIndex);
  
  const stateRegex = /const \[(\w+),\s*set\w+\]\s*=\s*useState\(([\s\S]*?)\);/g;
  let match;
  const states = [];
  while ((match = stateRegex.exec(hooksSection)) !== null) {
    states.push({
      name: match[1],
      defaultVal: match[2].trim(),
      setter: `set${match[1].charAt(0).toUpperCase()}${match[1].slice(1)}`
    });
  }

  if (states.length === 0) {
    console.log(`No states found for ${filename}`);
    continue;
  }

  // 4. Construct hydration and auto-save blocks
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

  // Inject cacheBlock after `const lang = state.language || "ar";` or just after `const { state } = useApp();`
  // We'll inject it right before the first `return (` to be safe.
  const returnTarget = '  return (';
  content = content.replace(returnTarget, cacheBlock + '\n' + returnTarget);

  // 5. Inject Reset button in UI
  const headerTarget = '<div className="ai-tabs-header-wrap">';
  const headerTarget2 = '<div className="ai-tabs-header-wrap" style={{ position: \'relative\' }}>';
  
  const headerReplacement = `<div className="ai-tabs-header-wrap" style={{ position: 'relative' }}>
        <button
          onClick={handleResetSession}
          style={{
            position: 'absolute',
            left: (state?.language || 'ar') === 'ar' ? '20px' : 'auto',
            right: (state?.language || 'ar') === 'ar' ? 'auto' : '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
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
          <RefreshCw size={12} />
          {(state?.language || 'ar') === 'en' ? 'Reset' : 'إعادة ضبط'}
        </button>
`;

  if (content.includes(headerTarget)) {
    content = content.replace(headerTarget, headerReplacement);
  } else if (content.includes(headerTarget2)) {
    // If it already has relative positioning, just insert the button
    content = content.replace(
      headerTarget2,
      headerReplacement
    );
  } else {
    // Try to find an alternative header, like <div className="tool-dashboard-header">
    const altHeader = '<div className="td-header">';
    if (content.includes(altHeader)) {
      content = content.replace(altHeader, `<div className="td-header" style={{ position: 'relative' }}>
        <button
          onClick={handleResetSession}
          style={{
            position: 'absolute',
            left: (state?.language || 'ar') === 'ar' ? '20px' : 'auto',
            right: (state?.language || 'ar') === 'ar' ? 'auto' : '20px',
            top: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            zIndex: 10
          }}
        >
          <RefreshCw size={12} />
          {(state?.language || 'ar') === 'en' ? 'Reset' : 'إعادة ضبط'}
        </button>`);
    } else {
      console.log(`Could not find header to inject button in ${filename}`);
    }
  }

  // Save changes
  fs.writeFileSync(path, content);
  console.log(`Successfully patched ${filename}`);
}

console.log('All patches completed.');
