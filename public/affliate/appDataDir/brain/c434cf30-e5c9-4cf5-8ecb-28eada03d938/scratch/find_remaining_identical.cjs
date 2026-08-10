const fs = require('fs');

const filePath = 'd:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const translateRegex = /translateText\s*\(\s*(['"`])(.*?)\1\s*,\s*(['"`])(.*?)\3\s*\)/g;

let match;
const remaining = [];
while ((match = translateRegex.exec(content)) !== null) {
  if (match[2] === match[4]) {
    remaining.push(match[0]);
  }
}

console.log('Remaining identical calls:', remaining.length);
if (remaining.length > 0) {
  console.log(JSON.stringify(remaining, null, 2));
}
