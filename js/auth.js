import { auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";
import { LIGA_ID, TEMP_ID } from "./constants.js";

export async function register(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

export async function ensureUserProfile(user = auth.currentUser) {
  if (!user) return;
  const ref = doc(db, `ligas/${LIGA_ID}/usuarios/${user.uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      role: 'consulta',
      ligaId: LIGA_ID,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  }
}

export async function ensureTemporada() {
  const ref = doc(db, `ligas/${LIGA_ID}/temporada/${TEMP_ID}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      tempId: TEMP_ID,
      nombre: `Temporada ${TEMP_ID}`,
      fechaInicio: serverTimestamp(),
      fechaFin: serverTimestamp(),
      activa: true,
      ligaId: LIGA_ID,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  }
}

export let currentProfile = null;

export function watchAuth(cb) {
  return onAuthStateChanged(auth, async (user) => {
    let profile = null;
    if (user) {
      await ensureUserProfile(user);
      const userRef = doc(db, `ligas/${LIGA_ID}/usuarios/${user.uid}`);
      const snap = await getDoc(userRef);
      profile = snap.data();
      if (profile?.role === 'admin') {
        await ensureTemporada();
      }
    }
    currentProfile = profile;
    cb(user, profile);
  });
}
