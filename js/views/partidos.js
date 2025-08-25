import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, userRole } from '../firebase-ui.js';
import { el, renderResponsiveTable, readForm, setBusy, showToast, emptyState } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';
import { ensureNewButton } from '../ui-new-button.js';
import { formatDate } from '../utils.js';

export async function render(){
  const role = await userRole();
  const section=el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Partidos'));
  const container=el('div'); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'sports',title:'Sin partidos',body:'',action: role==='admin'?{label:'Nuevo partido',onClick:openNew}:null}));
      await ensureNewButton(section,{text:'Nuevo partido',icon:'add',onClick:openNew,fab:true});
      return;
    }
    renderResponsiveTable(container,{
      columns:[
        {
          key:'fecha',
          label:'Fecha',
          format:v=>formatDate(v?.toDate?v.toDate():v)
        },
        {key:'local',label:'Local'},
        {key:'visitante',label:'Visitante'}
      ],
      rows
    });
    injectRowActions({
      root: container,
      rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id)
    });
    await ensureNewButton(section,{text:'Nuevo partido',icon:'add',onClick:openNew,fab:true});
  }

  function openForm(row){
    const form=el('form',{class:'stack'},[
      el('label',{},['Fecha', el('input',{
        class:'input',
        type:'date',
        name:'fecha',
        required:true,
        value: row?.fecha ? (row.fecha.toDate ? row.fecha.toDate().toISOString().slice(0,10) : row.fecha) : ''
      })]),
      el('label',{},['Local', el('input',{class:'input',name:'local',required:true,value:row?.local||''})]),
      el('label',{},['Visitante', el('input',{class:'input',name:'visitante',required:true,value:row?.visitante||''})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{
        if(row){ await updateDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos/${row.id}`), data); }
        else{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`), data); }
        Modal.close(); load(); showToast('success','Guardado');
      }catch(err){showToast('error',err.message);} finally{setBusy(btn,false);}
    });
    Modal.sheet(form,{title:row?'Editar partido':'Nuevo partido'});
  }

  const openNew = ()=>openForm(null);

  async function openEdit(id){
    const snap = await getDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos/${id}`));
    if(snap.exists()) openForm({id:snap.id,...snap.data()});
  }

  async function remove(id){
    try{ await deleteDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos/${id}`)); showToast('success','Eliminado'); load(); }
    catch(err){ showToast('error',err.message); }
  }

  await load();
  return section;
}
