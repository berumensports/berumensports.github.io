import { db, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "../firebase.js";
import { LIGA_ID } from "../constants.js";

const L = (p="")=>`ligas/${LIGA_ID}${p}`;

export async function listDelegaciones(){
  const snap = await getDocs(collection(db, L('/delegaciones')));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function create(data){
  data.ligaId=LIGA_ID; data.creadoEn=serverTimestamp(); data.actualizadoEn=serverTimestamp();
  return addDoc(collection(db,L('/delegaciones')), data);
}
export async function update(id,data){
  data.actualizadoEn=serverTimestamp();
  return updateDoc(doc(db,L(`/delegaciones/${id}`)), data);
}
export async function remove(id){
  return deleteDoc(doc(db,L(`/delegaciones/${id}`)));
}
