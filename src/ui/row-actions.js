export function attachRowActions(container, { onEdit, onDelete }, isAdmin) {
  if (!isAdmin) return;
  container.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'edit') onEdit(id);
    else if (action === 'delete') onDelete(id);
  });
}
export function renderActions(id) {
  return `<button data-action="edit" data-id="${id}" aria-label="Editar">✏️</button>
          <button data-action="delete" data-id="${id}" aria-label="Eliminar">🗑️</button>`;
}
