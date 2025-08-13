import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createArbitro } from '../services/arbitros';

const schema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional(),
  correo: z.string().email().optional(),
  estatus: z.enum(['activo', 'inactivo']).default('activo'),
});

export type ArbitroForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ArbitroForm) => void;
  initialData?: Partial<ArbitroForm>;
}

export default function ModalArbitroForm({ open, onClose, onSave, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArbitroForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: ArbitroForm) => {
    await createArbitro(data);
    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Árbitro</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Nombre"
            title="Nombre"
            {...register('nombre')}
          />
          {errors.nombre && <p className="text-red-500 text-sm">Requerido</p>}
          <input
            className="border p-2 w-full"
            placeholder="Teléfono"
            title="Teléfono"
            {...register('telefono')}
          />
          <input
            className="border p-2 w-full"
            placeholder="Correo"
            title="Correo"
            {...register('correo')}
          />
          <select className="border p-2 w-full" title="Estatus" {...register('estatus')}>
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
