const fs = require('fs');
const path = 'src/pages/Tools/components/SmartAIAssistant.jsx';
let code = fs.readFileSync(path, 'utf8');

// Find the handleSaveToWorkspace button
let searchToken = 'onClick={handleSaveToWorkspace}';
let idx = code.indexOf(searchToken);
if (idx !== -1) {
    let btnStart = code.lastIndexOf('<button', idx);
    let btnEnd = code.indexOf('</button>', idx) + 9;
    
    if (btnStart !== -1 && btnEnd !== -1) {
        let btnCode = code.substring(btnStart, btnEnd);
        code = code.replace(btnCode, '');
        fs.writeFileSync(path, code);
        console.log("Removed dock button");
    } else {
        console.log("Could not find button boundaries");
    }
} else {
    console.log("Could not find search token");
}
