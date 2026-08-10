const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

const oldDeleteBtn = `                              <button
                                type="button"
                                disabled={weekdayAvailability.length <= 1}
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title={translateText("حذف", "Delete")}
                              >`.split('\n').map(l => l.trimEnd()).join(nl);

const newDeleteBtn = `                              <button
                                type="button"
                                onClick={() => {
                                  setWeekdayAvailability(
                                    weekdayAvailability.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="text-red-450 hover:text-red-650 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                title={translateText("حذف", "Delete")}
                              >`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldDeleteBtn)) {
  content = content.replace(oldDeleteBtn, newDeleteBtn);
  console.log('Re-enabled delete button for single element.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldDeleteBtn.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...newDeleteBtn.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Re-enabled delete button for single element (normalized approach).');
  } else {
    console.log('Could not find old delete button block to replace!');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
