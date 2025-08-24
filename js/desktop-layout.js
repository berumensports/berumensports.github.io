// Sin dependencias. Sin tocar lógica de datos.
// 1) Añade/quita una clase en <html> para layouts de pantalla grande
//    y 2) asegura que la sidebar quede visible en esas vistas.
(function(){
  const mq = window.matchMedia('(min-width:768px)');
  const drawer = () => document.querySelector('.sidedrawer');

  function apply(){
    const isDesktop = mq.matches;
    document.documentElement.classList.toggle('is-desktop', isDesktop);
    const d = drawer();
    if(!d) return;
    const isAuth = document.body.classList.contains('auth');
    if(isDesktop && isAuth){
      // En pantallas amplias la barra lateral debe estar visible
      d.removeAttribute('hidden');
      d.style.display = 'block';
    } else {
      // Ocultar para usuarios sin sesión o en pantallas pequeñas
      d.setAttribute('hidden','');
      d.style.display = '';
      d.classList.remove('open');
    }
  }

  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  const observer = new MutationObserver(apply);
  observer.observe(document.body,{attributes:true, attributeFilter:['class']});
  apply();
})();
