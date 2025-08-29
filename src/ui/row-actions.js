export function attachRowActions(container, handlers, isAdmin) {
  if (!isAdmin) return;
  container.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const map = {
      edit: handlers.onEdit || handlers.edit,
      delete: handlers.onDelete || handlers.delete,
      ticket: handlers.onTicket || handlers.ticket,
      pdf: handlers.onPdf || handlers.pdf,
      whatsapp: handlers.onWhatsapp || handlers.whatsapp
    };
    const fn = map[action];
    if (!fn) return;
    if (action === 'delete') {
      if (confirm('¿Estás seguro de eliminar este registro?')) fn(id);
    } else {
      fn(id);
    }
  });
}

export function renderActions(id, extra = []) {
  return `<span class="row-actions">
    <button class="icon-btn" data-action="edit" data-id="${id}" aria-label="Editar" title="Editar">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#edit"></use></svg>
    </button>
    <button class="icon-btn" data-action="delete" data-id="${id}" aria-label="Eliminar" title="Eliminar">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#trash"></use></svg>
    </button>
    ${extra.map(a => `<button class="icon-btn" data-action="${a.action}" data-id="${id}" aria-label="${a.label}" title="${a.label}">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${a.icon}"></use></svg>
    </button>`).join('')}
  </span>`;
}
