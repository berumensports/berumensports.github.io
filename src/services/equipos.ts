import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { EquipoForm } from '../components/ModalEquipoForm';
import { ligaId } from '../config';

export const createEquipo = async (data: EquipoForm) => {
  const col = collection(db, 'ligas', ligaId, 'equipos');
  await addDoc(col, data);
};

export const listEquipos = async () => {
  const col = collection(db, 'ligas', ligaId, 'equipos');
  const snap = await getDocs(col);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};
