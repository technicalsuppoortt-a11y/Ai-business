const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

const target = `const { state, updateState, fmtMoney } = useAppState();`;

const duplicateHelpers = `  const handleDuplicateWeekday = (item: WeekdayAvailability) => {
    setWeekdayAvailability([
      ...weekdayAvailability,
      {
        id: Date.now() + Math.random(),
        day: item.day,
        start: item.start,
        end: item.end,
      }
    ]);
  };

  const handleDuplicateSpecificDate = (item: any) => {
    setSpecificDateAvailability([
      ...specificDateAvailability,
      {
        id: Date.now() + Math.random(),
        date: item.date,
        start: item.start,
        end: item.end,
      }
    ]);
  };`;

if (!content.includes('const handleDuplicateWeekday')) {
  content = content.replace(target, target + nl + duplicateHelpers.split('\n').join(nl));
  console.log('Inserted duplicate helpers robustly.');
} else {
  console.log('Helpers already exist.');
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
