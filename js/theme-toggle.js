// Opcional: toggle manual de tema si quisieras un switch en "Más"
// Por defecto respeta prefers-color-scheme.
export function setTheme(mode /* 'light' | 'dark' | 'system' */){
  const r = document.documentElement;
  if(mode === 'light') r.setAttribute('data-theme','light');
  else if(mode === 'dark') r.setAttribute('data-theme','dark');
  else r.removeAttribute('data-theme'); // system
  localStorage.setItem('themeMode', mode);
}
export function initTheme(){
  const saved = localStorage.getItem('themeMode');
  if(saved) setTheme(saved);
}
initTheme();
