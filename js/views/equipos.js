import { listEquipos, createEquipo, updateEquipo, deleteEquipo } from "../data/equipos.js";
import { listDelegaciones } from "../data/delegaciones.js";
import { currentProfile } from "../auth.js";
import { qs, on, formDataToObj } from "../utils.js";

export default {
  title: 'Equipos',
  async render(root) {
    const admin = currentProfile?.role === 'admin';
    let equipos = await listEquipos({});
    root.innerHTML = `
      <h2>Equipos</h2>
      ${admin ? '<button id="addEquipo" class="btn">Nuevo</button>' : ''}
      <table class="table"><thead><tr><th>Nombre</th><th>Delegación</th><th>Rama</th><th>Categoría</th>${admin ? '<th></th>' : ''}</tr></thead><tbody id="tbody"></tbody></table>
      <div id="modalEq" class="modal-overlay"><div class="modal"><form id="formEq">
        <h3 id="modalTitle">Equipo</h3>
        <input type="hidden" name="id" />
        <label>Nombre<input name="nombre" required></label>
        <label>Delegación<select name="delegacionId" required></select></label>
        <label>Rama<select name="rama"><option>Varonil</option><option>Femenil</option></select></label>
        <label>Categoría<input type="number" name="categoria" min="2009" max="2020" required></label>
        <label>Estatus<select name="estatus"><option value="activo">activo</option><option value="inactivo">inactivo</option></select></label>
        <div class="gap"><button class="btn" type="submit">Guardar</button><button type="button" class="btn" id="cancelEq">Cancelar</button></div>
      </form></div></div>`;
    const tbody = qs('#tbody', root);
    const modal = qs('#modalEq', root);
    const form = qs('#formEq', root);

    function renderTable(){
      tbody.innerHTML = equipos.map(e=>`<tr><td>${e.nombre}</td><td>${e.delegacionId||''}</td><td>${e.rama}</td><td>${e.categoria}</td>${admin?`<td><button class='edit btn' data-id='${e.id}'>Editar</button><button class='del btn' data-id='${e.id}'>Borrar</button></td>`:''}</tr>`).join('');
    }
    renderTable();

    if(admin){
      const delegSel = qs('select[name="delegacionId"]', form);
      const delegs = await listDelegaciones();
      delegSel.innerHTML = delegs.map(d=>`<option value="${d.id}">${d.nombre}</option>`).join('');
      qs('#addEquipo', root)?.addEventListener('click',()=>{form.reset();qs('#modalTitle',root).textContent='Nuevo equipo';modal.classList.add('open');});
      qs('#cancelEq', root).addEventListener('click',()=>modal.classList.remove('open'));
      form.addEventListener('submit', async e=>{
        e.preventDefault();
        const data = formDataToObj(form);
        try{
          if(data.id){
            await updateEquipo(data.id,data);
            const idx = equipos.findIndex(x=>x.id===data.id); if(idx>-1) equipos[idx] = {...equipos[idx], ...data};
          }else{
            const ref = await createEquipo(data);
            equipos.push({...data, id: ref.id});
          }
          renderTable();
          modal.classList.remove('open');
        }catch(err){alert(err.message);}      
      });
      on(tbody,'click','.del',async e=>{
        const id = e.target.dataset.id;
        if(confirm('¿Borrar?')){ await deleteEquipo(id); equipos = equipos.filter(x=>x.id!==id); renderTable(); }
      });
      on(tbody,'click','.edit',e=>{
        const id = e.target.dataset.id;
        const eq = equipos.find(x=>x.id===id);
        if(eq){
          form.id.value=id;
          form.nombre.value=eq.nombre; form.delegacionId.value=eq.delegacionId||''; form.rama.value=eq.rama; form.categoria.value=eq.categoria; form.estatus.value=eq.estatus;
          qs('#modalTitle',root).textContent='Editar equipo';
          modal.classList.add('open');
        }
      });
    }
  }
};
