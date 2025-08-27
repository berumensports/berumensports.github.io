import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';
import { addPartido, updatePartido, deletePartido } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Partidos</h1>
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table id="list"></table>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo partido"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const eqSnap = await getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID)));
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const q = query(collection(db, paths.partidos()), where('ligaId','==',LIGA_ID), where('tempId','==',TEMP_ID), orderBy('fecha','desc'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      const fechaObj = data.fecha ? new Date(data.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? `${fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'})} ${fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}` : '';
      const local = equipos[data.localId] || data.localId;
      const visita = equipos[data.visitaId] || data.visitaId;
      const marcador = data.jugado && data.marcadorLocal != null && data.marcadorVisita != null ?
        ` (${data.marcadorLocal}-${data.marcadorVisita})` : '';
      return `<tr><td>${fecha}</td><td>${local} vs ${visita}${marcador}</td>${isAdmin?'<td>'+renderActions(d.id)+'</td>':''}</tr>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay partidos</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    const open = (id) => openPartido(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
    attachRowActions(document.getElementById('list'), { onEdit: open, onDelete: id=>deletePartido(id) }, true);
  }
}

async function openPartido(id) {
  const isEdit = !!id;
  const [eqSnap, arSnap, paSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID), orderBy('nombre'))),
    getDocs(query(collection(db, paths.arbitros()), where('ligaId','==',LIGA_ID), orderBy('nombre'))),
    isEdit ? getDoc(doc(db, paths.partidos(), id)) : Promise.resolve(null)
  ]);
  const equipos = eqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equipos.map(e => e.categoria).filter(Boolean))];
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const arOpts = arSnap.docs.map(d => `<option value="${d.id}">${d.data().nombre}</option>`).join('');
  const existing = paSnap?.exists() ? paSnap.data() : { fecha: null, rama: '', categoria: '', localId: '', visitaId: '', arbitroId: '' };
  const canScore = isEdit && existing.fecha && new Date(existing.fecha.seconds * 1000) <= new Date();
  const scoreFields = canScore ? `
    <label class="field"><span class="label">Partido jugado</span><input name="jugado" type="checkbox"></label>
    <label class="field" id="marcador-local-wrap" hidden><span class="label">Marcador Local</span><input name="marcadorLocal" type="number" class="input" min="0"></label>
    <label class="field" id="marcador-visita-wrap" hidden><span class="label">Marcador Visitante</span><input name="marcadorVisita" type="number" class="input" min="0"></label>` : '';
  openModal(`<form id="pa-form" class="modal-form">
    <label class="field"><span class="label">Fecha</span><input name="fecha" type="datetime-local" class="input"></label>
    <label class="field"><span class="label">Rama</span><select name="rama" class="input"><option value="">Rama</option>${ramaOpts}</select></label>
    <label class="field"><span class="label">Categoría</span><select name="categoria" class="input"><option value="">Categoría</option>${catOpts}</select></label>
    <label class="field" id="local-wrap" hidden><span class="label">Local</span><select name="local" class="input"></select></label>
    <label class="field" id="visita-wrap" hidden><span class="label">Visita</span><select name="visita" class="input"></select></label>
    <label class="field" id="arbitro-wrap" hidden><span class="label">Árbitro</span><select name="arbitro" class="input"><option value="">Árbitro</option>${arOpts}</select></label>
    ${scoreFields}
    <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
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
      document.getElementById('local-wrap').hidden = false;
      document.getElementById('visita-wrap').hidden = false;
      document.getElementById('arbitro-wrap').hidden = false;
    } else {
      document.getElementById('local-wrap').hidden = true;
      document.getElementById('visita-wrap').hidden = true;
      document.getElementById('arbitro-wrap').hidden = true;
    }
  }
  form.rama.addEventListener('change', updateEquipos);
  form.categoria.addEventListener('change', updateEquipos);
  if (isEdit) {
    if (existing.fecha) {
      const date = new Date(existing.fecha.seconds * 1000);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      form.fecha.value = date.toISOString().slice(0, 16);
    } else {
      form.fecha.value = '';
    }
    form.rama.value = existing.rama || '';
    form.categoria.value = existing.categoria || '';
    updateEquipos();
    form.local.value = existing.localId || '';
    form.visita.value = existing.visitaId || '';
    form.arbitro.value = existing.arbitroId || '';
  }
  if (canScore) {
    const toggleScores = () => {
      document.getElementById('marcador-local-wrap').hidden = !form.jugado.checked;
      document.getElementById('marcador-visita-wrap').hidden = !form.jugado.checked;
    };
    form.jugado.checked = existing.jugado || false;
    form.marcadorLocal.value = existing.marcadorLocal ?? '';
    form.marcadorVisita.value = existing.marcadorVisita ?? '';
    toggleScores();
    form.jugado.addEventListener('change', toggleScores);
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      fecha: new Date(form.fecha.value),
      rama: form.rama.value,
      categoria: form.categoria.value,
      localId: form.local.value,
      visitaId: form.visita.value,
      arbitroId: form.arbitro.value
    };
    if (canScore) {
      data.jugado = form.jugado.checked;
      data.marcadorLocal = form.jugado.checked ? Number(form.marcadorLocal.value) : null;
      data.marcadorVisita = form.jugado.checked ? Number(form.marcadorVisita.value) : null;
    }
    if (isEdit) await updatePartido(id, data); else await addPartido(data);
    closeModal();
  });
}
