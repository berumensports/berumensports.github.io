import { useState } from 'react';
import ModalPartidoForm from '../components/ModalPartidoForm';

export default function Partidos() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Partidos</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nuevo partido
        </button>
      </div>
      <ModalPartidoForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
