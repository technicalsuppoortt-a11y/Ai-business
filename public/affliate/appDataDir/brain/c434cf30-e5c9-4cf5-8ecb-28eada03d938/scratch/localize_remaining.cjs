const fs = require('fs');
const filePath = 'd:/Froent_end_Courses/FreeLancer/joepartner-portal/src/pages/tabs/BookingSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('translateText("make it round", "make it round")', 'translateText("اجعلها دائرية", "Make it round")');
content = content.replace('translateText("account", "account")', 'translateText("الحساب", "Account")');
content = content.replace('translateText("42 Anywhere St", "42 Anywhere St")', 'translateText("42 شارع رئيسي", "42 Anywhere St")');
content = content.replace('translateText("Add a location option", "Add a location option")', 'translateText("إضافة خيار موقع", "Add a location option")');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Localised remaining calls successfully.');
