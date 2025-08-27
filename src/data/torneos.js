import { db, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from './firebase.js';
import { paths } from './paths.js';

const ACTIVE_KEY = 'torneoId';
let activeTorneoId = localStorage.getItem(ACTIVE_KEY);

export function getActiveTorneo() {
  return activeTorneoId;
}

export function setActiveTorneo(id) {
  activeTorneoId = id;
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  }
  document.dispatchEvent(new CustomEvent('torneo-changed', { detail: id }));
}

export function onTorneoChange(cb) {
  document.addEventListener('torneo-changed', e => cb(e.detail));
}

export function watchTorneos(cb) {
  return onSnapshot(query(collection(db, paths.torneos())), snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(list);
  });
}

export function addTorneo(data) {
  return addDoc(collection(db, paths.torneos()), data);
}

export function updateTorneo(id, data) {
  return updateDoc(doc(db, paths.torneos(), id), data);
}

export function deleteTorneo(id) {
  return deleteDoc(doc(db, paths.torneos(), id));
}
