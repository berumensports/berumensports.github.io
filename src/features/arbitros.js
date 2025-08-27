import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addArbitro, updateArbitro, deleteArbitro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

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
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo árbitro"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const q = query(collection(db, paths.arbitros()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
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
