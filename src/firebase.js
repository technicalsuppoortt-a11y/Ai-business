import { initializeApp, getApps, getApp } from 'firebase/app';
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

const receiptsFirebaseConfig = {
  apiKey: "AIzaSyCaswftcLmfIepG_F8fzizqGXFl5mnXvj8",
  authDomain: "aibrand-vision.firebaseapp.com",
  projectId: "aibrand-vision",
  storageBucket: "aibrand-vision.firebasestorage.app",
  messagingSenderId: "36898907108",
  appId: "1:36898907108:web:423352bb5b0f5825d65df1",
  measurementId: "G-G0CFX66Q3V"
};

// Create 3 independent apps to allow multiple login sessions on the same domain
const app = initializeApp(firebaseConfig);
const adminApp = initializeApp(firebaseConfig, 'admin-portal');
const superAdminApp = initializeApp(firebaseConfig, 'superadmin-portal');

export const db = getFirestore(app);
export const storage = getStorage(app);

// Receipts-specific Storage Instance
const receiptsApp = !getApps().some(a => a.name === "receiptsApp")
  ? initializeApp(receiptsFirebaseConfig, "receiptsApp")
  : getApp("receiptsApp");

export const receiptsStorage = getStorage(receiptsApp);

// Media Storage Instance (Images, Voice, Files)
const storageApp = getApps().find(app => app.name === "StorageApp") 
  || initializeApp(receiptsFirebaseConfig, "StorageApp");

export const mediaStorage = getStorage(storageApp);


// Independent Auth instances
export const auth = getAuth(app);
export const adminAuth = getAuth(adminApp);
export const superAdminAuth = getAuth(superAdminApp);

export default app;
