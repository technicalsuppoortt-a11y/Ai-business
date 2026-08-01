const fs = require('fs');
const path = './src/pages/Tools/components';
const files = fs.readdirSync(path).filter(f => f.endsWith('.jsx'));
for (const f of files) {
  const c = fs.readFileSync(path + '/' + f, 'utf8');
  if (c.includes('useRef') && !c.match(/import.*useRef.*from\s+['"]react['"]/)) {
    console.log(f);
  }
}
