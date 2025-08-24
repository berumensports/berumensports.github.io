import { db, collection, addDoc, getDocs, query, where, orderBy } from "../firebase.js";
import { serverTimestamp } from "../firebase.js";
import { auth } from "../firebase.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

const T = (p="") => `ligas/${LIGA_ID}/t/${TEMP_ID}/pagos_arbitros${p}`;

export async function listPagos({arbitroId, desde, hasta}={}){
  const col = collection(db, T(""));
  const q = [];
  if(arbitroId) q.push(where('arbitroId','==',arbitroId));
  if(desde) q.push(where('fecha','>=',desde));
  if(hasta) q.push(where('fecha','<=',hasta));
  q.push(orderBy('fecha','desc'));
  const snap = await getDocs(q.length?query(col,...q):col);
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function createPago({arbitroId, fecha, monto, metodo, referencia}){
  const user = auth.currentUser;
  const data = {
    arbitroId,
    fecha,
    monto: Number(monto),
    metodo,
    referencia: referencia || "",
    usuarioId: user?.uid || "",
    usuarioEmail: user?.email || "",
    ligaId: LIGA_ID,
    tempId: TEMP_ID,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  };
  await addDoc(collection(db, T("")), data);
}

export async function sumPagos({arbitroId, desde, hasta}={}){
  const pagos = await listPagos({arbitroId, desde, hasta});
  return pagos.reduce((s,p)=>s+(p.monto||0),0);
}
