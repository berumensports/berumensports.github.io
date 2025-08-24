import { db, collection, doc, getDocs, addDoc, updateDoc, serverTimestamp, query } from "../firebase.js";
import { buildWhere } from "../utils.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

const T = (p="")=>`ligas/${LIGA_ID}/t/${TEMP_ID}${p}`;

export async function listPartidos(filters={}){
  const col = collection(db, T('/partidos'));
  const q = buildWhere(filters);
  const snap = await getDocs(q.length?query(col,...q):col);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function createPartido(data){
  data.ligaId=LIGA_ID; data.tempId=TEMP_ID; data.estado=data.estado||'programado';
  data.creadoEn=serverTimestamp(); data.actualizadoEn=serverTimestamp();
  return addDoc(collection(db,T('/partidos')), data);
}
export async function updatePartido(id,data){
  data.actualizadoEn=serverTimestamp();
  return updateDoc(doc(db,T(`/partidos/${id}`)), data);
}
export async function cerrarPartido(id,data){
  data.estado='jugado';
  data.actualizadoEn=serverTimestamp();
  return updateDoc(doc(db,T(`/partidos/${id}`)), data);
}
