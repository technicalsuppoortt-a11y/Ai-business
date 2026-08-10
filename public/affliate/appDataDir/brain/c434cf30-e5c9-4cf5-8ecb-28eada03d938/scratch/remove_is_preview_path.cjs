const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const target = `      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}
      {!isPreviewPath && (
        <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
            M
          </div>
          <span className="text-[10px] text-white/70 font-semibold tracking-wide">
            Mohamed Joe Brand
          </span>
        </div>
      )}`;

const replacement = `      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}
      <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
          M
        </div>
        <span className="text-[10px] text-white/70 font-semibold tracking-wide">
          Mohamed Joe Brand
        </span>
      </div>`;

const isCrLf = content.includes('\r\n');
const targetStr = target.split('\n').map(l => l.trimEnd()).join(isCrLf ? '\r\n' : '\n');
const replacementStr = replacement.split('\n').map(l => l.trimEnd()).join(isCrLf ? '\r\n' : '\n');

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully removed isPreviewPath check!');
} else {
  console.log('Target block NOT found!');
}
