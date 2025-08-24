import { where } from "./firebase.js";

export const qs = (sel, ctx=document) => ctx.querySelector(sel);
export const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
export const on = (el, ev, sel, handler) => {
  if (typeof sel === 'function') { el.addEventListener(ev, sel); return; }
  el.addEventListener(ev, e => { if (e.target.closest(sel)) handler(e); });
};
export const money = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n||0);
export const formatDate = d => new Date(d).toLocaleDateString('es-MX');
export const toast = msg => { alert(msg); };
export const formDataToObj = form => Object.fromEntries(new FormData(form).entries());
export const buildWhere = (filters={}) => {
  const arr=[];
  Object.entries(filters).forEach(([k,v])=>{ if(v!==undefined && v!=='') arr.push(where(k,'==',v)); });
  return arr;
};

// Modal helpers
export function openModal(id){
  qs(id).classList.add('open');
  const first = qs(id+' .modal');
  first?.focus();
}
export function closeModal(id){
  qs(id).classList.remove('open');
}
