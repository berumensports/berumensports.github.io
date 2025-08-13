import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalEquipoForm, { EquipoForm } from '../components/ModalEquipoForm';

interface Equipo {
  nombre: string;
  delegacion: string;
}

export default function Equipos() {
  const [open, setOpen] = useState(false);
  const [equipos, setEquipos] = useState<Equipo[]>([
    { nombre: 'Tigres', delegacion: 'Norte' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Equipo>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'delegacion', header: 'Delegación' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Equipos</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo equipo
        </button>
      </div>
      <RecordView
        columns={columns}
        data={equipos}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setEquipos((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(e) => (
          <div>
            <div className="font-bold">{e.nombre}</div>
            <div>{e.delegacion}</div>
          </div>
        )}
      />
      <ModalEquipoForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? equipos[editing] : undefined}
        onSave={(data: EquipoForm) => {
          const item: Equipo = {
            nombre: data.nombre,
            delegacion: data.delegacionId,
          };
          setEquipos((prev) => {
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
