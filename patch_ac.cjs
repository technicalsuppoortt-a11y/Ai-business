const fs = require('fs');

// 1. Modify AdCreative.jsx
const jsxPath = 'src/pages/Tools/components/AdCreative.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

const debounceSearch = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ analysisMode, structure, selectedProduct, selectedPain, selectedPlatform, selectedDialect, isGenerating, result, activePopover, loadingBadgeIndex, activeAngleTab });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, structure, selectedProduct, selectedPain, selectedPlatform, selectedDialect, isGenerating, result, activePopover, loadingBadgeIndex, activeAngleTab]);`;

const debounceReplace = `  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    saveResult({ analysisMode, structure, selectedProduct, selectedPain, selectedPlatform, selectedDialect, isGenerating, result, activePopover, loadingBadgeIndex, activeAngleTab });
  }, [isLoadedFromCloud, analysisMode, structure, selectedProduct, selectedPain, selectedPlatform, selectedDialect, isGenerating, result, activePopover, loadingBadgeIndex, activeAngleTab]);`;

if (jsx.includes(debounceSearch)) {
    jsx = jsx.replace(debounceSearch, debounceReplace);
}

const stageRegex = /(<motion\.div\s+key="mockup-stage"[^>]*?className="ac-mockup-stage")([^>]*?>)/s;
if (stageRegex.test(jsx)) {
    jsx = jsx.replace(stageRegex, '$1 ac-custom-scroll" style={{ maxHeight: \'500px\', overflowY: \'auto\' }}$2');
}

fs.writeFileSync(jsxPath, jsx);

// 2. Modify AdCreative.css
const cssPath = 'src/pages/Tools/components/AdCreative.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.ac-custom-scroll')) {
    css += `
/* Custom Scrollbar */
.ac-custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.ac-custom-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 10px;
}
.ac-custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 10px;
}
.ac-custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
`;
    fs.writeFileSync(cssPath, css);
}

console.log("Patched AdCreative!");
