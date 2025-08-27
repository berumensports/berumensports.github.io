import './data/firebase.js';
import { renderShell } from './core/shell.js';
import { onAuth, login, logout, fetchUserInfo } from './core/auth.js';
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
  app.innerHTML = `
    <div class="card">
      <h1 class="h1">Iniciar sesión</h1>
      <form id="login" class="form">
        <label class="field">
          <span class="label">Correo</span>
          <input class="input" name="email" type="email" required>
        </label>
        <label class="field">
          <span class="label">Contraseña</span>
          <input class="input" name="pass" type="password" required>
        </label>
        <button class="btn btn-primary" type="submit">Entrar</button>
      </form>
    </div>`;
  document.getElementById('login').addEventListener('submit', e => {
    e.preventDefault();
    login(e.target.email.value, e.target.pass.value).catch(err=>alert(err.message));
  });
}

onAuth(async user => {
  if (!user) {
    hideShell();
    showLogin();
    const userInfoEl = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    if (userInfoEl) userInfoEl.textContent = 'Berumen';
    if (logoutBtn) logoutBtn.hidden = true;
  } else {
    renderShell();
    showShell();
    const info = await fetchUserInfo(user.uid);
    if (info) {
      const userInfoEl = document.getElementById('user-info');
      const logoutBtn = document.getElementById('logout-btn');
      if (userInfoEl) userInfoEl.innerHTML = `${info.nombre} <span id="user-role" class="chip">${info.role}</span>`;
      if (logoutBtn) logoutBtn.hidden = false;
      initRouter();
    }
  }
});

window.appLogout = logout;
