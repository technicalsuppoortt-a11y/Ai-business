const fs = require('fs');

const jsxPath = 'src/pages/Tools/components/CampaignLaunch.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// 1. Add useToolCache import
if (!jsx.includes('useToolCache')) {
  jsx = jsx.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport useToolCache from '../../../hooks/useToolCache';"
  );
}

// 2. Add hydration and save logic
const hydrationSearch = `  const [campaignName, setCampaignName] = useState('launch_offer');`;
const hydrationReplace = `  const [campaignName, setCampaignName] = useState('launch_offer');

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cached, isLoadedFromCloud, saveResult } = useToolCache('campaign-launch');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.url !== undefined) setUrl(cached.url);
        if (cached.source !== undefined) setSource(cached.source);
        if (cached.medium !== undefined) setMedium(cached.medium);
        if (cached.campaignName !== undefined) setCampaignName(cached.campaignName);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    // Immediate save, no debounce
    saveResult({ url, source, medium, campaignName });
  }, [isLoadedFromCloud, url, source, medium, campaignName]);
  // -------------------------------------`;

if (!jsx.includes('useToolCache(')) {
  jsx = jsx.replace(hydrationSearch, hydrationReplace);
}

// 3. Add Reset button to ToolDashboardLayout
const resetSearch = `      bottomSections={bottomSections}
    >
      <div className="cl-container"`;

const resetReplace = `      bottomSections={bottomSections}
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={() => {
              setUrl(state.websiteUrl || '');
              setSource('facebook');
              setMedium('cpc');
              setCampaignName('launch_offer');
              saveResult(null);
            }}
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
        </div>
      <div className="cl-container"`;

if (!jsx.includes('Reset / Start Fresh')) {
  // we also need to ensure RefreshCw is imported!
  if (!jsx.includes('RefreshCw')) {
      jsx = jsx.replace('Zap\n} from \'lucide-react\';', 'Zap,\n  RefreshCw\n} from \'lucide-react\';');
  }
  jsx = jsx.replace(resetSearch, resetReplace);
}

// 4. Wrap terminal container in max-h div
const terminalSearch = `          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;
const terminalReplace = `          <div className="cl-custom-scroll" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px', borderRadius: '24px' }}>
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;

if (jsx.includes(terminalSearch)) {
    jsx = jsx.replace(terminalSearch, terminalReplace);
    
    // Add the closing div
    const terminalEndSearch = `              </button>
            </div>
          </motion.div>

        </div>`;
    const terminalEndReplace = `              </button>
            </div>
          </motion.div>
          </div>

        </div>`;
    jsx = jsx.replace(terminalEndSearch, terminalEndReplace);
} else {
    console.log("Could not find terminal container for replacement.");
}

fs.writeFileSync(jsxPath, jsx);
console.log("Fully patched CampaignLaunch.jsx!");
