import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalAbonoForm, { AbonoForm } from '../components/ModalAbonoForm';

interface CobroRecord {
  equipo: string;
  monto: number;
  fecha: string;
}

export default function Cobros() {
  const [open, setOpen] = useState(false);
  const [cobros, setCobros] = useState<CobroRecord[]>([
    { equipo: 'Tigres', monto: 100, fecha: '2024-01-01' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<CobroRecord>[] = [
    { key: 'equipo', header: 'Equipo' },
    { key: 'monto', header: 'Monto' },
    { key: 'fecha', header: 'Fecha' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Cobros</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Registrar abono
        </button>
      </div>
      <RecordView
        columns={columns}
        data={cobros}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setCobros((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(c) => (
          <div>
            <div className="font-bold">{c.equipo}</div>
            <div>Monto: {c.monto}</div>
            <div>{c.fecha}</div>
          </div>
        )}
      />
      <ModalAbonoForm
        open={open}
        onClose={() => setOpen(false)}
        cobroId="demo"
        saldo={100}
        initialData={editing !== null ? cobros[editing] : undefined}
        onSave={(data: AbonoForm) => {
          const item: CobroRecord = {
            equipo: data.equipoId,
            monto: data.monto,
            fecha: data.fecha,
          };
          setCobros((prev) => {
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
