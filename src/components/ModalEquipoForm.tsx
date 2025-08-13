import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEquipo } from '../services/equipos';
import { listDelegaciones } from '../services/delegaciones';

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
  const [delegaciones, setDelegaciones] = useState<any[]>([]);
  const categorias = Array.from({ length: 2020 - 2009 + 1 }, (_, i) => 2009 + i);

  useEffect(() => {
    listDelegaciones().then(setDelegaciones);
  }, []);

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
          <input
            className="border p-2 w-full"
            placeholder="Nombre"
            title="Nombre"
            {...register('nombre')}
          />
          {errors.nombre && <p className="text-red-500 text-sm">Requerido</p>}
          <select className="border p-2 w-full" title="Delegación" {...register('delegacionId')}>
            <option value="">Seleccione delegación</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
          <select className="border p-2 w-full" title="Rama" {...register('rama')}>
            <option value="Varonil">Varonil</option>
            <option value="Femenil">Femenil</option>
          </select>
          <select
            className="border p-2 w-full"
            title="Categoría"
            {...register('categoria', { valueAsNumber: true })}
          >
            <option value="">Seleccione categoría</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
