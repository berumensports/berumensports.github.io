import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addEquipo, updateEquipo, deleteEquipo } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Equipos</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<table id="list"></table></div>`;
  const q = query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => `<tr><td>${d.data().nombre}</td>${isAdmin?'<td>'+renderActions(d.id)+'</td>':''}</tr>`).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay equipos</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openEquipo());
    attachRowActions(document.getElementById('list'), { onEdit:id=>openEquipo(id), onDelete: id=>deleteEquipo(id) }, true);
  }
}

function openEquipo(id) {
  const isEdit = !!id;
  openModal(`<form id="eq-form"><input name="nombre" placeholder="Nombre"><button>Guardar</button></form>`);
  const form = document.getElementById('eq-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value };
    if (isEdit) await updateEquipo(id, data); else await addEquipo(data);
    closeModal();
  });
}
