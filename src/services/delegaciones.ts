import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ligaId } from '../config';

const delegacionesCol = collection(db, 'ligas', ligaId, 'delegaciones');

export const createDelegacion = async (data: any) => {
  await addDoc(delegacionesCol, data);
};

export const listDelegaciones = async () => {
  const snap = await getDocs(delegacionesCol);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};
