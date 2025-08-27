import { db, collection, query, where, onSnapshot, orderBy } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addDelegacion, updateDelegacion, deleteDelegacion } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Delegaciones</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<table id="list"></table></div>`;
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

function openDelegacion(id) {
  const isEdit = !!id;
  openModal(`<form id="del-form" class="modal-form"><input name="nombre" placeholder="Nombre"><button>Guardar</button></form>`);
  const form = document.getElementById('del-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value };
    if (isEdit) await updateDelegacion(id, data); else await addDelegacion(data);
    closeModal();
  });
}
