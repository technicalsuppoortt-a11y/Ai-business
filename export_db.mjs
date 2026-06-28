import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
  authDomain: "event-upklick.firebaseapp.com",
  projectId: "event-upklick",
  storageBucket: "event-upklick.firebasestorage.app",
  messagingSenderId: "430249494103",
  appId: "1:430249494103:web:816e0c03a70d8bf2bb8512"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToExport = [
  'tc_product_ideas_v2',
  'tc_social_presence_matrix',
  'tc_email_sequences_v2',
  'tc_ad_creatives_v2',
  'tc_task_templates',
  'tc_freelance_ai'
];

async function exportDB() {
  console.log("Starting export...");
  const exportedData = {};

  for (const col of collectionsToExport) {
    console.log(`Exporting collection: ${col}`);
    const colRef = collection(db, col);
    const snap = await getDocs(colRef);
    exportedData[col] = {};
    snap.forEach(doc => {
      exportedData[col][doc.id] = doc.data();
    });
    console.log(`Exported ${snap.size} documents from ${col}`);
  }

  fs.writeFileSync('C:/Users/sheri/.gemini/antigravity-ide/brain/f8fba469-08af-4c64-9e8d-d907217d9dca/scratch/db_dump.json', JSON.stringify(exportedData, null, 2));
  console.log("Export complete! Saved to db_dump.json");
  process.exit(0);
}

exportDB().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});
