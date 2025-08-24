import { listCobros } from "../data/cobros.js";
import { qs, formDataToObj, money } from "../utils.js";

export default {
  title: 'Reportes',
  async render(root) {
    let cobros = await listCobros({});
    root.innerHTML = `
      <h2>Reportes</h2>
      <button id="exportPdf" class="btn">Exportar PDF</button>
      <table class="table"><thead><tr><th>Equipo</th><th>Monto</th><th>Saldo</th></tr></thead><tbody id="tbody"></tbody></table>
    `;
    const tbody = qs('#tbody', root);
    function renderTable(){
      tbody.innerHTML = cobros.map(c=>`<tr><td>${c.equipoNombre||''}</td><td>${money(c.montoTotal)}</td><td>${money(c.saldo)}</td></tr>`).join('');
    }
    renderTable();
    qs('#exportPdf', root).addEventListener('click',()=>{
      const doc = new window.jspdf.jsPDF();
      doc.text('Reporte de Cobros',10,10);
      doc.autoTable({head:[['Equipo','Monto','Saldo']], body:cobros.map(c=>[c.equipoNombre||'',c.montoTotal,c.saldo])});
      doc.save('reporte.pdf');
    });
  }
};
