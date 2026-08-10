const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace border styling
const borderTarget = /style=\{\{\s*borderLeft:\s*isRtl[\s\S]*?\}\}/;
const borderReplacement = `style={{
                                  borderLeft: \`8px solid \${getCalendarColorById(booking.calendarId)}\`,
                                  borderRight: \`8px solid \${getCalendarColorById(booking.calendarId)}\`,
                                }}`;

if (borderTarget.test(content)) {
  content = content.replace(borderTarget, borderReplacement);
  console.log('Border styling replaced successfully!');
} else {
  console.log('Border styling target NOT found!');
}

// Replace Eye icon button with ChevronUp / ChevronDown collapse arrows
const eyeTarget = /<Eye className="w-4 h-4" \/>/;
const eyeReplacement = `{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}`;

if (eyeTarget.test(content)) {
  content = content.replace(eyeTarget, eyeReplacement);
  console.log('Eye icon replaced successfully!');
} else {
  console.log('Eye icon target NOT found!');
}

fs.writeFileSync(filepath, content, 'utf8');
