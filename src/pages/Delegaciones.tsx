import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalDelegacionForm, { DelegacionForm } from '../components/ModalDelegacionForm';

interface Delegacion {
  nombre: string;
  contacto: string;
}

export default function Delegaciones() {
  const [open, setOpen] = useState(false);
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([
    { nombre: 'Delegación Norte', contacto: 'Carlos' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Delegacion>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'contacto', header: 'Contacto' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Delegaciones</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva delegación
        </button>
      </div>
      <RecordView
        columns={columns}
        data={delegaciones}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setDelegaciones((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(d) => (
          <div>
            <div className="font-bold">{d.nombre}</div>
            <div>{d.contacto}</div>
          </div>
        )}
      />
      <ModalDelegacionForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? delegaciones[editing] : undefined}
        onSave={(data: DelegacionForm) => {
          const item: Delegacion = {
            nombre: data.nombre,
            contacto: editing !== null ? delegaciones[editing].contacto : '',
          };
          setDelegaciones((prev) => {
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
