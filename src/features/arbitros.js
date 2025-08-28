import { db, collection, query, onSnapshot, orderBy, doc, getDoc, where, getDocs } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { addArbitro, updateArbitro, deleteArbitro, updatePartido } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';
import { getActiveTorneo } from '../data/torneos.js';
import { exportToPdf } from '../pdf/export.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Árbitros</h1>
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <select id="f-estado" class="input"><option value="">Todos</option><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></select>
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table class="responsive-table"><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table>
      <div class="toolbar"><button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button></div>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo árbitro"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const toSnap = await getDoc(doc(db, paths.torneos(), getActiveTorneo()));
  const ligaNombre = toSnap.data()?.nombre || '';
  const [eqSnap, joSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(collection(db, paths.jornadas()), where('torneoId','==',getActiveTorneo())))
  ]);
  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data().nombre]));
  const jornadas = Object.fromEntries(joSnap.docs.map(d => [d.id, d.data().nombre]));
  const q = query(collection(db, paths.arbitros()), orderBy('nombre'));
  let exportRows = [];
  const arbitrosData = {};
  const matchesByArbitro = {};
  let estadoFilter = '';

  async function loadMatches(arbitroId) {
    const snap = await getDocs(query(collection(db, paths.partidos()), where('torneoId','==',getActiveTorneo()), where('arbitroId','==', arbitroId)));
    matchesByArbitro[arbitroId] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  function renderMatches(arbitroId) {
    const container = document.querySelector(`.matches[data-id="${arbitroId}"]`);
    if (!container) return;
    const matches = matchesByArbitro[arbitroId] || [];
    const filtered = estadoFilter === '' ? matches : matches.filter(m => estadoFilter === 'pagado' ? m.pagadoArbitro : !m.pagadoArbitro);
    const rows = filtered.map(m => {
      const jornada = jornadas[m.jornadaId] || '';
      const local = equipos[m.localId] || m.localId;
      const visita = equipos[m.visitaId] || m.visitaId;
      const fechaObj = m.fecha ? new Date(m.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'}) : '';
      const hora = fechaObj ? fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false}) : '';
      return `<tr>
        <td data-label="Jornada">${jornada}</td>
        <td data-label="Rama">${m.rama||''}</td>
        <td data-label="Categoría">${m.categoria||''}</td>
        <td data-label="Equipos">${local} vs ${visita}</td>
        <td data-label="Fecha">${fecha}</td>
        <td data-label="Hora">${hora}</td>
        <td data-label="Pagado"><input type="checkbox" data-match-id="${m.id}" ${m.pagadoArbitro?'checked':''}></td>
      </tr>`;
    }).join('');
    const body = rows || `<tr><td data-label="Mensaje" colspan="7">No hay partidos</td></tr>`;
    container.innerHTML = `<table class="responsive-table"><thead><tr><th>Jornada</th><th>Rama</th><th>Categoría</th><th>Equipos</th><th>Fecha</th><th>Hora</th><th>Pagado</th></tr></thead><tbody>${body}</tbody></table>`;
  }

  function buildPdfRows(arr) {
    return arr.map(m => {
      const jornada = jornadas[m.jornadaId] || '';
      const local = equipos[m.localId] || m.localId;
      const visita = equipos[m.visitaId] || m.visitaId;
      const fechaObj = m.fecha ? new Date(m.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? fechaObj.toLocaleDateString('es-MX',{year:'numeric',month:'2-digit',day:'2-digit'}) : '';
      const hora = fechaObj ? fechaObj.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false}) : '';
      return [jornada, m.rama||'', m.categoria||'', `${local} vs ${visita}`, fecha, hora];
    });
  }

  function exportArbitroPdf(arbitroId) {
    const ar = arbitrosData[arbitroId];
    if (!ar) return;
    const matches = matchesByArbitro[arbitroId] || [];
    const pagados = matches.filter(m => m.pagadoArbitro);
    const pendientes = matches.filter(m => !m.pagadoArbitro);
    const header = [
      { text: 'Jornada', style: 'tableHeader' },
      { text: 'Rama', style: 'tableHeader' },
      { text: 'Categoría', style: 'tableHeader' },
      { text: 'Equipos', style: 'tableHeader' },
      { text: 'Fecha', style: 'tableHeader' },
      { text: 'Hora', style: 'tableHeader' }
    ];
    const content = [
      { text: 'Pagados', style: 'subtitle' },
      pagados.length ? {
        table: { headerRows: 1, widths: ['auto','auto','auto','*','auto','auto'], body: [header, ...buildPdfRows(pagados)] },
        layout: 'lightHorizontalLines', style: 'small'
      } : { text: 'Sin partidos', style: 'small' },
      { text: 'Pendientes', style: 'subtitle', margin: [0,10,0,0] },
      pendientes.length ? {
        table: { headerRows: 1, widths: ['auto','auto','auto','*','auto','auto'], body: [header, ...buildPdfRows(pendientes)] },
        layout: 'lightHorizontalLines', style: 'small'
      } : { text: 'Sin partidos', style: 'small' },
    ];
    const agendados = matches.length;
    const pitados = matches.filter(m => m.jugado).length;
    content.push({ text: 'Resumen', style: 'subtitle', margin: [0,10,0,0] });
    content.push({ text: `Partidos agendados: ${agendados}\nPartidos pitados: ${pitados}\nPagados: ${pagados.length}\nPendientes: ${pendientes.length}`, style: 'small' });
    const now = new Date();
    const fecha = now.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 60, 20, 28],
      header: {
        margin: [20, 20, 20, 0],
        stack: [
          { text: `Reporte de árbitro - ${ar.nombre}`, style: 'title' },
          { text: `${ligaNombre} - ${fecha} ${hora}`, style: 'small' }
        ]
      },
      footer: (currentPage, pageCount) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        style: 'small',
        margin: [0, 0, 0, 10]
      }),
      content,
      styles: {
        title: { fontSize: 14, bold: true },
        subtitle: { fontSize: 12, margin: [0, 0, 0, 6] },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
        small: { fontSize: 8 }
      }
    };
    exportToPdf(docDefinition, `arbitro-${ar.nombre}.pdf`);
  }

  function openWhatsapp(arbitroId) {
    const ar = arbitrosData[arbitroId];
    if (!ar) return;
    const digits = (ar.telefono || '').replace(/\D/g, '');
    if (!digits) return;
    window.open(`https://wa.me/${digits}`, '_blank');
  }
  const unsub = onSnapshot(q, snap => {
    exportRows = [];
    const rows = snap.docs.map(d => {
      const data = d.data();
      arbitrosData[d.id] = data;
      exportRows.push({ nombre: data.nombre, telefono: data.telefono || '', email: data.email || '' });
      const actions = isAdmin?`<td data-label="Acciones">${renderActions(d.id, [{action:'pdf',icon:'document',label:'Reporte PDF'},{action:'whatsapp',icon:'chat',label:'WhatsApp'}])}</td>`:'';
      return `<tr class="ar-row" data-id="${d.id}">
        <td data-label="Nombre">${data.nombre}</td>
        <td data-label="Teléfono">${data.telefono||''}</td>
        <td data-label="Email">${data.email||''}</td>
        ${actions}
      </tr>
      <tr class="detail-row" data-id="${d.id}" hidden><td colspan="${isAdmin?4:3}"><div class="matches" data-id="${d.id}"></div></td></tr>`;
    }).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?4:3}">No hay árbitros</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
  });
  pushCleanup(() => unsub());
  document.getElementById('f-estado').addEventListener('change', () => {
    estadoFilter = document.getElementById('f-estado').value;
    Object.keys(matchesByArbitro).forEach(id => renderMatches(id));
  });
  document.getElementById('limpiar').addEventListener('click', () => {
    document.getElementById('buscar').value = '';
    document.getElementById('f-estado').value = '';
    estadoFilter = '';
    Object.keys(matchesByArbitro).forEach(id => renderMatches(id));
  });
  document.getElementById('list').addEventListener('click', async e => {
    const tr = e.target.closest('tr.ar-row');
    if (!tr || e.target.closest('.row-actions')) return;
    const id = tr.dataset.id;
    const detail = document.querySelector(`tr.detail-row[data-id="${id}"]`);
    if (detail.hidden) {
      if (!matchesByArbitro[id]) await loadMatches(id);
      renderMatches(id);
      detail.hidden = false;
    } else {
      detail.hidden = true;
    }
  });
  el.addEventListener('change', async e => {
    const chk = e.target.closest('input[data-match-id]');
    if (!chk) return;
    const matchId = chk.dataset.matchId;
    const arbitroId = chk.closest('.matches').dataset.id;
    await updatePartido(matchId, { pagadoArbitro: chk.checked });
    const match = (matchesByArbitro[arbitroId] || []).find(m => m.id === matchId);
    if (match) match.pagadoArbitro = chk.checked;
    renderMatches(arbitroId);
  });
  document.getElementById('exportar-pdf').addEventListener('click', () => {
    const body = [
      [
        { text: 'Nombre', style: 'tableHeader' },
        { text: 'Teléfono', style: 'tableHeader' },
        { text: 'Email', style: 'tableHeader' }
      ],
      ...exportRows.map(r => [r.nombre, r.telefono, r.email])
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
          { text: 'Árbitros', style: 'title' },
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
            widths: ['*', 'auto', 'auto'],
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
    exportToPdf(docDefinition, 'arbitros.pdf');
  });
  if (isAdmin) {
    const open = (id) => openArbitro(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
    attachRowActions(document.getElementById('list'), {
      onEdit: open,
      onDelete: id => deleteArbitro(id),
      pdf: async id => { if (!matchesByArbitro[id]) await loadMatches(id); exportArbitroPdf(id); },
      whatsapp: async id => { if (!matchesByArbitro[id]) await loadMatches(id); exportArbitroPdf(id); openWhatsapp(id); }
    }, true);
  }
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length !== 10) return value;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)} ${digits.slice(6)}`;
}

async function openArbitro(id) {
  const isEdit = !!id;
  let existing = { nombre: '', telefono: '', email: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.arbitros(), id));
    if (snap.exists()) existing = snap.data();
  }
  openModal(`
    <form id="ar-form" class="modal-form">
      <label class="field"><span class="label">Nombre</span><input name="nombre" class="input" required></label>
      <label class="field"><span class="label">Teléfono</span><input name="telefono" class="input" placeholder="10 dígitos"></label>
      <label class="field"><span class="label">Email</span><input name="email" type="email" class="input" placeholder="Email"></label>
      <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
    </form>`);
  const form = document.getElementById('ar-form');
  form.nombre.value = existing.nombre || '';
  form.telefono.value = existing.telefono || '';
  form.email.value = existing.email || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombre: form.nombre.value.trim(),
      telefono: formatPhone(form.telefono.value),
      email: form.email.value.trim()
    };
    if (isEdit) await updateArbitro(id, data); else await addArbitro(data);
    closeModal();
  });
}
