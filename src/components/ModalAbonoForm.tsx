import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addAbono } from '../services/abonos';
import { listEquipos } from '../services/equipos';

const schema = z.object({
  fecha: z.string(),
  monto: z.coerce.number().gt(0),
  metodo: z.enum(['efectivo', 'transferencia']),
  ref: z.string().optional(),
  equipoId: z.string().min(1),
});

export type AbonoForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  cobroId: string;
  saldo: number;
}

export default function ModalAbonoForm({ open, onClose, cobroId, saldo }: Props) {
  const [equipos, setEquipos] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AbonoForm>({ resolver: zodResolver(schema), defaultValues: { fecha: new Date().toISOString().substring(0, 10) } });

  useEffect(() => {
    listEquipos().then(setEquipos);
  }, []);

  const onSubmit = async (data: AbonoForm) => {
    if (data.monto > saldo) {
      alert('Monto excede saldo');
      return;
    }
    const equipo = equipos.find((e) => e.id === data.equipoId);
    await addAbono(cobroId, { ...data, equipoNombre: equipo?.nombre });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Registrar abono</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input type="date" className="border p-2 w-full" {...register('fecha')} />
          <input type="number" className="border p-2 w-full" placeholder="Monto" {...register('monto', { valueAsNumber: true })} />
          {errors.monto && <p className="text-red-500 text-sm">Monto inválido</p>}
          <select className="border p-2 w-full" {...register('metodo')}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <input className="border p-2 w-full" placeholder="Referencia" {...register('ref')} />
          <select className="border p-2 w-full" {...register('equipoId')}>
            <option value="">Seleccione equipo</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          {errors.equipoId && <p className="text-red-500 text-sm">Seleccione un equipo</p>}
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" className="px-3 py-1" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
