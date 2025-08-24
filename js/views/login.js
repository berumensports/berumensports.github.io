import { login } from "../auth.js";
import { qs, formDataToObj, toast } from "../utils.js";

export default {
  title: 'Ingresar',
  render(root) {
    root.innerHTML = `
      <h2>Ingresar</h2>
      <form id="loginForm">
        <label>Email<input type="email" name="email" required></label>
        <label>Contraseña<input type="password" name="password" required></label>
        <button class="btn" type="submit">Entrar</button>
        <p id="msg" class="error"></p>
        <p><a href="#/register">Crear cuenta</a></p>
      </form>`;
    const form = qs('#loginForm', root);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = formDataToObj(form);
      try {
        await login(data.email, data.password);
        location.hash = '#/';
      } catch (err) {
        qs('#msg', root).textContent = err.code || 'Error';
      }
    });
  }
};
