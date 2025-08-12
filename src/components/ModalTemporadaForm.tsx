import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTemporada } from '../services/temporadas';

const schema = z.object({
  nombre: z.string().min(1),
  inicio: z.string(),
  fin: z.string(),
  activa: z.boolean().optional(),
});

export type TemporadaForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<TemporadaForm>;
}

export default function ModalTemporadaForm({ open, onClose, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemporadaForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: TemporadaForm) => {
    await createTemporada(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Temporada</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input className="border p-2 w-full" placeholder="Nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-red-500 text-sm">Requerido</p>}
          <input type="date" className="border p-2 w-full" {...register('inicio')} />
          <input type="date" className="border p-2 w-full" {...register('fin')} />
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('activa')} />
            <span>Activa</span>
          </label>
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
