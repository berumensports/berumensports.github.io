import { useState } from 'react';
import ModalArbitroForm from '../components/ModalArbitroForm';

export default function Arbitros() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Árbitros</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo árbitro
        </button>
      </div>
      {/* tabla de árbitros pendiente */}
      <ModalArbitroForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
