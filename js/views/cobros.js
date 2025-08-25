import { Modal } from '../modal-manager.js';
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, userRole } from '../firebase-ui.js';
import { el, readForm, setBusy, showToast, emptyState } from '../ui-kit.js';
import { injectRowActions } from '../row-actions.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';
import { ensureNewButton } from '../ui-new-button.js';

export async function render(){
  const role = await userRole();
  const section=el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Cobros'));
  const container=el('div',{class:'stack'}); section.appendChild(container);
  let rows=[];

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
    rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'payments',title:'Sin cobros',body:'',action: role==='admin'?{label:'Nuevo cobro',onClick:openNew}:null}));
      await ensureNewButton(section,{text:'Nuevo cobro',icon:'add',onClick:openNew,fab:true});
      return;
    }
    container.innerHTML='';
    rows.forEach(row=>{
      container.appendChild(el('div',{class:'card stack-sm','data-id':row.id,'data-name':row.equipo||row.equipoNombre||''},[
        el('h3',{},row.equipo||row.equipoNombre||'Equipo'),
        el('p',{},`Monto: $${row.monto||row.montoTotal||0}`),
        el('p',{},`Saldo: $${row.saldo||0}`),
        el('button',{class:'btn btn-primary btn-xs',onClick:()=>openAbono(row)},'Registrar abono')
      ]));
    });
    injectRowActions({
      root: container,
      rowSelector: 'div.card[data-id]',
      onEdit: ({id})=>openEdit(id),
      onDelete: ({id})=>remove(id)
    });
    await ensureNewButton(section,{text:'Nuevo cobro',icon:'add',onClick:openNew,fab:true});
  }

  function openForm(row){
    const form=el('form',{class:'stack'},[
      el('label',{},['Equipo', el('input',{class:'input',name:'equipo',required:true,value:row?.equipo||row?.equipoNombre||''})]),
      el('label',{},['Monto', el('input',{class:'input',type:'number',name:'monto',required:true,value:row?.monto||row?.montoTotal||0})]),
      el('label',{},['Saldo', el('input',{class:'input',type:'number',name:'saldo',required:true,value:row?.saldo||0})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form);
      data.monto=Number(data.monto); data.saldo=Number(data.saldo);
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{
        if(row){ await updateDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros/${row.id}`), {equipo:data.equipo,monto:data.monto,saldo:data.saldo}); }
        else{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`), {equipo:data.equipo,monto:data.monto,saldo:data.saldo}); }
        Modal.close(); load(); showToast('success','Guardado');
      }catch(err){ showToast('error',err.message); } finally{ setBusy(btn,false); }
    });
    Modal.sheet(form,{title:row?'Editar cobro':'Nuevo cobro'});
  }

  const openNew = ()=>openForm(null);
  const openEdit = id=>{ const row=rows.find(r=>r.id===id); if(row) openForm(row); };

  async function remove(id){
    try{ await deleteDoc(doc(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros/${id}`)); showToast('success','Eliminado'); load(); }
    catch(err){ showToast('error',err.message); }
  }

  function openAbono(row){
    const form=el('form',{class:'stack'},[
      el('p',{},row.equipo||row.equipoNombre||''),
      el('label',{},['Monto', el('input',{class:'input',type:'number',name:'monto',min:1,max:row.saldo,required:true})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form); const m=Number(data.monto);
      if(m<=0 || m>row.saldo){showToast('error','Monto inválido');return;}
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros/${row.id}/abonos`), {monto:m,fecha:new Date().toISOString()}); Modal.close(); showToast('success','Abono registrado'); }
      catch(err){showToast('error',err.message);} finally{ setBusy(btn,false); }
    });
    Modal.sheet(form,{title:'Registrar abono'});
  }

  await load();
  return section;
}
