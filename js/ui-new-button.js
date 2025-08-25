import { el } from './ui-kit.js';
import { userRole } from './firebase-ui.js';

export async function ensureNewButton(viewRoot, {text, icon='add', onClick, role='admin', fab=false}={}){
  if(!viewRoot) return;
  const currentRole = await userRole();
  // Ensure section header
  let header = viewRoot.querySelector('.section-header');
  let heading = viewRoot.querySelector('h1, h2');
  if(!header){
    if(!heading){ return; }
    // convert heading to h1 if needed
    if(heading.tagName.toLowerCase()!=='h1'){
      const h1=document.createElement('h1');
      h1.textContent=heading.textContent;
      heading.replaceWith(h1); heading=h1;
    }
    header=document.createElement('div');
    header.className='section-header';
    heading.parentNode.insertBefore(header, heading);
    header.appendChild(heading);
  }
  let row=header.querySelector('.btn-row');
  if(!row){
    row=document.createElement('div');
    row.className='btn-row';
    header.appendChild(row);
  }
  // role check
  if(currentRole!==role){
    const existing=row.querySelector('button[data-new]');
    if(existing) existing.remove();
    const fabBtn=viewRoot.querySelector('.fab[data-new]');
    if(fabBtn) fabBtn.remove();
    return;
  }
  let btn=row.querySelector('button[data-new]');
  if(!btn){
    btn=el('button',{class:'btn btn-primary','data-new':'','aria-label':text,title:text},[
      el('span',{class:'material-symbols-outlined'},icon),
      el('span',{},text)
    ]);
    row.appendChild(btn);
  }
  if(!btn._listener){
    btn.addEventListener('click',onClick);
    btn._listener=true;
  }
  // FAB for mobile/iPad
  if(fab && document.documentElement.classList.contains('is-mobile')){
    let fabBtn=viewRoot.querySelector('.fab[data-new]');
    if(!fabBtn){
      fabBtn=el('button',{class:'fab','data-new':'','aria-label':text,title:text},
        el('span',{class:'material-symbols-outlined'},icon)
      );
      viewRoot.appendChild(fabBtn);
    }
    if(!fabBtn._listener){
      fabBtn.addEventListener('click',onClick);
      fabBtn._listener=true;
    }
  }
}

export default ensureNewButton;
