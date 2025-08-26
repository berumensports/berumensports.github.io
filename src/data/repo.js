import { db, collection, addDoc, updateDoc, deleteDoc, doc } from './firebase.js';
import { LIGA_ID, TEMP_ID, paths } from './paths.js';

async function safeWrite(cb, label) {
  try {
    const res = await cb();
    console.log(`OK ${label}:`, res.id || res);
    return res;
  } catch (e) {
    console.error(`FALLÓ ${label}:`, e.message);
    throw e;
  }
}

export function addEquipo(data) {
  return safeWrite(() => addDoc(collection(db, paths.equipos()), { ...data, ligaId: LIGA_ID }), 'addEquipo');
}
export function updateEquipo(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.equipos(), id), data), 'updateEquipo');
}
export function deleteEquipo(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.equipos(), id)), 'deleteEquipo');
}
export function addArbitro(data) {
  return safeWrite(() => addDoc(collection(db, paths.arbitros()), { ...data, ligaId: LIGA_ID }), 'addArbitro');
}
export function addPartido(data) {
  return safeWrite(() => addDoc(collection(db, paths.partidos()), { ...data, ligaId: LIGA_ID, tempId: TEMP_ID }), 'addPartido');
}
export function updatePartido(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.partidos(), id), data), 'updatePartido');
}
export function addCobro(data) {
  return safeWrite(() => addDoc(collection(db, paths.cobros()), { ...data, ligaId: LIGA_ID, tempId: TEMP_ID }), 'addCobro');
}
export function addDiagnostic(note, byUid) {
  return safeWrite(() => addDoc(collection(db, paths.diagnostics()), { note, byUid, createdAt: Date.now(), ligaId: LIGA_ID }), 'addDiagnostic');
}
