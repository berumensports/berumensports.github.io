import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalTemporadaForm from '../components/ModalTemporadaForm';

interface Temporada {
  nombre: string;
  anio: number;
}

export default function Temporadas() {
  const [open, setOpen] = useState(false);

  const temporadas: Temporada[] = [
    { nombre: 'Apertura', anio: 2024 },
  ];

  const columns: Column<Temporada>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'anio', header: 'Año' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Temporadas</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nueva temporada
        </button>
      </div>
      <RecordView
        columns={columns}
        data={temporadas}
        cardRender={(t) => (
          <div>
            <div className="font-bold">{t.nombre}</div>
            <div>{t.anio}</div>
          </div>
        )}
      />
      <ModalTemporadaForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
