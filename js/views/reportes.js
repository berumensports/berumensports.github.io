import { db, collection, getDocs, userRole } from '../firebase-ui.js';
import { el, renderResponsiveTable, showToast, emptyState } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';
import { ensureNewButton } from '../ui-new-button.js';

export async function render(){
  const role = await userRole();
  const section=el('section',{class:'stack'});
  section.appendChild(el('h1',{},'Reportes'));
  const container=el('div'); section.appendChild(container);

  async function load(){
    const snap=await getDocs(collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
    const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(!rows.length){
      container.innerHTML='';
      container.appendChild(emptyState({icon:'picture_as_pdf',title:'Sin datos',body:''}));
      return [];
    }
    renderResponsiveTable(container,{columns:[{key:'equipo',label:'Equipo'},{key:'monto',label:'Monto'}],rows});
    return rows;
  }

  const rows = await load();
  await ensureNewButton(section,{text:'Exportar PDF',icon:'picture_as_pdf',onClick:()=>exportPDF(rows),role});

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
