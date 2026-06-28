const fs = require('fs');
const file = 'src/services/seedSocialPresence.js';
let content = fs.readFileSync(file, 'utf8');

// Add _ar suffixes to keys
content = content.replace(/strategy: /g, 'strategy_ar: ');
content = content.replace(/bio: /g, 'bio_ar: ');
content = content.replace(/tips: /g, 'tips_ar: ');
content = content.replace(/ideas: /g, 'ideas_ar: ');

// Duplicate with _en keys
content = content.replace(/strategy_ar: (["'\`].*?["'\`]),/g, (match, p1) => {
  return match + '\n        strategy_en: ' + p1 + ',';
});

content = content.replace(/bio_ar: ([\`].*?[\`]),/gs, (match, p1) => {
  return match + '\n        bio_en: ' + p1 + ',';
});

content = content.replace(/tips_ar: (\[.*?\]),/gs, (match, p1) => {
  return match + '\n        tips_en: ' + p1 + ',';
});

content = content.replace(/ideas_ar: (\[.*?\])/gs, (match, p1) => {
  return match + '\n        ideas_en: ' + p1;
});

fs.writeFileSync(file, content);
console.log('Modified seedSocialPresence.js with english keys (duplicated for now to prevent errors)');
