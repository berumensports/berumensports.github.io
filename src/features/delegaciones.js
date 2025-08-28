import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { getActiveTorneo } from '../data/torneos.js';
import { addDelegacion, updateDelegacion, deleteDelegacion } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><div class="page-header"><h1 class="h1">Delegaciones</h1>${isAdmin?'<button id="nuevo" class="btn btn-primary">Nuevo</button>':''}</div><table class="responsive-table"><thead><tr><th>Nombre</th><th>Teléfono</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table></div>`;
  const q = query(collection(db, paths.delegaciones()), where('torneoId','==',getActiveTorneo()), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => `<tr><td data-label="Nombre">${d.data().nombre}</td><td data-label="Teléfono">${d.data().telefono||''}</td>${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}</tr>`).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?3:2}">No hay delegaciones</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openDelegacion());
    attachRowActions(document.getElementById('list'), { onEdit:id=>openDelegacion(id), onDelete:id=>deleteDelegacion(id) }, true);
  }
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length !== 10) return value;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)} ${digits.slice(6)}`;
}

async function openDelegacion(id) {
  const isEdit = !!id;
  let existing = { nombre: '', telefono: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.delegaciones(), id));
    if (snap.exists()) existing = snap.data();
  }
  openModal(`<form id="del-form" class="modal-form"><label class="field"><span class="label">Nombre</span><input class="input" name="nombre" placeholder="Nombre"></label><label class="field"><span class="label">Teléfono/Whatsapp</span><input class="input" name="telefono" placeholder="10 dígitos"></label><div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div></form>`);
  const form = document.getElementById('del-form');
  form.nombre.value = existing.nombre || '';
  form.telefono.value = existing.telefono || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value, telefono: formatPhone(form.telefono.value) };
    if (isEdit) await updateDelegacion(id, data); else await addDelegacion(data);
    closeModal();
  });
}
