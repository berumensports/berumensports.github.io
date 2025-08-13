import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalPartidoForm, { PartidoForm } from '../components/ModalPartidoForm';

interface Partido {
  local: string;
  visitante: string;
  fecha: string;
}

export default function Partidos() {
  const [open, setOpen] = useState(false);
  const [partidos, setPartidos] = useState<Partido[]>([
    { local: 'Tigres', visitante: 'Leones', fecha: '2024-01-10' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Partido>[] = [
    { key: 'local', header: 'Local' },
    { key: 'visitante', header: 'Visitante' },
    { key: 'fecha', header: 'Fecha' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Partidos</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo partido
        </button>
      </div>
      <RecordView
        columns={columns}
        data={partidos}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setPartidos((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(p) => (
          <div>
            <div className="font-bold">
              {p.local} vs {p.visitante}
            </div>
            <div>{p.fecha}</div>
          </div>
        )}
      />
      <ModalPartidoForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? (partidos[editing] as any) : undefined}
        onSave={(data: PartidoForm) => {
          const item: Partido = {
            local: data.localId,
            visitante: data.visitaId,
            fecha: data.fecha,
          };
          setPartidos((prev) => {
            if (editing !== null) {
              const copy = [...prev];
              copy[editing] = item;
              return copy;
            }
            return [...prev, item];
          });
          setEditing(null);
        }}
      />
    </div>
  );
}
