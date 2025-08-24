import { db, collection, getCountFromServer } from '../firebase-ui.js';
import { el } from '../ui-kit.js';
import { LIGA_ID, TEMP_ID } from '../constants.js';

export async function render(){
  const cont = el('section',{class:'stack'});
  const metrics = await Promise.all([
    ['Equipos', collection(db,`ligas/${LIGA_ID}/equipos`)],
    ['Partidos', collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`)],
    ['Cobros', collection(db,`ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`)]
  ].map(async ([label,ref])=>{
    const c = await getCountFromServer(ref);
    return {label,count:c.data().count};
  }));
  const grid = el('div',{class:'grid-2@md'}, metrics.map(m=>
    el('div',{class:'card stack-sm'},[
      el('span',{class:'eyebrow'},m.label),
      el('span',{class:'mono',style:'font-size:24px;'},String(m.count))
    ])
  ));
  cont.appendChild(grid);
  return cont;
}
