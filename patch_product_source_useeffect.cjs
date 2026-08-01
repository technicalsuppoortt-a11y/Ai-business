const fs = require('fs');

const path = 'src/pages/Tools/components/ProductSource.jsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /if\s*\(data\.productTypes\?\.length\)\s*setSelectedType\(data\.productTypes\[0\]\.id\);\s*if\s*\(data\.niches\?\.length\)\s*setSelectedNiche\(data\.niches\[0\]\.id\);\s*if\s*\(data\.effortLevels\?\.length\)\s*setSelectedEffort\(data\.effortLevels\[0\]\.id\);/g;

const replacement = `if (data.productTypes?.length) setSelectedType(prev => prev || data.productTypes[0].id);
        if (data.niches?.length) setSelectedNiche(prev => prev || data.niches[0].id);
        if (data.effortLevels?.length) setSelectedEffort(prev => prev || data.effortLevels[0].id);`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(path, code);
  console.log('Successfully patched useEffect via Regex to prevent overriding cached dropdown values!');
} else {
  console.error('Target useEffect not found using Regex.');
}
