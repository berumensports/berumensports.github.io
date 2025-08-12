import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

export const signup = async (
  email: string,
  password: string,
  displayName: string,
  ligaId: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'ligas', ligaId, 'usuarios', cred.user.uid), {
    email,
    displayName,
    role: 'consulta',
  });
};

export const logout = () => signOut(auth);
