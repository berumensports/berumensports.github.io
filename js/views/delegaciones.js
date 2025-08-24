import { db, collection, getDocs, addDoc } from '../firebase-ui.js';
import { el, renderResponsiveTable, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { LIGA_ID } from '../constants.js';

export async function render(){
  const section = el('section',{class:'stack'});
  const header = el('div',{class:'stack-sm',style:'flex-direction:row;align-items:center;'},[
    el('h2',{style:'flex:1;'},'Delegaciones'),
    el('button',{class:'btn',id:'newBtn'},'Nueva')
  ]);
  section.appendChild(header);
  const container = el('div');
  section.appendChild(container);

  async function load(){
    const snap = await getDocs(collection(db,`ligas/${LIGA_ID}/delegaciones`));
    const rows = snap.docs.map(d=>({id:d.id,...d.data()}));
    if(rows.length===0){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'domain',title:'Sin delegaciones',body:'No hay registros',action:{label:'Crear',onClick:openNew}}));
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'nombre',label:'Nombre'}],rows});
  }

  function openNew(){
    const form = el('form',{class:'stack'},[
      el('label',{},['Nombre', el('input',{class:'input',name:'nombre',required:true})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button');
      setBusy(btn,true);
      try{ await addDoc(collection(db,`ligas/${LIGA_ID}/delegaciones`), data); closeModal(); load(); showToast('success','Guardado'); }
      catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    openSheet('Nueva delegación',form);
  }

  header.querySelector('#newBtn').addEventListener('click',openNew);
  await load();
  return section;
}
