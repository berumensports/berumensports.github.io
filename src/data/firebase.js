import { getApps, getApp, initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { initializeFirestore, getFirestore, setLogLevel } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

// TODO: replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAW04kavFwGnaRJkLkHWD50WKHaxamekSU",
  authDomain: "berumen-sports.firebaseapp.com",
  projectId: "berumen-sports",
  storageBucket: "berumen-sports.appspot.com",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
setLogLevel('error');

export const db = getFirestore(app);
export const auth = getAuth(app);
