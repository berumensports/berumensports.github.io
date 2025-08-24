export const qs = (sel, ctx=document) => ctx.querySelector(sel);
export const el = (tag, attrs={}, children=[]) => {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if(k.startsWith('on')) element.addEventListener(k.substring(2), v);
    else if(k==='class') element.className = v;
    else if(v!==false && v!=null) element.setAttribute(k,v);
  });
  (Array.isArray(children)?children:[children]).forEach(c => {
    if(c==null) return;
    if(typeof c === 'string' || typeof c === 'number') element.appendChild(document.createTextNode(c));
    else element.appendChild(c);
  });
  return element;
};
export const on = (el, ev, cb) => el.addEventListener(ev, cb);

export function showToast(type, msg){
  const cont = qs('#toaster') || (()=>{const c=el('div',{id:'toaster',class:'toast-container'});document.body.appendChild(c);return c;})();
  const t = el('div',{class:`toast ${type}`},msg);
  cont.appendChild(t);
  setTimeout(()=>t.remove(),4000);
}

export function confirmDialog({title='Confirmar',body='¿Continuar?',confirmText='Aceptar'}){
  return new Promise(res=>{
    const content=el('div',{class:'stack'},[
      el('p',{},body),
      el('div',{class:'stack-sm',style:'flex-direction:row;justify-content:flex-end;'},[
        el('button',{class:'btn btn-ghost',onClick:()=>{closeModal();res(false);}},'Cancelar'),
        el('button',{class:'btn btn-danger',onClick:()=>{closeModal();res(true);}},confirmText)
      ])
    ]);
    openModal(title,content);
  });
}

export function openModal(title,content){
  const overlay=el('div',{class:'modal-overlay',role:'dialog'},[
    el('div',{class:'modal'},[
      el('header',{class:'stack-sm',style:'margin-bottom:8px;'},[
        el('h2',{},title),
        el('button',{class:'btn-icon',onClick:closeModal},el('span',{class:'material-symbols-outlined'},'close'))
      ]),
      content
    ])
  ]);
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay) closeModal();});
  document.addEventListener('keydown', escListener);
}

export function openSheet(title,content){
  const overlay=el('div',{class:'modal-overlay'},[
    el('div',{class:'sheet',role:'dialog'},[
      el('header',{class:'stack-sm',style:'margin-bottom:8px;'},[
        el('h2',{},title),
        el('button',{class:'btn-icon',onClick:closeModal},el('span',{class:'material-symbols-outlined'},'close'))
      ]),
      content
    ])
  ]);
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay) closeModal();});
  document.addEventListener('keydown', escListener);
}

function escListener(e){ if(e.key==='Escape') closeModal(); }

export function closeModal(){
  const overlay = qs('.modal-overlay');
  if(overlay) overlay.remove();
  document.removeEventListener('keydown', escListener);
}

export function renderResponsiveTable(container, config){
  function render(){
    container.innerHTML='';
    if(document.documentElement.classList.contains('is-mobile')){
      const list=el('div',{class:'table-stack'});
      config.rows.forEach(row=>{
        const card=el('div',{class:'row','data-id':row.id,'data-name':row.nombre||row.equipo||row.local||''});
        config.columns.forEach(col=>{
          const v=col.format?col.format(row[col.key]):row[col.key];
          card.appendChild(el('div',{},[el('strong',{},col.label+': '), el('span',{},v)]));
        });
        if(config.actions){
          const act=el('div',{class:'actions'});
          config.actions.forEach(a=>{
            act.appendChild(el('button',{class:'btn-icon',title:a.label,onClick:()=>a.onClick(row)},el('span',{class:'material-symbols-outlined'},a.icon)));
          });
          card.appendChild(act);
        }
        list.appendChild(card);
      });
      container.appendChild(list);
    }else{
      const cols=[...config.columns];
      if(config.actions) cols.push({key:'__actions',label:''});
      const table=el('table',{},[
        el('thead',{},el('tr',{},cols.map(c=>el('th',{},c.label)))),
        el('tbody',{},config.rows.map(row=>{
          const tds=cols.map(c=>{
            if(c.key==='__actions'){
              const td=el('td',{});
              const act=el('div',{class:'actions'});
              config.actions.forEach(a=>{
                act.appendChild(el('button',{class:'btn-icon',title:a.label,onClick:()=>a.onClick(row)},el('span',{class:'material-symbols-outlined'},a.icon)));
              });
              td.appendChild(act);
              return td;
            }
            return el('td',{},(c.format?c.format(row[c.key]):row[c.key]));
          });
          return el('tr',{'data-id':row.id,'data-name':row.nombre||row.equipo||row.local||''},tds);
        }))
      ]);
      container.appendChild(table);
    }
  }
  render();
  if(!container._resizer){
    container._resizer = () => render();
    window.addEventListener('resize', container._resizer);
  }
}

export function emptyState({icon,title,body,action}){
  const btn = action? el('button',{class:'btn',onClick:action.onClick},action.label):null;
  return el('div',{class:'empty'},[
    el('span',{class:'material-symbols-outlined icon'},icon||'inbox'),
    el('h3',{},title),
    el('p',{},body),
    btn
  ]);
}

export function readForm(form){
  const data=new FormData(form);
  return Array.from(data.entries()).reduce((a,[k,v])=>{a[k]=v;return a;},{});
}

export function setBusy(btn,bool){
  if(!btn) return;
  btn.disabled=!!bool;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = bool?'...':btn.dataset.originalText;
}
