const fs = require('fs');
const content = fs.readFileSync('d:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx', 'utf8');
const lines = content.split('\n');

const targets = [
  "Set one or multiple durations options.",
  "Add a duration option",
  "How many people can book the same time",
  "Limit by a fixed date range",
  "Invitee can select one of the following",
  "Follow-up email after meeting",
  "Redirect visitor after booking",
  "Allow self-cancel/reschedule",
  "Show 'Book another' button",
  "Send booking data to external systems"
];

lines.forEach((line, idx) => {
  targets.forEach(target => {
    if (line.toLowerCase().includes(target.toLowerCase().trim())) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
});
