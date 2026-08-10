const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Left pane space-y-6 -> space-y-4
content = content.replace('space-y-6 w-full flex flex-col items-center', 'space-y-4 w-full flex flex-col items-center');

// 2. Logo/name block gap-4 -> gap-2.5
content = content.replace('flex flex-col items-center gap-4 text-center', 'flex flex-col items-center gap-2.5 text-center');

// 3. Selected slot summary p-4 space-y-2 -> p-3.5 space-y-1.5
content = content.replace('className="bg-white/20 border border-white/30 rounded-2xl p-4 space-y-2 text-white text-center flex flex-col items-center justify-center w-full"', 'className="bg-white/20 border border-white/30 rounded-2xl p-3.5 space-y-1.5 text-white text-center flex flex-col items-center justify-center w-full"');

// 4. Right pane p-6 md:p-8 -> p-5 md:p-6
content = content.replace('className="md:col-span-7 p-6 md:p-8 bg-white/40 dark:bg-slate-900/40 md:order-2"', 'className="md:col-span-7 p-5 md:p-6 bg-white/40 dark:bg-slate-900/40 md:order-2"');

// 5. Confirmation form space-y-4 -> space-y-3
content = content.replace('<form onSubmit={handleConfirm} className="space-y-4">', '<form onSubmit={handleConfirm} className="space-y-3">');

// 6. Location option container inside confirmation form space-y-4 -> space-y-3
content = content.replace('className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50"', 'className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50"');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Spacing adjusted successfully!');
