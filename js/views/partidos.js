import { listPartidos, createPartido, updatePartido } from "../data/partidos.js";
import { listDelegaciones } from "../data/delegaciones.js";
import { listEquipos } from "../data/equipos.js";
import { currentProfile } from "../auth.js";
import { qs, on, formDataToObj } from "../utils.js";

export default {
  title: 'Partidos',
  async render(root) {
    const admin = currentProfile?.role === 'admin';
    let partidos = await listPartidos({});
    const equipos = await listEquipos({});
    root.innerHTML = `
      <h2>Partidos</h2>
      ${admin ? '<button id="addPartido" class="btn">Nuevo</button>' : ''}
      <table class="table"><thead><tr><th>Fecha</th><th>Local</th><th>Visita</th><th>Estado</th>${admin?'<th></th>':''}</tr></thead><tbody id="tbody"></tbody></table>
      <div id="modalPar" class="modal-overlay"><div class="modal"><form id="formPar">
        <h3 id="modalTitle">Partido</h3>
        <input type="hidden" name="id" />
        <label>Fecha<input type="datetime-local" name="fecha" required></label>
        <label>Delegación<select name="delegacionId" required></select></label>
        <label>Local<select name="localId" required></select></label>
        <label>Visita<select name="visitaId" required></select></label>
        <label>Rama<select name="rama"><option>Varonil</option><option>Femenil</option></select></label>
        <label>Categoría<input type="number" name="categoria" min="2009" max="2020" required></label>
        <div class="gap"><button class="btn" type="submit">Guardar</button><button type="button" class="btn" id="cancelPar">Cancelar</button></div>
      </form></div></div>`;
    const tbody = qs('#tbody', root);
    const modal = qs('#modalPar', root);
    const form = qs('#formPar', root);

    function renderTable(){
      tbody.innerHTML = partidos.map(p=>`<tr><td>${p.fecha?new Date(p.fecha.seconds*1000).toLocaleString():''}</td><td>${p.localNombre||''}</td><td>${p.visitaNombre||''}</td><td>${p.estado}</td>${admin?`<td><button class='edit btn' data-id='${p.id}'>Editar</button></td>`:''}</tr>`).join('');
    }
    renderTable();

    if(admin){
      const delegSel = qs('select[name="delegacionId"]', form);
      const delegs = await listDelegaciones();
      delegSel.innerHTML = delegs.map(d=>`<option value="${d.id}">${d.nombre}</option>`).join('');
      const localSel = qs('select[name="localId"]', form);
      const visitaSel = qs('select[name="visitaId"]', form);
      const eqOpts = equipos.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join('');
      localSel.innerHTML = eqOpts; visitaSel.innerHTML = eqOpts;
      qs('#addPartido', root)?.addEventListener('click',()=>{form.reset();qs('#modalTitle',root).textContent='Nuevo partido';modal.classList.add('open');});
      qs('#cancelPar', root).addEventListener('click',()=>modal.classList.remove('open'));
      form.addEventListener('submit', async e=>{
        e.preventDefault();
        const data = formDataToObj(form);
        data.fecha = new Date(data.fecha);
        const eqL = equipos.find(x=>x.id===data.localId);
        const eqV = equipos.find(x=>x.id===data.visitaId);
        data.localNombre = eqL?.nombre;
        data.visitaNombre = eqV?.nombre;
        try{
          if(data.id){
            await updatePartido(data.id,data);
            const idx = partidos.findIndex(x=>x.id===data.id); if(idx>-1) partidos[idx] = {...partidos[idx], ...data};
          }else{
            const ref = await createPartido(data);
            partidos.push({...data, id: ref.id});
          }
          renderTable();
          modal.classList.remove('open');
        }catch(err){alert(err.message);}
      });
      on(tbody,'click','.edit',e=>{
        const id = e.target.dataset.id;
        const p = partidos.find(x=>x.id===id);
        if(p){
          form.id.value=id;
          form.fecha.value = p.fecha ? new Date(p.fecha.seconds*1000).toISOString().slice(0,16) : '';
          form.delegacionId.value=p.delegacionId||'';
          form.localId.value=p.localId; form.visitaId.value=p.visitaId;
          form.rama.value=p.rama; form.categoria.value=p.categoria;
          qs('#modalTitle',root).textContent='Editar partido';
          modal.classList.add('open');
        }
      });
    }
  }
};
