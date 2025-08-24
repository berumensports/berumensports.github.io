import { listTarifas, upsertTarifa } from "../data/tarifas.js";
import { currentProfile } from "../auth.js";
import { qs, on, formDataToObj } from "../utils.js";

export default {
  title: 'Tarifas',
  async render(root) {
    const admin = currentProfile?.role === 'admin';
    let tarifas = await listTarifas();
    root.innerHTML = `
      <h2>Tarifas</h2>
      ${admin ? '<button id="addTarifa" class="btn">Nueva</button>' : ''}
      <table class="table"><thead><tr><th>Rama</th><th>Categoría</th><th>Monto</th>${admin?'<th></th>':''}</tr></thead><tbody id="tbody"></tbody></table>
      <div id="modalTar" class="modal-overlay"><div class="modal"><form id="formTar">
        <h3 id="modalTitle">Tarifa</h3>
        <input type="hidden" name="id" />
        <label>Rama<select name="rama"><option>Varonil</option><option>Femenil</option></select></label>
        <label>Categoría<input type="number" name="categoria" min="2009" max="2020" required></label>
        <label>Monto<input type="number" name="monto" min="0" required></label>
        <div class="gap"><button class="btn" type="submit">Guardar</button><button type="button" class="btn" id="cancelTar">Cancelar</button></div>
      </form></div></div>`;
    const tbody = qs('#tbody', root);
    const modal = qs('#modalTar', root);
    const form = qs('#formTar', root);

    function renderTable(){
      tbody.innerHTML = tarifas.map(t=>`<tr><td>${t.rama}</td><td>${t.categoria}</td><td>${t.monto}</td>${admin?`<td><button class='edit btn' data-id='${t.id}'>Editar</button></td>`:''}</tr>`).join('');
    }
    renderTable();

    if(admin){
      qs('#addTarifa', root)?.addEventListener('click',()=>{form.reset();qs('#modalTitle',root).textContent='Nueva tarifa';modal.classList.add('open');});
      qs('#cancelTar', root).addEventListener('click',()=>modal.classList.remove('open'));
      form.addEventListener('submit', async e=>{
        e.preventDefault();
        const data = formDataToObj(form);
        data.monto = Number(data.monto);
        const id = await upsertTarifa(data);
        const existing = tarifas.find(t=>t.id===id);
        if(existing){ Object.assign(existing, data); } else { tarifas.push({...data,id}); }
        renderTable();
        modal.classList.remove('open');
      });
      on(tbody,'click','.edit',e=>{
        const id = e.target.dataset.id;
        const t = tarifas.find(x=>x.id===id);
        if(t){ form.id.value=id; form.rama.value=t.rama; form.categoria.value=t.categoria; form.monto.value=t.monto; qs('#modalTitle',root).textContent='Editar tarifa'; modal.classList.add('open'); }
      });
    }
  }
};
