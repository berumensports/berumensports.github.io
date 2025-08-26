import { getApps, getApp, initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
setLogLevel('error');

export const db = getFirestore(app);
export const auth = getAuth(app);
