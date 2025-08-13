import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalTarifaForm, { TarifaForm } from '../components/ModalTarifaForm';

interface Tarifa {
  concepto: string;
  monto: number;
}

export default function Tarifas() {
  const [open, setOpen] = useState(false);
  const [tarifas, setTarifas] = useState<Tarifa[]>([
    { concepto: 'Inscripción', monto: 50 },
  ]);
  const [editing, setEditing] = useState<number | null>(null);

  const columns: Column<Tarifa>[] = [
    { key: 'concepto', header: 'Concepto' },
    { key: 'monto', header: 'Monto' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Tarifas</h1>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva tarifa
        </button>
      </div>
      <RecordView
        columns={columns}
        data={tarifas}
        onEdit={(_, idx) => {
          setEditing(idx);
          setOpen(true);
        }}
        onDelete={(_, idx) =>
          setTarifas((prev) => prev.filter((_, i) => i !== idx))
        }
        cardRender={(t) => (
          <div>
            <div className="font-bold">{t.concepto}</div>
            <div>Monto: {t.monto}</div>
          </div>
        )}
      />
      <ModalTarifaForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? tarifas[editing] : undefined}
        onSave={(data: TarifaForm) => {
          const item: Tarifa = {
            concepto: `${data.rama} ${data.categoria}`,
            monto: data.monto,
          };
          setTarifas((prev) => {
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
