import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ligaId } from '../config';

const arbitrosCol = collection(db, 'ligas', ligaId, 'arbitros');

export const createArbitro = async (data: any) => {
  await addDoc(arbitrosCol, data);
};

export const listArbitros = async () => {
  const snap = await getDocs(arbitrosCol);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};
