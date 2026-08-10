const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/PublicBooking.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 1530; i < 1850; i++) {
  console.log(`L${i+1}: ${lines[i]}`);
}
