// Sin dependencias. Sin tocar lógica de datos.
// 1) Añade/quita una clase en <html> para layouts de pantalla grande
//    y 2) asegura que la sidebar quede visible en esas vistas.
(function(){
  const mq = window.matchMedia('(min-width:768px)');
  const drawer = () => document.querySelector('.sidedrawer');

  function apply(e){
    document.documentElement.classList.toggle('is-desktop', e.matches);
    const d = drawer();
    if(!d) return;
    if(e.matches){
      // En pantallas amplias siempre visible (aunque el JS móvil haya puesto hidden)
      d.removeAttribute('hidden');
      d.style.display = 'block';
    }
  }
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  apply(mq);
})();
