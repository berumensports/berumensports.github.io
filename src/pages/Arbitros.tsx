import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalArbitroForm from '../components/ModalArbitroForm';

interface Arbitro {
  nombre: string;
  telefono: string;
  categoria: string;
}

export default function Arbitros() {
  const [open, setOpen] = useState(false);

  const arbitros: Arbitro[] = [
    { nombre: 'Juan Pérez', telefono: '555-1234', categoria: 'A' },
  ];

  const columns: Column<Arbitro>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'categoria', header: 'Categoría' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Árbitros</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo árbitro
        </button>
      </div>
      <RecordView
        columns={columns}
        data={arbitros}
        cardRender={(a) => (
          <div>
            <div className="font-bold">{a.nombre}</div>
            <div>{a.telefono}</div>
            <div>{a.categoria}</div>
          </div>
        )}
      />
      <ModalArbitroForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
