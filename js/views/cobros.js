import { listCobros, registrarAbono } from "../data/cobros.js";
import { currentProfile } from "../auth.js";
import { qs, on, formDataToObj } from "../utils.js";

export default {
  title: 'Cobros',
  async render(root) {
    const admin = currentProfile?.role === 'admin';
    let cobros = await listCobros({});
    root.innerHTML = `
      <h2>Cobros</h2>
      <table class="table"><thead><tr><th>Equipo</th><th>Monto</th><th>Saldo</th><th>Estatus</th>${admin?'<th></th>':''}</tr></thead><tbody id="tbody"></tbody></table>
      <div id="abonoModal" class="modal-overlay"><div class="modal"><form id="abonoForm"><h3>Abono</h3>
        <input type="hidden" name="cobroId" />
        <label>Monto<input type="number" name="monto" min="1" required></label>
        <label>Método<select name="metodo"><option value="efectivo">efectivo</option><option value="transferencia">transferencia</option></select></label>
        <label>Ref<input name="ref" /></label>
        <div class="gap"><button class="btn" type="submit">Guardar</button><button type="button" class="btn" id="cancelAbono">Cancelar</button></div>
      </form></div></div>`;
    const tbody = qs('#tbody', root);
    const modal = qs('#abonoModal', root);
    const form = qs('#abonoForm', root);
    function renderTable(){
      tbody.innerHTML = cobros.map(c=>`<tr><td>${c.equipoNombre||''}</td><td>${c.montoTotal}</td><td>${c.saldo}</td><td>${c.estatus}</td>${admin?`<td><button class='abono btn' data-id='${c.id}'>Abono</button></td>`:''}</tr>`).join('');
    }
    renderTable();
    if(admin){
      on(tbody,'click','.abono',e=>{form.reset();form.cobroId.value=e.target.dataset.id;modal.classList.add('open');});
      qs('#cancelAbono', root).addEventListener('click',()=>modal.classList.remove('open'));
      form.addEventListener('submit', async e=>{
        e.preventDefault();
        const data = formDataToObj(form);
        try{
          await registrarAbono(data.cobroId,{monto:Number(data.monto),metodo:data.metodo,ref:data.ref});
          modal.classList.remove('open');
          cobros = await listCobros({});
          renderTable();
        }catch(err){alert(err.message);}
      });
    }
  }
};
