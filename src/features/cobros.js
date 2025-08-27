import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
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
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <div id="lists"></div>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo cobro"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
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
    const grupos = { pendientes: [], parciales: [], pagados: [] };
    snap.docs.forEach(d => {
      const data = d.data();
      const pa = partidos[data.partidoId] || {};
      const fechaObj = pa.fecha ? new Date(pa.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? `${fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'})} ${fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}` : '';
      const local = equipos[pa.localId] || pa.localId || '';
      const visita = equipos[pa.visitaId] || pa.visitaId || '';
      const tarifa = Number(data.tarifa || 0);
      const monto = Number(data.monto || 0);
      let status, badgeClass;
      if (!monto) { status = 'Pendiente'; badgeClass = 'badge-danger'; }
      else if (monto < tarifa) { status = 'Pago parcial'; badgeClass = 'badge-warning'; }
      else { status = 'Pagado'; badgeClass = 'badge-success'; }
      const row = `<tr>
        <td data-label="Partido">${pa.rama || ''} ${pa.categoria || ''} - ${local} vs ${visita} - ${fecha}</td>
        <td data-label="Tarifa">${fmt.format(tarifa)}</td>
        <td data-label="Monto">${fmt.format(monto)}</td>
        <td data-label="Estado"><span class="badge ${badgeClass}">${status}</span></td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}
      </tr>`;
      if (!monto) grupos.pendientes.push(row);
      else if (monto < tarifa) grupos.parciales.push(row);
      else grupos.pagados.push(row);
    });
    const renderGrupo = (titulo, rows) => rows.length ? `<h2 class="h2 mt-4">${titulo}</h2><table class="responsive-table"><thead><tr><th>Partido</th><th>Tarifa</th><th>Monto</th><th>Estado</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody>${rows.join('')}</tbody></table>` : '';
    const html = renderGrupo('Pendientes', grupos.pendientes) +
                 renderGrupo('Pagados Parcialmente', grupos.parciales) +
                 renderGrupo('Pagados', grupos.pagados);
    document.getElementById('lists').innerHTML = html || '<p>No hay cobros</p>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    const open = (id) => openCobro(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
    attachRowActions(document.getElementById('lists'), { onEdit: open, onDelete: id=>deleteCobro(id) }, true);
  }
}

async function openCobro(id) {
  const isEdit = !!id;
  const [paSnap, taSnap, coSnap, eqSnap] = await Promise.all([
    getDocs(query(
      collection(db, paths.partidos()),
      where('ligaId','==',LIGA_ID),
      where('tempId','==',TEMP_ID),
      orderBy('fecha','desc')
    )),
    getDocs(query(collection(db, paths.tarifas()), where('ligaId','==',LIGA_ID))),
    isEdit ? getDoc(doc(db, paths.cobros(), id)) : Promise.resolve(null),
    getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID)))
  ]);
  const partidos = paSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const tarifas = taSnap.docs.map(d => d.data());
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const existing = coSnap?.exists() ? coSnap.data() : { partidoId: '', monto: '', tarifa: 0 };
  const paOpts = partidos.map(p => `<option value="${p.id}" data-rama="${p.rama}" data-categoria="${p.categoria}">${equipos[p.localId] || p.localId} vs ${equipos[p.visitaId] || p.visitaId}</option>`).join('');
  openModal(`<form id="co-form" class="modal-form">
    <label class="field"><span class="label">Partido</span><select name="partido" class="input"><option value="">Partido</option>${paOpts}</select></label>
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
  form.partido.addEventListener('change', updateTarifa);
  form.partido.value = existing.partidoId || '';
  updateTarifa();
  form.tarifa.value = fmt.format(existing.tarifa || 0);
  form.tarifa.dataset.raw = existing.tarifa || 0;
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
