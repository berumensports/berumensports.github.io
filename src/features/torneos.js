import { db, doc, getDoc } from '../data/firebase.js';
import { paths } from '../data/paths.js';
import { watchTorneos, addTorneo, updateTorneo, deleteTorneo, setActiveTorneo, getActiveTorneo } from '../data/torneos.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><div class="page-header"><h1 class="h1">Torneos</h1>${isAdmin?'<button id="nuevo" class="btn btn-primary">Nuevo</button>':''}</div><table class="responsive-table"><thead><tr><th>Nombre</th><th>Activo</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table></div>`;
  const unsub = watchTorneos(list => {
    const rows = list.map(t => `<tr><td data-label="Nombre">${t.nombre}</td><td data-label="Activo"><input type="radio" name="activo" value="${t.id}" ${t.id===getActiveTorneo()?'checked':''}></td>${isAdmin?`<td data-label="Acciones">${renderActions(t.id)}</td>`:''}</tr>`).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?3:2}">No hay torneos</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
    document.querySelectorAll('input[name="activo"]').forEach(r => r.addEventListener('change', e => setActiveTorneo(e.target.value)));
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openTorneo());
    attachRowActions(document.getElementById('list'), { onEdit:id=>openTorneo(id), onDelete:id=>deleteTorneo(id) }, true);
  }
}

async function openTorneo(id) {
  const isEdit = !!id;
  let existing = { nombre: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.torneos(), id));
    if (snap.exists()) existing = snap.data();
  }
  openModal(`<form id="to-form" class="modal-form"><label class="field"><span class="label">Nombre</span><input class="input" name="nombre" placeholder="Nombre"></label><div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div></form>`);
  const form = document.getElementById('to-form');
  form.nombre.value = existing.nombre || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value };
    if (isEdit) await updateTorneo(id, data); else await addTorneo(data);
    closeModal();
  });
}
