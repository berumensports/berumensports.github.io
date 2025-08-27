import { onTorneoChange } from '../data/torneos.js';

const routes = {
  '/': () => import('../features/home.js'),
  '/equipos': () => import('../features/equipos.js'),
  '/delegaciones': () => import('../features/delegaciones.js'),
  '/arbitros': () => import('../features/arbitros.js'),
  '/torneos': () => import('../features/torneos.js'),
  '/partidos': () => import('../features/partidos.js'),
  '/cobros': () => import('../features/cobros.js'),
  '/tarifas': () => import('../features/tarifas.js'),
  '/reportes': () => import('../features/reportes.js'),
};

let cleanupFns = [];
function runCleanup() {
  cleanupFns.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
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
  onTorneoChange(() => requestAnimationFrame(loadRoute));
  requestAnimationFrame(loadRoute);
}
