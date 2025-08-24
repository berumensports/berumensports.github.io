import { db, collection, getDocs, query, where } from "../firebase.js";
import { LIGA_ID, TEMP_ID } from "../constants.js";

export default {
  title: 'Dashboard',
  async render(root) {
    const equiposSnap = await getDocs(collection(db, `ligas/${LIGA_ID}/equipos`));
    const partidosSnap = await getDocs(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/partidos`));
    const cobrosSnap = await getDocs(collection(db, `ligas/${LIGA_ID}/t/${TEMP_ID}/cobros`));
    const programados = partidosSnap.docs.filter(d=>d.data().estado==='programado').length;
    const jugados = partidosSnap.docs.filter(d=>d.data().estado==='jugado').length;
    const pendientes = cobrosSnap.docs.filter(d=>d.data().estatus==='pendiente').length;
    const parciales = cobrosSnap.docs.filter(d=>d.data().estatus==='parcial').length;
    const cubiertos = cobrosSnap.docs.filter(d=>d.data().estatus==='cubierto').length;
    root.innerHTML = `
      <h2>Dashboard</h2>
      <ul>
        <li>Equipos: ${equiposSnap.size}</li>
        <li>Partidos programados: ${programados}</li>
        <li>Partidos jugados: ${jugados}</li>
        <li>Cobros pendientes: ${pendientes}</li>
        <li>Cobros parciales: ${parciales}</li>
        <li>Cobros cubiertos: ${cubiertos}</li>
      </ul>`;
  }
};
