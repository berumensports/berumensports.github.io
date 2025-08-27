import { db, collection, query, where, onSnapshot, orderBy, getDocs } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
import { addCobro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Cobros</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<ul id="list"></ul></div>`;
  const fmt = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});

  const [eqSnap, paSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID))),
    getDocs(query(
      collection(db, paths.partidos()),
      where('ligaId','==',LIGA_ID),
      where('tempId','==',TEMP_ID)
    ))
  ]);
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const partidos = Object.fromEntries(paSnap.docs.map(d => [d.id, d.data()]));

  const q = query(
    collection(db, paths.cobros()),
    where('ligaId','==',LIGA_ID),
    where('tempId','==',TEMP_ID),
    orderBy('fechaCobro','desc')
  );
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      const pa = partidos[data.partidoId] || {};
      const fechaObj = pa.fecha ? new Date(pa.fecha.seconds * 1000) : null;
      const fecha = fechaObj
        ? `${fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'})} ${fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}`
        : '';
      const local = equipos[pa.localId] || pa.localId || '';
      const visita = equipos[pa.visitaId] || pa.visitaId || '';
      return `<li>${pa.rama || ''} ${pa.categoria || ''} - ${local} vs ${visita} - ${fecha} - Tarifa ${fmt.format(data.tarifa || 0)} - Monto ${fmt.format(data.monto || 0)}</li>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<li>No hay cobros</li>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) document.getElementById('nuevo').addEventListener('click', () => openCobro());
}

async function openCobro() {
  const [paSnap, taSnap] = await Promise.all([
    getDocs(query(
      collection(db, paths.partidos()),
      where('ligaId','==',LIGA_ID),
      where('tempId','==',TEMP_ID),
      orderBy('fecha','desc')
    )),
    getDocs(query(collection(db, paths.tarifas()), where('ligaId','==',LIGA_ID)))
  ]);
  const partidos = paSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const tarifas = taSnap.docs.map(d => d.data());
  const paOpts = partidos.map(p => `<option value="${p.id}" data-rama="${p.rama}" data-categoria="${p.categoria}">${p.localId} vs ${p.visitaId}</option>`).join('');
  openModal(`<form id="co-form" class="modal-form">
    <select name="partido"><option value="">Partido</option>${paOpts}</select>
    <input name="tarifa" placeholder="Tarifa" disabled>
    <input name="monto" type="number" min="0" step="1" placeholder="Cobro">
    <button>Guardar</button>
  </form>`);
  const form = document.getElementById('co-form');
  const fmt = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
  function updateTarifa() {
    const opt = form.partido.selectedOptions[0];
    if (!opt) {
      form.tarifa.value = '';
      form.tarifa.dataset.raw = '';
      return;
    }
    const tarifa = tarifas.find(t => t.rama === opt.dataset.rama && t.categoria === opt.dataset.categoria)?.tarifa || 0;
    form.tarifa.value = fmt.format(tarifa);
    form.tarifa.dataset.raw = tarifa;
  }
  form.partido.addEventListener('change', updateTarifa);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    await addCobro({
      partidoId: form.partido.value,
      tarifa: Number(form.tarifa.dataset.raw || 0),
      monto: Number(form.monto.value),
      pagado:false,
      fechaCobro: new Date(),
    });
    closeModal();
  });
}
