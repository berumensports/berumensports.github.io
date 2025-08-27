import { db, collection, query, where, onSnapshot, orderBy, getDocs } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addEquipo, updateEquipo, deleteEquipo } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';
import { attachRowActions, renderActions } from '../ui/row-actions.js';

export async function render(el) {
  const isAdmin = getUserRole() === 'admin';
  el.innerHTML = `<div class="card"><h2>Equipos</h2>${isAdmin?'<button id="nuevo">Nuevo</button>':''}<table id="list"></table></div>`;
  const delSnap = await getDocs(query(collection(db, paths.delegaciones()), where('ligaId','==',LIGA_ID), orderBy('nombre')));
  const delegMap = {};
  delSnap.forEach(d => { delegMap[d.id] = d.data().nombre; });
  const q = query(collection(db, paths.equipos()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `<tr><td>${data.nombre}</td><td>${data.rama||''}</td><td>${data.categoria||''}</td><td>${delegMap[data.delegacionId]||''}</td>${isAdmin?'<td>'+renderActions(d.id)+'</td>':''}</tr>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay equipos</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    document.getElementById('nuevo').addEventListener('click', () => openEquipo(null, delegMap));
    attachRowActions(document.getElementById('list'), { onEdit:id=>openEquipo(id, delegMap), onDelete: id=>deleteEquipo(id) }, true);
  }
}

function openEquipo(id, delegaciones) {
  const isEdit = !!id;
  const ramaOpts = ['Varonil','Femenil'].map(r => `<option value="${r}">${r}</option>`).join('');
  const catOpts = Array.from({length: 2020-2009+1}, (_,i)=>2009+i).map(y => `<option value="${y}">${y}</option>`).join('');
  const delOpts = Object.entries(delegaciones).map(([did,name]) => `<option value="${did}">${name}</option>`).join('');
  openModal(`<form id="eq-form"><input name="nombre" placeholder="Nombre"><select name="rama">${ramaOpts}</select><select name="categoria">${catOpts}</select><select name="delegacionId">${delOpts}</select><button>Guardar</button></form>`);
  const form = document.getElementById('eq-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = { nombre: form.nombre.value, rama: form.rama.value, categoria: form.categoria.value, delegacionId: form.delegacionId.value };
    if (isEdit) await updateEquipo(id, data); else await addEquipo(data);
    closeModal();
  });
}
