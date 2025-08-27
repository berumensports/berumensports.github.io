import { db, collection, query, where, onSnapshot, orderBy, getDocs } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addTarifa } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Tarifas</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;
  const q = query(collection(db, paths.tarifas()), where('ligaId','==',LIGA_ID), orderBy('rama'), orderBy('categoria'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      const monto = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(data.tarifa);
      return `<li>${data.rama} - ${data.categoria}: ${monto}</li>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay tarifas</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openTarifa());
}

async function openTarifa() {
  const eqSnap = await getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID)));
  const equipos = eqSnap.docs.map(d => d.data());
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equipos.map(e => e.categoria).filter(Boolean))];
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  openModal(`<form id="ta-form" class="modal-form">
    <select name="rama"><option value="">Rama</option>${ramaOpts}</select>
    <select name="categoria"><option value="">Categoría</option>${catOpts}</select>
    <input name="tarifa" type="number" min="0" step="1" placeholder="Tarifa">
    <button>Guardar</button>
  </form>`);
  document.getElementById('ta-form').addEventListener('submit', async e => {
    e.preventDefault();
    await addTarifa({
      rama: e.target.rama.value,
      categoria: e.target.categoria.value,
      tarifa: Number(e.target.tarifa.value),
    });
    closeModal();
  });
}
