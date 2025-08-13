import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTarifa } from '../services/tarifas';

const schema = z.object({
  rama: z.enum(['Varonil', 'Femenil']),
  categoria: z.coerce.number().min(2009).max(2020),
  monto: z.coerce.number().gt(0),
});

export type TarifaForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: TarifaForm) => void;
  initialData?: Partial<TarifaForm>;
}

export default function ModalTarifaForm({ open, onClose, onSave, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TarifaForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: TarifaForm) => {
    await createTarifa(data);
    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Tarifa</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
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
          {errors.categoria && <p className="text-red-500 text-sm">Categoría inválida</p>}
          <input
            type="number"
            className="border p-2 w-full"
            placeholder="Monto"
            {...register('monto', { valueAsNumber: true })}
          />
          {errors.monto && <p className="text-red-500 text-sm">Monto inválido</p>}
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
