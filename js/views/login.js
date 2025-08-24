import { auth, signInWithEmailAndPassword } from '../firebase-ui.js';
import { el, readForm, setBusy, showToast } from '../ui-kit.js';

export async function render(){
  const form = el('form',{class:'stack'},[
    el('label',{},['Email', el('input',{class:'input',type:'email',name:'email',required:true})]),
    el('label',{},['Contraseña', el('input',{class:'input',type:'password',name:'password',required:true})]),
    el('button',{class:'btn btn-primary',type:'submit'},'Entrar'),
    el('a',{href:'#/create',class:'text-muted'},'Crear cuenta')
  ]);

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = readForm(form);
    const btn = form.querySelector('button');
    setBusy(btn,true);
    try{
      await signInWithEmailAndPassword(auth,data.email,data.password);
    }catch(err){
      showToast('error', err.message);
    }finally{
      setBusy(btn,false);
    }
  });

  return el('div',{class:'card',style:'max-width:420px;margin:40px auto;'},[
    el('h2',{},'Iniciar sesión'),
    form
  ]);
}
