import { getUserRole } from '../core/auth.js';
import { pushCleanup } from '../core/router.js';

/**
 * Renderiza la pantalla Home con secciones de tablero.
 * Solo UI: los datos se muestran como placeholders.
 */
export async function render(el) {
  // Topbar: título liga + chip rol + selector de rango
  const topbarTitle = document.getElementById('user-info');
  const previousTopbar = topbarTitle.innerHTML;
  const role = getUserRole();
  topbarTitle.innerHTML = `Berumen Sports • Liga 2025 <span class="chip">${role}</span>`;
  const range = document.createElement('select');
  range.id = 'home-range';
  range.className = 'input';
  range.setAttribute('aria-label', 'Seleccionar rango');
  range.innerHTML = `
    <option value="hoy">Hoy</option>
    <option value="semana">Semana</option>
    <option value="mes">Mes</option>
    <option value="temporada">Temporada</option>
  `;
  topbarTitle.after(range);
  pushCleanup(() => {
    topbarTitle.innerHTML = previousTopbar;
    range.remove();
  });

  // UI principal
  el.innerHTML = `
    <section class="home-kpis" aria-label="Indicadores clave">
      <a href="#/equipos" class="kpi-card" role="link" aria-label="Equipos">
        <span class="kpi-main" id="kpi-equipos">0</span>
        <span class="kpi-label">Equipos</span>
        <span class="kpi-delta" aria-label="Variación">0</span>
      </a>
      <a href="#/partidos" class="kpi-card" role="link" aria-label="Partidos">
        <span class="kpi-main" id="kpi-partidos">0</span>
        <span class="kpi-label">Partidos</span>
        <span class="kpi-delta" aria-label="Variación">0</span>
      </a>
      <a href="#/cobros" class="kpi-card" role="link" aria-label="Cobros pendientes">
        <span class="kpi-main" id="kpi-pendientes">0</span>
        <span class="kpi-label">Cobros pendientes</span>
        <span class="kpi-delta" aria-label="Variación">0</span>
      </a>
      <a href="#/cobros" class="kpi-card" role="link" aria-label="Recaudado">
        <span class="kpi-main" id="kpi-recaudado">$0</span>
        <span class="kpi-label">Recaudado</span>
        <span class="kpi-delta" aria-label="Variación">0</span>
      </a>
      <a href="#/arbitros" class="kpi-card" role="link" aria-label="Árbitros activos">
        <span class="kpi-main" id="kpi-arbitros">0</span>
        <span class="kpi-label">Árbitros activos</span>
        <span class="kpi-delta" aria-label="Variación">0</span>
      </a>
    </section>

    <div class="card" id="home-upcoming">
      <h2 class="h2">Próximos partidos</h2>
      <ul class="home-list" role="list" id="upcoming-list">
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
      </ul>
      <div class="toolbar">
        <a href="#/partidos" class="btn btn-secondary">Ver todos</a>
      </div>
    </div>

    <div class="card" id="home-finance">
      <h2 class="h2">Snapshot financiero</h2>
      <div class="finance-cards">
        <div class="finance-card">
          <span class="finance-label">Facturado</span>
          <span class="finance-value" id="fin-facturado">$0</span>
        </div>
        <div class="finance-card">
          <span class="finance-label">Cobrado</span>
          <span class="finance-value" id="fin-cobrado">$0</span>
        </div>
        <div class="finance-card">
          <span class="finance-label">Por cobrar</span>
          <span class="finance-value" id="fin-porcobrar">$0</span>
        </div>
      </div>
      <ul class="home-list" role="list" aria-label="Top deudores" id="top-deudores">
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
      </ul>
      <div class="toolbar">
        <a href="#/cobros" class="btn btn-primary">Registrar cobro</a>
        <a href="#/reportes" class="btn btn-secondary">Ver reportes</a>
      </div>
    </div>

    <div class="card" id="home-alerts">
      <h2 class="h2">Alertas</h2>
      <div class="alerts-wrap" role="list">
        <div class="alert-item skeleton" aria-hidden="true"></div>
        <div class="alert-item skeleton" aria-hidden="true"></div>
      </div>
    </div>

    <div class="card" id="home-activity">
      <h2 class="h2">Actividad reciente</h2>
      <ul class="home-list" role="list" id="activity-list">
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
        <li class="skeleton" aria-hidden="true"></li>
      </ul>
    </div>

    <div class="card desktop-only" id="quick-actions">
      <h2 class="h2">Acciones rápidas</h2>
      <div class="qa-grid">
        <a href="#/partidos" class="qa-btn btn btn-secondary">Nuevo partido</a>
        <a href="#/cobros" class="qa-btn btn btn-secondary">Registrar cobro</a>
        <a href="#/equipos" class="qa-btn btn btn-secondary">Nuevo equipo</a>
        <a href="#/tarifas" class="qa-btn btn btn-secondary">Nueva tarifa</a>
      </div>
    </div>
    <button id="fab-qa" class="fab mobile-only" aria-label="Acciones rápidas">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#plus"></use></svg>
    </button>

    <div class="card" id="home-reports">
      <h2 class="h2">Reportes destacados</h2>
      <div class="reports-grid">
        <a href="#/reportes" class="report-card">Cobros por delegación</a>
        <a href="#/reportes" class="report-card">Partidos por estado</a>
        <a href="#/reportes" class="report-card">Ingresos por periodo</a>
      </div>
    </div>

    <div class="card" id="home-onboarding" hidden>
      <h2 class="h2">Primeros pasos</h2>
      <ol class="onboarding-list">
        <li>Crear delegaciones</li>
        <li>Cargar tarifas</li>
        <li>Crear equipos</li>
        <li>Programar partido</li>
        <li>Registrar primer cobro</li>
      </ol>
    </div>
  `;

  // Salud del sistema
  const health = document.createElement('div');
  health.id = 'system-health';
  health.className = 'system-health';
  document.body.appendChild(health);
  function updateHealth() {
    health.textContent = navigator.onLine ? 'Online' : 'Offline';
  }
  updateHealth();
  window.addEventListener('online', updateHealth);
  window.addEventListener('offline', updateHealth);
  pushCleanup(() => {
    window.removeEventListener('online', updateHealth);
    window.removeEventListener('offline', updateHealth);
    health.remove();
  });
}
