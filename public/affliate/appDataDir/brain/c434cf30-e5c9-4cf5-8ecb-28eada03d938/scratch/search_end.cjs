const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\PublicBooking.tsx', 'utf8');
const end = content.substring(content.length - 200);
console.log(JSON.stringify(end));
