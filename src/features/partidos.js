import { db, collection, query, where, onSnapshot, orderBy, getDocs } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
import { addPartido } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Partidos</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;

  const eqSnap = await getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID)));
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));

  const q = query(collection(db, paths.partidos()), where('ligaId','==',LIGA_ID), where('tempId','==',TEMP_ID), orderBy('fecha','desc'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      const fechaObj = new Date(data.fecha.seconds * 1000);
      const fecha = `${fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'})} ${fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}`;
      const local = equipos[data.localId] || data.localId;
      const visita = equipos[data.visitaId] || data.visitaId;
      return `<li>${fecha} - ${local} vs ${visita}</li>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay partidos</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openPartido());
}
async function openPartido() {
  const [eqSnap, arSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID), orderBy('nombre'))),
    getDocs(query(collection(db, paths.arbitros()), where('ligaId','==',LIGA_ID), orderBy('nombre'))),
  ]);
  const equipos = eqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equipos.map(e => e.categoria).filter(Boolean))];
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const arOpts = arSnap.docs.map(d => `<option value="${d.id}">${d.data().nombre}</option>`).join('');
  openModal(`<form id="pa-form" class="modal-form">
    <input name="fecha" type="datetime-local">
    <select name="rama"><option value="">Rama</option>${ramaOpts}</select>
    <select name="categoria"><option value="">Categoría</option>${catOpts}</select>
    <select name="local" hidden disabled></select>
    <select name="visita" hidden disabled></select>
    <select name="arbitro" hidden><option value="">Árbitro</option>${arOpts}</select>
    <button>Guardar</button>
  </form>`);
  const form = document.getElementById('pa-form');
  function updateEquipos() {
    const r = form.rama.value;
    const c = form.categoria.value;
    if (r && c) {
      const filtered = equipos.filter(e => e.rama === r && e.categoria === c);
      const opts = filtered.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
      form.local.innerHTML = opts;
      form.visita.innerHTML = opts;
      form.local.hidden = form.visita.hidden = false;
      form.local.disabled = form.visita.disabled = false;
      form.arbitro.hidden = false;
    } else {
      form.local.hidden = form.visita.hidden = true;
      form.local.disabled = form.visita.disabled = true;
      form.arbitro.hidden = true;
    }
  }
  form.rama.addEventListener('change', updateEquipos);
  form.categoria.addEventListener('change', updateEquipos);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await addPartido({
      fecha: new Date(form.fecha.value),
      rama: form.rama.value,
      categoria: form.categoria.value,
      localId: form.local.value,
      visitaId: form.visita.value,
      arbitroId: form.arbitro.value,
    });
    closeModal();
  });
}
