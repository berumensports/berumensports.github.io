import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export const runSeed = async () => {
  const ligaId = import.meta.env.VITE_LIGA_ID as string;
  const delegaciones = ['Norte', 'Sur'];
  for (const nombre of delegaciones) {
    await addDoc(collection(db, 'ligas', ligaId, 'delegaciones'), { nombre });
  }
  // Datos adicionales omitidos por brevedad
};
