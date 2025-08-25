import { el } from '../ui-kit.js';

export async function render(){
  return el('section',{class:'stack'},[
    el('h1',{},'Más'),
    el('p',{},'Sección en construcción.')
  ]);
}
