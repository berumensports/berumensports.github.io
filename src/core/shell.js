const shellHtml = `
<header class="topbar">
  <button id="menu-btn" aria-label="Menu">☰</button>
  <h1 style="margin-left:1rem; font-size:1.2rem;">Berumen</h1>
</header>
<nav id="drawer" hidden>
  <a href="#/">Home</a>
  <a href="#/equipos">Equipos</a>
  <a href="#/arbitros">Árbitros</a>
  <a href="#/partidos">Partidos</a>
  <a href="#/cobros">Cobros</a>
  <a href="#/reportes">Reportes</a>
</nav>
<div id="drawer-overlay" hidden></div>
<nav class="tabbar">
  <a href="#/">🏠</a>
  <a href="#/equipos">👥</a>
  <a href="#/partidos">📅</a>
  <a href="#/cobros">💰</a>
</nav>
<div id="modal-root"></div>`;

let rendered = false;
export function renderShell() {
  if (rendered) return;
  document.body.insertAdjacentHTML('afterbegin', shellHtml);
  const menuBtn = document.getElementById('menu-btn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  function closeDrawer() {
    drawer.hidden = true;
    overlay.hidden = true;
  }
  menuBtn.addEventListener('click', () => {
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
