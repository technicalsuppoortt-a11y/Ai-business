const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Exact string match for the original absolute branding block
const originalBrandingBlock = `      {/* Branding - Show project branding (Mandatory Mohamed Joe Brand) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
          M
        </div>
        <span className="text-[10px] text-white/70 font-semibold tracking-wide">
          Mohamed Joe Brand
        </span>
      </div>`;

// Try both \r\n and \n line endings
const normContent = content.replace(/\r\n/g, '\n');
const normBlock = originalBrandingBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normBlock)) {
  // We can do the replace on the original content by converting the block's newlines to match the file's newlines
  const isCrLf = content.includes('\r\n');
  const targetBlock = isCrLf ? originalBrandingBlock.replace(/\n/g, '\r\n') : originalBrandingBlock;
  content = content.replace(targetBlock, '');
  console.log('Removed original branding block successfully.');
} else {
  console.log('Original branding block NOT found!');
}

// 2. Exact string match for container styling
const originalContainer = `      className={isPreviewPath 
        ? "w-full h-full p-0 flex items-center justify-center relative overflow-hidden bg-transparent" 
        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center relative overflow-hidden"}`;

const targetContainer = content.includes('\r\n') ? originalContainer.replace(/\n/g, '\r\n') : originalContainer;
const newContainer = `      className={isPreviewPath 
        ? "w-full h-full p-0 flex flex-col items-center justify-center relative overflow-hidden bg-transparent" 
        : "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center relative"}`;
const replacementContainer = content.includes('\r\n') ? newContainer.replace(/\n/g, '\r\n') : newContainer;

if (content.includes(targetContainer)) {
  content = content.replace(targetContainer, replacementContainer);
  console.log('Updated container layout successfully.');
} else {
  console.log('Container layout NOT found!');
}

// 3. Exact string match for the end block to append branding
const originalEnd = `      </AnimatePresence>
    </div>
  );
}`;

const targetEnd = content.includes('\r\n') ? originalEnd.replace(/\n/g, '\r\n') : originalEnd;
const newEnd = `      </AnimatePresence>

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
    </div>
  );
}`;
const replacementEnd = content.includes('\r\n') ? newEnd.replace(/\n/g, '\r\n') : newEnd;

if (content.includes(targetEnd)) {
  content = content.replace(targetEnd, replacementEnd);
  console.log('Appended branding block successfully.');
} else {
  console.log('Ending block NOT found!');
}

fs.writeFileSync(filepath, content, 'utf8');
