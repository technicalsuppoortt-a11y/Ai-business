const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Remove the advertisement question
const originalAdBlock = `                      {/* Source of Access Question */}
                      <div className="text-center bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm space-y-3">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block text-center">
                          {translateText("هل مصدر الوصول من الإعلان؟", "Is the source of access from the advertisement?")} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3 justify-center">
                          <button
                            type="button"
                            onClick={() => setFromAd(true)}
                            className={\`flex-1 max-w-[140px] py-2.5 rounded-xl border text-xs font-bold transition-all \${
                              fromAd === true
                                ? "bg-purple-600 border-purple-605 text-white shadow-md shadow-purple-500/20"
                                : "bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                            }\`}
                          >
                            {translateText("نعم", "Yes")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFromAd(false)}
                            className={\`flex-1 max-w-[140px] py-2.5 rounded-xl border text-xs font-bold transition-all \${
                              fromAd === false
                                ? "bg-purple-600 border-purple-605 text-white shadow-md shadow-purple-500/20"
                                : "bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                            }\`}
                          >
                            {translateText("لا", "No")}
                          </button>
                        </div>
                      </div>`;

const targetAdBlock = originalAdBlock.split('\n').map(l => l.trimEnd()).join(nl);
if (content.includes(targetAdBlock)) {
  content = content.replace(targetAdBlock, '');
  console.log('Removed advertisement question block.');
} else {
  // Let's try matching with normalized content
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedAdBlock = originalAdBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normalizedContent.includes(normalizedAdBlock)) {
    // Reconstruct exact string from content lines
    const startIdx = normalizedContent.indexOf(normalizedAdBlock);
    const length = normalizedAdBlock.length;
    // Since normalizedContent is shorter (no \r), we can use a direct search and replace
    const lines = content.split(/\r?\n/);
    const startLineIdx = normalizedContent.substring(0, startIdx).split('\n').length - 1;
    const adLinesCount = normalizedAdBlock.split('\n').length;
    lines.splice(startLineIdx, adLinesCount);
    content = lines.join(nl);
    console.log('Removed advertisement question block (normalized line approach).');
  } else {
    console.log('Advertisement question block NOT found!');
  }
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

const targetBrandingBlock = originalBrandingBlock.split('\n').map(l => l.trimEnd()).join(nl);
if (content.includes(targetBrandingBlock)) {
  content = content.replace(targetBrandingBlock, '');
  console.log('Removed original absolute branding block.');
} else {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedBrandingBlock = originalBrandingBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normalizedContent.includes(normalizedBrandingBlock)) {
    const startIdx = normalizedContent.indexOf(normalizedBrandingBlock);
    const lines = content.split(/\r?\n/);
    const startLineIdx = normalizedContent.substring(0, startIdx).split('\n').length - 1;
    const brandingLinesCount = normalizedBrandingBlock.split('\n').length;
    lines.splice(startLineIdx, brandingLinesCount);
    content = lines.join(nl);
    console.log('Removed original absolute branding block (normalized line approach).');
  } else {
    console.log('Original absolute branding block NOT found!');
  }
}

// 3. Update the container style to flex-col and remove overflow-hidden
const targetContainerStyle = `className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"`;
const replacementContainerStyle = `className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center relative"`;

if (content.includes(targetContainerStyle)) {
  content = content.replace(targetContainerStyle, replacementContainerStyle);
  console.log('Updated container styling.');
} else {
  console.log('Container styling target NOT found!');
}

// 4. Append branding block at the end of the container
const originalEnd = `      </AnimatePresence>
    </div>
  );
}`;

const targetEnd = originalEnd.split('\n').map(l => l.trimEnd()).join(nl);
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

const replacementEnd = newEnd.split('\n').map(l => l.trimEnd()).join(nl);
if (content.includes(targetEnd)) {
  content = content.replace(targetEnd, replacementEnd);
  console.log('Appended dynamic branding block at the bottom.');
} else {
  console.log('Ending block NOT found!');
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
