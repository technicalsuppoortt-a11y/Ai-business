const fs = require('fs');

const searchInFile = (filepath) => {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('package') || line.includes('Package') || line.includes('lead') || line.includes('Lead') || line.includes('deal') || line.includes('Deal')) {
      if (line.includes('save') || line.includes('update') || line.includes('create') || line.includes('add') || line.includes('Select') || line.includes('onChange')) {
        console.log(`${filepath} L${idx + 1}: ${line.trim()}`);
      }
    }
  });
};

searchInFile('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\CRMSection.tsx');
searchInFile('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\SalesSection.tsx');
