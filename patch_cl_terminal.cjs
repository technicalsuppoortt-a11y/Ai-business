const fs = require('fs');

const jsxPath = 'src/pages/Tools/components/CampaignLaunch.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

const termRegex = /(<motion\.div\s+className="cl-terminal-container cl-station-4-vault")/s;
const endRegex = /(<\/button>\s*<\/div>\s*<\/motion\.div>\s*)<\/div>/s;

if (termRegex.test(jsx)) {
    jsx = jsx.replace(termRegex, '<div className="cl-custom-scroll" style={{ maxHeight: \'500px\', overflowY: \'auto\', paddingRight: \'10px\', borderRadius: \'24px\' }}>\n          $1');
    jsx = jsx.replace(endRegex, '$1</div>\n        </div>');
    fs.writeFileSync(jsxPath, jsx);
    console.log("Terminal container successfully wrapped via regex!");
} else {
    console.log("Regex didn't match.");
}
