const fs = require('fs');

// 1. Add scrollbar CSS to CampaignLaunch.css
const cssPath = 'src/pages/Tools/components/CampaignLaunch.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.cl-custom-scroll')) {
    css += `
/* Custom Scrollbar for Terminal Vault */
.cl-custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.cl-custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 10px;
}
.cl-custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 10px;
}
.cl-custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
`;
    fs.writeFileSync(cssPath, css);
}

// 2. Modify CampaignLaunch.jsx
const jsxPath = 'src/pages/Tools/components/CampaignLaunch.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// a. Remove 1.5s debounce from saveResult
const debounceSearch = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ url, source, medium, campaignName });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, url, source, medium, campaignName]);`;

const debounceReplace = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({ url, source, medium, campaignName });
  }, [isLoadedFromCloud, url, source, medium, campaignName]);`;

if (jsx.includes(debounceSearch)) {
    jsx = jsx.replace(debounceSearch, debounceReplace);
} else {
    console.log("Could not find debounce logic");
}

// b. Wrap terminal in a bounded max-h-500 container
const terminalSearch = `          {/* ⚡ STATION 4: THE FINAL UTM TERMINAL VAULT */}
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;

const terminalReplace = `          {/* ⚡ STATION 4: THE FINAL UTM TERMINAL VAULT */}
          <div className="cl-custom-scroll" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px', borderRadius: '24px' }}>
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;

const terminalSearchAlt = `          {/* ⚡ STATION 4: THE FINAL UTM TERMINAL VAULT */}
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;

// Wait, the emoji is ⚡? Let's verify the emoji from earlier. The terminal search might fail if encoding is weird.
// Let's use a simpler search.
const simpleTerminalSearch = `          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;
const simpleTerminalReplace = `          <div className="cl-custom-scroll" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px', borderRadius: '24px' }}>
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"`;

if (jsx.includes(simpleTerminalSearch)) {
    jsx = jsx.replace(simpleTerminalSearch, simpleTerminalReplace);
    
    // add closing div
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
    console.log("Could not find terminal container");
}

fs.writeFileSync(jsxPath, jsx);
console.log("Patch applied to CampaignLaunch!");
