import { useState } from 'react';
import ModalAbonoForm from '../components/ModalAbonoForm';

export default function Cobros() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Cobros</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Registrar abono
        </button>
      </div>
      <ModalAbonoForm open={open} onClose={() => setOpen(false)} cobroId="demo" saldo={100} />
    </div>
  );
}
