import { db, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query } from "../firebase.js";
import { serverTimestamp } from "../firebase.js";
import { buildWhere } from "../utils.js";
import { LIGA_ID } from "../constants.js";

const L = (p="") => `ligas/${LIGA_ID}/arbitros${p}`;

export async function listArbitros(filters={}){
  const col = collection(db, L(""));
  const q = buildWhere(filters);
  const snap = await getDocs(q.length?query(col, ...q):col);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function getArbitro(id){
  const snap = await getDoc(doc(db, L(`/${id}`)));
  return snap.exists()?{id:snap.id,...snap.data()}:null;
}

export async function createArbitro(data){
  if(!data.nombre || !data.nombre.trim()) throw new Error('Nombre requerido');
  const payload = {
    nombre: data.nombre.trim(),
    telefono: data.telefono || "",
    email: data.email || "",
    delegacionId: data.delegacionId || "",
    activo: data.activo !== false,
    ligaId: LIGA_ID,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  };
  const ref = await addDoc(collection(db, L("")), payload);
  return ref;
}

export async function updateArbitro(id, data){
  data.actualizadoEn = serverTimestamp();
  await updateDoc(doc(db, L(`/${id}`)), data);
}

export async function deleteArbitro(id){
  await deleteDoc(doc(db, L(`/${id}`)));
}
