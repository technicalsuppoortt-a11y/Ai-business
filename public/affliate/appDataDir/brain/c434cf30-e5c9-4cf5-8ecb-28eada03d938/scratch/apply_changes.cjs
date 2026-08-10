const fs = require('fs');

// --- 1. BookingSection.tsx changes ---
const bookingSectionPath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let bsContent = fs.readFileSync(bookingSectionPath, 'utf8');

// A. Translate Show/Hide advanced configuration & Password protect
bsContent = bsContent.replace(
  /"Show advanced configuration",\s*"Show advanced configuration"/g,
  '"إظهار الإعدادات المتقدمة", "Show advanced configuration"'
);
bsContent = bsContent.replace(
  /"Hide advanced configuration",\s*"Hide advanced configuration"/g,
  '"إخفاء الإعدادات المتقدمة", "Hide advanced configuration"'
);
bsContent = bsContent.replace(
  /"Password protect your booking page",\s*"Password protect your booking page"/g,
  '"حماية صفحة الحجز بكلمة مرور", "Password protect your booking page"'
);

// B. English-only slug generation in name field onChange
const originalOnChange = /if \(editingCalendarId === null\) \{\s*const generatedSlug = val\s*\.toLowerCase\(\)\s*\.replace\(\/\[\^\\p\{L\}\\p\{N\}-\]\/gu, "-"\)\s*\.replace\(\/-\+\/g, "-"\)\s*\.replace\(\/\^-[-]\+\|-[-]\+\$\/g, ""\);\s*setCalendarSlug\(generatedSlug\);\s*\}/;
const newOnChange = `if (!val.trim()) {
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

if (bsContent.includes('const generatedSlug = val')) {
  // Let's do a direct replace of the block around calendarName onChange
  bsContent = bsContent.replace(
    /if \(editingCalendarId === null\) \{\s*const generatedSlug = val[\s\S]*?setCalendarSlug\(generatedSlug\);\s*\}/g,
    newOnChange
  );
  console.log('Updated onChange slug generation logic.');
} else {
  console.log('onChange slug generation block not found, trying fallback regex...');
}

// C. Sanitization of slug in saveCalendar to be English-only
const saveSlugTarget = /let slug = calendarSlug\.trim\(\);\s*slug = slug\s*\?\s*slug\s*\.toLowerCase\(\)\s*\.replace\(\/\[\^\\p\{L\}\\p\{N\}-\]\/gu, "-"\)\s*\.replace\(\/-\+\/g, "-"\)\s*\.replace\(\/\^-[-]\+\|-[-]\+\$\/g, ""\)\s*\.slice\(0, 50\)\s*:\s*calendarName\s*\.toLowerCase\(\)\s*\.replace\(\/\[\^\\p\{L\}\\p\{N\}-\]\/gu, "-"\)\s*\.replace\(\/-\+\/g, "-"\)\s*\.replace\(\/\^-[-]\+\|-[-]\+\$\/g, ""\)\s*\.slice\(0, 50\);/;

const newSaveSlug = `let slug = calendarSlug.trim();
    slug = slug
      ? slug
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50)
      : calendarName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50);

    if (!slug || slug === "-") {
      slug = \`booking-\${Date.now().toString().slice(-4)}\`;
    }`;

if (bsContent.includes('.replace(/[^\\p{L}\\p{N}-]/gu')) {
  bsContent = bsContent.replace(
    /let slug = calendarSlug\.trim\(\);[\s\S]*?\.slice\(0, 50\);/g,
    newSaveSlug
  );
  console.log('Updated saveCalendar slug sanitization logic.');
}

// D. Table border: left or right only based on isRtl (width 10px)
const tableBorderTarget = /style=\{\{\s*borderLeft:\s*`8px solid \${getCalendarColorById\(booking\.calendarId\)}`,\s*borderRight:\s*`8px solid \${getCalendarColorById\(booking\.calendarId\)}`,\s*\}\}/;
const tableBorderReplacement = `style={{
                                  borderLeft: isRtl
                                    ? undefined
                                    : \`10px solid \${getCalendarColorById(booking.calendarId)}\`,
                                  borderRight: isRtl
                                    ? \`10px solid \${getCalendarColorById(booking.calendarId)}\`
                                    : undefined,
                                }}`;

if (tableBorderTarget.test(bsContent)) {
  bsContent = bsContent.replace(tableBorderTarget, tableBorderReplacement);
  console.log('Updated incoming booking table cell border to be single (10px wide).');
} else {
  console.log('Incoming booking table border target not found!');
}

fs.writeFileSync(bookingSectionPath, bsContent, 'utf8');

// --- 2. PublicBooking.tsx changes ---
const publicBookingPath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let pbContent = fs.readFileSync(publicBookingPath, 'utf8');

// A. Remove absolute branding block
const absoluteBrandingRegex = /\{\/\* Branding - Show project branding \(Mandatory Mohamed Joe Brand\) \*\/\}\s*<div className="absolute bottom-4 left-1\/2 -translate-x-1\/2 z-40 flex items-center gap-1\.5 bg-slate-900\/60 backdrop-blur-md px-3\.5 py-1\.5 rounded-full border border-white\/10 shadow-lg">[\s\S]*?<\/div>/;

if (absoluteBrandingRegex.test(pbContent)) {
  pbContent = pbContent.replace(absoluteBrandingRegex, '');
  console.log('Removed absolute branding badge.');
} else {
  console.log('Absolute branding badge NOT found!');
}

// B. Append branding block before closing tag of main page container
const endTarget = /<\/AnimatePresence>\s*<\/div>\s*<\/div>/;
const endTargetWithBranding = `</AnimatePresence>

      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}
      {!isPreviewPath && (
        <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
            M
          </div>
          <span className="text-[10px] text-white/70 font-semibold tracking-wide">
            Mohamed Joe Brand
          </span>
        </div>
      )}
    </div>`;

// Let's replace the last outer </div> closing (before return / exports)
const lastDivRegex = /<\/AnimatePresence>\s*<\/div>(?=\s*);\s*\}/;
if (lastDivRegex.test(pbContent)) {
  pbContent = pbContent.replace(lastDivRegex, `</AnimatePresence>\n\n      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}\n      {!isPreviewPath && (\n        <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg z-40 mx-auto w-fit">\n          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">\n            M\n          </div>\n          <span className="text-[10px] text-white/70 font-semibold tracking-wide">\n            Mohamed Joe Brand\n          </span>\n        </div>\n      )}\n    </div>`);
  console.log('Appended branding badge to page bottom.');
} else {
  console.log('Closing page container div not found.');
}

// C. Update outer container styling to be flex-col and remove overflow-hidden
const containerRegex = /className=\{isPreviewPath \s*\? "w-full h-full p-0 flex items-center justify-center relative overflow-hidden bg-transparent" \s*: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"\}/;

const newContainerStyle = `className={isPreviewPath 
        ? "w-full h-full p-0 flex flex-col items-center justify-center relative overflow-hidden bg-transparent" 
        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center relative"}`;

if (containerRegex.test(pbContent)) {
  pbContent = pbContent.replace(containerRegex, newContainerStyle);
  console.log('Updated page container to flex-col and removed overflow-hidden.');
} else {
  console.log('Outer container style regex not found, doing exact match replace...');
  pbContent = pbContent.replace(
    'className={isPreviewPath \n        ? "w-full h-full p-0 flex items-center justify-center relative overflow-hidden bg-transparent" \n        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"}',
    newContainerStyle
  );
}

fs.writeFileSync(publicBookingPath, pbContent, 'utf8');

console.log('All changes applied successfully!');
