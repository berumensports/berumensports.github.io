export function createSelect(options = []) {
  const select = document.createElement('select');
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    select.appendChild(opt);
  });
  return select;
}
