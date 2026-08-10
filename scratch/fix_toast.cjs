const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Marketing/MarketingTrackingSection.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace import
content = content.replace(
  /import \{ toast \} from "sonner";/,
  'import { useToast } from "../../../context/ToastContext";'
);

// Inject toast inside component
content = content.replace(
  /function MarketingTrackingSection\(\{ isAdmin, userId, isRtl, t \}\) \{/,
  `function MarketingTrackingSection({ isAdmin, userId, isRtl, t }) {
  const showToast = useToast();
  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error')
  };`
);

// Remove the remaining declare global block and typings that were left behind if any
// (No typings should be there because esbuild removed them, except esbuild leaves JS alone)

fs.writeFileSync(filePath, content);
console.log("Done fixing toast.");
