const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Remove the old declaration near the top of the component
const oldDecl = `  const presetOptions = [
    { value: "Every day", label: translateText("كل يوم", "Every day") },
    { value: "Mon - Fri", label: translateText("من الإثنين إلى الجمعة", "Mon - Fri") },
    { value: "Sat - Sun", label: translateText("السبت والأحد", "Sat - Sun") },
    { value: "Monday", label: translateText("الإثنين", "Monday") },
    { value: "Tuesday", label: translateText("الثلاثاء", "Tuesday") },
    { value: "Wednesday", label: translateText("الأربعاء", "Wednesday") },
    { value: "Thursday", label: translateText("الخميس", "Thursday") },
    { value: "Friday", label: translateText("الجمعة", "Friday") },
    { value: "Saturday", label: translateText("السبت", "Saturday") },
    { value: "Sunday", label: translateText("الأحد", "Sunday") },
  ];`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldDecl)) {
  content = content.replace(oldDecl, '');
  console.log('Removed old presetOptions declaration successfully.');
} else {
  // Let's do a normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normOldDecl = oldDecl.replace(/\r\n/g, '\n');
  if (normContent.includes(normOldDecl)) {
    const startIdx = normContent.indexOf(normOldDecl);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normOldDecl.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount);
    content = lines.join(nl);
    console.log('Removed old presetOptions declaration successfully (normalized approach).');
  } else {
    console.log('Could not find old presetOptions declaration to remove.');
  }
}

// 2. Insert new declaration after translateText
const targetInsert = `  const translateText = (arabicText: string, englishText: string) =>
    isRtl ? arabicText : englishText;`.split('\n').map(l => l.trimEnd()).join(nl);

const newDecl = `${nl}  const presetOptions = [
    { value: "Every day", label: translateText("كل يوم", "Every day") },
    { value: "Mon - Fri", label: translateText("من الإثنين إلى الجمعة", "Mon - Fri") },
    { value: "Sat - Sun", label: translateText("السبت والأحد", "Sat - Sun") },
    { value: "Monday", label: translateText("الإثنين", "Monday") },
    { value: "Tuesday", label: translateText("الثلاثاء", "Tuesday") },
    { value: "Wednesday", label: translateText("الأربعاء", "Wednesday") },
    { value: "Thursday", label: translateText("الخميس", "Thursday") },
    { value: "Friday", label: translateText("الجمعة", "Friday") },
    { value: "Saturday", label: translateText("السبت", "Saturday") },
    { value: "Sunday", label: translateText("الأحد", "Sunday") },
  ];`;

if (content.includes(targetInsert)) {
  content = content.replace(targetInsert, targetInsert + newDecl.split('\n').join(nl));
  console.log('Inserted new presetOptions declaration successfully.');
} else {
  console.log('Could not find target insertion point!');
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
