import { db, collection, doc, getDoc, getDocs, addDoc, updateDoc, serverTimestamp, query } from "../firebase.js";
import { buildWhere } from "../utils.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

const T = (p="")=>`ligas/${LIGA_ID}/t/${TEMP_ID}${p}`;

export async function listCobros(filters={}){
  const col = collection(db, T('/cobros'));
  const q = buildWhere(filters);
  const snap = await getDocs(q.length?query(col,...q):col);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function registrarAbono(cobroId, data){
  const abRef = collection(db, T(`/cobros/${cobroId}/abonos`));
  await addDoc(abRef, {
    ...data,
    monto: Number(data.monto),
    ligaId: LIGA_ID,
    tempId: TEMP_ID,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  await recalcSaldo(cobroId);
}

export async function recalcSaldo(cobroId){
  const cobroRef = doc(db, T(`/cobros/${cobroId}`));
  const cobroSnap = await getDoc(cobroRef);
  if(!cobroSnap.exists()) return;
  const cobro = cobroSnap.data();
  const abSnap = await getDocs(collection(db, T(`/cobros/${cobroId}/abonos`)));
  const abonado = abSnap.docs.reduce((s,d)=>s+(d.data().monto||0),0);
  const saldo = cobro.montoTotal - abonado;
  let estatus = 'pendiente';
  if(saldo<=0) estatus='cubierto'; else if(abonado>0) estatus='parcial';
  await updateDoc(cobroRef,{saldo,estatus,actualizadoEn:serverTimestamp()});
}
export async function crearCobroDesdePartido(partidoId){
  const pRef = doc(db, T(`/partidos/${partidoId}`));
  const pSnap = await getDoc(pRef);
  if(!pSnap.exists()) throw new Error('Partido no encontrado');
  const p = pSnap.data();
  const ref = await addDoc(collection(db, T('/cobros')), {
    partidoId,
    equipoDeudorId: p.localId,
    equipoNombre: p.localNombre,
    delegacionId: p.delegacionId,
    fechaEmision: serverTimestamp(),
    montoTotal: p.tarifaAplicada || 0,
    descuento:0, recargos:0,
    saldo: p.tarifaAplicada || 0,
    estatus:'pendiente',
    ligaId:LIGA_ID,
    tempId:TEMP_ID,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
  return ref.id;
}
