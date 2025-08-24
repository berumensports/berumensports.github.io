import { auth, onAuthChanged, signOut, userRole, ensureUserProfile, ensureTemporada } from './firebase-ui.js';
import { qs, showToast } from './ui-kit.js';
import { enhanceView } from './views/_shared-patches.js';

const AUTH = {
  UNKNOWN: 'desconocido',
  AUTHENTICATED: 'autenticado',
  NOT_AUTHENTICATED: 'noAutenticado'
};

let authState = AUTH.UNKNOWN;
let routerLocked = true;
const app = qs('#app');
app.innerHTML = '<p class="loading">Cargando...</p>';

const routes = {
  '#/': () => import('./views/dashboard.js'),
  '#/login': () => import('./views/login.js'),
  '#/delegaciones': () => import('./views/delegaciones.js'),
  '#/equipos': () => import('./views/equipos.js'),
  '#/tarifas': () => import('./views/tarifas.js'),
  '#/partidos': () => import('./views/partidos.js'),
  '#/cobros': () => import('./views/cobros.js'),
  '#/reportes': () => import('./views/reportes.js'),
  '#/mas': () => import('./views/mas.js'),
};

function getSavedRoute() {
  const r = localStorage.getItem('lastRoute');
  return r && r !== '#/login' && routes[r] ? r : '#/';
}

async function router() {
  if (authState === AUTH.UNKNOWN) return;
  let path = location.hash || '#/';
  if (authState === AUTH.NOT_AUTHENTICATED) {
    if (path !== '#/login') {
      location.hash = '#/login';
      return;
    }
  } else if (authState === AUTH.AUTHENTICATED) {
    if (path === '#/login') {
      const target = getSavedRoute();
      if (target !== path) {
        location.hash = target;
        return;
      }
    }
  }
  const load = routes[path];
  if (!load) {
    showToast('error', 'Sección no encontrada');
    location.hash = '#/';
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
    const tabs = Array.from(tabbar.querySelectorAll('.tab'));
    tabs.forEach(t => {
      const active = t.getAttribute('href') === path;
      t.setAttribute('aria-selected', active);
      t.tabIndex = active ? 0 : -1;
    });
    tabbar.classList.toggle('hide', isLogin);
    tabbar.classList.remove('disabled');
  }
  if (menuBtn) menuBtn.classList.toggle('hide', isLogin);
  if (drawer) drawer.classList.toggle('hide', isLogin);
  if (topbarUser) topbarUser.classList.toggle('hide', isLogin);
}

function initTabbar() {
  const tabbar = qs('.tabbar');
  if (!tabbar) return;
  const tabs = Array.from(tabbar.querySelectorAll('.tab'));
  tabs.forEach((t,i)=> t.tabIndex = i===0 ? 0 : -1);

  tabbar.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    e.preventDefault();
    if (tab.getAttribute('aria-selected') === 'true') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    tabbar.classList.add('disabled');
    location.hash = tab.getAttribute('href');
  });

  tabbar.addEventListener('keydown', (e) => {
    const current = document.activeElement.closest('.tab');
    const idx = tabs.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      let next = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
      if (next < 0) next = tabs.length - 1;
      if (next >= tabs.length) next = 0;
      tabs[next].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      current?.click();
    }
  });
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
  const roleEl = qs('#user-role');
  const emailEl = qs('#user-email');
  if (user) {
    await ensureUserProfile();
    await ensureTemporada();
    authState = AUTH.AUTHENTICATED;
    emailEl.textContent = user.email || '';
    const role = await userRole();
    roleEl.textContent = role;
    roleEl.classList.add(role);
  } else {
    authState = AUTH.NOT_AUTHENTICATED;
    emailEl.textContent = '';
    roleEl.textContent = '';
    roleEl.className = 'badge';
  }
  document.body.classList.toggle('auth', authState === AUTH.AUTHENTICATED);
  routerLocked = false;
  const target = authState === AUTH.AUTHENTICATED ? getSavedRoute() : '#/login';
  if (location.hash !== target) {
    location.hash = target;
  } else {
    router();
  }
});

window.addEventListener('hashchange', () => {
  localStorage.setItem('lastRoute', location.hash);
  if (!routerLocked) router();
});

initMenu();
initLogout();
initTabbar();
