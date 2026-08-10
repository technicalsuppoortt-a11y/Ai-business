const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Match the last </AnimatePresence> followed by </div>\s*);\s*}
// We match both \r\n and \n line endings
const match = content.match(/<\/AnimatePresence>(\r?\n)\s*<\/div>(\r?\n)\s*\);(\r?\n)\s*\}/);

if (match) {
  const nl = match[1]; // Get matched newline character
  const replacement = `</AnimatePresence>${nl}${nl}      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}${nl}      {!isPreviewPath && (${nl}        <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">${nl}          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">${nl}            M${nl}          </div>${nl}          <span className="text-[10px] text-white/70 font-semibold tracking-wide">${nl}            Mohamed Joe Brand${nl}          </span>${nl}        </div>${nl}      )}${nl}    </div>${nl}  );${nl}}`;

  content = content.replace(/<\/AnimatePresence>(\r?\n)\s*<\/div>(\r?\n)\s*\);(\r?\n)\s*\}/, replacement);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully added bottom branding!');
} else {
  console.log('Match NOT found for ending block!');
}
