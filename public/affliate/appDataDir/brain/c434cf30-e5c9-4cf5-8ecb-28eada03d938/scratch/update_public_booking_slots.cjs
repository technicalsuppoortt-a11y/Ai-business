const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

const oldFilter = `    const specificDateEntries = (calendar.specificDateAvailability || []).filter(
      (entry: any) => entry.date === dateStr,
    );`.split('\n').map(l => l.trimEnd()).join(nl);

const newFilter = `    const specificDateEntries = (calendar.specificDateAvailability || []).filter((entry: any) => {
      if (!entry.date) return false;
      if (entry.date.includes("_to_")) {
        const [start, end] = entry.date.split("_to_");
        return dateStr >= start && dateStr <= end;
      }
      return entry.date === dateStr;
    });`;

const targetBlock = oldFilter;
const replacementBlock = newFilter.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replacementBlock);
  console.log('Replaced specific date filter in PublicBooking.tsx successfully.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldFilter.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...newFilter.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Replaced specific date filter in PublicBooking.tsx successfully (normalized approach).');
  } else {
    console.log('Could not find target filter block in PublicBooking.tsx!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
