const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 2180; i < 2279; i++) {
  console.log(`L${i+1}: ${lines[i]}`);
}
