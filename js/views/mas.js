import { el } from '../ui-kit.js';

export async function render(){
  return el('section',{class:'stack'},[
    el('h2',{},'Más'),
    el('p',{},'Sección en construcción.')
  ]);
}
