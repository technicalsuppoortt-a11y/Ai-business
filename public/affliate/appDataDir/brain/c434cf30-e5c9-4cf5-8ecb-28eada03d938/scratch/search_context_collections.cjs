const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\context\\StateContext.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('collection(') || line.includes('onSnapshot') || line.includes('deals') || line.includes('packages')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
