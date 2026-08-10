const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx', 'utf8');
const lines = content.split('\n');
for (let idx = 2600; idx <= 4400; idx++) {
  const line = lines[idx];
  if (line && (line.includes('slug') || line.includes('Slug') || line.includes('BASE_BOOKING_URL') || line.includes('الرابط'))) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
}
