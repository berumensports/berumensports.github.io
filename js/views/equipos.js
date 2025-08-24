import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from '../firebase-ui.js';
import { el, renderResponsiveTable, readForm, setBusy, showToast, emptyState } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID } from '../constants.js';
import { createFirestoreSelect, createStaticSelect } from '../combobox.js';

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
    const [equipSnap, delegSnap] = await Promise.all([
      getDocs(collection(db,`ligas/${LIGA_ID}/equipos`)),
      getDocs(collection(db,`ligas/${LIGA_ID}/delegaciones`))
    ]);
    const delegMap = Object.fromEntries(delegSnap.docs.map(d=>[d.id,d.data().nombre]));
    const rows = equipSnap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'groups',title:'Sin equipos',body:'',action:{label:'Crear',onClick:openNew}}));
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
      onDelete: ({id})=>remove(id)
    });
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

  header.querySelector('#newBtn').addEventListener('click',openNew);
  await load();
  return section;
}
