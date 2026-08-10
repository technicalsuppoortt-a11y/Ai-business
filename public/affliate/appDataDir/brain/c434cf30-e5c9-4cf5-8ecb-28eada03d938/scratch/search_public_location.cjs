const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/PublicBooking.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('locationOptions') || line.includes('selectedLocation')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
