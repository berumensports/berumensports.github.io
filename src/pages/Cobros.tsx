import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalAbonoForm from '../components/ModalAbonoForm';

interface CobroRecord {
  equipo: string;
  monto: number;
  fecha: string;
}

export default function Cobros() {
  const [open, setOpen] = useState(false);

  const cobros: CobroRecord[] = [
    { equipo: 'Tigres', monto: 100, fecha: '2024-01-01' },
  ];

  const columns: Column<CobroRecord>[] = [
    { key: 'equipo', header: 'Equipo' },
    { key: 'monto', header: 'Monto' },
    { key: 'fecha', header: 'Fecha' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Cobros</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Registrar abono
        </button>
      </div>
      <RecordView
        columns={columns}
        data={cobros}
        cardRender={(c) => (
          <div>
            <div className="font-bold">{c.equipo}</div>
            <div>Monto: {c.monto}</div>
            <div>{c.fecha}</div>
          </div>
        )}
      />
      <ModalAbonoForm open={open} onClose={() => setOpen(false)} cobroId="demo" saldo={100} />
    </div>
  );
}
