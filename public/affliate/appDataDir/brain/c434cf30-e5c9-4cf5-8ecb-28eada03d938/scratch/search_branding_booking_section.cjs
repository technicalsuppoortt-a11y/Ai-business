const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Mohamed Joe') || line.includes('Joe Partner') || line.includes('displayBranding') || line.includes('brand') || line.includes('Brand')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
