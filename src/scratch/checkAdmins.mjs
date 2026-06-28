import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function run() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.role === 'admin') {
      console.log(`ID: ${docSnap.id}`);
      console.log(`- brandName: ${data.brandName}`);
      console.log(`- brandUrl: ${data.brandUrl}`);
      console.log(`- ownerName: ${data.ownerName}`);
      console.log(`- brandSlug: ${data.brandSlug}`);
      console.log(`- plans: ${JSON.stringify(data.plans)}`);
      console.log('---');
    }
  });
  process.exit(0);
}
run();
