const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const target = 'className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"';
const replacement = 'className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center relative"';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully updated container styling!');
} else {
  console.log('Target container styling NOT found!');
}
