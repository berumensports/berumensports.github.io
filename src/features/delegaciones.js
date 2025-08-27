import { db, collection, query, where, onSnapshot, orderBy, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addDelegacion, updateDelegacion, deleteDelegacion } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><div class="page-header"><h1 class="h1">Delegaciones</h1>${isAdmin?'<button id="nuevo" class="btn btn-primary">Nuevo</button>':''}</div><table id="list"></table></div>`;
  const q = query(collection(db, paths.delegaciones()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => `<tr><td>${d.data().nombre}</td>${isAdmin?'<td>'+renderActions(d.id)+'</td>':''}</tr>`).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay delegaciones</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openDelegacion());
    attachRowActions(document.getElementById('list'), { onEdit:id=>openDelegacion(id), onDelete:id=>deleteDelegacion(id) }, true);
  }
}

async function openDelegacion(id) {
  const isEdit = !!id;
  let existing = { nombre: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.delegaciones(), id));
    if (snap.exists()) existing = snap.data();
  }
  openModal(`<form id="del-form" class="modal-form"><label class="field"><span class="label">Nombre</span><input class="input" name="nombre" placeholder="Nombre"></label><div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div></form>`);
  const form = document.getElementById('del-form');
  form.nombre.value = existing.nombre || '';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value };
    if (isEdit) await updateDelegacion(id, data); else await addDelegacion(data);
    closeModal();
  });
}
