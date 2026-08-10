const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('<input') || line.includes('<textarea') || line.includes('placeholder=')) {
    if (index >= 2400 && index <= 3500) {
      console.log(`L${index + 1}: ${line.trim()}`);
    }
  }
});
