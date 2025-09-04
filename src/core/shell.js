import { watchTorneos, getActiveTorneo, setActiveTorneo, onTorneoChange } from '../data/torneos.js';

const shellHtml = `
<header class="topbar">
  <button id="menu-btn" class="icon-btn" aria-label="Abrir menú" title="Abrir menú">
    <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#menu"></use></svg>
  </button>
  <div id="user-info" class="topbar-title">Berumen <span id="user-role" class="chip"></span></div>
  <button id="logout-btn" class="icon-btn" onclick="appLogout()" aria-label="Configuración" title="Configuración" hidden>
    <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#settings"></use></svg>
  </button>
  <select id="torneo-switch" class="input"></select>
</header>
<nav id="drawer" class="drawer" hidden>
  <ul>
    <li><a href="#/"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#home"></use></svg><span>Home</span></a></li>
    <li><a href="#/torneos"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#chart"></use></svg><span>Torneos</span></a></li>
    <li><a href="#/delegaciones"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#user"></use></svg><span>Delegaciones</span></a></li>
    <li><a href="#/categorias"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#document"></use></svg><span>Categorías</span></a></li>
    <li><a href="#/equipos"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#users"></use></svg><span>Equipos</span></a></li>
    <li><a href="#/partidos"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#calendar"></use></svg><span>Partidos</span></a></li>
    <li><a href="#/jornadas"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#calendar"></use></svg><span>Jornadas</span></a></li>
    <li><a href="#/cobros"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#currency"></use></svg><span>Cobros</span></a></li>
    <li><a href="#/tarifas"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#currency"></use></svg><span>Tarifas</span></a></li>
    <li><a href="#/arbitros"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#user"></use></svg><span>Árbitros</span></a></li>
    <li><a href="#/reportes"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#chart"></use></svg><span>Reportes</span></a></li>
  </ul>
</nav>
<div id="drawer-overlay" class="drawer-overlay" hidden></div>
<nav class="tabbar" role="navigation">
  <a href="#/equipos" class="tabbar-item"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#users"></use></svg><span>Equipos</span></a>
  <a href="#/partidos" class="tabbar-item"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#calendar"></use></svg><span>Partidos</span></a>
  <a href="#/cobros" class="tabbar-item"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#currency"></use></svg><span>Cobros</span></a>
  <a href="#/reportes" class="tabbar-item"><svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#chart"></use></svg><span>Reportes</span></a>
</nav>
<div id="modal-root"></div>`;

let rendered = false;
export function renderShell() {
  if (rendered) return;
  document.body.insertAdjacentHTML('afterbegin', shellHtml);
  const menuBtn = document.getElementById('menu-btn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const torneoSelect = document.getElementById('torneo-switch');
  const mql = window.matchMedia('(min-width:1025px)');
  watchTorneos(list => {
    torneoSelect.innerHTML = list.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
    if (!getActiveTorneo() && list.length) setActiveTorneo(list[0].id);
    torneoSelect.value = getActiveTorneo() || '';
  });
  torneoSelect.addEventListener('change', e => setActiveTorneo(e.target.value));
  onTorneoChange(id => { torneoSelect.value = id || ''; });
  function updateDrawer() {
    if (mql.matches) {
      drawer.hidden = false;
      overlay.hidden = true;
    } else {
      drawer.hidden = true;
      overlay.hidden = true;
    }
  }
  function closeDrawer() {
    if (mql.matches) return;
    drawer.hidden = true;
    overlay.hidden = true;
  }
  updateDrawer();
  mql.addEventListener('change', updateDrawer);
  menuBtn.addEventListener('click', () => {
    if (mql.matches) return;
    drawer.hidden = !drawer.hidden;
    overlay.hidden = drawer.hidden;
  });
  overlay.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', e => {
    if (e.target.closest('a')) closeDrawer();
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === location.hash) e.preventDefault();
    if (!drawer.hidden && !drawer.contains(e.target) && e.target !== menuBtn) {
      closeDrawer();
    }
  });
  window.addEventListener('hashchange', closeDrawer);
  rendered = true;
}
