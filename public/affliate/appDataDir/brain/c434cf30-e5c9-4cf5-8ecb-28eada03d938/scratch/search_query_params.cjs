const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/PublicBooking.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('SearchParams') || line.includes('location.search') || line.includes('URLSearchParams')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
