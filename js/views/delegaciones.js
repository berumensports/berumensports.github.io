import { listDelegaciones, create as createDelegacion, update as updateDelegacion, remove as deleteDelegacion } from "../data/delegaciones.js";
import { currentProfile } from "../auth.js";
import { qs, on, formDataToObj } from "../utils.js";

export default {
  title: 'Delegaciones',
  async render(root) {
    const admin = currentProfile?.role === 'admin';
    let delegaciones = await listDelegaciones();
    root.innerHTML = `
      <h2>Delegaciones</h2>
      ${admin ? '<button id="addDel" class="btn">Nueva</button>' : ''}
      <table class="table"><thead><tr><th>Nombre</th>${admin?'<th></th>':''}</tr></thead><tbody id="tbody"></tbody></table>
      <div id="modalDel" class="modal-overlay"><div class="modal"><form id="formDel">
        <h3 id="modalTitle">Delegación</h3>
        <input type="hidden" name="id" />
        <label>Nombre<input name="nombre" required></label>
        <div class="gap"><button class="btn" type="submit">Guardar</button><button type="button" class="btn" id="cancelDel">Cancelar</button></div>
      </form></div></div>`;
    const tbody = qs('#tbody', root);
    const modal = qs('#modalDel', root);
    const form = qs('#formDel', root);

    function renderTable(){
      tbody.innerHTML = delegaciones.map(d=>`<tr><td>${d.nombre}</td>${admin?`<td><button class='edit btn' data-id='${d.id}'>Editar</button><button class='del btn' data-id='${d.id}'>Borrar</button></td>`:''}</tr>`).join('');
    }
    renderTable();

    if(admin){
      qs('#addDel', root)?.addEventListener('click',()=>{form.reset();qs('#modalTitle',root).textContent='Nueva delegación';modal.classList.add('open');});
      qs('#cancelDel', root).addEventListener('click',()=>modal.classList.remove('open'));
      form.addEventListener('submit', async e=>{
        e.preventDefault();
        const data = formDataToObj(form);
        try{
          if(data.id){
            await updateDelegacion(data.id,data);
            const idx = delegaciones.findIndex(x=>x.id===data.id); if(idx>-1) delegaciones[idx] = {...delegaciones[idx], ...data};
          }else{
            const ref = await createDelegacion(data);
            delegaciones.push({...data, id: ref.id});
          }
          renderTable();
          modal.classList.remove('open');
        }catch(err){alert(err.message);}
      });
      on(tbody,'click','.del',async e=>{
        const id = e.target.dataset.id;
        if(confirm('¿Borrar?')){ await deleteDelegacion(id); delegaciones = delegaciones.filter(x=>x.id!==id); renderTable(); }
      });
      on(tbody,'click','.edit',e=>{
        const id = e.target.dataset.id;
        const d = delegaciones.find(x=>x.id===id);
        if(d){
          form.id.value=id;
          form.nombre.value=d.nombre;
          qs('#modalTitle',root).textContent='Editar delegación';
          modal.classList.add('open');
        }
      });
    }
  }
};
