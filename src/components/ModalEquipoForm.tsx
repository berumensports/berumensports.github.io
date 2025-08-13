import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEquipo } from '../services/equipos';

const schema = z.object({
  nombre: z.string().min(1),
  delegacionId: z.string().min(1),
  rama: z.enum(['Varonil', 'Femenil']),
  categoria: z.coerce.number().min(2009).max(2020),
  estatus: z.enum(['activo', 'inactivo']).default('activo'),
});

export type EquipoForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: EquipoForm) => void;
  initialData?: Partial<EquipoForm>;
}

export default function ModalEquipoForm({ open, onClose, onSave, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipoForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: EquipoForm) => {
    await createEquipo(data);
    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Equipo</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input className="border p-2 w-full" placeholder="Nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-red-500 text-sm">Requerido</p>}
          <input className="border p-2 w-full" placeholder="Delegación" {...register('delegacionId')} />
          <select className="border p-2 w-full" {...register('rama')}>
            <option value="Varonil">Varonil</option>
            <option value="Femenil">Femenil</option>
          </select>
          <input
            type="number"
            className="border p-2 w-full"
            placeholder="Categoría"
            {...register('categoria', { valueAsNumber: true })}
          />
          <select className="border p-2 w-full" {...register('estatus')}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
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
