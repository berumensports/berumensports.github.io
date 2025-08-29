import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, TEMP_ID } from '../data/paths.js';
import { getActiveTorneo } from '../data/torneos.js';
import { addPartido, updatePartido, deletePartido } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';
import { exportToPdf } from '../pdf/export.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  const [eqSnap, joSnap, arSnap, delSnap, toSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(collection(db, paths.jornadas()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(collection(db, paths.arbitros()), orderBy('nombre'))),
    getDocs(query(collection(db, paths.delegaciones()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    getDoc(doc(db, paths.torneos(), getActiveTorneo()))
  ]);
  const equiposData = eqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const equipos = Object.fromEntries(equiposData.map(d => [d.id, d]));
  const jornadas = Object.fromEntries(joSnap.docs.map(d => [d.id, d.data().nombre]));
  const arbitros = Object.fromEntries(arSnap.docs.map(d => [d.id, d.data().nombre]));
  const delegaciones = Object.fromEntries(delSnap.docs.map(d => [d.id, d.data().nombre]));
  const ligaNombre = toSnap.data()?.nombre || '';
  const ramas = [...new Set(equiposData.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equiposData.map(e => e.categoria).filter(Boolean))];
  const jornadaOpts = Object.entries(jornadas).map(([id,n]) => `<option value="${id}">${n}</option>`).join('');
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const categoriaOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const delegacionOpts = Object.entries(delegaciones).map(([id,n]) => `<option value="${id}">${n}</option>`).join('');
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Partidos</h1>
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <select id="f-jornada" class="input"><option value="">Jornada</option>${jornadaOpts}</select>
        <select id="f-rama" class="input"><option value="">Rama</option>${ramaOpts}</select>
        <select id="f-categoria" class="input"><option value="">Categoría</option>${categoriaOpts}</select>
        <select id="f-delegacion" class="input"><option value="">Delegación</option>${delegacionOpts}</select>
        <button id="aplicar" class="btn btn-secondary">Aplicar</button>
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table class="responsive-table"><thead><tr><th>Jornada</th><th>Fecha</th><th>Partido</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table>
      <div class="toolbar">
        <button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button>
      </div>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo partido" title="Nuevo partido"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  let partidosData = [];
  let exportRows = [];
  function update() {
    const jFilter = document.getElementById('f-jornada').value;
    const rFilter = document.getElementById('f-rama').value;
    const cFilter = document.getElementById('f-categoria').value;
    const dFilter = document.getElementById('f-delegacion').value;
    const filtered = partidosData.filter(pa => {
      if (jFilter && pa.jornadaId !== jFilter) return false;
      if (rFilter && pa.rama !== rFilter) return false;
      if (cFilter && pa.categoria !== cFilter) return false;
      if (dFilter) {
        const localDel = equipos[pa.localId]?.delegacionId;
        const visitaDel = equipos[pa.visitaId]?.delegacionId;
        if (localDel !== dFilter && visitaDel !== dFilter) return false;
      }
      return true;
    });
    exportRows = [];
    const rows = filtered.map(d => {
      const fechaObj = d.fecha ? new Date(d.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? `${fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'})} ${fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}` : '';
      const jornada = jornadas[d.jornadaId] || '';
      const local = equipos[d.localId]?.nombre || d.localId;
      const visita = equipos[d.visitaId]?.nombre || d.visitaId;
      const marcador = d.jugado && d.marcadorLocal != null && d.marcadorVisita != null ? ` (${d.marcadorLocal}-${d.marcadorVisita})` : '';
      const arbitro = arbitros[d.arbitroId] || '';
      const ramaCat = `${d.rama || ''} ${d.categoria || ''}`.trim();
      const estado = d.jugado ? 'Jugado' : 'Pendiente';
      exportRows.push({ fecha, local, visita, arbitro, ramaCat, estado });
      return `<tr>
        <td data-label="Jornada">${jornada}</td>
        <td data-label="Fecha">${fecha}</td>
        <td data-label="Partido">${local} vs ${visita}${marcador}</td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}
      </tr>`;
    }).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?4:3}">No hay partidos</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
    if (isAdmin) attachRowActions(document.getElementById('list'), { onEdit: id=>openPartido(id), onDelete: id=>deletePartido(id) }, true);
  }
  const q = query(collection(db, paths.partidos()), where('torneoId','==',getActiveTorneo()), where('tempId','==',TEMP_ID), orderBy('fecha','desc'));
  const unsub = onSnapshot(q, snap => {
    partidosData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    update();
  });
  pushCleanup(() => unsub());
  document.getElementById('aplicar').addEventListener('click', update);
  document.getElementById('limpiar').addEventListener('click', () => {
    document.getElementById('f-jornada').value = '';
    document.getElementById('f-rama').value = '';
    document.getElementById('f-categoria').value = '';
    document.getElementById('f-delegacion').value = '';
    update();
  });
  document.getElementById('exportar-pdf').addEventListener('click', () => {
    const body = [
      [
        { text: 'Fecha/Hora', style: 'tableHeader' },
        { text: 'Local', style: 'tableHeader' },
        { text: 'Visita', style: 'tableHeader' },
        { text: 'Árbitro', style: 'tableHeader' },
        { text: 'Rama/Categoría', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' }
      ],
      ...exportRows.map(r => [
        r.fecha,
        r.local,
        r.visita,
        r.arbitro,
        r.ramaCat,
        r.estado
      ])
    ];
    const now = new Date();
    const fecha = now.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 60, 20, 28],
      header: {
        margin: [20, 20, 20, 0],
        stack: [
          { text: 'Partidos', style: 'title' },
          { text: `${ligaNombre} - ${fecha} ${hora}`, style: 'small' }
        ]
      },
      footer: (currentPage, pageCount) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        style: 'small',
        margin: [0, 0, 0, 10]
      }),
      content: [
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto'],
            body
          },
          layout: 'lightHorizontalLines',
          style: 'small'
        }
      ],
      styles: {
        title: { fontSize: 14, bold: true },
        subtitle: { fontSize: 12, margin: [0, 0, 0, 6] },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
        small: { fontSize: 8 },
        muted: { color: '#666666' }
      }
    };
    exportToPdf(docDefinition, 'partidos.pdf');
  });
  if (isAdmin) {
    const open = (id) => openPartido(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
  }
}

