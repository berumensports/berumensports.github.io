import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, userRole } from '../firebase-ui.js';
import { el, renderResponsiveTable, readForm, setBusy, showToast, emptyState, confirmDialog } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';
import { ensureNewButton } from '../ui-new-button.js';

export async function render(){
  const role = await userRole();
  const section=el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Tarifas'));
  const container=el('div'); section.appendChild(container);
  let rows=[];

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`));
    rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'price_check',title:'Sin tarifas',body:'',action: role==='admin'?{label:'Nueva tarifa',onClick:openNew}:null}));
      await ensureNewButton(section,{text:'Nueva tarifa',icon:'add',onClick:openNew,fab:true});
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'rama',label:'Rama'},{key:'categoria',label:'Categoría'},{key:'monto',label:'Monto',format:v=>`$${v}`}],rows});
    injectRowActions({
      root: container,
      rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id)
    });
    await ensureNewButton(section,{text:'Nueva tarifa',icon:'add',onClick:openNew,fab:true});
  }

  function openForm(row){
    const form = el('form',{class:'stack'},[
      el('label',{},['Rama', el('input',{class:'input',name:'rama',required:true,value:row?.rama||''})]),
      el('label',{},['Categoría', el('input',{class:'input',name:'categoria',required:true,value:row?.categoria||''})]),
      el('label',{},['Monto', el('input',{class:'input',type:'number',name:'monto',required:true,value:row?.monto||''})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      data.monto=Number(data.monto);
      const btn=form.querySelector('button');
      setBusy(btn,true);
      try{
        if(row){ await updateDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas/${row.id}`), data); }
        else{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas`), data); }
        Modal.close(); load(); showToast('success','Guardado');
      }catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    Modal.sheet(form,{title:row?'Editar tarifa':'Nueva tarifa'});
  }

  const openNew = ()=>openForm(null);
  const openEdit = id=>{ const row=rows.find(r=>r.id===id); if(row) openForm(row); };

  async function remove(id){
    const ok = await confirmDialog({body:'¿Eliminar tarifa?',confirmText:'Eliminar'});
    if(!ok) return;
    try{ await deleteDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/tarifas/${id}`)); showToast('success','Eliminado'); load(); }
    catch(err){ showToast('error',err.message); }
  }

  await load();
  return section;
}
