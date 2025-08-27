import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, TEMP_ID } from '../data/paths.js';
import { getActiveTorneo } from '../data/torneos.js';
import { addCobro, updateCobro, deleteCobro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Cobros</h1>
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <div id="lists"></div>
    </div>`;
  const fmt = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
  const [eqSnap, paSnap, taSnap, joSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(
      collection(db, paths.partidos()),
      where('torneoId','==',getActiveTorneo()),
      where('tempId','==',TEMP_ID)
    )),
    getDocs(query(collection(db, paths.tarifas()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(collection(db, paths.jornadas()), where('torneoId','==',getActiveTorneo())))
  ]);
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const partidos = paSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const tarifas = taSnap.docs.map(d => d.data());
  const jornadas = Object.fromEntries(joSnap.docs.map(d => [d.id, d.data().nombre]));
  function tarifaPorPartido(pa) {
    return tarifas.find(t => t.rama === pa.rama && t.categoria === pa.categoria)?.tarifa || 0;
  }

  const q = query(
    collection(db, paths.cobros()),
    where('torneoId','==',getActiveTorneo()),
    where('tempId','==',TEMP_ID),
    orderBy('fechaCobro','desc')
  );
  const unsub = onSnapshot(q, snap => {
    const cobros = {};
    snap.docs.forEach(d => { cobros[d.data().partidoId] = { id: d.id, ...d.data() }; });
    const rows = [];
    partidos.forEach(pa => {
      const co = cobros[pa.id] || {};
      const fechaObj = pa.fecha ? new Date(pa.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'}) : '';
      const hora = fechaObj ? fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false}) : '';
      const local = equipos[pa.localId] || pa.localId || '';
      const visita = equipos[pa.visitaId] || pa.visitaId || '';
      const tarifa = Number(co.tarifa || tarifaPorPartido(pa));
      const monto = Number(co.monto || 0);
      const jornada = jornadas[pa.jornadaId] || 'Sin jornada';
      let status, badgeClass;
      if (!monto) { status = 'Pendiente'; badgeClass = 'badge-danger'; }
      else if (monto < tarifa) { status = 'Parcial'; badgeClass = 'badge-warning'; }
      else { status = 'Pagado'; badgeClass = 'badge-success'; }
      rows.push(`<tr>
        <td data-label="Jornada">${jornada}</td>
        <td data-label="Rama y Categoría">${pa.rama || ''} ${pa.categoria || ''}</td>
        <td data-label="Equipos">${local} vs ${visita}</td>
        <td data-label="Fecha y hora">${fecha} ${hora}</td>
        <td data-label="Tarifa">${fmt.format(tarifa)}</td>
        <td data-label="Monto">${fmt.format(monto)}</td>
        <td data-label="Estado"><span class="badge ${badgeClass}">${status}</span></td>
        ${isAdmin?`<td data-label="Acciones">${renderCobroActions(co.id, pa.id)}</td>`:''}
      </tr>`);
    });
    const header = `<table class="responsive-table"><thead><tr><th>Jornada</th><th>Rama y Categoría</th><th>Equipos</th><th>Fecha y hora</th><th>Tarifa</th><th>Monto</th><th>Estado</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody>`;
    const html = rows.length ? `${header}${rows.join('')}</tbody></table>` : '<p>No hay partidos</p>';
    document.getElementById('lists').innerHTML = html;
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    const open = (id) => {
      if (id.startsWith('partido:')) openCobro(null, id.split(':')[1]);
      else openCobro(id);
    };
    const onDelete = id => { if (!id.startsWith('partido:')) deleteCobro(id); };
    attachRowActions(document.getElementById('lists'), { onEdit: open, onDelete }, true);
  }
}

function renderCobroActions(cobroId, partidoId) {
  if (cobroId) return renderActions(cobroId);
  return `<span class="row-actions">
    <button class="icon-btn" data-action="edit" data-id="partido:${partidoId}" aria-label="Registrar cobro">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#edit"></use></svg>
    </button>
  </span>`;
}

async function openCobro(id, partidoId) {
  const isEdit = !!id;
  const [paSnap, taSnap, coSnap, eqSnap] = await Promise.all([
    getDocs(query(
      collection(db, paths.partidos()),
      where('torneoId','==',getActiveTorneo()),
      where('tempId','==',TEMP_ID),
      orderBy('fecha','desc')
    )),
    getDocs(query(collection(db, paths.tarifas()), where('torneoId','==',getActiveTorneo()))),
    isEdit ? getDoc(doc(db, paths.cobros(), id)) : Promise.resolve(null),
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo())))
  ]);
  const partidos = paSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const tarifas = taSnap.docs.map(d => d.data());
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const existing = coSnap?.exists() ? coSnap.data() : { partidoId: '', monto: '', tarifa: 0 };
  const paOpts = partidos.map(p => `<option value="${p.id}" data-rama="${p.rama}" data-categoria="${p.categoria}">${equipos[p.localId] || p.localId} vs ${equipos[p.visitaId] || p.visitaId}</option>`).join('');
  openModal(`<form id="co-form" class="modal-form">
    <label class="field"><span class="label">Partido</span><select name="partido" class="input" disabled><option value="">Partido</option>${paOpts}</select></label>
    <label class="field"><span class="label">Tarifa</span><input name="tarifa" class="input" disabled></label>
    <label class="field"><span class="label">Monto</span><input name="monto" type="number" min="0" step="1" class="input" placeholder="Cobro"></label>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
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
  form.partido.value = existing.partidoId || partidoId || '';
  updateTarifa();
  if (existing.tarifa) {
    form.tarifa.value = fmt.format(existing.tarifa);
    form.tarifa.dataset.raw = existing.tarifa;
  }
  form.monto.value = existing.monto || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      partidoId: form.partido.value,
      tarifa: Number(form.tarifa.dataset.raw || 0),
      monto: Number(form.monto.value),
      pagado:false,
      fechaCobro: new Date(),
    };
    if (isEdit) await updateCobro(id, data); else await addCobro(data);
    closeModal();
  });
}
