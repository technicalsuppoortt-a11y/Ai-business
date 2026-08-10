const fs = require('fs');
let data = fs.readFileSync('D:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Admin/AdminDashboardPage.jsx', 'utf8');

data = data.replace(
  /\n(\s*)—(\s*\n\s*<\/span>\s*\n\s*<\/}*\s*\n\s*<\/td>\s*\n\s*<td style=\{\{ textAlign: "center" \}\}>\s*\n\s*\{isPending \? \()/g,
  '\n$1{state.language === "en" ? "No receipt" : "لا يوجد إيصال"}$2'
);

// Fallback if the strict regex above doesn't match due to exact whitespace:
if (!data.includes('No receipt')) {
    data = data.replace(
      />—</g,
      '>{state.language === "en" ? "No receipt" : "لا يوجد إيصال"}<'
    );
}

fs.writeFileSync('D:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Admin/AdminDashboardPage.jsx', data);
