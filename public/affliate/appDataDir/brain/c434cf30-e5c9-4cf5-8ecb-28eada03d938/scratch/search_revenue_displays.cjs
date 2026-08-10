const fs = require('fs');
const path = require('path');

const searchInDir = (dir) => {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullpath = path.join(dir, file);
    const stat = fs.statSync(fullpath);
    if (stat.isDirectory()) {
      searchInDir(fullpath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullpath, 'utf8');
      if (content.includes('revenue')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('revenue') && (line.includes('fmtMoney') || line.includes('{') || line.includes('span') || line.includes('div'))) {
            console.log(`${fullpath} L${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
};

searchInDir('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src');
