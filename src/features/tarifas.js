import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { getActiveTorneo, updateTorneo } from '../data/torneos.js';
import { addTarifa, updateTarifa, deleteTarifa } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';
import { exportToPdf } from '../pdf/export.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  const toSnap = await getDoc(doc(db, paths.torneos(), getActiveTorneo()));
  const ligaNombre = toSnap.data()?.nombre || '';
  const tarifaArbitro = toSnap.data()?.tarifaArbitro || '';
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Tarifas</h1>
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <label class="field"><span class="label">Árbitros (monto por partido)</span><input id="monto-arbitro" type="number" min="0" step="1" class="input" value="${tarifaArbitro}" ${isAdmin?'':'disabled'}></label>
        ${isAdmin ? '<button id="guardar-arbitro" class="btn btn-secondary">Guardar</button>' : ''}
      </div>
      <table class="responsive-table"><thead><tr><th>Rama</th><th>Categoría</th><th>Tarifa</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table>
      <div class="toolbar"><button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button></div>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nueva tarifa" title="Nueva tarifa"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const q = query(collection(db, paths.tarifas()), where('torneoId','==',getActiveTorneo()), orderBy('rama'), orderBy('categoria'));
  let exportRows = [];
  const unsub = onSnapshot(q, snap => {
    exportRows = [];
    const rows = snap.docs.map(d => {
      const data = d.data();
      const monto = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(data.tarifa);
      exportRows.push({ rama: data.rama, categoria: data.categoria, tarifa: data.tarifa });
      return `<tr>
        <td data-label="Rama">${data.rama}</td>
        <td data-label="Categoría">${data.categoria}</td>
        <td data-label="Tarifa">${monto}</td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}
      </tr>`;
    }).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?4:3}">No hay tarifas</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('guardar-arbitro')?.addEventListener('click', async () => {
      const monto = Number(document.getElementById('monto-arbitro').value);
      await updateTorneo(getActiveTorneo(), { tarifaArbitro: monto });
    });
  }
  document.getElementById('exportar-pdf').addEventListener('click', () => {
    const fmt = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
    const body = [
      [
        { text: 'Rama', style: 'tableHeader' },
        { text: 'Categoría', style: 'tableHeader' },
        { text: 'Tarifa', style: 'tableHeader' }
      ],
      ...exportRows.map(r => [r.rama, r.categoria, fmt.format(r.tarifa)])
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
          { text: 'Tarifas', style: 'title' },
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
            widths: ['auto', 'auto', 'auto'],
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
    exportToPdf(docDefinition, 'tarifas.pdf');
  });
  if (isAdmin) {
    const open = (id) => openTarifa(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
    attachRowActions(document.getElementById('list'), { onEdit: open, onDelete: id=>deleteTarifa(id) }, true);
  }
}

async function openTarifa(id) {
  const isEdit = !!id;
  const [eqSnap, catSnap, taSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId','==',getActiveTorneo()))),
    getDocs(query(collection(db, paths.categorias()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'))),
    isEdit ? getDoc(doc(db, paths.tarifas(), id)) : Promise.resolve(null)
  ]);
  const equipos = eqSnap.docs.map(d => d.data());
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = catSnap.docs.map(d => d.data().nombre);
  const ramaOpts = ramas.map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  const existing = taSnap?.exists() ? taSnap.data() : { rama: '', categoria: '', tarifa: '' };
  openModal(`<form id="ta-form" class="modal-form">
    <label class="field"><span class="label">Rama</span><select name="rama" class="input"><option value="">Rama</option>${ramaOpts}</select></label>
    <label class="field"><span class="label">Categoría</span><select name="categoria" class="input"><option value="">Categoría</option>${catOpts}</select></label>
    <label class="field"><span class="label">Monto</span><input name="tarifa" type="number" min="0" step="1" class="input" placeholder="Tarifa"></label>
    <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
  </form>`);
  const form = document.getElementById('ta-form');
  form.rama.value = existing.rama || '';
  form.categoria.value = existing.categoria || '';
  form.tarifa.value = existing.tarifa || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      rama: form.rama.value,
      categoria: form.categoria.value,
      tarifa: Number(form.tarifa.value),
    };
    if (isEdit) await updateTarifa(id, data); else await addTarifa(data);
    closeModal();
  });
}
