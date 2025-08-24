import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, onSnapshot, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { LIGA_ID, TEMP_ID } from "./constants.js";

const firebaseConfig = {
  apiKey: "AIzaSyAW04kavFwGnaRJkLkHWD50WKHaxamekSU",
  authDomain: "berumen-sports.firebaseapp.com",
  projectId: "berumen-sports",
  storageBucket: "berumen-sports.appspot.com",
  messagingSenderId: "718432709224",
  appId: "1:718432709224:web:2659163e0f68c43f30a9dd"
};

if (Object.values(firebaseConfig).some(v => !v)) {
  throw new Error("Missing Firebase configuration");
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getCountFromServer
};

window.__FIREBASE_APP_OPTIONS__ = app.options;

export async function runDiag() {
  console.log("Diagnóstico Firebase");
  const uid = auth.currentUser?.uid;
  if (uid) {
    const userDoc = await getDoc(doc(db, `ligas/${LIGA_ID}/usuarios/${uid}`));
    console.log("Perfil de usuario existe:", userDoc.exists());
  } else {
    console.log("Sin usuario autenticado");
  }
  const tempDoc = await getDoc(doc(db, `ligas/${LIGA_ID}/temporada`));
  console.log("Temporada existe:", tempDoc.exists());
  const delegaciones = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/delegaciones`));
  const equipos = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/equipos`));
  const tarifas = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`));
  const partidos = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`));
  const cobros = await getCountFromServer(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
  console.log(`Delegaciones: ${delegaciones.data().count}`);
  console.log(`Equipos: ${equipos.data().count}`);
  console.log(`Tarifas: ${tarifas.data().count}`);
  console.log(`Partidos: ${partidos.data().count}`);
  console.log(`Cobros: ${cobros.data().count}`);
}

window.runDiag = runDiag;
