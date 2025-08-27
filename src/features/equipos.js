import { db, collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addEquipo, updateEquipo, deleteEquipo } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><div class="page-header"><h1 class="h1">Equipos</h1>${isAdmin?'<button id="nuevo" class="btn btn-primary">Nuevo</button>':''}</div><table class="responsive-table"><thead><tr><th>Nombre</th><th>Rama</th><th>Categoría</th><th>Delegación</th>${isAdmin?'<th>Acciones</th>':''}</tr></thead><tbody id="list"></tbody></table></div>`;
  const delSnap = await getDocs(query(collection(db, paths.delegaciones()), where('ligaId','==',LIGA_ID), orderBy('nombre')));
  const delegMap = {};
  delSnap.forEach(d => { delegMap[d.id] = d.data().nombre; });
  const q = query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `<tr>
        <td data-label="Nombre">${data.nombre}</td>
        <td data-label="Rama">${data.rama||''}</td>
        <td data-label="Categoría">${data.categoria||''}</td>
        <td data-label="Delegación">${delegMap[data.delegacionId]||''}</td>
        ${isAdmin?`<td data-label="Acciones">${renderActions(d.id)}</td>`:''}
      </tr>`;
    }).join('');
    const empty = `<tr><td data-label="Mensaje" colspan="${isAdmin?5:4}">No hay equipos</td></tr>`;
    document.getElementById('list').innerHTML = rows || empty;
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openEquipo(null, delegMap));
    attachRowActions(document.getElementById('list'), { onEdit:id=>openEquipo(id, delegMap), onDelete: id=>deleteEquipo(id) }, true);
  }
}

async function openEquipo(id, delegaciones) {
  const isEdit = !!id;
  let existing = { nombre: '', rama: '', categoria: '', delegacionId: '' };
  if (isEdit) {
    const snap = await getDoc(doc(db, paths.equipos(), id));
    if (snap.exists()) existing = snap.data();
  }
  const ramaOpts = ['Varonil','Femenil'].map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = Array.from({length: 2020-2009+1}, (_,i)=>2009+i).map(y => `<option value="${y}">${y}</option>`).join('');
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
