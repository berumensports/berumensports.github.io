import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { LIGA_ID, TEMP_ID } from './constants.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAW04kavFwGnaRJkLkHWD50WKHaxamekSU',
  authDomain: 'berumen-sports.firebaseapp.com',
  projectId: 'berumen-sports',
  storageBucket: 'berumen-sports.appspot.com',
  messagingSenderId: '718432709224',
  appId: '1:718432709224:web:2659163e0f68c43f30a9dd'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Persist authentication between tabs and reloads
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);

export const signOut = () => fbSignOut(auth);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, collection, getCountFromServer, serverTimestamp };

export function onAuthChanged(cb){
  return onAuthStateChanged(auth, cb);
}

export async function ensureUserProfile(){
  const u = auth.currentUser;
  if (!u) return;
  const ref = doc(db, `ligas/${LIGA_ID}/usuarios/${u.uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref,{email:u.email,role:'consulta',creado:serverTimestamp()});
}

export async function ensureTemporada(){
  const ref = doc(db, `ligas/${LIGA_ID}/temporada/${TEMP_ID}`);
  const snap = await getDoc(ref);
  if(!snap.exists()) await setDoc(ref,{creado:serverTimestamp()});
}

export async function userRole(){
  const uid = auth.currentUser?.uid;
  if(!uid) return 'consulta';
  const ref = doc(db, `ligas/${LIGA_ID}/usuarios/${uid}`);
  const snap = await getDoc(ref);
  return snap.exists()? (snap.data().role||'consulta') : 'consulta';
}

window.__FIREBASE_APP_OPTIONS__ = app.options;

export async function runDiag(){
  const deleg = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/delegaciones`));
  const eq = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/equipos`));
  const tarifas = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`));
  const partidos = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`));
  const cobros = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
  console.table({delegaciones:deleg.data().count,equipos:eq.data().count,tarifas:tarifas.data().count,partidos:partidos.data().count,cobros:cobros.data().count});
}
window.runDiag = runDiag;
