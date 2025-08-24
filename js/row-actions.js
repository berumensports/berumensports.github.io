// Berumen • utilidades para inyectar acciones Editar/Eliminar en cualquier listado.
// Uso: after render de una vista, llama a injectRowActions({...})
import { userRole } from './firebase-ui.js'; // función que devuelve "admin"|"consulta" (ajusta si tu helper tiene otro nombre)

/**
 * @typedef {Object} ActionsOptions
 * @property {HTMLElement} root            - contenedor donde buscar filas
 * @property {string} rowSelector          - selector de cada item con data-id (ej: 'tbody tr[data-id], .table-stack .row[data-id]')
 * @property {(p:{id:string,el:HTMLElement})=>void} onEdit
 * @property {(p:{id:string,el:HTMLElement})=>Promise<void>|void} onDelete
 * @property {('table'|'card'|'auto')} [mode]  - cómo renderizar (auto detecta)
 * @property {boolean} [onlyAdmin=true]        - si true, solo muestra a admins
 */
export function injectRowActions(opts){
  const role = (typeof userRole === 'function' ? userRole() : 'consulta');
  const onlyAdmin = opts.onlyAdmin !== false;
  if (onlyAdmin && role !== 'admin') return; // no muestra nada a consulta

  const root = opts.root || document;
  const rows = root.querySelectorAll(opts.rowSelector);
  if (!rows.length) return;

  rows.forEach(el=>{
    const id = el.getAttribute('data-id');
    if (!id || el.querySelector('[data-actions]')) return; // ya tiene acciones
    const isTableRow = el.tagName === 'TR' || el.closest('table');
    const mode = opts.mode || (isTableRow ? 'table' : 'card');

    if (mode === 'table') {
      // Cabecera: asegura th "Acciones"
      const table = el.closest('table');
      if (table && !table.querySelector('thead th.th-actions')) {
        const th = document.createElement('th');
        th.className = 'th-actions'; th.textContent = 'Acciones';
        const theadRow = table.tHead?.rows[0];
        if (theadRow) theadRow.appendChild(th);
      }
      // Celda de acciones
      const td = document.createElement('td');
      td.className = 'cell-actions'; td.setAttribute('data-actions','');
      td.appendChild(makeBtn('edit', 'Editar'));
      td.appendChild(makeBtn('delete', 'Eliminar'));
      el.appendChild(td);
    } else {
      // Card / lista apilada
      const footer = document.createElement('div');
      footer.className = 'actions actions--card'; footer.setAttribute('data-actions','');
      footer.appendChild(makeBtn('edit', 'Editar'));
      footer.appendChild(makeBtn('delete', 'Eliminar'));
      el.appendChild(footer);
    }
  });

  // Delegación de eventos (un solo listener)
  root.addEventListener('click', async (ev)=>{
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    const host = btn.closest('[data-id]');
    if (!host) return;
    const id = host.getAttribute('data-id');
    if (!id) return;

    const type = btn.getAttribute('data-action');
    if (type === 'edit') {
      opts.onEdit?.({ id, el: host });
    } else if (type === 'delete') {
      // Confirmación simple + bloqueo mientras elimina
      if (!(await confirmDelete(host.getAttribute('data-name') || 'registro'))) return;
      btn.setAttribute('disabled', 'true');
      try {
        await opts.onDelete?.({ id, el: host });
        // Si el handler no removió la fila, lo hacemos aquí
        const isRow = host.tagName === 'TR';
        if (isRow) host.remove();
        else host.classList.add('hidden');
      } finally {
        btn.removeAttribute('disabled');
      }
    }
  }, { once: false });

  function makeBtn(kind, label){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `action-btn action-btn--${kind}`;
    b.setAttribute('title', label);
    b.setAttribute('aria-label', label);
    b.setAttribute('data-action', kind);
    // icono Material Symbols
    const i = document.createElement('span');
    i.className = 'material-symbols-outlined';
    i.textContent = kind === 'edit' ? 'edit' : 'delete';
    b.appendChild(i);
    return b;
  }
}

/** Confirmación accesible minimal */
export function confirmDelete(name='registro'){
  return new Promise(res=>{
    const ok = window.confirm(`¿Eliminar ${name}? Esta acción no se puede deshacer.`);
    res(ok);
  });
}
