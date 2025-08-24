import { auth } from "./firebase.js";
import loginView from "./views/login.js";
import registerView from "./views/register.js";
import dashboardView from "./views/dashboard.js";
import delegacionesView from "./views/delegaciones.js";
import equiposView from "./views/equipos.js";
import tarifasView from "./views/tarifas.js";
import partidosView from "./views/partidos.js";
import cobrosView from "./views/cobros.js";
import reportesView from "./views/reportes.js";

const routes = {
  '/login': loginView,
  '/register': registerView,
  '/': dashboardView,
  '/delegaciones': delegacionesView,
  '/equipos': equiposView,
  '/tarifas': tarifasView,
  '/partidos': partidosView,
  '/cobros': cobrosView,
  '/reportes': reportesView
};

let currentRoute = null;

function renderRoute() {
  const path = location.hash.replace('#','') || '/';
  const user = auth.currentUser;
  if (!user && path !== '/login' && path !== '/register') {
    location.hash = '#/login';
    return;
  }
  const view = routes[path] || routes['/'];
  const container = document.getElementById('main');
  container.innerHTML = '';
  if (currentRoute && currentRoute.unmount) currentRoute.unmount();
  currentRoute = view;
  view.render(container);
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.textContent = view.title || '';
}

export function initRouter(){
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

export function refreshRoute(){
  renderRoute();
}
