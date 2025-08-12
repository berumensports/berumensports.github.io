import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalDelegacionForm from '../components/ModalDelegacionForm';

interface Delegacion {
  nombre: string;
  contacto: string;
}

export default function Delegaciones() {
  const [open, setOpen] = useState(false);

  const delegaciones: Delegacion[] = [
    { nombre: 'Delegación Norte', contacto: 'Carlos' },
  ];

  const columns: Column<Delegacion>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'contacto', header: 'Contacto' },
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Delegaciones</h1>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setOpen(true)}>
          Nueva delegación
        </button>
      </div>
      <RecordView
        columns={columns}
        data={delegaciones}
        cardRender={(d) => (
          <div>
            <div className="font-bold">{d.nombre}</div>
            <div>{d.contacto}</div>
          </div>
        )}
      />
      <ModalDelegacionForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
