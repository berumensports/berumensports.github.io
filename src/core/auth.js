import {
  db,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
} from '../data/firebase.js';

const LIGA_ID = 'BERUMEN';
let cachedRole = null;

export function getUserRole() {
  if (cachedRole) return cachedRole;
  const ls = localStorage.getItem('userRole');
  if (ls) return cachedRole = ls;
  return null;
}

export async function fetchUserRole(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { role: 'consulta', ligaId: LIGA_ID });
    cachedRole = 'consulta';
  } else {
    cachedRole = snap.data().role;
  }
  localStorage.setItem('userRole', cachedRole);
  return cachedRole;
}

export function login(email, password) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}
export function logout() {
  const auth = getAuth();
  cachedRole = null;
  localStorage.removeItem('userRole');
  return signOut(auth);
}
export function onAuth(cb) {
  const auth = getAuth();
  onAuthStateChanged(auth, cb);
}
