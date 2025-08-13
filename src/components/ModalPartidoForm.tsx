import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPartido } from '../services/partidos';
import { listDelegaciones } from '../services/delegaciones';
import { listEquipos } from '../services/equipos';
import { listArbitros } from '../services/arbitros';

const schema = z
  .object({
    fecha: z.string(),
    jornada: z.string(),
    sede: z.string(),
    delegacionId: z.string(),
    localId: z.string(),
    visitaId: z.string(),
    rama: z.enum(['Varonil', 'Femenil']),
    categoria: z.coerce.number().min(2009).max(2020),
    arbitroCentralId: z.string().optional(),
  })
  .refine((data) => data.localId !== data.visitaId, {
    message: 'Equipos deben ser distintos',
    path: ['visitaId'],
  });

export type PartidoForm = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (data: PartidoForm) => void;
  initialData?: Partial<PartidoForm>;
}

export default function ModalPartidoForm({ open, onClose, onSave, initialData }: Props) {
  const [delegaciones, setDelegaciones] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [arbitros, setArbitros] = useState<any[]>([]);
  const categorias = Array.from({ length: 2020 - 2009 + 1 }, (_, i) => 2009 + i);

  useEffect(() => {
    listDelegaciones().then(setDelegaciones);
    listEquipos().then(setEquipos);
    listArbitros().then(setArbitros);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartidoForm>({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: PartidoForm) => {
    await createPartido({ ...data, estado: 'programado' });
    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white p-4 rounded shadow w-96 relative z-20 space-y-2">
        <Dialog.Title className="text-lg font-bold">Partido</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input
            type="datetime-local"
            className="border p-2 w-full"
            title="Fecha"
            {...register('fecha')}
          />
          <input
            className="border p-2 w-full"
            placeholder="Jornada"
            title="Jornada"
            {...register('jornada')}
          />
          <input
            className="border p-2 w-full"
            placeholder="Sede"
            title="Sede"
            {...register('sede')}
          />
          <select className="border p-2 w-full" title="Delegación" {...register('delegacionId')}>
            <option value="">Seleccione delegación</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
          <select className="border p-2 w-full" title="Equipo local" {...register('localId')}>
            <option value="">Seleccione local</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          <select className="border p-2 w-full" title="Equipo visitante" {...register('visitaId')}>
            <option value="">Seleccione visita</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          {errors.visitaId && <p className="text-red-500 text-sm">{errors.visitaId.message}</p>}
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
          <select className="border p-2 w-full" title="Árbitro central" {...register('arbitroCentralId')}>
            <option value="">Seleccione árbitro</option>
            {arbitros.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
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
