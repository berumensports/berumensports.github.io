import { addDiagnostic } from '../data/repo.js';
import { getAuth } from 'firebase/auth';

export async function render(el) {
  el.innerHTML = `<div class="card"><h2>Home</h2><button id="smoke">Probar escritura</button><div id="result"></div></div>`;
  document.getElementById('smoke').addEventListener('click', async () => {
    const uid = getAuth().currentUser.uid;
    try {
      const res = await addDiagnostic('smoke', uid);
      document.getElementById('result').textContent = 'Escribió id ' + res.id;
    } catch (e) {
      document.getElementById('result').textContent = 'Error: ' + e.message;
    }
  });
}
