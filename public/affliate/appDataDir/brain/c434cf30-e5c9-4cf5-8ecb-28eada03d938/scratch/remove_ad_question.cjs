const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const adBlockRegex = /\{\/\* Source of Access Question \*\/\}\s*<div className="text-center bg-slate-50\/50 dark:bg-slate-900\/30 p-4 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm space-y-3">[\s\S]*?<\/div>\s*<\/div>/;

if (adBlockRegex.test(content)) {
  content = content.replace(adBlockRegex, '');
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Access question removed successfully!');
} else {
  // Let's try without the trailing </div> if it doesn't match
  const adBlockRegexAlt = /\{\/\* Source of Access Question \*\/\}\s*<div className="text-center bg-slate-50\/50 dark:bg-slate-900\/30 p-4 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm space-y-3">[\s\S]*?<\/div>/;
  if (adBlockRegexAlt.test(content)) {
    content = content.replace(adBlockRegexAlt, '');
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Access question (alt) removed successfully!');
  } else {
    console.log('Access question block NOT found!');
  }
}
