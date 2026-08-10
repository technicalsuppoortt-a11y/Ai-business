const fs = require('fs');
const file = 'D:/Froent_end_Courses/FreeLancer/Ai-business/src/pages/Admin/AdminDashboardPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/instapay: \{ enabled: false, address: "" \},[\s\S]*?paypal: \{ enabled: false, email: "" \},[\s\S]*?paddle: \{[\s\S]*?\},/g, '');
content = content.replace(/const \[showPaddleManual, setShowPaddleManual\] = useState\(false\);\n/, '');
content = content.replace(/const isPaddleOAuth =[\s\S]*?searchParams\.get\("state"\) === "PADDLE_OAUTH";/, '');
content = content.replace(/if \(isPaddleOAuth\) \{[\s\S]*?\}\n        \}/, '');
content = content.replace(/const handlePaddleConnect = \(\) => \{[\s\S]*?const \[isSyncingStripe, setIsSyncingStripe\] = useState\(false\);/, 'const [isSyncingStripe, setIsSyncingStripe] = useState(false);');
content = content.replace(/const \[showPaddleKey, setShowPaddleKey\] = useState\(false\);\n/, '');
content = content.replace(/const \[paddleModalTab, setPaddleModalTab\] = useState\("settings"\);[^\n]*\n/, '');
content = content.replace(/const \[isTestingPaddle, setIsTestingPaddle\] = useState\(false\);\n/, '');
content = content.replace(/const \[paddleTestSuccess, setPaddleTestSuccess\] = useState\(false\);\n/, '');
content = content.replace(/const handleValidatePaddle = async \(\) => \{[\s\S]*?setIsPaddleValidating\(false\);\n    \}\n  \};\n/, '');
content = content.replace(/\{\/\* Environment Filter like User Management Status \*\/\}[\s\S]*?<\/div>\n                    <\/div>/, '</div>');
content = content.replace(/\{p\.paddlePriceId && \([\s\S]*?Paddle ID: \{p\.paddlePriceId\}[\s\S]*?<\/div>\n                      \)\}/, '');
content = content.replace(/loadedPM = \{\n            instapay: \{ \.\.\.DEFAULTS\.instapay, \.\.\.\(pmData\.instapay \|\| \{\}\) \},[\s\S]*?paddle: \{ \.\.\.DEFAULTS\.paddle, \.\.\.\(pmData\.paddle \|\| \{\}\) \},\n          \};/, 'loadedPM = {\n            stripe: { ...DEFAULTS.stripe, ...(pmData.stripe || {}) },\n            manualMethods: pmData.manualMethods || DEFAULTS.manualMethods,\n          };');

fs.writeFileSync(file, content, 'utf8');
console.log('Regex replacements executed successfully!');
