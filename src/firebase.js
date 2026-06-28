import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
  authDomain: "event-upklick.firebaseapp.com",
  projectId: "event-upklick",
  storageBucket: "event-upklick.firebasestorage.app",
  messagingSenderId: "430249494103",
  appId: "1:430249494103:web:816e0c03a70d8bf2bb8512",
  measurementId: "G-WZ3K99ZS3H"
};

// Create 3 independent apps to allow multiple login sessions on the same domain
const app = initializeApp(firebaseConfig);
const adminApp = initializeApp(firebaseConfig, 'admin-portal');
const superAdminApp = initializeApp(firebaseConfig, 'superadmin-portal');

export const db = getFirestore(app);
export const storage = getStorage(app);

// Independent Auth instances
export const auth = getAuth(app);
export const adminAuth = getAuth(adminApp);
export const superAdminAuth = getAuth(superAdminApp);

export default app;
