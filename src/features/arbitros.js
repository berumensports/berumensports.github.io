import { db, collection, query, where, onSnapshot, orderBy } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addArbitro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Árbitros</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;
  const q = query(collection(db, paths.arbitros()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `<li>${data.nombre}${data.telefono ? ' - ' + data.telefono : ''}</li>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay árbitros</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openArbitro());
}
function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) return null;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)} ${digits.slice(6)}`;
}

function openArbitro() {
  openModal(`
    <form id="ar-form" class="modal-form">
      <input name="nombre" placeholder="Nombre">
      <input name="telefono" placeholder="Teléfono/Whatsapp">
      <button>Guardar</button>
    </form>`);
  document.getElementById('ar-form').addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = e.target.nombre.value;
    const telefono = formatPhone(e.target.telefono.value);
    if (!telefono) {
      alert('Teléfono debe tener 10 dígitos');
      return;
    }
    await addArbitro({ nombre, telefono });
    closeModal();
  });
}
