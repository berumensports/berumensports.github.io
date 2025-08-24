// Hook visual: 1) envolver tablas en .table-wrap  2) asegurar headers
export function enhanceView(root=document){
  root.querySelectorAll('table').forEach(t=>{
    if(!t.parentElement.classList.contains('table-wrap')){
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      t.parentNode.insertBefore(wrap, t); wrap.appendChild(t);
    }
  });
  root.querySelectorAll('h1').forEach(h=>{
    if(!h.closest('.section-header')){
      const w = document.createElement('div'); w.className='section-header';
      h.parentNode.insertBefore(w, h); w.appendChild(h);
      const next = w.nextElementSibling;
      if(next && next.classList.contains('btn-row')) w.appendChild(next);
    }
  });
}
