const fs = require('fs');

const path = 'src/pages/Tools/components/SocialIntegration.jsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('RefreshCw')) {
  // Replace Layers with Layers, RefreshCw at the end of the lucide-react import
  const newCode = code.replace(/Layers\s*\}\s*from\s*'lucide-react';/, "Layers,\n  RefreshCw\n} from 'lucide-react';");
  
  if (code !== newCode) {
    fs.writeFileSync(path, newCode);
    console.log('Successfully added RefreshCw to SocialIntegration.jsx');
  } else {
    console.log('Failed to replace string.');
  }
} else {
  console.log('RefreshCw already exists.');
}
