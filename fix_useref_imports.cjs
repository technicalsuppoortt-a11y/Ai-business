const fs = require('fs');
const path = './src/pages/Tools/components';
const files = fs.readdirSync(path).filter(f => f.endsWith('.jsx'));

for (const f of files) {
  const filePath = path + '/' + f;
  let c = fs.readFileSync(filePath, 'utf8');
  if (c.includes('useRef') && !c.match(/import.*useRef.*from\s+['"]react['"]/)) {
    c = c.replace(/import\s+React.*?from\s+['"]react['"];/, (match) => {
      if (!match.includes('useRef')) {
        return match.replace('}', ', useRef }').replace('{ ,', '{');
      }
      return match;
    });
    fs.writeFileSync(filePath, c);
    console.log('Fixed', f);
  }
}
