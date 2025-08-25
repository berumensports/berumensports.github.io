import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, userRole } from '../firebase-ui.js';
import { el, renderResponsiveTable, readForm, setBusy, showToast, emptyState } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID } from '../constants.js';
import { createFirestoreSelect, createStaticSelect } from '../combobox.js';
import { ensureNewButton } from '../ui-new-button.js';

export async function render(){
  const role = await userRole();
  const section = el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Equipos'));
  const container = el('div');
  section.appendChild(container);

  async function load(){
    const [equipSnap, delegSnap] = await Promise.all([
      getDocs(collection(db,`ligas/${LIGA_ID}/equipos`)),
      getDocs(collection(db,`ligas/${LIGA_ID}/delegaciones`))
    ]);
    const delegMap = Object.fromEntries(delegSnap.docs.map(d=>[d.id,d.data().nombre]));
    const rows = equipSnap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'groups',title:'Sin equipos',body:'',action: role==='admin'?{label:'Nuevo equipo',onClick:openNew}:null}));
      await ensureNewButton(section,{text:'Nuevo equipo',icon:'add',onClick:openNew,fab:true});
      return;
    }
    renderResponsiveTable(container,{
      columns:[
        {key:'nombre',label:'Nombre'},
        {key:'delegacionId',label:'Delegación',format:v=>delegMap[v]||''},
        {key:'rama',label:'Rama'},
        {key:'categoria',label:'Categoría'}
      ],
      rows
    });
    injectRowActions({
      root: container,
      rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id),
      getRole: () => role
    });
    await ensureNewButton(section,{text:'Nuevo equipo',icon:'add',onClick:openNew,fab:true});
  }

  function openForm(row){
    const delegacionSel = createFirestoreSelect({
      name:'delegacionId',
      placeholder:'Delegación',
      collectionPath:`ligas/${LIGA_ID}/delegaciones`,
      cacheKey:'delegaciones',
      selectedId:row?.delegacionId
    });
    const ramaSel = createStaticSelect({
      name:'rama',
      placeholder:'Rama',
      options:[
        {id:'Varonil',label:'Varonil'},
        {id:'Femenil',label:'Femenil'}
      ],
      selectedId:row?.rama
    });
    const catOptions = [];
    for(let y=2009;y<=2020;y++) catOptions.push({id:String(y),label:String(y)});
    const catSel = createStaticSelect({
      name:'categoria',
      placeholder:'Categoría',
      options:catOptions,
      selectedId:row?.categoria
    });
    const form = el('form',{class:'stack'},[
      el('label',{},['Nombre', el('input',{class:'input',name:'nombre',required:true,value:row?.nombre||''})]),
      el('label',{},['Delegación', delegacionSel]),
      el('label',{},['Rama', ramaSel]),
      el('label',{},['Categoría', catSel]),
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
        Modal.close(); load(); showToast('success','Guardado');
      }catch(err){ showToast('error',err.message); }
      finally{ setBusy(btn,false); }
    });
    Modal.sheet(form,{title:row?'Editar equipo':'Nuevo equipo'});
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

  await load();
  return section;
}
