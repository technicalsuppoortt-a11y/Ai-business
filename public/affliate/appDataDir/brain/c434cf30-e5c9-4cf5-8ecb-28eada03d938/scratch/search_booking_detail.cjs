const fs = require('fs');
const content = fs.readFileSync('d:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('openBookingDetail') || line.includes('selectedBooking') || line.includes('isDetailModalOpen') || line.includes('DetailModal')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
