const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Marketing/MarketingTrackingSection.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the imports
content = content.replace(
  /import \{ db, firestore, isFirebaseMocked, auth \} from "\.\.\/\.\.\/config\/firebase";/,
  'import { db, auth } from "../../firebase";\nimport { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";'
);

// Replace firestore method calls
content = content.replace(/firestore\.doc\(/g, 'doc(');
content = content.replace(/firestore\.getDoc\(/g, 'getDoc(');
content = content.replace(/firestore\.setDoc\(/g, 'setDoc(');
content = content.replace(/firestore\.updateDoc\(/g, 'updateDoc(');
content = content.replace(/firestore\.onSnapshot\(/g, 'onSnapshot(');

// Remove isFirebaseMocked references (if any) or replace with false
content = content.replace(/isFirebaseMocked/g, 'false');

fs.writeFileSync(filePath, content);
console.log("Done fixing firebase imports.");
