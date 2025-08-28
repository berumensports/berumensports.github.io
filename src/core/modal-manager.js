let modal;
export function openModal(content) {
  const tabbar = document.querySelector('.tabbar');
  const mb = tabbar && getComputedStyle(tabbar).display !== 'none' ? tabbar.offsetHeight : 0;
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    Object.assign(modal.style, {
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'rgba(0,0,0,0.3)', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', zIndex: 1100
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.getElementById('modal-root').appendChild(modal);
  }
  modal.style.display = 'flex';
  modal.style.bottom = mb + 'px';
  modal.innerHTML = `<div class="modal-sheet">${content}</div>`;
  document.body.style.overflow = 'hidden';
}
export function closeModal() {
  if (!modal) return;
  modal.innerHTML = '';
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Expose closeModal globally so that inline event handlers like
// <button onclick="closeModal()">Cancelar</button> can access it. This
// solves the "closeModal is not defined" error triggered when clicking
// the Cancel button inside modal dialogs.
window.closeModal = closeModal;
