import { db, collection, getDocs, addDoc } from '../firebase-ui.js';
import { el, renderResponsiveTable, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';

export async function render(){
  const section=el('section',{class:'stack'});
  const header=el('div',{class:'stack-sm',style:'flex-direction:row;align-items:center;'},[
    el('h2',{style:'flex:1;'},'Partidos'),
    el('button',{class:'btn',id:'newBtn'},'Nuevo')
  ]);
  section.appendChild(header);
  const container=el('div'); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'sports',title:'Sin partidos',body:'',action:{label:'Crear',onClick:openNew}}));
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'fecha',label:'Fecha'},{key:'local',label:'Local'},{key:'visitante',label:'Visitante'}],rows});
  }

  function openNew(){
    const form=el('form',{class:'stack'},[
      el('label',{},['Fecha', el('input',{class:'input',type:'date',name:'fecha',required:true})]),
      el('label',{},['Local', el('input',{class:'input',name:'local',required:true})]),
      el('label',{},['Visitante', el('input',{class:'input',name:'visitante',required:true})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`), data); closeModal(); load(); showToast('success','Guardado'); }
      catch(err){showToast('error',err.message);} finally{setBusy(btn,false);}
    });
    openSheet('Nuevo partido', form);
  }

  header.querySelector('#newBtn').addEventListener('click',openNew);
  await load();
  return section;
}
