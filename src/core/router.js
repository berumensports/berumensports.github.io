const routes = {
  '/': () => import('../features/home.js'),
  '/equipos': () => import('../features/equipos.js'),
  '/arbitros': () => import('../features/arbitros.js'),
  '/partidos': () => import('../features/partidos.js'),
  '/cobros': () => import('../features/cobros.js'),
  '/reportes': () => import('../features/reportes.js'),
};

let cleanupFns = [];
function runCleanup() {
  cleanupFns.forEach(fn => { try { fn(); } catch (e) {} });
  cleanupFns = [];
}
export function pushCleanup(fn) { cleanupFns.push(fn); }

async function loadRoute() {
  if (!location.hash) location.replace('#/');
  const path = location.hash.slice(1);
  const loader = routes[path];
  if (!loader) return;
  runCleanup();
  const module = await loader();
  await module.render(document.getElementById('app'));
}
let bound = false;
export function initRouter() {
  if (bound) return;
  bound = true;
  window.addEventListener('hashchange', () => requestAnimationFrame(loadRoute));
  requestAnimationFrame(loadRoute);
}
