const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix Tools 1-4 (sm-deck-btn)
// The flex container has gap: 12px.
// We remove `flex: '1'` and the <span>, add width/padding/title
content = content.replace(/flex:\s*'1'([\s\S]*?)>\s*<RotateCcw size=\{18\}\s*\/>\s*<span>\{lang === 'en' \? 'Reset' : 'إعادة ضبط'\}<\/span>/g, 
  `width: '48px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' $1 title={lang === 'en' ? 'Reset' : 'إعادة ضبط'}>\n                        <RotateCcw size={18} />`);

// Also change the flex on the generate button from `style={{ flex: '2' }}` to `style={{ flex: 1 }}` or remove it so it defaults correctly?
// Let's just change `flex: '2'` to `flex: 1`
content = content.replace(/style=\{\{\s*flex:\s*'2'\s*\}\}/g, `style={{ flex: 1 }}`);


// 2. Fix Tools 5-6 (sm-dock-btn next to primary)
// We remove the span and add width/padding/title.
// First, find the reset button for idea lab and trends
content = content.replace(/boxShadow:\s*'none'\s*\}\}\s*>\s*<RotateCcw size=\{15\}\s*\/>\s*<span>\{lang === 'en' \? 'Reset' : 'إعادة ضبط'\}<\/span>\s*<\/button>\s*<button\s*type="button"\s*onClick=\{handleGenerate(Ideas|Trends)\}/g,
  `boxShadow: 'none', width: '40px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title={lang === 'en' ? 'Reset' : 'إعادة ضبط'}>\n                        <RotateCcw size={15} />\n                      </button>\n                      <button\n                        type="button"\n                        style={{ flex: 1 }}\n                        onClick={handleGenerate$1}`);


// 3. Fix Tools 7-8 (in headers)
content = content.replace(/boxShadow:\s*'none'(,\s*height:\s*'fit-content')?\s*\}\}\s*>\s*<RotateCcw size=\{15\}\s*\/>\s*<span>\{lang === 'en' \? 'Reset' : 'إعادة ضبط'\}<\/span>\s*<\/button>/g,
  `boxShadow: 'none', width: '36px', height: '36px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title={lang === 'en' ? 'Reset' : 'إعادة ضبط'}>\n                      <RotateCcw size={15} />\n                    </button>`);

// Fix the Architect reset button (Wait, does Architect have a reset button? No, only the global one which is not currently rendered or it was rendered in ProductSource. We are only fixing the 8 tools in SocialMedia.jsx)

fs.writeFileSync(path, content);
console.log("Fixed Reset buttons UI successfully.");
