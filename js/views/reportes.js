import { db, collection, getDocs } from '../firebase-ui.js';
import { el, renderResponsiveTable, showToast, emptyState } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';

export async function render(){
  const section=el('section',{class:'stack'});
  const header=el('div',{class:'stack-sm',style:'flex-direction:row;align-items:center;'},[
    el('h2',{style:'flex:1;'},'Reportes'),
    el('button',{class:'btn',id:'exportBtn'},'Exportar PDF')
  ]);
  section.appendChild(header);
  const container=el('div'); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){ container.appendChild(emptyState({icon:'picture_as_pdf',title:'Sin datos',body:''})); return []; }
    renderResponsiveTable(container,{columns:[{key:'equipo',label:'Equipo'},{key:'monto',label:'Monto'}],rows});
    return rows;
  }

  const rows = await load();

  header.querySelector('#exportBtn').addEventListener('click',()=>exportPDF(rows));

  function exportPDF(rows){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Reporte',10,10);
    doc.autoTable({head:[['Equipo','Monto']], body: rows.map(r=>[r.equipo||'', r.monto||0])});
    doc.save('reporte.pdf');
    showToast('success','PDF generado');
  }

  return section;
}
