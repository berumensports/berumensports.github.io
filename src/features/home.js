import { addDiagnostic } from '../data/repo.js';
import { getAuth } from '../data/firebase.js';

export async function render(el) {
  el.innerHTML = `<div class="card"><h1 class="h1">Home</h1><button id="smoke" class="btn btn-secondary">Probar escritura</button><div id="result" class="mt-4"></div></div>`;
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
