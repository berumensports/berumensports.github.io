import { db, collection, query, where, onSnapshot, orderBy } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
import { addPartido } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Partidos</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;
  const q = query(collection(db, paths.partidos()), where('ligaId','==',LIGA_ID), where('tempId','==',TEMP_ID), orderBy('fecha','desc'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => `<li>${new Date(d.data().fecha.seconds*1000).toLocaleString()} - ${d.data().localId} vs ${d.data().visitaId}</li>`).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay partidos</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openPartido());
}
function openPartido() {
  openModal(`<form id="pa-form" class="modal-form"><input name="fecha" type="date"><input name="local" placeholder="Local"><input name="visita" placeholder="Visita"><button>Guardar</button></form>`);
  document.getElementById('pa-form').addEventListener('submit', async e => {
    e.preventDefault();
    await addPartido({ fecha: new Date(e.target.fecha.value), localId: e.target.local.value, visitaId: e.target.visita.value });
    closeModal();
  });
}
