import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from '../firebase-ui.js';
import { el, renderResponsiveTable, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID } from '../constants.js';

export async function render(){
  const section = el('section',{class:'stack'});
  const header = el('div',{class:'stack-sm',style:'flex-direction:row;align-items:center;'},[
    el('h2',{style:'flex:1;'},'Equipos'),
    el('button',{class:'btn',id:'newBtn'},'Nuevo')
  ]);
  section.appendChild(header);
  const container = el('div');
  section.appendChild(container);

  async function load(){
    const snap = await getDocs(collection(db,`ligas/${LIGA_ID}/equipos`));
    const rows = snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'groups',title:'Sin equipos',body:'',action:{label:'Crear',onClick:openNew}}));
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'nombre',label:'Nombre'},{key:'delegacion',label:'Delegación'}],rows});
    injectRowActions({
      root: container,
      rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id)
    });
  }

  function openForm(row){
    const form = el('form',{class:'stack'},[
      el('label',{},['Nombre', el('input',{class:'input',name:'nombre',required:true,value:row?.nombre||''})]),
      el('label',{},['Delegación', el('input',{class:'input',name:'delegacion',required:true,value:row?.delegacion||''})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button');
      setBusy(btn,true);
      try{
        if(row){ await updateDoc(doc(db,`ligas/${LIGA_ID}/equipos/${row.id}`), data); }
        else{ await addDoc(collection(db,`ligas/${LIGA_ID}/equipos`), data); }
        closeModal(); load(); showToast('success','Guardado');
      }catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    openSheet(row?'Editar equipo':'Nuevo equipo',form);
  }

  const openNew = () => openForm(null);

  async function openEdit(id){
    const snap = await getDoc(doc(db,`ligas/${LIGA_ID}/equipos/${id}`));
    if(snap.exists()) openForm({id:snap.id,...snap.data()});
  }

  async function remove(id){
    try{ await deleteDoc(doc(db,`ligas/${LIGA_ID}/equipos/${id}`)); showToast('success','Eliminado'); load(); }
    catch(err){ showToast('error',err.message); }
  }

  header.querySelector('#newBtn').addEventListener('click',openNew);
  await load();
  return section;
}