async function openPartido(id) {
  const isEdit = !!id;
  const [eqSnap, arSnap, joSnap, paSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    getDocs(query(collection(db, paths.arbitros()), orderBy('nombre'))),
    getDocs(query(collection(db, paths.jornadas()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    isEdit ? getDoc(doc(db, paths.partidos(), id)) : Promise.resolve(null)
  ]);
  const equipos = eqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equipos.map(e => e.categoria).filter(Boolean))];
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const arOpts = arSnap.docs.map(d => `<option value="${d.id}">${d.data().nombre}</option>`).join('');
  const jornadaOpts = joSnap.docs.map(d => `<option value="${d.id}">${d.data().nombre}</option>`).join('');
  const existing = paSnap?.exists() ? paSnap.data() : { fecha: null, rama: '', categoria: '', localId: '', visitaId: '', arbitroId: '', jornadaId: '' };
  const canScore = isEdit && existing.fecha && new Date(existing.fecha.seconds * 1000) <= new Date();
  const scoreFields = canScore ? `
    <label class="field"><span class="label">Partido jugado</span><input name="jugado" type="checkbox"></label>
    <label class="field" id="marcador-local-wrap" hidden><span class="label">Marcador Local</span><input name="marcadorLocal" type="number" class="input" min="0"></label>
    <label class="field" id="marcador-visita-wrap" hidden><span class="label">Marcador Visitante</span><input name="marcadorVisita" type="number" class="input" min="0"></label>` : '';
  openModal(`<form id="pa-form" class="modal-form">
    <label class="field"><span class="label">Fecha</span><input name="fecha" type="datetime-local" class="input"></label>
    <label class="field"><span class="label">Jornada</span><select name="jornada" class="input"><option value="">Jornada</option>${jornadaOpts}</select></label>
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
    form.jornada.value = existing.jornadaId || '';
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
      arbitroId: form.arbitro.value,
      jornadaId: form.jornada.value
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
