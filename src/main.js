import './data/firebase.js';
import { renderShell } from './core/shell.js';
import { onAuth, login, logout, fetchUserRole } from './core/auth.js';
import { initRouter } from './core/router.js';

function hideShell() {
  document.querySelector('.topbar')?.setAttribute('hidden', '');
  document.querySelector('.tabbar')?.setAttribute('hidden', '');
}

function showShell() {
  document.querySelector('.topbar')?.removeAttribute('hidden');
  document.querySelector('.tabbar')?.removeAttribute('hidden');
}

function showLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="card"><h2>Login</h2><form id="login"><input name="email" type="email" placeholder="Email"><input name="pass" type="password" placeholder="Password"><button>Entrar</button></form></div>`;
  document.getElementById('login').addEventListener('submit', e => {
    e.preventDefault();
    login(e.target.email.value, e.target.pass.value).catch(err=>alert(err.message));
  });
}

onAuth(async user => {
  if (!user) {
    hideShell();
    showLogin();
  } else {
    renderShell();
    showShell();
    const role = await fetchUserRole(user.uid);
    if (role) {
      initRouter();
    }
  }
});

window.appLogout = logout;
