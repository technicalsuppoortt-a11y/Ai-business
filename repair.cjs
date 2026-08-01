const fs = require('fs');
const path = 'src/pages/Tools/components/SocialMedia.jsx';
let content = fs.readFileSync(path, 'utf8');

const badBlock = `    ]);
    
    saveResult(null);
  };
  // -------------------------------------

      label_ar: "كاتب السكريبت",`;

const repairBlock = `    ]);
    
    saveResult(null);
  };
  // -------------------------------------

  const subTools = [
    {
      id: "script-writer",
      label_ar: "كاتب السكريبت",`;

if (content.includes(badBlock)) {
    content = content.replace(badBlock, repairBlock);
    fs.writeFileSync(path, content);
    console.log("Repaired successfully.");
} else {
    console.log("Could not find bad block to repair.");
}
