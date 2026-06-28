// Script to read all Firestore collections and dump their structure
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
  authDomain: "event-upklick.firebaseapp.com",
  projectId: "event-upklick",
  storageBucket: "event-upklick.firebasestorage.app",
  messagingSenderId: "430249494103",
  appId: "1:430249494103:web:816e0c03a70d8bf2bb8512",
  measurementId: "G-WZ3K99ZS3H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToCheck = [
  'niches', 'ideas', 'plans', 'names', 'pages',
  'hooks', 'offers', 'ads', 'content', 'brands',
  'users', 'templates', 'strategies', 'case_studies',
  'branding', 'growth', 'settings', 'config',
  'categories', 'sub_niches', 'frameworks',
  'psychology', 'triggers', 'cta', 'slogans',
  'colors', 'tones', 'audiences', 'positioning',
  'pricing', 'guarantees', 'testimonials',
  'ad_hooks', 'ad_creatives', 'campaigns',
  'workflows', 'automations', 'clients',
  'niche_data', 'brand_names', 'content_hooks',
  'offer_structures', 'ad_ideas', 'growth_strategies',
  'products', 'orders', 'subscriptions', 'events',
  'articles', 'blog', 'posts', 'media', 'files',
  'reports', 'analytics', 'logs', 'notifications',
  'members', 'teams', 'roles', 'permissions',
  'projects', 'tasks', 'milestones', 'invoices',
  'landingPages', 'landing_pages', 'website_templates',
  'brand_library', 'documents', 'brand_assets',
  'sub_niches_data', 'product_types', 'market_data',
];

async function readCollections() {
  const result = {};
  
  for (const colName of collectionsToCheck) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) continue;
      
      result[colName] = {
        count: snapshot.size,
        documents: []
      };
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Truncate very long strings (like landingPageCode)
        const cleanData = {};
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.length > 300) {
            cleanData[key] = value.substring(0, 300) + '...[TRUNCATED]';
          } else {
            cleanData[key] = value;
          }
        }
        result[colName].documents.push({
          id: docSnap.id,
          data: cleanData
        });
      });
    } catch (err) {
      // silently skip
    }
  }
  
  const output = JSON.stringify(result, null, 2);
  writeFileSync('src/scratch/firestore_dump.json', output);
  console.log('Saved to src/scratch/firestore_dump.json');
  console.log('Collections found:', Object.keys(result).join(', '));
  console.log('Total docs:', Object.values(result).reduce((sum, c) => sum + c.count, 0));
  process.exit(0);
}

readCollections().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
