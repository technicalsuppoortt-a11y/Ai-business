const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('handleSaveCalendar') || line.includes('setCalendarSlug') || line.includes('slug:') || line.includes('calendarSlug')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
