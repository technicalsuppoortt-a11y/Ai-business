const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 400; i < 600; i++) {
  const line = lines[i];
  if (line.includes('availability') || line.includes('Availability')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}
