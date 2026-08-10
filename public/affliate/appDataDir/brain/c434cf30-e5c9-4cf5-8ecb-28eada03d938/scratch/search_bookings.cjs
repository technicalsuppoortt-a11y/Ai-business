const fs = require('fs');

function searchFile(path, pattern) {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      console.log(`${path} - L${index + 1}: ${line.trim()}`);
    }
  });
}

console.log('Searching for Brand/Joe/Branding...');
searchFile('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', /brand|logo|joe|showBranding/i);
searchFile('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/PublicBooking.tsx', /brand|logo|joe|showBranding/i);
