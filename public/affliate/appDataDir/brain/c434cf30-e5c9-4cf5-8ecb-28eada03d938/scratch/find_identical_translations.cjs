const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', 'utf8');

const regex = /translateText\(\s*"(.*?)"\s*,\s*"(.*?)"\s*\)/g;
let match;
const matches = [];

while ((match = regex.exec(content)) !== null) {
  if (match[1] === match[2]) {
    // Check if it's English (doesn't contain Arabic letters)
    if (!/[\u0600-\u06FF]/.test(match[1])) {
      matches.push({ line: content.substring(0, match.index).split('\n').length, text: match[1] });
    }
  }
}

console.log(`Found ${matches.length} matches:`);
matches.forEach((m) => {
  console.log(`L${m.line}: ${m.text}`);
});
