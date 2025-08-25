import { register } from "../auth.js";
import { qs, formDataToObj } from "../utils.js";

export default {
  title: 'Registro',
  render(root) {
    root.innerHTML = `
      <h1>Registro</h1>
      <form id="regForm">
        <label>Email<input type="email" name="email" required></label>
        <label>Contraseña<input type="password" name="password" required></label>
        <button class="btn" type="submit">Crear cuenta</button>
        <p id="msg" class="error"></p>
        <p><a href="#/login">Iniciar sesión</a></p>
      </form>`;
    const form = qs('#regForm', root);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = formDataToObj(form);
      try {
        await register(data.email, data.password);
        location.hash = '#/';
      } catch (err) {
        qs('#msg', root).textContent = err.code || 'Error';
      }
    });
  }
};
