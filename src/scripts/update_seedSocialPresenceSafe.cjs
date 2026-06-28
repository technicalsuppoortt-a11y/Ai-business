const fs = require('fs');
const file = 'src/services/seedSocialPresence.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/strategy:/g, 'strategy_ar:');
content = content.replace(/bio:/g, 'bio_ar:');
content = content.replace(/tips:/g, 'tips_ar:');
content = content.replace(/ideas:/g, 'ideas_ar:');

content = content.replace(/strategy_ar:\s*\"([^\"]+)\",/g, (match, p1) => {
  return match + '\n        strategy_en: \"' + p1 + '\",';
});

content = content.replace(/bio_ar:\s*\`([^\`]+)\`,/g, (match, p1) => {
  return match + '\n        bio_en: \`' + p1 + '\`,';
});

content = content.replace(/tips_ar:\s*\[([\s\S]*?)\]/g, (match, p1) => {
  return match + ',\n        tips_en: [' + p1 + ']';
});

content = content.replace(/ideas_ar:\s*\[([\s\S]*?)\]/g, (match, p1) => {
  return match + ',\n        ideas_en: [' + p1 + ']';
});

fs.writeFileSync(file, content);
console.log('Safely modified seedSocialPresence.js');
