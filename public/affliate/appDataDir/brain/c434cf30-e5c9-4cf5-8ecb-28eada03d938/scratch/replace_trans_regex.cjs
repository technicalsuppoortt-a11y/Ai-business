const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace Set one or multiple durations options
content = content.replace(/"Set one or multiple durations options\.",\s*"Set one or multiple durations options\."/g, '"حدد خياراً واحداً أو خيارات مدة متعددة.", "Set one or multiple durations options."');

// Replace Add a duration option
content = content.replace(/"Add a duration option",\s*"Add a duration option"/g, '"إضافة خيار مدة", "Add a duration option"');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Regex replacements done!');
