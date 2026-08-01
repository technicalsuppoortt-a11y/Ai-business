const fs = require('fs');

const path = 'src/pages/Tools/components/AnalysisIdentity.jsx';
let code = fs.readFileSync(path, 'utf8');

// Find the block to move
const startStr = 'const hydratedRef = useRef(false);';
const endRegex = /customCssCode, appliedCssCode\]\);\s*;/;
const startIndex = code.indexOf(startStr);
const endMatch = endRegex.exec(code);

if (startIndex !== -1 && endMatch) {
  const endIndex = endMatch.index + endMatch[0].length;
  const blockToMove = code.slice(startIndex, endIndex);

  // Remove the block from its current position
  code = code.slice(0, startIndex) + code.slice(endIndex);

  // Find the insertion point
  const insertionPointStr = '// 1. Fetch niches for Tab 1';
  const insertionIndex = code.indexOf(insertionPointStr);

  if (insertionIndex !== -1) {
    // Back up to the start of the useEffect block that contains this line
    const lastUseEffectBefore = code.lastIndexOf('useEffect(() => {', insertionIndex);
    const finalIndex = lastUseEffectBefore !== -1 ? lastUseEffectBefore : insertionIndex;
    
    code = code.slice(0, finalIndex) + blockToMove + '\n\n  ' + code.slice(finalIndex);
    fs.writeFileSync(path, code);
    console.log('Successfully moved the hydration block!');
  } else {
    console.log('Could not find insertion point!');
  }
} else {
  console.log('Could not find the block to move!');
}
