import { getApps, getApp, initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { initializeFirestore, getFirestore, setLogLevel } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

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
