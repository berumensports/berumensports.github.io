import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalPartidoForm from '../components/ModalPartidoForm';

interface Partido {
  local: string;
  visitante: string;
  fecha: string;
}

export default function Partidos() {
  const [open, setOpen] = useState(false);

  const partidos: Partido[] = [
    { local: 'Tigres', visitante: 'Leones', fecha: '2024-01-10' },
  ];

  const columns: Column<Partido>[] = [
    { key: 'local', header: 'Local' },
    { key: 'visitante', header: 'Visitante' },
    { key: 'fecha', header: 'Fecha' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Partidos</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo partido
        </button>
      </div>
      <RecordView
        columns={columns}
        data={partidos}
        cardRender={(p) => (
          <div>
            <div className="font-bold">
              {p.local} vs {p.visitante}
            </div>
            <div>{p.fecha}</div>
          </div>
        )}
      />
      <ModalPartidoForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
