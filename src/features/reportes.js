import { db, collection, query, where, getDocs } from '../data/firebase.js';
import { paths, LIGA_ID, TEMP_ID } from '../data/paths.js';

export async function render(el) {
  const chartJs = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js');
  const { default: Chart } = chartJs;

  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Reportes</h1>
      </div>
      <div class="toolbar">
        <select id="periodo" class="input">
          <option value="year">Año</option>
          <option value="month" selected>Mes</option>
          <option value="week">Semana</option>
          <option value="day">Día</option>
          <option value="date">Fecha</option>
        </select>
        <input id="fecha" type="date" class="input" value="${new Date().toISOString().slice(0,10)}">
        <button id="aplicar" class="btn btn-secondary">Aplicar</button>
      </div>
      <div id="kpis" class="dashboard-kpis"></div>
      <canvas id="chart-equipos" height="120"></canvas>
      <canvas id="chart-cobros" height="120" class="mt-4"></canvas>
    </div>`;

  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  let chartEquipos;
  let chartCobros;

  function getRange(period, dateStr) {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(0, 0, 0, 0);
    let start;
    let end;
    switch (period) {
      case 'year':
        start = new Date(d.getFullYear(), 0, 1);
        end = new Date(d.getFullYear() + 1, 0, 1);
        break;
      case 'month':
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        break;
      case 'week': {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(d.setDate(diff));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      }
      case 'day':
      case 'date':
        start = new Date(d);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      default:
        start = new Date(d.getFullYear(), 0, 1);
        end = new Date(d.getFullYear() + 1, 0, 1);
    }
    return { start, end };
  }

  async function update() {
    const period = document.getElementById('periodo').value;
    const dateStr = document.getElementById('fecha').value;
    const { start, end } = getRange(period, dateStr);

    const [delegSnap, equipoSnap, partidoSnap, cobroSnap] = await Promise.all([
      getDocs(query(collection(db, paths.delegaciones()), where('ligaId', '==', LIGA_ID))),
      getDocs(query(collection(db, paths.equipos()), where('ligaId', '==', LIGA_ID))),
      getDocs(query(
        collection(db, paths.partidos()),
        where('ligaId', '==', LIGA_ID),
        where('tempId', '==', TEMP_ID),
        where('fecha', '>=', start),
        where('fecha', '<', end)
      )),
      getDocs(query(
        collection(db, paths.cobros()),
        where('ligaId', '==', LIGA_ID),
        where('tempId', '==', TEMP_ID),
        where('fechaCobro', '>=', start),
        where('fechaCobro', '<', end)
      ))
    ]);

    const delegaciones = delegSnap.size;
    const equipos = equipoSnap.size;
    const ramas = new Set(equipoSnap.docs.map(d => d.data().rama).filter(Boolean));
    const categorias = new Set(equipoSnap.docs.map(d => d.data().categoria).filter(Boolean));
    const partidosAgendados = partidoSnap.size;

    let pendientes = 0;
    let parciales = 0;
    let pagados = 0;
    let cobradoParcial = 0;
    let saldoParcial = 0;
    let montoPagado = 0;
    cobroSnap.docs.forEach(d => {
      const data = d.data();
      const tarifa = Number(data.tarifa || 0);
      const monto = Number(data.monto || 0);
      if (!monto) {
        pendientes++;
      } else if (monto < tarifa) {
        parciales++;
        cobradoParcial += monto;
        saldoParcial += tarifa - monto;
      } else {
        pagados++;
        montoPagado += monto;
      }
    });

    const kpiHtml = `
      <div class="dashboard-card"><h3 class="h3">Delegaciones</h3><p>${delegaciones}</p></div>
      <div class="dashboard-card"><h3 class="h3">Equipos</h3><p>${equipos}</p></div>
      <div class="dashboard-card"><h3 class="h3">Ramas</h3><p>${ramas.size}</p></div>
      <div class="dashboard-card"><h3 class="h3">Categorías</h3><p>${categorias.size}</p></div>
      <div class="dashboard-card"><h3 class="h3">Partidos Agendados</h3><p>${partidosAgendados}</p></div>
      <div class="dashboard-card"><h3 class="h3">Pagos Pendientes</h3><p>${pendientes}</p></div>
      <div class="dashboard-card"><h3 class="h3">Pagos Parciales</h3><p>${parciales}<br><span class="label">${fmt.format(cobradoParcial)} cobrados<br>${fmt.format(saldoParcial)} saldo</span></p></div>
      <div class="dashboard-card"><h3 class="h3">Pagos Completos</h3><p>${pagados}<br><span class="label">${fmt.format(montoPagado)}</span></p></div>
    `;
    document.getElementById('kpis').innerHTML = kpiHtml;

    const ramaCounts = {};
    equipoSnap.docs.forEach(d => {
      const r = d.data().rama || 'Sin rama';
      ramaCounts[r] = (ramaCounts[r] || 0) + 1;
    });
    const ramaLabels = Object.keys(ramaCounts);
    const ramaData = Object.values(ramaCounts);

    if (chartEquipos) chartEquipos.destroy();
    chartEquipos = new Chart(document.getElementById('chart-equipos'), {
      type: 'pie',
      data: { labels: ramaLabels, datasets: [{ data: ramaData }] },
      options: { plugins: { legend: { position: 'bottom' } } }
    });

    if (chartCobros) chartCobros.destroy();
    chartCobros = new Chart(document.getElementById('chart-cobros'), {
      type: 'bar',
      data: {
        labels: ['Pendientes', 'Parciales', 'Pagados'],
        datasets: [{ data: [pendientes, parciales, pagados], backgroundColor: ['#f87171', '#fbbf24', '#34d399'] }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  document.getElementById('aplicar').addEventListener('click', update);
  await update();
}
