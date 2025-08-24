import { el } from './ui-kit.js';

const catalogCache = {};

function cacheFetch(key, fetcher){
  if(catalogCache[key]) return catalogCache[key];
  catalogCache[key] = fetcher().catch(err=>{ delete catalogCache[key]; throw err; });
  return catalogCache[key];
}

function createBaseSelect({name, placeholder='--', selectedId, fetch}){
  const hidden = el('input',{type:'hidden',name,value:selectedId||''});
  const input = el('input',{
    class:'input',
    placeholder,
    'aria-haspopup':'listbox',
    autocomplete:'off'
  });
  const list = el('ul',{class:'cb-list',role:'listbox',hidden:true});
  const wrapper = el('div',{class:'combobox',role:'combobox','aria-expanded':'false'},[hidden,input,list]);

  let items = [];
  let loaded = false;

  async function ensure(){
    if(loaded) return;
    loaded = true;
    list.innerHTML = '<li class="cb-loading">Cargando...</li>';
    try{
      items = await fetch();
      list.innerHTML='';
      items.forEach(it=>{
        const li = el('li',{role:'option','data-id':it.id},it.label);
        if(it.id===selectedId){
          input.value = it.label;
          hidden.value = it.id;
        }
        list.appendChild(li);
      });
      if(!items.length){
        list.innerHTML = '<li class="cb-empty">Sin resultados</li>';
      }
    }catch(err){
      list.innerHTML = '<li class="cb-error">Error al cargar</li>';
      console.error(err);
    }
  }

  input.addEventListener('focus', async ()=>{
    wrapper.setAttribute('aria-expanded','true');
    list.hidden = false;
    await ensure();
  });

  input.addEventListener('input',()=>{
    const q = input.value.toLowerCase();
    Array.from(list.children).forEach(li=>{
      if(!li.dataset.id) return;
      li.hidden = !li.textContent.toLowerCase().includes(q);
    });
  });

  list.addEventListener('click',e=>{
    const li = e.target.closest('li[data-id]');
    if(!li) return;
    hidden.value = li.dataset.id;
    input.value = li.textContent;
    list.hidden = true;
    wrapper.setAttribute('aria-expanded','false');
    wrapper.dispatchEvent(new Event('change'));
  });

  document.addEventListener('click',e=>{
    if(!wrapper.contains(e.target)){
      list.hidden = true;
      wrapper.setAttribute('aria-expanded','false');
    }
  });

  return wrapper;
}

export function createFirestoreSelect({name, placeholder='--', collectionPath, labelField='nombre', selectedId, cacheKey}){
  return createBaseSelect({
    name,
    placeholder,
    selectedId,
    fetch: ()=>cacheFetch(cacheKey||collectionPath, async ()=>{
      const { db, collection, getDocs } = await import('./firebase-ui.js');
      const snap = await getDocs(collection(db, collectionPath));
      const arr = snap.docs.map(d=>({id:d.id,label:d.data()[labelField]||d.id}));
      arr.sort((a,b)=>a.label.localeCompare(b.label));
      return arr;
    })
  });
}

export function createStaticSelect({name, placeholder='--', options=[], selectedId}){
  return createBaseSelect({
    name,
    placeholder,
    selectedId,
    fetch: async ()=>options
  });
}

