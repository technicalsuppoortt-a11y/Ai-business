const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Marketing/MarketingTrackingSection.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove interfaces and declare global block
content = content.replace(/declare global \{[\s\S]*?\}/g, '');
content = content.replace(/interface [a-zA-Z0-9_]+ (extends [a-zA-Z0-9_]+ )?\{[\s\S]*?\}/g, '');

// 2. Fix component signature
content = content.replace(/export default function MarketingTrackingSection\(\{ isAdmin, userId, isRtl, t \}: Props\) \{/, 'export default function MarketingTrackingSection({ isAdmin, userId, isRtl, t }) {');

// 3. Remove useState typings
content = content.replace(/useState<[^>]+>\(/g, 'useState(');
content = content.replace(/useRef<[^>]+>\(/g, 'useRef(');

// 4. Fix other typings like `userId: string`, `dir: 1 | -1`, etc.
content = content.replace(/\(dir: 1 \| -1\)/g, '(dir)');
content = content.replace(/\(eventName: string, payload: Record<string, unknown> = \{\}\)/g, '(eventName, payload = {})');
content = content.replace(/\(en: string, ar: string\)/g, '(en, ar)');
content = content.replace(/\(index: number\)/g, '(index)');
content = content.replace(/\(e: React\.ChangeEvent<HTMLInputElement>\)/g, '(e)');
content = content.replace(/\(e: React\.KeyboardEvent<HTMLInputElement>\)/g, '(e)');
content = content.replace(/\(id: string\)/g, '(id)');
content = content.replace(/\(value: number, currency = "USD", payload: Record<string, unknown> = \{\}\)/g, '(value, currency = "USD", payload = {})');
content = content.replace(/\(userId: string, traits: Record<string, unknown> = \{\}\)/g, '(userId, traits = {})');
content = content.replace(/Record<string, unknown>/g, 'Object');

// 5. Fix imports and add toast adapter
content = content.replace(/import \{ toast \} from "sonner";/, 'import { useToast } from "../../../context/ToastContext";');
content = content.replace(/export default function MarketingTrackingSection\(\{ isAdmin, userId, isRtl, t \}\) \{/, `export default function MarketingTrackingSection({ isAdmin, userId, isRtl, t }) {\n  const showToast = useToast();\n  const toast = {\n    success: (msg) => showToast(msg, 'success'),\n    error: (msg) => showToast(msg, 'error')\n  };`);

// 6. Fix `const activeUserId = userId || auth\?\.currentUser\?\.uid;`
// Wait, that's valid JS

fs.writeFileSync(filePath, content);
console.log("Done fixing file.");
