const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Remove "free: calendarIsFree," and "price: Number(calendarPrice),"
const oldLines = `      free: calendarIsFree,
      price: Number(calendarPrice),`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldLines)) {
  content = content.replace(oldLines, '');
  console.log('Removed duplicate pricing keys in save payload.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldLines.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount);
    content = lines.join(nl);
    console.log('Removed duplicate pricing keys (normalized approach).');
  } else {
    console.log('Could not find target block to remove!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
