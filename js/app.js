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
  updateNav(path);
}

function updateNav(path) {
  const tabbar = qs('.tabbar');
  const menuBtn = qs('#menu-btn');
  const drawer = qs('.sidedrawer');
  const topbarUser = qs('.topbar-user');
  const isLogin = path === '#/login';
  if (tabbar) {
    const tabs = tabbar.querySelectorAll('a');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === path));
    tabbar.classList.toggle('hide', isLogin);
  }
  if (menuBtn) menuBtn.classList.toggle('hide', isLogin);
  if (drawer) drawer.classList.toggle('hide', isLogin);
  if (topbarUser) topbarUser.classList.toggle('hide', isLogin);
}

function initMenu() {
  const drawer = qs('.sidedrawer');
  const menuBtn = qs('#menu-btn');

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.hidden = true;
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('open');
    drawer.hidden = !drawer.classList.contains('open');
  });

  // Cierra al dar click fuera del menú
    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains('open')) return;
      if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
        closeDrawer();
      }
    });

  // Cierra al navegar
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
}

function initLogout() {
  qs('#logout-btn').addEventListener('click', async () => {
    await signOut();
    showToast('success', 'Sesión cerrada');
    location.hash = '#/login';
  });
}

onAuthChanged(async (user) => {
  document.body.classList.toggle('auth', !!user);
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
    roleEl.className = 'badge';
    router();
  }
});

window.addEventListener('hashchange', router);

initMenu();
initLogout();
router();
