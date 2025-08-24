import { db, collection, getDocs, addDoc } from '../firebase-ui.js';
import { el, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';

export async function render(){
  const section=el('section',{class:'stack'});
  section.appendChild(el('h2',{},'Cobros'));
  const container=el('div',{class:'stack'}); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'payments',title:'Sin cobros',body:'',action:null}));
      return;
    }
    container.innerHTML='';
    rows.forEach(row=>{
      container.appendChild(el('div',{class:'card stack-sm'},[
        el('h3',{},row.equipo||'Equipo'),
        el('p',{},`Monto: $${row.monto||0}`),
        el('p',{},`Saldo: $${row.saldo||0}`),
        el('button',{class:'btn btn-primary btn-xs',onClick:()=>openAbono(row)},'Registrar abono')
      ]));
    });
  }

  function openAbono(row){
    const form=el('form',{class:'stack'},[
      el('p',{},row.equipo),
      el('label',{},['Monto', el('input',{class:'input',type:'number',name:'monto',min:1,max:row.saldo,required:true})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const data=readForm(form); const m=Number(data.monto);
      if(m<=0 || m>row.saldo){showToast('error','Monto inválido');return;}
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{ await addDoc(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros/${row.id}/abonos`), {monto:m,fecha:new Date().toISOString()}); closeModal(); showToast('success','Abono registrado'); }
      catch(err){showToast('error',err.message);} finally{ setBusy(btn,false); }
    });
    openSheet('Registrar abono',form);
  }

  await load();
  return section;
}
