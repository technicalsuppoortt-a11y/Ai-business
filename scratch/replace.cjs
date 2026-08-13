const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
for (const file of files) {
    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(file, 'utf8');
        
        let newContent = content.replace(/lang\s*===\s*['"]ar['"]/g, "lang?.startsWith('ar')");
        newContent = newContent.replace(/language\s*===\s*['"]ar['"]/g, "language?.startsWith('ar')");
        
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Updated', file);
        }
    }
}
