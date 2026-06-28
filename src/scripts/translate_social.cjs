const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, '../services/seedSocialPresence.js');
const enFile = path.join(__dirname, 'social_en.json');

let seedContent = fs.readFileSync(seedFile, 'utf8');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Loop through each platform and goal in enData and replace the English fields in seedContent
for (const [platform, goals] of Object.entries(enData)) {
  for (const [goal, fields] of Object.entries(goals)) {
    // fields: strategy_en, bio_en, tips_en, ideas_en

    // strategy_en
    if (fields.strategy_en) {
        // Regex to find: "strategy_en": "...", within the correct platform and goal context is tricky with regex.
        // It's safer to parse the object, but the file has JS exports. 
        // Let's use a simpler regex that replaces the specific `_en` keys inside the string based on matching.
        // Actually, since we know the exact Arabic text with [EN], we can just find and replace using regex.
    }
  }
}

// Better approach: Since seedSocialPresence.js starts with `const contentMap = {` and ends with `}; export const seedSocialPresence ...`
// We can extract the JSON part, parse it (it's JS, but mostly JSON compatible), modify it, and write it back.
// But it might not be strict JSON.

// Let's do string replacement for the _en fields.
// Since `seedSocialPresence.js` is nicely formatted, we can match:
/*
        "strategy_en": "...",
        "bio_en": `...`,
        "tips_en": [
            "...",
        ],
        "ideas_en": [
            "...",
        ]
*/

// Actually, the easiest way is to re-evaluate the file content in Node, modify the object, and stringify it!
const code = seedContent.split('export const seedSocialPresence')[0];
// code contains `import ... const contentMap = { ... };`
// Let's strip the import
let jsonStr = code.replace(/import.*?;/g, '').trim();
jsonStr = jsonStr.replace('const contentMap = ', '');
if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

// evaluate it
let contentMap;
eval('contentMap = ' + jsonStr);

// Now modify contentMap
for (const [platform, goals] of Object.entries(enData)) {
  for (const [goal, fields] of Object.entries(goals)) {
    if (contentMap[platform] && contentMap[platform][goal]) {
      contentMap[platform][goal].strategy_en = fields.strategy_en;
      contentMap[platform][goal].bio_en = fields.bio_en;
      contentMap[platform][goal].tips_en = fields.tips_en;
      contentMap[platform][goal].ideas_en = fields.ideas_en;
    }
  }
}

// Convert back to string
const newJsonStr = JSON.stringify(contentMap, null, 4);

// Reconstruct the file
const finalFileContent = `import { db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const contentMap = ${newJsonStr};

export const seedSocialPresence = async () => {
  console.log('⏳ Generating & Seeding Social Presence Matrix...');
  try {
    for (const [platform, goals] of Object.entries(contentMap)) {
      for (const [goal, data] of Object.entries(goals)) {
        const docId = \`\${platform}_\${goal}\`;
        const docRef = doc(db, 'social_presence_matrix', docId);
        
        await setDoc(docRef, {
          platform,
          goal,
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
    }
    console.log('✅ Successfully seeded Social Presence Matrix');
    alert('✅ تم تحديث بيانات استراتيجيات السوشيال ميديا بنجاح!');
  } catch (error) {
    console.error('❌ Error seeding Social Presence:', error);
    alert('❌ حدث خطأ أثناء تحديث البيانات.');
  }
};
`;

fs.writeFileSync(seedFile, finalFileContent);
console.log('✅ Successfully updated seedSocialPresence.js with English translations!');
