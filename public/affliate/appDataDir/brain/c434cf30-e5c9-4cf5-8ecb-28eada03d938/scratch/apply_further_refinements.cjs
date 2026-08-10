const fs = require('fs');

// --- 1. PublicBooking.tsx modifications ---
const pbPath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let pbContent = fs.readFileSync(pbPath, 'utf8');
const isPbCrLf = pbContent.includes('\r\n');
const pbNl = isPbCrLf ? '\r\n' : '\n';

// A. Remove fromAd validation block
const originalValidationBlock = `    // Validate fromAd required question
    if (fromAd === null) {
      toast.error(
        translateText(
          "يرجى تحديد مصدر الوصول (من الإعلان أم لا)",
          "Please select whether the source of access is from the advertisement or not"
        )
      );
      return;
    }`;

const targetValidationBlock = originalValidationBlock.split('\n').map(l => l.trimEnd()).join(pbNl);
if (pbContent.includes(targetValidationBlock)) {
  pbContent = pbContent.replace(targetValidationBlock, '');
  console.log('Removed fromAd validation block.');
} else {
  // Try normalized lines search
  const normPbContent = pbContent.replace(/\r\n/g, '\n');
  const normValBlock = originalValidationBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normPbContent.includes(normValBlock)) {
    const startIdx = normPbContent.indexOf(normValBlock);
    const lines = pbContent.split(/\r?\n/);
    const startLineIdx = normPbContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normValBlock.split('\n').length;
    lines.splice(startLineIdx, blockLinesCount);
    pbContent = lines.join(pbNl);
    console.log('Removed fromAd validation block (normalized approach).');
  } else {
    console.log('fromAd validation block NOT found!');
  }
}

// B. Replace the dynamic branding block with static Mohamed Joe Brand
const originalBrandingBlock = `      {/* Branding - Show project branding */}
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
      )}`;

const targetBrandingBlock = originalBrandingBlock.split('\n').map(l => l.trimEnd()).join(pbNl);
const newStaticBrandingBlock = `      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}
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

const replacementBrandingBlock = newStaticBrandingBlock.split('\n').map(l => l.trimEnd()).join(pbNl);

if (pbContent.includes(targetBrandingBlock)) {
  pbContent = pbContent.replace(targetBrandingBlock, replacementBrandingBlock);
  console.log('Replaced dynamic branding with static Mohamed Joe Brand.');
} else {
  const normPbContent = pbContent.replace(/\r\n/g, '\n');
  const normBrandingBlock = originalBrandingBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normPbContent.includes(normBrandingBlock)) {
    const startIdx = normPbContent.indexOf(normBrandingBlock);
    const lines = pbContent.split(/\r?\n/);
    const startLineIdx = normPbContent.substring(0, startIdx).split('\n').length - 1;
    const brandingLinesCount = normBrandingBlock.split('\n').length;
    lines.splice(startLineIdx, brandingLinesCount, ...newStaticBrandingBlock.split('\n').map(l => l.trimEnd()));
    pbContent = lines.join(pbNl);
    console.log('Replaced dynamic branding with static Mohamed Joe Brand (normalized approach).');
  } else {
    console.log('Original dynamic branding block NOT found!');
  }
}

fs.writeFileSync(pbPath, pbContent, 'utf8');

// --- 2. BookingSection.tsx modifications ---
const bsPath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let bsContent = fs.readFileSync(bsPath, 'utf8');
const isBsCrLf = bsContent.includes('\r\n');
const bsNl = isBsCrLf ? '\r\n' : '\n';

// A. Update title onChange auto generated slug fallback: "booking" -> "booking" + random 3 digit number
const oldOnChangeBlock = `if (!val.trim()) {
                              setCalendarSlug("");
                            } else if (editingCalendarId === null) {
                              let englishOnly = val
                                .toLowerCase()
                                .replace(/[^a-z0-9\\s-]/g, "")
                                .trim();
                              if (!englishOnly) {
                                englishOnly = "booking";
                              }
                              const generatedSlug = englishOnly
                                .replace(/\\s+/g, "-")
                                .replace(/-+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              setCalendarSlug(generatedSlug);
                            }`;

const newOnChangeBlock = `if (!val.trim()) {
                              setCalendarSlug("");
                            } else if (editingCalendarId === null) {
                              let englishOnly = val
                                .toLowerCase()
                                .replace(/[^a-z0-9\\s-]/g, "")
                                .trim();
                              if (!englishOnly) {
                                const randSuffix = Math.floor(100 + Math.random() * 900);
                                englishOnly = \`booking\${randSuffix}\`;
                              }
                              const generatedSlug = englishOnly
                                .replace(/\\s+/g, "-")
                                .replace(/-+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              setCalendarSlug(generatedSlug);
                            }`;

const targetOnChangeBlock = oldOnChangeBlock.split('\n').map(l => l.trimEnd()).join(bsNl);
const replacementOnChangeBlock = newOnChangeBlock.split('\n').map(l => l.trimEnd()).join(bsNl);

if (bsContent.includes(targetOnChangeBlock)) {
  bsContent = bsContent.replace(targetOnChangeBlock, replacementOnChangeBlock);
  console.log('Updated onChange slug generation logic with random 3-digit suffix.');
} else {
  // Normalized approach
  const normBs = bsContent.replace(/\r\n/g, '\n');
  const normTarget = oldOnChangeBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normBs.includes(normTarget)) {
    const startIdx = normBs.indexOf(normTarget);
    const lines = bsContent.split(/\r?\n/);
    const startLineIdx = normBs.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    lines.splice(startLineIdx, blockLinesCount, ...newOnChangeBlock.split('\n').map(l => l.trimEnd()));
    bsContent = lines.join(bsNl);
    console.log('Updated onChange slug generation logic (normalized approach).');
  } else {
    console.log('Old onChange slug block NOT found!');
  }
}

// B. Update saveCalendar slug fallback in BookingSection.tsx
const oldSaveFallback = `    if (!slug || slug === "-") {
      slug = \`booking-\${Date.now().toString().slice(-4)}\`;
    }`;

const newSaveFallback = `    if (!slug || slug === "-") {
      const randSuffix = Math.floor(100 + Math.random() * 900);
      slug = \`booking\${randSuffix}\`;
    }`;

const targetSaveFallback = oldSaveFallback.split('\n').map(l => l.trimEnd()).join(bsNl);
const replacementSaveFallback = newSaveFallback.split('\n').map(l => l.trimEnd()).join(bsNl);

if (bsContent.includes(targetSaveFallback)) {
  bsContent = bsContent.replace(targetSaveFallback, replacementSaveFallback);
  console.log('Updated saveCalendar slug fallback logic with random 3-digit suffix.');
} else {
  const normBs = bsContent.replace(/\r\n/g, '\n');
  const normTarget = oldSaveFallback.split('\n').map(l => l.trimEnd()).join('\n');
  if (normBs.includes(normTarget)) {
    const startIdx = normBs.indexOf(normTarget);
    const lines = bsContent.split(/\r?\n/);
    const startLineIdx = normBs.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    lines.splice(startLineIdx, blockLinesCount, ...newSaveFallback.split('\n').map(l => l.trimEnd()));
    bsContent = lines.join(bsNl);
    console.log('Updated saveCalendar slug fallback (normalized approach).');
  } else {
    console.log('Old saveCalendar fallback block NOT found!');
  }
}

fs.writeFileSync(bsPath, bsContent, 'utf8');
console.log('All refinements applied successfully!');
