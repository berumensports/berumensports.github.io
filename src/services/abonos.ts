import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { updateSaldo, getCobro } from './cobros';
import { AbonoForm } from '../components/ModalAbonoForm';
import { auth } from '../firebase';
import { ligaId } from '../config';
const temporadaId = 'TEMPORADA_DEMO';

export const addAbono = async (cobroId: string, data: AbonoForm & { equipoNombre?: string }) => {
  const user = auth.currentUser;
  const abonosCol = collection(
    db,
    'ligas',
    ligaId,
    'temporadas',
    temporadaId,
    'cobros',
    cobroId,
    'abonos'
  );
  await addDoc(abonosCol, {
    ...data,
    usuarioId: user?.uid,
    usuarioNombre: user?.displayName,
  });
  const cobro = await getCobro(cobroId);
  const nuevoSaldo = cobro.saldo - data.monto;
  await updateSaldo(cobroId, nuevoSaldo);
};
