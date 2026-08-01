const fs = require('fs');

const path = 'src/pages/Tools/components/SocialIntegration.jsx';
let code = fs.readFileSync(path, 'utf8');

if (code.includes('import React, { useState, useEffect } from \'react\';')) {
  code = code.replace(
    'import React, { useState, useEffect } from \'react\';',
    'import React, { useState, useEffect, useRef } from \'react\';'
  );
  fs.writeFileSync(path, code);
  console.log('Successfully added useRef to SocialIntegration.jsx');
} else {
  console.log('Could not find the exact import string. Please check manually.');
}
