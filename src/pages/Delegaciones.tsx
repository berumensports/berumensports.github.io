import { useState } from 'react';
import ModalDelegacionForm from '../components/ModalDelegacionForm';

export default function Delegaciones() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Delegaciones</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nueva delegación
        </button>
      </div>
      {/* tabla de delegaciones pendiente */}
      <ModalDelegacionForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
