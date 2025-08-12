import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ligaId } from '../config';
const temporadasCol = collection(db, 'ligas', ligaId, 'temporadas');

export const createTemporada = async (data: any) => {
  await addDoc(temporadasCol, data);
};

export const listTemporadas = async () => {
  const snap = await getDocs(temporadasCol);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const setTemporadaActiva = async (id: string) => {
  const q = query(temporadasCol, where('activa', '==', true));
  const snap = await getDocs(q);
  snap.forEach((d) => updateDoc(doc(temporadasCol, d.id), { activa: false }));
  await updateDoc(doc(temporadasCol, id), { activa: true });
};
