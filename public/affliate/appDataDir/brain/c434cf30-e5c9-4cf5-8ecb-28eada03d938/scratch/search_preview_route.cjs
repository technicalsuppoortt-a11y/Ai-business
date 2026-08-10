const fs = require('fs');
const files = ['d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/App.tsx', 'd:/Froent_end_Courses/FreeLancer/joepartner-portal/src/main.tsx'];
files.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('preview') || line.includes('PublicBooking')) {
        console.log(`${file} - L${index + 1}: ${line.trim()}`);
      }
    });
  }
});
