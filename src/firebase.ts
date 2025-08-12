import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAW04kavFwGnaRJkLkHWD50WKHaxamekSU',
  authDomain: 'berumen-sports.firebaseapp.com',
  projectId: 'berumen-sports',
  storageBucket: 'berumen-sports.firebasestorage.app',
  messagingSenderId: '718432709224',
  appId: '1:718432709224:web:2659163e0f68c43f30a9dd',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

