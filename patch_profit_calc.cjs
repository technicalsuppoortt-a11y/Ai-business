const fs = require('fs');
const path = 'src/pages/Tools/components/ProfitCalculator.jsx';
let code = fs.readFileSync(path, 'utf8');

// Add useRef
if (!code.includes('useRef')) {
  code = code.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect, useRef } from "react";'
  );
}

// Add RefreshCw
if (!code.includes('RefreshCw')) {
  code = code.replace(
    /from "lucide-react";/,
    '  RefreshCw,\n} from "lucide-react";'
  );
}

fs.writeFileSync(path, code);
console.log('Successfully patched ProfitCalculator (useRef and RefreshCw)!');
