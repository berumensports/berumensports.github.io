import { el, renderResponsiveTable, openSheet, readForm, setBusy, showToast, emptyState, closeModal } from '../ui-kit.js';
import { listArbitros, getArbitro, createArbitro, updateArbitro, deleteArbitro } from '../data/arbitros.js';
import { listDelegaciones } from '../data/delegaciones.js';
import { listPagos, createPago, sumPagos } from '../data/pagos-arbitros.js';
import { listPartidosDeArbitro } from '../data/partidos-arbitro.js';
import { injectRowActions } from '../row-actions.js';
import { userRole } from '../firebase-ui.js';
import { money, formatDate } from '../utils.js';

export async function render(){
  const role = await userRole();
  const section = el('section',{class:'stack'});
  const header = el('div',{class:'stack-sm',style:'flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;'},[
    el('h2',{style:'flex:1 1 100%;'},'Árbitros'),
    el('input',{type:'search',class:'input',id:'search',placeholder:'Buscar'}),
    el('select',{class:'input',id:'fDeleg'},[el('option',{value:''},'Delegación')]),
    el('select',{class:'input',id:'fActivo'},[
      el('option',{value:''},'Estatus'),
      el('option',{value:'true'},'Activo'),
      el('option',{value:'false'},'Inactivo')
    ]),
    role==='admin'?el('button',{class:'btn btn-primary',id:'newBtn'},'Nuevo árbitro'):null
  ]);
  section.appendChild(header);
  const container = el('div');
  section.appendChild(container);

  const delegaciones = await listDelegaciones();
  const sel = header.querySelector('#fDeleg');
  delegaciones.forEach(d=>sel.appendChild(el('option',{value:d.id},d.nombre)));

  async function load(){
    const filters={};
    const q = header.querySelector('#search').value.trim().toLowerCase();
    const del = header.querySelector('#fDeleg').value;
    const act = header.querySelector('#fActivo').value;
    if(del) filters.delegacionId = del;
    if(act!=='' ) filters.activo = act==='true';
    let rows = await listArbitros(filters);
    if(q) rows = rows.filter(r=> (r.nombre||'').toLowerCase().includes(q) || (r.email||'').toLowerCase().includes(q));
    for(const r of rows){
      const partidos = await listPartidosDeArbitro({arbitroId:r.id});
      r.jugados = partidos.length;
      r.aPagar = partidos.reduce((s,p)=>s+(p.tarifaAplicada||0),0);
      r.pagado = await sumPagos({arbitroId:r.id});
      r.saldo = Math.max(0, r.aPagar - r.pagado);
    }
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'person',title:'Sin árbitros',body:'',action: role==='admin'?{label:'Crear',onClick:openNew}:null}));
      return;
    }
    renderResponsiveTable(container,{
      columns:[
        {key:'nombre',label:'Nombre'},
        {key:'delegacionId',label:'Delegación',format:v=>delegaciones.find(d=>d.id===v)?.nombre||''},
        {key:'telefono',label:'Teléfono'},
        {key:'email',label:'Email'},
        {key:'activo',label:'Estatus',format:v=>v?el('span',{class:'badge badge-activo'},'ACTIVO'):el('span',{class:'badge badge-inactivo'},'INACTIVO')},
        {key:'jugados',label:'Jugados'},
        {key:'aPagar',label:'A pagar',format:money},
        {key:'pagado',label:'Pagado',format:money},
        {key:'saldo',label:'Saldo',format:money}
      ],
      rows,
      actions: role==='admin'?[{icon:'paid',label:'Liquidar',onClick:(row)=>openPago(row)}]:null
    });
    if(role==='admin'){
      injectRowActions({
        root: container,
        rowSelector: 'tbody tr[data-id], .table-stack .row[data-id]',
        onEdit: ({id})=>openEdit(id),
        onDelete: ({id})=>remove(id)
      });
    }
  }

  header.querySelector('#search').addEventListener('input',()=>{clearTimeout(header._t);header._t=setTimeout(load,300);});
  header.querySelector('#fDeleg').addEventListener('change',load);
  header.querySelector('#fActivo').addEventListener('change',load);
  if(role==='admin') header.querySelector('#newBtn').addEventListener('click',openNew);

  container.addEventListener('click',e=>{
    const row = e.target.closest('[data-id]');
    if(!row || e.target.closest('[data-actions]')) return;
    openDetail(row.getAttribute('data-id'));
  });

  function openForm(row){
    const form = el('form',{class:'stack'},[
      el('label',{},['Nombre',el('input',{class:'input',name:'nombre',required:true,value:row?.nombre||''})]),
      el('label',{},['Teléfono',el('input',{class:'input',name:'telefono',value:row?.telefono||''})]),
      el('label',{},['Email',el('input',{class:'input',type:'email',name:'email',value:row?.email||''})]),
      el('label',{},['Delegación',(()=>{const s=el('select',{class:'input',name:'delegacionId'},[el('option',{value:''},'--')]);delegaciones.forEach(d=>s.appendChild(el('option',{value:d.id,selected:d.id===row?.delegacionId},d.nombre)));return s;})()]),
      el('label',{},[el('input',{type:'checkbox',name:'activo',checked: row?row.activo:true}),' Activo']),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const data = readForm(form); data.activo = form.activo.checked;
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{
        if(row) await updateArbitro(row.id,data); else await createArbitro(data);
        closeModal(); showToast('success','Guardado'); load();
      }catch(err){showToast('error',err.message);}finally{setBusy(btn,false);} 
    });
    openSheet(row?'Editar árbitro':'Nuevo árbitro',form);
  }
  const openNew=()=>openForm(null);
  async function openEdit(id){ const r=await getArbitro(id); if(r) openForm(r); }
  async function remove(id){ try{await deleteArbitro(id);showToast('success','Eliminado');load();}catch(err){showToast('error',err.message);} }

  async function openPago(row){
    const form = el('form',{class:'stack'},[
      el('label',{},['Fecha',el('input',{class:'input',type:'date',name:'fecha',value:new Date().toISOString().slice(0,10),required:true})]),
      el('label',{},['Monto',el('input',{class:'input',type:'number',name:'monto',min:'1',step:'0.01',required:true})]),
      el('label',{},['Método',el('select',{class:'input',name:'metodo',required:true},[
        el('option',{value:'efectivo'},'Efectivo'),
        el('option',{value:'transferencia'},'Transferencia'),
        el('option',{value:'otros'},'Otros')
      ])]),
      el('label',{},['Referencia',el('input',{class:'input',name:'referencia'})]),
      el('button',{class:'btn btn-primary',type:'submit'},'Guardar')
    ]);
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const data = readForm(form);
      const btn=form.querySelector('button'); setBusy(btn,true);
      try{
        await createPago({
          arbitroId: row.id,
          fecha: new Date(data.fecha),
          monto: Number(data.monto),
          metodo: data.metodo,
          referencia: data.referencia
        });
        closeModal(); showToast('success','Pago registrado'); load();
      }catch(err){showToast('error',err.message);}finally{setBusy(btn,false);} 
    });
    openSheet(`Registrar pago • ${row.nombre}`,form);
  }

  async function openDetail(id){
    const arbitro = await getArbitro(id);
    const [partidos, pagos] = await Promise.all([
      listPartidosDeArbitro({arbitroId:id}),
      listPagos({arbitroId:id})
    ]);
    const totalDevengar = partidos.reduce((s,p)=>s+(p.tarifaAplicada||0),0);
    const totalPagado = pagos.reduce((s,p)=>s+(p.monto||0),0);
    const totalJugados = partidos.length;
    const saldo = Math.max(0,totalDevengar-totalPagado);

    const resumen = el('div',{class:'stack'},[
      el('div',{},[`Jugados: ${totalJugados}`]),
      el('div',{},[`A pagar: ${money(totalDevengar)}`]),
      el('div',{},[`Pagado: ${money(totalPagado)}`]),
      el('div',{},[`Saldo: ${money(saldo)}`])
    ]);
    const partList = el('ul',{class:'stack'}, partidos.map(p=>
      el('li',{},`${formatDate(p.fecha?.toDate?p.fecha.toDate():p.fecha)} - ${p.localNombre||''} vs ${p.visitanteNombre||''} (${money(p.tarifaAplicada||0)})`)
    ));
    const pagosList = el('ul',{class:'stack'}, pagos.map(p=>
      el('li',{},`${formatDate(p.fecha)} - ${money(p.monto)} (${p.metodo})`)
    ));

    const btnRes = el('button',{class:'tab-btn active'},'Resumen');
    const btnPar = el('button',{class:'tab-btn'},'Partidos');
    const btnPag = el('button',{class:'tab-btn'},'Pagos');
    const panelRes = el('div',{class:'tab-panel active'},resumen);
    const panelPar = el('div',{class:'tab-panel'},partList);
    const panelPag = el('div',{class:'tab-panel'},pagosList);
    function setTab(id){
      btnRes.classList.toggle('active',id==='res');
      btnPar.classList.toggle('active',id==='par');
      btnPag.classList.toggle('active',id==='pag');
      panelRes.classList.toggle('active',id==='res');
      panelPar.classList.toggle('active',id==='par');
      panelPag.classList.toggle('active',id==='pag');
    }
    btnRes.addEventListener('click',()=>setTab('res'));
    btnPar.addEventListener('click',()=>setTab('par'));
    btnPag.addEventListener('click',()=>setTab('pag'));
    const tabs = el('div',{},[
      el('div',{class:'tab-headers'},[btnRes,btnPar,btnPag]),
      panelRes,panelPar,panelPag
    ]);
    const content = el('div',{class:'stack'},[
      el('h3',{},arbitro.nombre||''),
      tabs,
      role==='admin'?el('button',{class:'btn btn-primary',onClick:()=>{closeModal();openPago({id:arbitro.id,nombre:arbitro.nombre});}},'Registrar pago'):null
    ]);
    openSheet('Detalle árbitro',content);
  }

  await load();
  return section;
}

export default render;
