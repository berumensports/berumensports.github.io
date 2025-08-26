let modal;
export function openModal(content) {
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    Object.assign(modal.style, {
      position: 'fixed', top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.3)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:1100
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.getElementById('modal-root').appendChild(modal);
  }
  modal.innerHTML = `<div style="background:#fff;max-height:90vh;overflow:auto;padding:1rem;border-radius:var(--radius);">${content}</div>`;
  document.body.style.overflow = 'hidden';
}
export function closeModal() {
  if (!modal) return;
  modal.innerHTML = '';
  document.body.style.overflow = '';
}
