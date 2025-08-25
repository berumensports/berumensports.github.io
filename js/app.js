import { Modal } from './modal-manager.js';
import { auth, onAuthChanged, signOut, userRole, ensureUserProfile, ensureTemporada } from './firebase-ui.js';
import { qs, showToast } from './ui-kit.js';
import { enhanceView } from './views/_shared-patches.js';
import { initNav, setActiveRoute, lockRouter, canonicalize } from './nav.js';

const AUTH = {
  UNKNOWN: 'desconocido',
  AUTHENTICATED: 'autenticado',
  NOT_AUTHENTICATED: 'noAutenticado'
};

let authState = AUTH.UNKNOWN;
const app = qs('#app');
app.innerHTML = '<p class="loading">Cargando...</p>';
Modal.init();

const routes = {
  '#/': () => import('./views/dashboard.js'),
  '#/login': () => import('./views/login.js'),
  '#/delegaciones': () => import('./views/delegaciones.js'),
  '#/equipos': () => import('./views/equipos.js'),
  '#/tarifas': () => import('./views/tarifas.js'),
  '#/partidos': () => import('./views/partidos.js'),
  '#/cobros': () => import('./views/cobros.js'),
  '#/arbitros': () => import('./views/arbitros.js'),
  '#/reportes': () => import('./views/reportes.js'),
  '#/mas': () => import('./views/mas.js'),
};

function getSavedRoute() {
  const r = localStorage.getItem('lastRoute');
  return r && r !== '#/login' && routes[r] ? r : '#/';
}

async function router() {
  if (authState === AUTH.UNKNOWN) return;
  let path = canonicalize(location.hash || '#/');
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
  setActiveRoute(path);
}

onAuthChanged(async (user) => {
  const roleEl = qs('#user-role');
  const emailEl = qs('#user-email');
  if (user) {
    try {
      await ensureUserProfile();
      await ensureTemporada();
      authState = AUTH.AUTHENTICATED;
      emailEl.textContent = user.email || '';
      const role = await userRole();
      roleEl.textContent = role;
      roleEl.classList.add(role);
    } catch (err) {
      console.error('Failed to initialize user', err);
      showToast('error', 'No se pudo iniciar la sesión. Permisos insuficientes.');
      await signOut();
      authState = AUTH.NOT_AUTHENTICATED;
      emailEl.textContent = '';
      roleEl.textContent = '';
      roleEl.className = 'badge';
    }
  } else {
    authState = AUTH.NOT_AUTHENTICATED;
    emailEl.textContent = '';
    roleEl.textContent = '';
    roleEl.className = 'badge';
  }
  document.body.classList.toggle('auth', authState === AUTH.AUTHENTICATED);
  lockRouter(false);
  const target = authState === AUTH.AUTHENTICATED ? getSavedRoute() : '#/login';
  if (location.hash !== target) {
    location.hash = target;
  } else {
    router();
  }
});

window.addEventListener('hashchange', () => {
  Modal.closeAll();
  localStorage.setItem('lastRoute', location.hash);
  router();
});

function getAuthState() { return authState; }
async function getRole() { return await userRole(); }
function navigate(route) {
  const target = canonicalize(route);
  if (location.hash !== target) {
    location.hash = target;
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
async function onSignOut() {
  await signOut();
  Modal.closeAll();
  showToast('success', 'Sesión cerrada');
  navigate('#/login');
}

initNav({ getAuthState, getRole, navigate, onSignOut });
lockRouter(true);
