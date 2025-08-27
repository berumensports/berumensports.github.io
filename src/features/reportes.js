export async function render(el) {
  el.innerHTML = `
    <div class="card">
      <div class="page-header">
        <h1 class="h1">Reportes</h1>
      </div>
      <div class="toolbar">
        <input id="buscar" class="input" placeholder="Buscar">
        <button id="limpiar" class="btn btn-secondary">Limpiar</button>
      </div>
      <p>Próximamente filtros y exportación.</p>
    </div>`;
}
