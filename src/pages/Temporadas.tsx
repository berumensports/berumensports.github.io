import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalTemporadaForm, { TemporadaForm } from '../components/ModalTemporadaForm';

interface Temporada {
  nombre: string;
  anio: number;
}

export default function Temporadas() {
  const [open, setOpen] = useState(false);
  const [temporadas, setTemporadas] = useState<Temporada[]>([
    { nombre: 'Apertura', anio: 2024 },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Temporada>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'anio', header: 'Año' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Temporadas</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva temporada
        </button>
      </div>
      <RecordView
        columns={columns}
        data={temporadas}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setTemporadas((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(t) => (
          <div>
            <div className="font-bold">{t.nombre}</div>
            <div>{t.anio}</div>
          </div>
        )}
      />
      <ModalTemporadaForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? (temporadas[editing] as any) : undefined}
        onSave={(data: TemporadaForm) => {
          const item: Temporada = {
            nombre: data.nombre,
            anio: new Date(data.inicio).getFullYear(),
          };
          setTemporadas((prev) => {
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
