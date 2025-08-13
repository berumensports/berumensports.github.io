import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDelegacion } from '../services/delegaciones';

const schema = z.object({
  nombre: z.string().min(1),
});

export type DelegacionForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: DelegacionForm) => void;
  initialData?: Partial<DelegacionForm>;
}

export default function ModalDelegacionForm({ open, onClose, onSave, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DelegacionForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: DelegacionForm) => {
    await createDelegacion(data);
    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Delegación</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input className="border p-2 w-full" placeholder="Nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-red-500 text-sm">Requerido</p>}
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
