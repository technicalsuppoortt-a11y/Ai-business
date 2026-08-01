const fs = require('fs');

const path = 'src/pages/Tools/components/SocialIntegration.jsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('RefreshCw,')) {
  code = code.replace(
    'Layers\n} from \'lucide-react\';',
    'Layers,\n    RefreshCw\n} from \'lucide-react\';'
  );
  fs.writeFileSync(path, code);
  console.log('Successfully added RefreshCw to SocialIntegration.jsx');
} else {
  console.log('RefreshCw already exists.');
}
