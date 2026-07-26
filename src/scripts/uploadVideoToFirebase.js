import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

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
const storage = getStorage(app);

async function uploadVideo() {
  try {
    const videoPath = path.resolve('src/assets/video.mp4');
    console.log('Reading video file from:', videoPath);
    const fileBuffer = fs.readFileSync(videoPath);

    const storageRef = ref(storage, 'landing_videos/platform_demo.mp4');
    console.log('Uploading 78MB video to Firebase Storage (landing_videos/platform_demo.mp4)...');

    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: 'video/mp4'
    });
    console.log('Upload successful! Metadata:', snapshot.metadata.fullPath);

    const downloadURL = await getDownloadURL(storageRef);
    console.log('\n=============================================');
    console.log('🔥 FIREBASE STORAGE VIDEO DOWNLOAD URL:');
    console.log(downloadURL);
    console.log('=============================================\n');
  } catch (error) {
    console.error('Upload Error:', error);
  }
}

uploadVideo();
