import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { getActiveTorneo } from '../data/torneos.js';
import { addEquipo, updateEquipo, deleteEquipo } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';
import { exportToPdf } from '../pdf/export.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  const [catSnap, delSnap, toSnap, eqSnap] = await Promise.all([
    getDocs(query(collection(db, paths.categorias()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    getDocs(query(collection(db, paths.delegaciones()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    getDoc(doc(db, paths.torneos(), getActiveTorneo())),
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()), orderBy('nombre')))
  ]);
  const delegMap = {};
  delSnap.forEach(d => { delegMap[d.id] = d.data().nombre; });
  const equiposInit = eqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ligaNombre = toSnap.data()?.nombre || '';
  const ramas = [...new Set(equiposInit.map(e => e.rama).filter(Boolean))];
  const categorias = catSnap.docs.map(d => d.data().nombre);
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const delegacionOpts = Object.entries(delegMap).map(([id,nombre]) => `<option value="${id}">${nombre}</option>`).join('');
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Equipos</h1>${isAdmin?'<button id="nuevo" class="btn btn-primary">Nuevo</button>':''}
      </div>
      <div class="toolbar">
        <select id="f-rama" class="input"><option value="">Rama</option>${ramaOpts}</select>
        <select id="f-categoria" class="input"><option value="">Categoría</option>${catOpts}</select>
        <select id="f-delegacion" class="input"><option value="">Delegación</option>${delegacionOpts}</select>
        <button id="aplicar" class="btn btn-secondary">Aplicar</button>
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table class="responsive-table"><thead><tr><th>Nombre</th><th>Rama</th><th>Categoría</th><th>Delegación</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table>
      <div class="toolbar"><button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button></div>
    </div>`;
  let equiposData = equiposInit;
  let exportRows = [];
  function update() {
    const rFilter = document.getElementById('f-rama').value;
    const cFilter = document.getElementById('f-categoria').value;
    const dFilter = document.getElementById('f-delegacion').value;
    const filtered = equiposData.filter(eq => {
      if (rFilter && eq.rama !== rFilter) return false;
      if (cFilter && eq.categoria !== cFilter) return false;
      if (dFilter && eq.delegacionId !== dFilter) return false;
      return true;
    });
    exportRows = filtered.map(eq => ({
      nombre: eq.nombre,
      rama: eq.rama || '',
      categoria: eq.categoria || '',
      delegacion: delegMap[eq.delegacionId] || ''
    }));
    const rows = filtered.map(eq => `<tr>
        <td data-label="Nombre">${eq.nombre}</td>
        <td data-label="Rama">${eq.rama||''}</td>
        <td data-label="Categoría">${eq.categoria||''}</td>
        <td data-label="Delegación">${delegMap[eq.delegacionId]||''}</td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(eq.id)}</td>`:''}
      </tr>`).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?5:4}">No hay equipos</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
    if (isAdmin) attachRowActions(document.getElementById('list'), { onEdit:id=>openEquipo(id, delegMap, categorias), onDelete:id=>deleteEquipo(id) }, true);
  }
  const q = query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    equiposData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    update();
  });
  pushCleanup(() => unsub());
  document.getElementById('aplicar').addEventListener('click', update);
  document.getElementById('limpiar').addEventListener('click', () => {
    document.getElementById('f-rama').value = '';
    document.getElementById('f-categoria').value = '';
    document.getElementById('f-delegacion').value = '';
    update();
  });
  document.getElementById('exportar-pdf').addEventListener('click', () => {
    const body = [
      [
        { text: 'Nombre', style: 'tableHeader' },
        { text: 'Rama', style: 'tableHeader' },
        { text: 'Categoría', style: 'tableHeader' },
        { text: 'Delegación', style: 'tableHeader' }
      ],
      ...exportRows.map(r => [r.nombre, r.rama, r.categoria, r.delegacion])
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
          { text: 'Equipos', style: 'title' },
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
            widths: ['*', 'auto', 'auto', 'auto'],
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
    exportToPdf(docDefinition, 'equipos.pdf');
  });
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openEquipo(null, delegMap, categorias));
  }
}

async function openEquipo(id, delegaciones, categorias) {
  const isEdit = !!id;
  let existing = { nombre: '', rama: '', categoria: '', delegacionId: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.equipos(), id));
    if (snap.exists()) existing = snap.data();
  }
  const ramaOpts = ['Varonil','Femenil'].map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const delOpts = Object.entries(delegaciones).map(([did,name]) => `<option value="${did}">${name}</option>`).join('');
  openModal(`<form id="eq-form" class="modal-form">
    <label class="field"><span class="label">Nombre</span><input class="input" name="nombre" placeholder="Nombre"></label>
    <label class="field"><span class="label">Rama</span><select class="input" name="rama">${ramaOpts}</select></label>
    <label class="field"><span class="label">Categoría</span><select class="input" name="categoria">${catOpts}</select></label>
    <label class="field"><span class="label">Delegación</span><select class="input" name="delegacionId">${delOpts}</select></label>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
  </form>`);
  const form = document.getElementById('eq-form');
  form.nombre.value = existing.nombre || '';
  form.rama.value = existing.rama || '';
  form.categoria.value = existing.categoria || '';
  form.delegacionId.value = existing.delegacionId || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value, rama: form.rama.value, categoria: form.categoria.value, delegacionId: form.delegacionId.value };
    if (isEdit) await updateEquipo(id, data); else await addEquipo(data);
    closeModal();
  });
}
