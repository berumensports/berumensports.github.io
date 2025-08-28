import { db, collection, query, onSnapshot, orderBy, doc, getDoc } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { addArbitro, updateArbitro, deleteArbitro } from '../data/repo.js';
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
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table class="responsive-table"><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table>
      <div class="toolbar"><button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button></div>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo árbitro"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const toSnap = await getDoc(doc(db, paths.torneos(), getActiveTorneo()));
  const ligaNombre = toSnap.data()?.nombre || '';
  const q = query(collection(db, paths.arbitros()), orderBy('nombre'));
  let exportRows = [];
  const unsub = onSnapshot(q, snap => {
    exportRows = [];
    const rows = snap.docs.map(d => {
      const data = d.data();
      exportRows.push({ nombre: data.nombre, telefono: data.telefono || '', email: data.email || '' });
      return `<tr>
        <td data-label="Nombre">${data.nombre}</td>
        <td data-label="Teléfono">${data.telefono||''}</td>
        <td data-label="Email">${data.email||''}</td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}
      </tr>`;
    }).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?4:3}">No hay árbitros</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
  });
  pushCleanup(() => unsub());
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
    attachRowActions(document.getElementById('list'), { onEdit: open, onDelete: id=>deleteArbitro(id) }, true);
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
