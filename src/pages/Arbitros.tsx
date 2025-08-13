import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalArbitroForm, { ArbitroForm } from '../components/ModalArbitroForm';

interface Arbitro {
  nombre: string;
  telefono: string;
  categoria: string;
}

export default function Arbitros() {
  const [open, setOpen] = useState(false);
  const [arbitros, setArbitros] = useState<Arbitro[]>([
    { nombre: 'Juan Pérez', telefono: '555-1234', categoria: 'A' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Arbitro>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'categoria', header: 'Categoría' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Árbitros</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo árbitro
        </button>
      </div>
      <RecordView
        columns={columns}
        data={arbitros}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setArbitros((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(a) => (
          <div>
            <div className="font-bold">{a.nombre}</div>
            <div>{a.telefono}</div>
            <div>{a.categoria}</div>
          </div>
        )}
      />
      <ModalArbitroForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? arbitros[editing] : undefined}
        onSave={(data: ArbitroForm) => {
          setArbitros((prev) => {
            const item = data as unknown as Arbitro;
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
