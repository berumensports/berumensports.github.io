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
  '#/mas': () => import('./views/mas.js'),
};

async function router() {
  let path = location.hash || '#/';
  if (!auth.currentUser && path !== '#/login') {
    path = '#/login';
    location.hash = path;
  }
  const load = routes[path];
  if (!load) {
    showToast('error', 'Sección no encontrada');
    location.hash = '#/';
    return;
  }
  const app = qs('#app');
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
initTabbar();
router();
