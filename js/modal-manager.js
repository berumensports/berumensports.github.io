const focusableSel = 'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])';
const defaults = { trapFocus:true, escClose:true, clickOutsideClose:true, preventScroll:true, restoreFocus:true, safeArea:true, destroyOnClose:false };
const stack = [];
const listeners = {open:[], afterOpen:[], beforeClose:[], afterClose:[]};
let initialized=false;
let lastTrigger=null;

function emit(ev, detail){ (listeners[ev]||[]).forEach(fn=>fn(detail)); }

function lockScroll(){ const y=window.scrollY; document.body.dataset.modalScrollY=y; document.body.style.top=`-${y}px`; document.body.classList.add('modal-lock'); }
function unlockScroll(){ const y=parseInt(document.body.dataset.modalScrollY||'0',10); document.body.classList.remove('modal-lock'); document.body.style.top=''; window.scrollTo(0,y); delete document.body.dataset.modalScrollY; }

function backgroundInert(on){ const els=[...document.body.children].filter(el=>el.id!=='modal-root'); els.forEach(el=>{ if(on){ el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); } else{ el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); } }); }

function setupTrap(container){ const focusables=Array.from(container.querySelectorAll(focusableSel)); const first=focusables[0]||container; const last=focusables[focusables.length-1]||container; const start=document.createElement('span'); start.tabIndex=0; const end=document.createElement('span'); end.tabIndex=0; start.className='focus-sentinel'; end.className='focus-sentinel'; start.addEventListener('focus',()=>last.focus()); end.addEventListener('focus',()=>first.focus()); container.prepend(start); container.appendChild(end); container._trap={start,end}; }
function removeTrap(container){ const t=container._trap; if(t){ t.start.remove(); t.end.remove(); delete container._trap; } }

function handleEsc(e){ if(e.key==='Escape'){ const top=stack[stack.length-1]; if(top && top.options.escClose) close(top.id); }}

document.addEventListener('keydown',handleEsc);

function open(target, options={}){
  options={...defaults,...options};
  const isMobile=document.documentElement.classList.contains('is-mobile');
  const id = typeof target==='string' && target.startsWith('#') ? target.slice(1) : `m${Date.now()}`;
  let content;
  if(typeof target==='string'){
    if(target.startsWith('#')){
      const tpl=document.getElementById(target.slice(1));
      if(tpl){ content=tpl.tagName==='TEMPLATE'?tpl.content.cloneNode(true):tpl.cloneNode(true); }
    } else { const tmp=document.createElement('div'); tmp.innerHTML=target; content=tmp; }
  } else if(target instanceof Node){ content=target; }
  const overlay=document.createElement('div'); overlay.className='modal-overlay'; overlay.dataset.modalId=id;
  const inner=document.createElement('div'); inner.className=options.sheet || isMobile ? 'sheet' : 'modal'; inner.setAttribute('role','dialog'); inner.setAttribute('aria-modal','true');
  if(options.title){
    const header=document.createElement('header'); header.className='modal-header';
    const h=document.createElement('h2'); h.id=`${id}-title`; h.textContent=options.title; header.appendChild(h);
    const btn=document.createElement('button'); btn.setAttribute('type','button'); btn.className='modal-close'; btn.setAttribute('aria-label','Cerrar'); btn.setAttribute('data-modal-close',''); btn.innerHTML='<span class="material-symbols-outlined">close</span>'; header.appendChild(btn);
    inner.appendChild(header); inner.setAttribute('aria-labelledby',h.id);
  }
  const body=document.createElement('div'); body.className='modal-body'; if(content) body.append(content); inner.appendChild(body);
  overlay.appendChild(inner);
  const root=document.getElementById('modal-root')||document.body; root.appendChild(overlay);
  if(options.preventScroll && stack.length===0){ lockScroll(); backgroundInert(true); }
  if(options.trapFocus) setupTrap(inner);
  overlay.addEventListener('click',e=>{ if(e.target===overlay && options.clickOutsideClose) close(id); });
  setTimeout(()=>overlay.setAttribute('data-open',''));
  const focusEl=inner.querySelector('[autofocus],'+focusableSel); (focusEl||inner).focus();
  const opener=options.trigger||document.activeElement; stack.push({id,overlay,inner,options,opener});
  window.__MODAL_DEBUG__.openStack=stack; emit('open',{id}); setTimeout(()=>emit('afterOpen',{id}),200);
  return id;
}

function sheet(target,opts={}){ return open(target,{...opts,sheet:true}); }

function close(id){ let m; if(!id){ m=stack.pop(); } else { const i=stack.findIndex(x=>x.id===id); if(i>=0) m=stack.splice(i,1)[0]; }
  if(!m) return; emit('beforeClose',{id:m.id}); m.overlay.setAttribute('data-closing',''); setTimeout(()=>{ removeTrap(m.inner); m.overlay.remove(); if(m.options.restoreFocus && m.opener instanceof HTMLElement) m.opener.focus(); if(stack.length===0 && m.options.preventScroll){ unlockScroll(); backgroundInert(false);} emit('afterClose',{id:m.id}); },200);
}

function closeAll(){ while(stack.length) close(stack[stack.length-1].id); }

function setContent(id, html){ const m=stack.find(x=>x.id===id); if(!m) return; const body=m.inner.querySelector('.modal-body'); body.innerHTML=''; if(typeof html==='string') body.innerHTML=html; else if(html) body.append(html); }

function on(ev,handler){ if(listeners[ev]) listeners[ev].push(handler); }

function init(){ if(initialized) return; document.addEventListener('click',e=>{ const openBtn=e.target.closest('[data-modal-open]'); if(openBtn){ e.preventDefault(); lastTrigger=openBtn; open(openBtn.getAttribute('data-modal-open'),{trigger:openBtn}); return;} const sheetBtn=e.target.closest('[data-modal-sheet]'); if(sheetBtn){ e.preventDefault(); lastTrigger=sheetBtn; sheet(sheetBtn.getAttribute('data-modal-sheet'),{trigger:sheetBtn}); return;} const closeBtn=e.target.closest('[data-modal-close]'); if(closeBtn){ e.preventDefault(); const ov=closeBtn.closest('.modal-overlay'); close(ov?.dataset.modalId); } }); initialized=true; }

window.__MODAL_DEBUG__ = { openStack: stack, lastTrigger: ()=>lastTrigger };

export const Modal = { init, open, sheet, close, closeAll, setContent, on };
if (typeof window !== "undefined") window.Modal = Modal;
export default Modal;
