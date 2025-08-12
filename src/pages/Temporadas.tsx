import { useState } from 'react';
import ModalTemporadaForm from '../components/ModalTemporadaForm';

export default function Temporadas() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Temporadas</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nueva temporada
        </button>
      </div>
      {/* tabla de temporadas pendiente */}
      <ModalTemporadaForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
