const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Remove the advertisement question
const adBlockRegex = /\{\/\* Source of Access Question \*\/\}\s*<div className="text-center bg-slate-50\/50 dark:bg-slate-900\/30 p-4 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm space-y-3">[\s\S]*?<\/div>/;

if (adBlockRegex.test(content)) {
  content = content.replace(adBlockRegex, '');
  console.log('Access question removed.');
} else {
  console.log('Access question NOT found!');
}

// 2. Remove the original absolute branding block
const originalBrandingBlock = `      {/* Branding - Show project branding */}
      {calendar.displayBranding && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={companyName || "Brand Logo"}
              className="w-4 h-4 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
              {(companyName || "JP").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[10px] text-white/70 font-semibold tracking-wide">
            {companyName || "Joe Partner"}
          </span>
        </div>
      )}`;

const isCrLf = content.includes('\r\n');
const targetBrandingBlock = isCrLf ? originalBrandingBlock.replace(/\n/g, '\r\n') : originalBrandingBlock;

if (content.includes(targetBrandingBlock)) {
  content = content.replace(targetBrandingBlock, '');
  console.log('Removed original dynamic branding block.');
} else {
  console.log('Original dynamic branding block NOT found!');
}

// 3. Update the container style to flex-col and remove overflow-hidden
const originalContainer = `      className={isPreviewPath 
        ? "w-full h-full p-0 flex items-center justify-center relative overflow-hidden bg-transparent" 
        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"}`;

const targetContainer = isCrLf ? originalContainer.replace(/\n/g, '\r\n') : originalContainer;
const newContainer = `      className={isPreviewPath 
        ? "w-full h-full p-0 flex flex-col items-center justify-center relative overflow-hidden bg-transparent" 
        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center relative"}`;
const replacementContainer = isCrLf ? newContainer.replace(/\n/g, '\r\n') : newContainer;

if (content.includes(targetContainer)) {
  content = content.replace(targetContainer, replacementContainer);
  console.log('Updated container layout.');
} else {
  console.log('Container layout NOT found!');
}

// 4. Append branding block before closing tag of main page container
const originalEnd = `      </AnimatePresence>
    </div>
  );
}`;

const targetEnd = isCrLf ? originalEnd.replace(/\n/g, '\r\n') : originalEnd;
const newEnd = `      </AnimatePresence>

      {/* Branding - Show project branding */}
      {calendar.displayBranding && (
        <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={companyName || "Brand Logo"}
              className="w-4 h-4 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
              {(companyName || "JP").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[10px] text-white/70 font-semibold tracking-wide">
            {companyName || "Joe Partner"}
          </span>
        </div>
      )}
    </div>
  );
}`;
const replacementEnd = isCrLf ? newEnd.replace(/\n/g, '\r\n') : newEnd;

if (content.includes(targetEnd)) {
  content = content.replace(targetEnd, replacementEnd);
  console.log('Appended branding block.');
} else {
  console.log('Ending block NOT found!');
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
