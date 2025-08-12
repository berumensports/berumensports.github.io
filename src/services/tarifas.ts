import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const ligaId = import.meta.env.VITE_LIGA_ID as string;
const temporadaId = 'TEMPORADA_DEMO';
const tarifasCol = collection(db, 'ligas', ligaId, 'temporadas', temporadaId, 'tarifas');

export const createTarifa = async (data: any) => {
  await addDoc(tarifasCol, data);
};

export const listTarifas = async () => {
  const snap = await getDocs(tarifasCol);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const getTarifa = async (rama: string, categoria: number) => {
  const q = query(tarifasCol, where('rama', '==', rama), where('categoria', '==', categoria));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
};
