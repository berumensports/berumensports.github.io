import { useState } from 'react';
import { Column } from '../components/DataTable';
import RecordView from '../components/RecordView';
import ModalDelegacionForm, { DelegacionForm } from '../components/ModalDelegacionForm';
import PageHeader from '../components/PageHeader';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';

interface Delegacion {
  nombre: string;
  contacto: string;
}

export default function Delegaciones() {
  const [open, setOpen] = useState(false);
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([
    { nombre: 'Delegación Norte', contacto: 'Carlos' },
  ]);
  const [editing, setEditing] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const filtered = delegaciones.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Delegacion>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'contacto', header: 'Contacto' },
  ];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const renderNewButton = () => (
    <button
      className="bg-[color:var(--primary)] text-white px-3 py-1 rounded"
      onClick={openNew}
    >
      Nueva delegación
    </button>
  );

  return (
    <div>
      <PageHeader title="Delegaciones" count={filtered.length} view={view} />
      <ActionBar
        search={search}
        onSearch={setSearch}
        view={view}
        onViewChange={setView}
        actions={renderNewButton()}
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="Aún no hay delegaciones"
          description="Crea tu primera delegación para empezar a organizar la liga"
          action={renderNewButton()}
        />
      ) : (
        <RecordView
          columns={columns}
          data={filtered}
          onEdit={(_, idx) => {
            setEditing(idx);
            setOpen(true);
          }}
          onDelete={(_, idx) =>
            setDelegaciones((prev) => prev.filter((_, i) => i !== idx))
          }
          cardRender={(d) => (
            <div>
              <div className="font-bold">{d.nombre}</div>
              <div>{d.contacto}</div>
            </div>
          )}
          view={view}
        />
      )}
      <ModalDelegacionForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing !== null ? delegaciones[editing] : undefined}
        onSave={(data: DelegacionForm) => {
          const item: Delegacion = {
            nombre: data.nombre,
            contacto: editing !== null ? delegaciones[editing].contacto : '',
          };
          setDelegaciones((prev) => {
            if (editing !== null) {
              const copy = [...prev];
              copy[editing] = item;
              return copy;
            }
            return [...prev, item];
          });
          setEditing(null);
        }}
      />
    </div>
  );
}
