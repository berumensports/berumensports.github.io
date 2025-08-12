import { useState } from 'react';
import ModalEquipoForm from '../components/ModalEquipoForm';

export default function Equipos() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Equipos</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo equipo
        </button>
      </div>
      {/* tabla de equipos pendiente */}
      <ModalEquipoForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
