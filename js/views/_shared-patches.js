/*
  Este archivo contiene pequeñas utilidades para uniformar headers y listas en todas las vistas
  sin reescribir cada una. 1) Aplica clase .section-header a encabezados, 2) envuelve tablas en .table-wrap.
  Llámalo desde tu app principal tras montar cada vista.
*/
export function enhanceView(root=document){
  // 1) Headers
  root.querySelectorAll('h1').forEach(h=>{
    if(!h.closest('.section-header')){
      const wrap = document.createElement('div');
      wrap.className = 'section-header';
      h.parentNode.insertBefore(wrap, h);
      wrap.appendChild(h);
      // Si hay un botón primario inmediatamente siguiente, súbelo al header
      const next = wrap.nextElementSibling;
      if(next && next.classList.contains('btn-row')) wrap.appendChild(next);
    }
  });
  // 2) Tablas
  root.querySelectorAll('table').forEach(t=>{
    if(!t.parentElement.classList.contains('table-wrap')){
      const w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    }
  });
}
