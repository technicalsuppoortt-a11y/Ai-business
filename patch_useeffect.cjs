const fs = require('fs');
const path = require('path');
const dir = 'src/pages/Tools/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('useEffect') && !content.match(/import React.*?useEffect.*?from/s)) {
    // Find the import React line
    const importReactRegex = /import React[^{]*{([^}]*)}[^'\"]*['\"]react['\"];/;
    const match = content.match(importReactRegex);
    
    if (match) {
        let inner = match[1];
        if (!inner.includes('useEffect')) {
            let newInner = inner + ', useEffect';
            let newImport = match[0].replace(inner, newInner);
            content = content.replace(match[0], newImport);
            fs.writeFileSync(filePath, content);
            console.log(`Patched ${f}`);
        }
    } else {
        // If it doesn't have destructuring, like import React from 'react';
        if (content.match(/import React from ['\"]react['\"];/)) {
            content = content.replace(/import React from ['\"]react['\"];/, "import React, { useEffect } from 'react';");
            fs.writeFileSync(filePath, content);
            console.log(`Patched ${f} (added destructured)`);
        }
    }
  }
});
console.log('All missing useEffect imports patched!');
