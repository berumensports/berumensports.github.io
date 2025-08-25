import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, userRole } from '../firebase-ui.js';
import { el, renderResponsiveTable, readForm, setBusy, showToast, emptyState } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID } from '../constants.js';
import { ensureNewButton } from '../ui-new-button.js';

export async function render(){
  const role = await userRole();
  const section = el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Delegaciones'));
  const container = el('div');
  section.appendChild(container);

  async function load(){
    const snap = await getDocs(collection(db,`ligas/${LIGA_ID}/delegaciones`));
    const rows = snap.docs.map(d=>({id:d.id,...d.data()}));
    if(rows.length===0){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'domain',title:'Sin delegaciones',body:'No hay registros',action: role==='admin'?{label:'Nueva delegación',onClick:openNew}:null}));
      await ensureNewButton(section,{text:'Nueva delegación',icon:'add',onClick:openNew,fab:true});
      return;
    }
    renderResponsiveTable(container,{columns:[{key:'nombre',label:'Nombre'}],rows});
    injectRowActions({
      root: container,
      rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id),
      getRole: () => role
    });
    await ensureNewButton(section,{text:'Nueva delegación',icon:'add',onClick:openNew,fab:true});
  }

  function openForm(row){
    const form = el('form',{class:'stack'},[
      el('label',{},['Nombre', el('input',{class:'input',name:'nombre',required:true,value:row?.nombre||''})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      const btn=form.querySelector('button');
      setBusy(btn,true);
      try{
        if(row){ await updateDoc(doc(db,`ligas/${LIGA_ID}/delegaciones/${row.id}`), data); }
        else{ await addDoc(collection(db,`ligas/${LIGA_ID}/delegaciones`), data); }
        Modal.close(); load(); showToast('success','Guardado');
      }
      catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    Modal.sheet(form,{title:row?'Editar delegación':'Nueva delegación'});
  }

  const openNew = () => openForm(null);

  async function openEdit(id){
    const snap = await getDoc(doc(db,`ligas/${LIGA_ID}/delegaciones/${id}`));
    if(snap.exists()) openForm({id:snap.id,...snap.data()});
  }

  async function remove(id){
    try{ await deleteDoc(doc(db,`ligas/${LIGA_ID}/delegaciones/${id}`)); showToast('success','Eliminado'); load(); }
    catch(err){ showToast('error',err.message); }
  }

  await load();
  return section;
}
