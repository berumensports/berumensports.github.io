import "./firebase.js";
import { watchAuth, logout, currentProfile } from "./auth.js";
import { initRouter, refreshRoute } from "./router.js";
import { qs } from "./utils.js";

const app = qs('#app');
const emailEl = qs('#userEmail');
const roleEl = qs('#userRole');
const logoutBtn = qs('#logoutBtn');
const menuBtn = qs('#menuBtn');
const sidebar = qs('#sidebar');

logoutBtn.addEventListener('click', () => logout());
menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

watchAuth((user, profile) => {
  if (user) {
    app.classList.remove('hidden');
    emailEl.textContent = user.email;
    roleEl.textContent = profile?.role || '';
    refreshRoute();
  } else {
    app.classList.remove('hidden');
    emailEl.textContent = '';
    roleEl.textContent = '';
    location.hash = '#/login';
  }
});

initRouter();
