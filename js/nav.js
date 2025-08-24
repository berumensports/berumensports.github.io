const ROUTES = [
  '#/',
  '#/partidos',
  '#/equipos',
  '#/cobros',
  '#/arbitros',
  '#/delegaciones',
  '#/tarifas',
  '#/reportes',
  '#/mas',
  '#/login'
];

let state = {
  init: false,
  locked: false,
  navigate: null,
  getAuthState: null,
  getRole: null,
  onSignOut: null,
  drawer: null,
  menuBtn: null,
  tabbar: null,
  overlay: null,
  lastFocus: null
};

export function canonicalize(route) {
  if (!route) return '#/' ;
  if (!route.startsWith('#')) route = '#' + route;
  route = route.split('?')[0];
  return ROUTES.includes(route) ? route : '#/';
}

export function initNav({ getAuthState, getRole, navigate, onSignOut }) {
  if (state.init) return;
  state.init = true;
  console.log('Nav:init once');

  state.getAuthState = getAuthState;
  state.getRole = getRole;
  state.navigate = navigate;
  state.onSignOut = onSignOut;

  state.drawer = document.querySelector('.sidedrawer');
  state.menuBtn = document.getElementById('menu-btn');
  state.tabbar = document.querySelector('.tabbar');

  if (state.drawer) {
    state.drawer.addEventListener('click', handleNavClick);
    state.drawer.addEventListener('keydown', handleDrawerKeydown);
  }
  if (state.tabbar) {
    state.tabbar.addEventListener('click', handleNavClick);
  }
  state.menuBtn?.addEventListener('click', (e) => { e.preventDefault(); toggleDrawer(); });

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    closeDrawer();
    await state.onSignOut?.();
  });

  state.overlay = document.createElement('div');
  state.overlay.className = 'drawer-overlay';
  state.overlay.addEventListener('click', closeDrawer);
  document.body.appendChild(state.overlay);

  window.addEventListener('hashchange', () => {
    if (state.locked) return;
    setActiveRoute(location.hash);
    closeDrawer();
  });

  setActiveRoute(location.hash);
}

function handleNavClick(e) {
  const link = e.target.closest('a');
  if (!link) return;
  const route = canonicalize(link.getAttribute('href') || link.dataset.route);
  e.preventDefault();
  if (route === canonicalize(location.hash)) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeDrawer();
    return;
  }
  state.navigate?.(route);
  closeDrawer();
}

function handleDrawerKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDrawer();
    return;
  }
  if (e.key === 'Tab') {
    const focusable = Array.from(state.drawer.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

export function setActiveRoute(route) {
  const target = canonicalize(route);
  if (location.hash !== target) {
    state.navigate?.(target);
    return;
  }
  if (state.tabbar) {
    const tabs = Array.from(state.tabbar.querySelectorAll('.tab'));
    tabs.forEach(t => {
      const active = canonicalize(t.getAttribute('href')) === target;
      t.setAttribute('aria-selected', active);
      t.tabIndex = active ? 0 : -1;
      if (active) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
  }
  if (state.drawer) {
    const links = Array.from(state.drawer.querySelectorAll('a'));
    links.forEach(a => {
      const active = canonicalize(a.getAttribute('href')) === target;
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  console.log('Nav:active', target);
}

export function openDrawer() {
  if (!state.drawer) return;
  state.lastFocus = document.activeElement;
  state.drawer.hidden = false;
  state.drawer.classList.add('open');
  state.overlay.classList.add('active');
  document.body.classList.add('lock-scroll');
  state.menuBtn?.setAttribute('aria-expanded', 'true');
  const focusable = state.drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
  focusable?.focus();
}

export function closeDrawer() {
  if (!state.drawer) return;
  state.drawer.classList.remove('open');
  state.overlay.classList.remove('active');
  document.body.classList.remove('lock-scroll');
  state.menuBtn?.setAttribute('aria-expanded', 'false');
  state.drawer.addEventListener('transitionend', () => {
    if (!state.drawer.classList.contains('open')) state.drawer.hidden = true;
  }, { once: true });
  state.lastFocus?.focus();
}

export function toggleDrawer() {
  if (state.drawer?.classList.contains('open')) closeDrawer();
  else openDrawer();
}

export function lockRouter(flag) {
  state.locked = flag;
}
