import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const buildCobranzaPdf = (rows: any[], _filtros: Record<string, any>) => {
  const doc = new jsPDF();
  doc.text('Reporte de Cobranza', 14, 10);
  autoTable(doc, {
    head: [['Folio', 'Equipo', 'Delegación', 'Fecha', 'Monto', 'Abonos', 'Saldo', 'Estatus']],
    body: rows.map((r) => [r.folio, r.equipoNombre, r.delegacionId, r.fechaEmision, r.montoTotal, r.abonos, r.saldo, r.estatus]),
    startY: 20,
  });
  return doc;
};

export const buildAbonoPdf = (cobro: any, abonos: any[]) => {
  const doc = new jsPDF();
  doc.text('Recibo de Abono', 14, 10);
  autoTable(doc, {
    body: [
      ['Folio', cobro.folio],
      ['Equipo', cobro.equipoNombre],
      ['Total', cobro.montoTotal],
      ['Saldo', cobro.saldo],
    ],
    startY: 20,
  });
  autoTable(doc, {
    head: [['Fecha', 'Monto', 'Método']],
    body: abonos.map((a) => [a.fecha, a.monto, a.metodo]),
    startY: (doc as any).lastAutoTable.finalY + 10,
  });
  return doc;
};
