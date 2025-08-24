import { db, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query } from "../firebase.js";
import { serverTimestamp } from "../firebase.js";
import { buildWhere } from "../utils.js";
import { LIGA_ID } from "../constants.js";

const L = (p="") => `ligas/${LIGA_ID}${p}`;

export async function listEquipos(filters={}){
  const col = collection(db, L('/equipos'));
  const q = buildWhere(filters);
  const snap = await getDocs(q.length?query(col, ...q):col);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function createEquipo(data){
  data.ligaId = LIGA_ID;
  data.creadoEn = serverTimestamp();
  data.actualizadoEn = serverTimestamp();
  const ref = await addDoc(collection(db, L('/equipos')), data);
  return ref;
}
export async function updateEquipo(id,data){
  data.actualizadoEn = serverTimestamp();
  await updateDoc(doc(db,L(`/equipos/${id}`)), data);
}
export async function deleteEquipo(id){
  await deleteDoc(doc(db,L(`/equipos/${id}`)));
}
