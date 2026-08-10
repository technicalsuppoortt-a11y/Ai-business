const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace 1
const target1 = `                                 <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                   {translateText(
                                     "Set one or multiple durations options.",
                                     "Set one or multiple durations options.",
                                   )}
                                 </div>`;
const replacement1 = `                                 <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                   {translateText(
                                     "حدد خياراً واحداً أو خيارات مدة متعددة.",
                                     "Set one or multiple durations options.",
                                   )}
                                 </div>`;

// Try both CRLF and LF
if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
} else {
  const target1crlf = target1.replace(/\n/g, '\r\n');
  const replacement1crlf = replacement1.replace(/\n/g, '\r\n');
  content = content.replace(target1crlf, replacement1crlf);
}

// Replace 2
const target2 = `                                   <span>
                                     {translateText(
                                       "Add a duration option",
                                       "Add a duration option",
                                     )}
                                   </span>`;
const replacement2 = `                                   <span>
                                     {translateText(
                                       "إضافة خيار مدة",
                                       "Add a duration option",
                                     )}
                                   </span>`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
} else {
  const target2crlf = target2.replace(/\n/g, '\r\n');
  const replacement2crlf = replacement2.replace(/\n/g, '\r\n');
  content = content.replace(target2crlf, replacement2crlf);
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
