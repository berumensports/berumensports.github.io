import { db, collection, doc, getDocs, setDoc, serverTimestamp, query, where } from "../firebase.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

const T = (p="")=>`ligas/${LIGA_ID}/t/${TEMP_ID}${p}`;

export async function listTarifas(){
  const snap = await getDocs(collection(db, T('/tarifas')));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}
export async function upsertTarifa(data){
  const col = collection(db, T('/tarifas'));
  const q = query(col, where('rama','==',data.rama), where('categoria','==',Number(data.categoria)));
  const snap = await getDocs(q);
  const id = snap.docs[0]?.id || doc(col).id;
  await setDoc(doc(db, T(`/tarifas/${id}`)), {
    ...data,
    categoria: Number(data.categoria),
    monto: Number(data.monto),
    ligaId: LIGA_ID,
    tempId: TEMP_ID,
    creadoEn: snap.docs[0]? undefined : serverTimestamp(),
    actualizadoEn: serverTimestamp()
  }, { merge: true });
  return id;
}
