const fs = require('fs');
const jsxPath = 'src/pages/Tools/components/SocialMedia.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

// 1. Force Inline Styles on Container Wrappers
jsx = jsx.replace(/className="sm-showcase-content"/g, 'className="sm-showcase-content pcc-custom-scroll" style={{ maxHeight: "500px", overflowY: "auto" }}');
jsx = jsx.replace(/className="sm-modal-output-scroll"/g, 'className="sm-modal-output-scroll pcc-custom-scroll" style={{ maxHeight: "500px", overflowY: "auto" }}');

// 2. Just in case, forcefully ensure no other isLoading flags exist
if (jsx.includes('setIsLoading')) {
    jsx = jsx.replace(/setIsLoading\(true\)/g, 'setIsLoading(true); setIsNewlyGenerated(true);');
}

fs.writeFileSync(jsxPath, jsx);
console.log("Forced inline styles on SocialMedia.jsx!");
