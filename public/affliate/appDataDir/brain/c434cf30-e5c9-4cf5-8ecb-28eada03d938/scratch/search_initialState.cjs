const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\context\\initialState.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('packages:') || line.includes('deals:') || line.includes('appliedCommissionPercentage')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
