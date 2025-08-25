import {
  auth,
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getCountFromServer,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  runDiag
} from './firebase.js';
import { LIGA_ID, TEMP_ID } from './constants.js';
import { setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

setPersistence(auth, browserLocalPersistence);

export {
  auth,
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getCountFromServer,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  runDiag
};

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
