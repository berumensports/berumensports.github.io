import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { ligaId } from '../config';

export const runSeed = async () => {
  const delegaciones = ['Norte', 'Sur'];
  for (const nombre of delegaciones) {
    await addDoc(collection(db, 'ligas', ligaId, 'delegaciones'), { nombre });
  }
  // Datos adicionales omitidos por brevedad
};
