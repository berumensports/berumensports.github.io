import { db, collection, query, where, getDocs, orderBy } from '../data/firebase.js';
import { paths, TEMP_ID } from '../data/paths.js';
import { getActiveTorneo } from '../data/torneos.js';

export async function render(el) {
  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  const [eqSnap, paSnap, coSnap, taSnap, joSnap, delSnap] = await Promise.all([
    getDocs(query(collection(db, paths.equipos()), where('torneoId', '==', getActiveTorneo()))),
    getDocs(query(
      collection(db, paths.partidos()),
      where('torneoId', '==', getActiveTorneo()),
      where('tempId', '==', TEMP_ID)
    )),
    getDocs(query(
      collection(db, paths.cobros()),
      where('torneoId', '==', getActiveTorneo()),
      where('tempId', '==', TEMP_ID)
    )),
    getDocs(query(collection(db, paths.tarifas()), where('torneoId', '==', getActiveTorneo()))),
    getDocs(query(collection(db, paths.jornadas()), where('torneoId', '==', getActiveTorneo()))),
    getDocs(query(collection(db, paths.delegaciones()), where('torneoId','==',getActiveTorneo()), orderBy('nombre')))
  ]);

  const equipos = Object.fromEntries(eqSnap.docs.map(d => [d.id, d.data()]));
  const partidos = paSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const cobros = {};
  coSnap.docs.forEach(d => {
    const data = d.data();
    if (!cobros[data.partidoId]) cobros[data.partidoId] = {};
    cobros[data.partidoId][data.equipoId] = { id: d.id, ...data };
  });
  const tarifas = taSnap.docs.map(d => d.data());
  const jornadas = Object.fromEntries(joSnap.docs.map(d => [d.id, d.data().nombre]));
  const delegaciones = Object.fromEntries(delSnap.docs.map(d => [d.id, d.data().nombre]));
  const ramas = new Set(eqSnap.docs.map(d => d.data().rama).filter(Boolean));
  const categorias = new Set(eqSnap.docs.map(d => d.data().categoria).filter(Boolean));

  function tarifaPorPartido(pa) {
    return tarifas.find(t => t.rama === pa.rama && t.categoria === pa.categoria)?.tarifa || 0;
  }

  const jornadaOpts = Object.entries(jornadas).map(([id, nombre]) => `<option value="${id}">${nombre}</option>`).join('');
  const ramaOpts = Array.from(ramas).map(r => `<option value="${r}">${r}</option>`).join('');
  const categoriaOpts = Array.from(categorias).map(c => `<option value="${c}">${c}</option>`).join('');
  const delegacionOpts = Object.entries(delegaciones).map(([id,nombre]) => `<option value="${id}">${nombre}</option>`).join('');

  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Reportes</h1>
      </div>
      <div class="toolbar">
        <select id="f-jornada" class="input"><option value="">Jornada</option>${jornadaOpts}</select>
        <select id="f-rama" class="input"><option value="">Rama</option>${ramaOpts}</select>
        <select id="f-categoria" class="input"><option value="">Categoría</option>${categoriaOpts}</select>
        <select id="f-delegacion" class="input"><option value="">Delegación</option>${delegacionOpts}</select>
        <button id="aplicar" class="btn btn-secondary">Aplicar</button>
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <div id="kpis" class="dashboard-kpis"></div>
      <div id="tabla"></div>
      <div class="toolbar">
        <button id="exportar-pdf" class="btn btn-secondary">Exportar PDF</button>
      </div>
    </div>`;

  function update() {
    const jFilter = document.getElementById('f-jornada').value;
    const rFilter = document.getElementById('f-rama').value;
    const cFilter = document.getElementById('f-categoria').value;
    const dFilter = document.getElementById('f-delegacion').value;

    const filtered = partidos.filter(pa => {
      if (jFilter && pa.jornadaId !== jFilter) return false;
      if (rFilter && pa.rama !== rFilter) return false;
      if (cFilter && pa.categoria !== cFilter) return false;
      return true;
    });

    const rowsByStatus = { Pendiente: [], Parcial: [], Pagado: [] };
    const partidosAgSet = new Set();
    const partidosJugSet = new Set();
    let tarifaAg = 0;
    let tarifaJug = 0;
    let totalCobrado = 0;
    let saldoPend = 0;

    filtered.forEach(pa => {
      const fechaObj = pa.fecha ? new Date(pa.fecha.seconds * 1000) : null;
      const fecha = fechaObj ? fechaObj.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
      const hora = fechaObj ? fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
      const local = equipos[pa.localId]?.nombre || pa.localId || '';
      const visita = equipos[pa.visitaId]?.nombre || pa.visitaId || '';
      const jornada = jornadas[pa.jornadaId] || 'Sin jornada';
      const rama = pa.rama || '';
      const categoria = pa.categoria || '';

      function processEquipo(eqId) {
        const eq = equipos[eqId] || {};
        const eqNombre = eq.nombre || eqId || '';
        const delegId = eq.delegacionId || '';
        if (dFilter && delegId !== dFilter) return;
        const delegacion = delegaciones[delegId] || '';
        const co = cobros[pa.id]?.[eqId] || {};
        const tarifa = Number(co.tarifa || tarifaPorPartido(pa));
        const monto = Number(co.monto || 0);
        const saldo = Math.max(tarifa - monto, 0);
        let status;
        if (!monto) status = 'Pendiente';
        else if (monto < tarifa) status = 'Parcial';
        else status = 'Pagado';
        const rowHtml = `<tr>
          <td data-label="Jornada">${jornada}</td>
          <td data-label="Rama">${rama}</td>
          <td data-label="Categoría">${categoria}</td>
          <td data-label="Equipos">${local} vs ${visita}</td>
          <td data-label="Equipo">${eqNombre}</td>
          <td data-label="Delegación">${delegacion}</td>
          <td data-label="Fecha">${fecha}</td>
          <td data-label="Hora">${hora}</td>
          <td data-label="Tarifa">${fmt.format(tarifa)}</td>
          <td data-label="Monto">${fmt.format(monto)}</td>
          <td data-label="Saldo">${fmt.format(saldo)}</td>
          <td data-label="Estado">${status}</td>
        </tr>`;
        rowsByStatus[status].push({ html: rowHtml, tarifa, monto, saldo });
        tarifaAg += tarifa;
        totalCobrado += monto;
        saldoPend += saldo;
        if (pa.jugado) tarifaJug += tarifa;
        partidosAgSet.add(pa.id);
        if (pa.jugado) partidosJugSet.add(pa.id);
      }

      processEquipo(pa.localId);
      processEquipo(pa.visitaId);
    });

    const pendientes = rowsByStatus.Pendiente.length;
    const parciales = rowsByStatus.Parcial.length;
    const pagados = rowsByStatus.Pagado.length;
    const partidosAg = partidosAgSet.size;
    const partidosJug = partidosJugSet.size;

    const kpiHtml = `
      <div class="dashboard-card"><h3 class="h3">Partidos agendados</h3><p>${partidosAg}<br><span class="label">${fmt.format(tarifaAg)}</span></p></div>
      <div class="dashboard-card"><h3 class="h3">Partidos jugados</h3><p>${partidosJug}<br><span class="label">${fmt.format(tarifaJug)}</span></p></div>
      <div class="dashboard-card"><h3 class="h3">Pendientes</h3><p>${pendientes}</p></div>
      <div class="dashboard-card"><h3 class="h3">Parciales</h3><p>${parciales}</p></div>
      <div class="dashboard-card"><h3 class="h3">Pagados</h3><p>${pagados}</p></div>
      <div class="dashboard-card"><h3 class="h3">Monto total cobrado</h3><p>${fmt.format(totalCobrado)}</p></div>
      <div class="dashboard-card"><h3 class="h3">Saldo pendiente</h3><p>${fmt.format(saldoPend)}</p></div>
    `;
    document.getElementById('kpis').innerHTML = kpiHtml;

    const labelMap = { Pendiente: 'Pendientes', Parcial: 'Parciales', Pagado: 'Pagados' };
    const tableParts = ['Pendiente', 'Parcial', 'Pagado'].map(status => {
      const group = rowsByStatus[status];
      if (!group.length) return '';
      const rowsHtml = group.map(r => r.html).join('');
      const totTarifa = group.reduce((s, r) => s + r.tarifa, 0);
      const totMonto = group.reduce((s, r) => s + r.monto, 0);
      const totSaldo = group.reduce((s, r) => s + r.saldo, 0);
      const summary = `<div class="summary-line"><span>Cobros: ${group.length}</span><span>Tarifa: ${fmt.format(totTarifa)}</span><span>Monto: ${fmt.format(totMonto)}</span><span>Saldo: ${fmt.format(totSaldo)}</span></div>`;
      const tableHeader = `<table class="responsive-table"><thead><tr><th>Jornada</th><th>Rama</th><th>Categoría</th><th>Equipos</th><th>Equipo</th><th>Delegación</th><th>Fecha</th><th>Hora</th><th>Tarifa</th><th>Monto</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>`;
      return `<h3 class="h3 table-label">${labelMap[status]}</h3>${tableHeader}${rowsHtml}</tbody></table>${summary}`;
    }).filter(Boolean);
    const tableHtml = tableParts.length ? tableParts.join('') : '<p>No hay partidos</p>';
    document.getElementById('tabla').innerHTML = tableHtml;
  }

  document.getElementById('aplicar').addEventListener('click', update);
  document.getElementById('limpiar').addEventListener('click', () => {
    document.getElementById('f-jornada').value = '';
    document.getElementById('f-rama').value = '';
    document.getElementById('f-categoria').value = '';
    document.getElementById('f-delegacion').value = '';
    update();
  });
  document.getElementById('exportar-pdf').addEventListener('click', async () => {
    const html2pdf = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')).default;
    const exportEl = document.createElement('div');
    exportEl.appendChild(document.getElementById('kpis').cloneNode(true));
    const breakEl = document.createElement('div');
    breakEl.className = 'html2pdf__page-break';
    exportEl.appendChild(breakEl);
    exportEl.appendChild(document.getElementById('tabla').cloneNode(true));
    exportEl.style.position = 'absolute';
    exportEl.style.left = '-9999px';
    document.body.appendChild(exportEl);
    const opt = {
      margin: 0.25,
      filename: 'reporte.pdf',
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(exportEl).save();
    document.body.removeChild(exportEl);
  });
  update();
}

