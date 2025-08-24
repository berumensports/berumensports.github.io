// Sin dependencias. Sin tocar lógica de datos.
// 1) Añade/quita una clase en <html> para desktop y 2) asegura que la sidebar quede visible en desktop.
(function(){
  const mq = window.matchMedia('(min-width:1024px)');
  const drawer = () => document.querySelector('.sidedrawer');

  function apply(e){
    document.documentElement.classList.toggle('is-desktop', e.matches);
    const d = drawer();
    if(!d) return;
    if(e.matches){
      // En desktop siempre visible (aunque el JS móvil haya puesto hidden)
      d.removeAttribute('hidden');
      d.style.display = 'block';
    }
  }
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  apply(mq);
})();
