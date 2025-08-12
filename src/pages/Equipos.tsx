import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalEquipoForm from '../components/ModalEquipoForm';

interface Equipo {
  nombre: string;
  delegacion: string;
}

export default function Equipos() {
  const [open, setOpen] = useState(false);

  const equipos: Equipo[] = [
    { nombre: 'Tigres', delegacion: 'Norte' },
  ];

  const columns: Column<Equipo>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'delegacion', header: 'Delegación' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Equipos</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo equipo
        </button>
      </div>
      <RecordView
        columns={columns}
        data={equipos}
        cardRender={(e) => (
          <div>
            <div className="font-bold">{e.nombre}</div>
            <div>{e.delegacion}</div>
          </div>
        )}
      />
      <ModalEquipoForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
