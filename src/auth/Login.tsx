import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ligaId } from '../config';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    if (isRegister) {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (data.displayName) await updateProfile(cred.user, { displayName: data.displayName });
      await setDoc(doc(db, 'ligas', ligaId, 'usuarios', cred.user.uid), {
        email: data.email,
        displayName: data.displayName,
        role: 'consulta',
      });
    } else {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-80 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">{isRegister ? 'Registro' : 'Login'}</h1>
        {isRegister && (
          <div>
            <input
              className="border p-2 w-full"
              placeholder="Nombre"
              {...register('displayName')}
            />
            {errors.displayName && <p className="text-red-500 text-sm">Requerido</p>}
          </div>
        )}
        <div>
          <input className="border p-2 w-full" placeholder="Email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm">Email inválido</p>}
        </div>
        <div>
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="Contraseña"
            {...register('password')}
          />
          {errors.password && <p className="text-red-500 text-sm">Mínimo 6 caracteres</p>}
        </div>
        <button className="bg-blue-500 text-white w-full py-2 rounded" type="submit">
          {isRegister ? 'Registrar' : 'Ingresar'}
        </button>
        <button
          type="button"
          className="text-sm text-center w-full"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
