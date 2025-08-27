import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addTarifa, updateTarifa, deleteTarifa } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Tarifas</h1>
        ${isAdmin ? '<button id="nuevo" class="btn btn-primary">Nuevo</button>' : ''}
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <table id="list"></table>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nueva tarifa"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const q = query(collection(db, paths.tarifas()), where('ligaId','==',LIGA_ID), orderBy('rama'), orderBy('categoria'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      const monto = new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(data.tarifa);
      return `<tr><td>${data.rama}</td><td>${data.categoria}</td><td>${monto}</td>${isAdmin?'<td>'+renderActions(d.id)+'</td>':''}</tr>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay tarifas</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    const open = (id) => openTarifa(id);
    document.getElementById('nuevo')?.addEventListener('click', () => open());
    document.getElementById('fab-nuevo')?.addEventListener('click', () => open());
    attachRowActions(document.getElementById('list'), { onEdit: open, onDelete: id=>deleteTarifa(id) }, true);
  }
}

async function openTarifa(id) {
  const isEdit = !!id;
  const [eqSnap, taSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID))),
    isEdit ? getDoc(doc(db, paths.tarifas(), id)) : Promise.resolve(null)
  ]);
  const equipos = eqSnap.docs.map(d => d.data());
  const ramas = [...new Set(equipos.map(e => e.rama).filter(Boolean))];
  const categorias = [...new Set(equipos.map(e => e.categoria).filter(Boolean))];
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
