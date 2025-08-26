import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
import { addCobro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Cobros</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;
  const q = query(collection(db, paths.cobros()), where('ligaId','==',LIGA_ID), where('tempId','==',TEMP_ID), orderBy('fechaCobro','desc'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => `<li>${d.data().partidoId || ''} - $${d.data().monto}</li>`).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay cobros</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openCobro());
}
function openCobro() {
  openModal(`<form id="co-form"><input name="partido" placeholder="PartidoId"><input name="monto" type="number" placeholder="Monto"><button>Guardar</button></form>`);
  document.getElementById('co-form').addEventListener('submit', async e => {
    e.preventDefault();
    await addCobro({ partidoId: e.target.partido.value, monto: Number(e.target.monto.value), pagado:false });
    closeModal();
  });
}
