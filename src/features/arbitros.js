import { db, collection, query, where, onSnapshot, orderBy } from '../data/firebase.js';
import { paths, LIGA_ID } from '../data/paths.js';
import { addArbitro } from '../data/repo.js';
import { openModal, closeModal } from '../core/modal-manager.js';
import { pushCleanup } from '../core/router.js';
import { getUserRole } from '../core/auth.js';

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
      <table id="list"></table>
    </div>
    ${isAdmin ? '<button id="fab-nuevo" class="fab" aria-label="Nuevo árbitro"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg></button>' : ''}`;
  const q = query(collection(db, paths.arbitros()), where('ligaId','==',LIGA_ID), orderBy('nombre'));
  const unsub = onSnapshot(q, snap => {
    const rows = snap.docs.map(d => {
      const data = d.data();
      return `<tr><td>${data.nombre}</td><td>${data.telefono||''}</td><td>${data.email||''}</td></tr>`;
    }).join('');
    document.getElementById('list').innerHTML = rows || '<tr><td>No hay árbitros</td></tr>';
  });
  pushCleanup(() => unsub());
  if (isAdmin) {
    const open = () => openArbitro();
    document.getElementById('nuevo')?.addEventListener('click', open);
    document.getElementById('fab-nuevo')?.addEventListener('click', open);
  }
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length !== 10) return value;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)} ${digits.slice(6)}`;
}

function openArbitro() {
  openModal(`
    <form id="ar-form" class="modal-form">
      <label class="field"><span class="label">Nombre</span><input name="nombre" class="input" required></label>
      <label class="field"><span class="label">Teléfono</span><input name="telefono" class="input" placeholder="10 dígitos"></label>
      <label class="field"><span class="label">Email</span><input name="email" type="email" class="input" placeholder="Email"></label>
      <div class="modal-footer"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary">Guardar</button></div>
    </form>`);
  const form = document.getElementById('ar-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nombre: form.nombre.value.trim(),
      telefono: formatPhone(form.telefono.value),
      email: form.email.value.trim()
    };
    await addArbitro(data);
    closeModal();
  });
}
