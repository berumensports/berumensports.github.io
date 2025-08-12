import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ligaId = import.meta.env.VITE_LIGA_ID as string;
const temporadaId = 'TEMPORADA_DEMO';
const cobrosCol = collection(db, 'ligas', ligaId, 'temporadas', temporadaId, 'cobros');

export interface CobroData {
  partidoId: string;
  equipoDeudorId: string;
  equipoNombre: string;
  delegacionId: string;
  montoTotal: number;
  descuento?: number;
  recargos?: number;
  folio: string;
}

export const createCobro = async (data: CobroData) => {
  const docRef = await addDoc(cobrosCol, {
    ...data,
    fechaEmision: new Date().toISOString(),
    saldo: data.montoTotal,
    estatus: 'pendiente',
  });
  return docRef.id;
};

export const updateSaldo = async (cobroId: string, saldo: number) => {
  const cobroRef = doc(cobrosCol, cobroId);
  await updateDoc(cobroRef, {
    saldo,
    estatus: saldo === 0 ? 'cubierto' : 'parcial',
  });
};

export const getCobro = async (cobroId: string) => {
  const snap = await getDoc(doc(cobrosCol, cobroId));
  return { id: snap.id, ...(snap.data() as any) };
};
