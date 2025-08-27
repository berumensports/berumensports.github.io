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
let cachedRole = null;
let cachedName = null;

export function getUserRole() {
  if (cachedRole) return cachedRole;
  const ls = localStorage.getItem('userRole');
  if (ls) return cachedRole = ls;
  return null;
}

export async function fetchUserInfo(uid) {
  const ref = doc(db, 'users', uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { role: 'consulta' });
      cachedRole = 'consulta';
      cachedName = '';
    } else {
      const data = snap.data();
      cachedRole = data.role;
      cachedName = data.nombre || '';
    }
    localStorage.setItem('userRole', cachedRole);
    return { role: cachedRole, nombre: cachedName };
  } catch (err) {
    console.error('Failed to fetch user role', err);
    if (err.code === 'permission-denied') {
      await logout();
      return null;
    }
    cachedRole = 'consulta';
    cachedName = '';
    localStorage.setItem('userRole', cachedRole);
    return { role: cachedRole, nombre: cachedName };
  }
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
