import { db, collection, addDoc, updateDoc, deleteDoc, doc } from './firebase.js';
import { TEMP_ID, paths } from './paths.js';
import { getActiveTorneo } from './torneos.js';

async function safeWrite(cb, label) {
  try {
    const res = await cb();
    console.log(`OK ${label}:`, res?.id ?? res);
    return res;
  } catch (e) {
    console.error(`FALLÓ ${label}:`, e.message);
    throw e;
  }
}

export function addEquipo(data) {
  return safeWrite(() => addDoc(collection(db, paths.equipos()), { ...data, torneoId: getActiveTorneo() }), 'addEquipo');
}
export function updateEquipo(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.equipos(), id), data), 'updateEquipo');
}
export function deleteEquipo(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.equipos(), id)), 'deleteEquipo');
}
export function addDelegacion(data) {
  return safeWrite(() => addDoc(collection(db, paths.delegaciones()), { ...data, torneoId: getActiveTorneo() }), 'addDelegacion');
}
export function updateDelegacion(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.delegaciones(), id), data), 'updateDelegacion');
}
export function deleteDelegacion(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.delegaciones(), id)), 'deleteDelegacion');
}
export function addArbitro(data) {
  return safeWrite(() => addDoc(collection(db, paths.arbitros()), data), 'addArbitro');
}
export function updateArbitro(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.arbitros(), id), data), 'updateArbitro');
}
export function deleteArbitro(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.arbitros(), id)), 'deleteArbitro');
}
export function addPartido(data) {
  return safeWrite(() => addDoc(collection(db, paths.partidos()), { ...data, torneoId: getActiveTorneo(), tempId: TEMP_ID }), 'addPartido');
}
export function updatePartido(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.partidos(), id), data), 'updatePartido');
}
export function deletePartido(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.partidos(), id)), 'deletePartido');
}
export function addCobro(data) {
  return safeWrite(() => addDoc(collection(db, paths.cobros()), { ...data, torneoId: getActiveTorneo(), tempId: TEMP_ID }), 'addCobro');
}
export function updateCobro(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.cobros(), id), data), 'updateCobro');
}
export function deleteCobro(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.cobros(), id)), 'deleteCobro');
}
export function addTarifa(data) {
  return safeWrite(() => addDoc(collection(db, paths.tarifas()), { ...data, torneoId: getActiveTorneo() }), 'addTarifa');
}
export function updateTarifa(id, data) {
  return safeWrite(() => updateDoc(doc(db, paths.tarifas(), id), data), 'updateTarifa');
}
export function deleteTarifa(id) {
  return safeWrite(() => deleteDoc(doc(db, paths.tarifas(), id)), 'deleteTarifa');
}
export function addDiagnostic(note, byUid) {
  return safeWrite(() => addDoc(collection(db, paths.diagnostics()), { note, byUid, createdAt: Date.now(), torneoId: getActiveTorneo() }), 'addDiagnostic');
}
