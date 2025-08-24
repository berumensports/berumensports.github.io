import { db, collection, getDocs, query, where, orderBy } from "../firebase.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

const T = (p="") => `ligas/${LIGA_ID}/t/${TEMP_ID}/partidos${p}`;

export async function listPartidosDeArbitro({arbitroId, desde, hasta}={}){
  const col = collection(db, T(""));
  const q = [where('estado','==','jugado'), where('arbitroCentralId','==', arbitroId)];
  if(desde) q.push(where('fecha','>=',desde));
  if(hasta) q.push(where('fecha','<=',hasta));
  q.push(orderBy('fecha','desc'));
  const snap = await getDocs(query(col, ...q));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

export async function sumTarifasDeArbitro({arbitroId, desde, hasta}={}){
  const partidos = await listPartidosDeArbitro({arbitroId, desde, hasta});
  return partidos.reduce((s,p)=>s+(p.tarifaAplicada||0),0);
}
