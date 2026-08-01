const fs = require('fs');
const path = './src/pages/Tools/components';
const files = fs.readdirSync(path).filter(f => f.endsWith('.jsx'));

for (const f of files) {
  const filePath = path + '/' + f;
  let c = fs.readFileSync(filePath, 'utf8');
  if (c.includes('RefreshCw') && !c.match(/import.*?RefreshCw.*?from\s+['"]lucide-react['"]/)) {
    c = c.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
      if (!p1.includes('RefreshCw')) {
        return match.replace(p1, p1 + ', RefreshCw');
      }
      return match;
    });
    fs.writeFileSync(filePath, c);
    console.log('Fixed RefreshCw in', f);
  }
}
