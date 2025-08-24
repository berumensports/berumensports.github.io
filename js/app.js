import { auth, onAuthChanged, signOut, userRole } from './firebase-ui.js';
import { qs, showToast } from './ui-kit.js';
import { enhanceView } from './views/_shared-patches.js';

const routes = {
  '#/': () => import('./views/dashboard.js'),
  '#/login': () => import('./views/login.js'),
  '#/delegaciones': () => import('./views/delegaciones.js'),
  '#/equipos': () => import('./views/equipos.js'),
  '#/tarifas': () => import('./views/tarifas.js'),
  '#/partidos': () => import('./views/partidos.js'),
  '#/cobros': () => import('./views/cobros.js'),
  '#/reportes': () => import('./views/reportes.js'),
};

async function router() {
  let path = location.hash || '#/';
  if (!auth.currentUser && path !== '#/login') {
    path = '#/login';
    location.hash = path;
  }
  const load = routes[path];
  const app = qs('#app');
  if (!load) {
    app.textContent = 'Ruta no encontrada';
    return;
  }
  const mod = await load();
  app.innerHTML = '';
  const el = await mod.render();
  app.appendChild(el);
  enhanceView(app);
  updateTabbar(path);
}

function updateTabbar(path) {
  const tabbar = qs('.tabbar');
  if (!tabbar) return;
  const tabs = tabbar.querySelectorAll('a');
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === path));
  if (path === '#/login') tabbar.classList.add('hide');
  else tabbar.classList.remove('hide');
}

function initMenu() {
  const drawer = qs('.sidedrawer');
  qs('#menu-btn').addEventListener('click', () => {
    drawer.classList.toggle('open');
    drawer.hidden = !drawer.classList.contains('open');
  });
}

function initLogout() {
  qs('#logout-btn').addEventListener('click', async () => {
    await signOut();
    showToast('success', 'Sesión cerrada');
    location.hash = '#/login';
  });
}

onAuthChanged(async (user) => {
  const roleEl = qs('#user-role');
  const emailEl = qs('#user-email');
  if (user) {
    emailEl.textContent = user.email || '';
    const role = await userRole();
    roleEl.textContent = role;
    roleEl.classList.add(role);
    router();
  } else {
    emailEl.textContent = '';
    roleEl.textContent = '';
    router();
  }
});

window.addEventListener('hashchange', router);

initMenu();
initLogout();
router();
