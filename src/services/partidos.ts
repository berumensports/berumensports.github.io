import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { PartidoForm } from '../components/ModalPartidoForm';

const ligaId = import.meta.env.VITE_LIGA_ID as string;
const temporadaId = 'TEMPORADA_DEMO';
const partidosCol = collection(db, 'ligas', ligaId, 'temporadas', temporadaId, 'partidos');

export const createPartido = async (data: PartidoForm & { estado: string }) => {
  await addDoc(partidosCol, data);
};

export const closePartido = async (partidoId: string, arbitroId: string, arbitroNombre: string) => {
  const partidoRef = doc(partidosCol, partidoId);
  const snap = await getDoc(partidoRef);
  if (!snap.exists()) throw new Error('Partido no encontrado');
  const partido = snap.data() as any;
  if (!arbitroId) throw new Error('Árbitro requerido');
  const tarifasCol = collection(db, 'ligas', ligaId, 'temporadas', temporadaId, 'tarifas');
  const q = query(tarifasCol, where('rama', '==', partido.rama), where('categoria', '==', partido.categoria));
  const tarifasSnap = await getDocs(q);
  if (tarifasSnap.empty) throw new Error('Tarifa no encontrada');
  const tarifa = tarifasSnap.docs[0].data() as any;
  await updateDoc(partidoRef, {
    estado: 'jugado',
    arbitroCentralId: arbitroId,
    arbitroCentralNombre: arbitroNombre,
    tarifaAplicada: tarifa.monto,
  });
};
