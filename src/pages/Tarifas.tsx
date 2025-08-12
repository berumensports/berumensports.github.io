import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalTarifaForm from '../components/ModalTarifaForm';

interface Tarifa {
  concepto: string;
  monto: number;
}

export default function Tarifas() {
  const [open, setOpen] = useState(false);

  const tarifas: Tarifa[] = [
    { concepto: 'Inscripción', monto: 50 },
  ];

  const columns: Column<Tarifa>[] = [
    { key: 'concepto', header: 'Concepto' },
    { key: 'monto', header: 'Monto' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Tarifas</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nueva tarifa
        </button>
      </div>
      <RecordView
        columns={columns}
        data={tarifas}
        cardRender={(t) => (
          <div>
            <div className="font-bold">{t.concepto}</div>
            <div>Monto: {t.monto}</div>
          </div>
        )}
      />
      <ModalTarifaForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
