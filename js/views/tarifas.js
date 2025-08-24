import { db, collection, getDocs, addDoc } from '../firebase-ui.js';
import { el, renderResponsiveTable, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';

export async function render(){
  const section=el('section',{class:'stack'});
  const header= el('div',{class:'stack-sm',style:'flex-direction:row;align-items:center;'},[
    el('h2',{style:'flex:1;'},'Tarifas'),
    el('button',{class:'btn',id:'newBtn'},'Nueva')
  ]);
  section.appendChild(header);
  const container=el('div'); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'price_check',title:'Sin tarifas',body:'',action:{label:'Crear',onClick:openNew}}));
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'rama',label:'Rama'},{key:'categoria',label:'Categoría'},{key:'monto',label:'Monto',format:v=>`$${v}`}],rows});
  }

  function openNew(){
    const form = el('form',{class:'stack'},[
      el('label',{},['Rama', el('input',{class:'input',name:'rama',required:true})]),
      el('label',{},['Categoría', el('input',{class:'input',name:'categoria',required:true})]),
      el('label',{},['Monto', el('input',{class:'input',type:'number',name:'monto',required:true})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button');
      setBusy(btn,true);
      try{ data.monto=Number(data.monto); await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`), data); closeModal(); load(); showToast('success','Guardado'); }
      catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    openSheet('Nueva tarifa',form);
  }

  header.querySelector('#newBtn').addEventListener('click',openNew);
  await load();
  return section;
}
