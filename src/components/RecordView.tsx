import { useState } from 'react';
import DataTable, { Column } from './DataTable';
import CardList from './CardList';

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  cardRender: (row: T) => React.ReactNode;
  onEdit?: (row: T, idx: number) => void;
  onDelete?: (row: T, idx: number) => void;
}

export default function RecordView<T>({ columns, data, cardRender, onEdit, onDelete }: Props<T>) {
  const [view, setView] = useState<'table' | 'cards'>('table');

  return (
    <div>
      <div className="flex justify-end mb-2 space-x-2">
        <button
          className={`px-2 py-1 border rounded ${view === 'table' ? 'bg-gray-200' : ''}`}
          onClick={() => setView('table')}
        >
          Tabla
        </button>
        <button
          className={`px-2 py-1 border rounded ${view === 'cards' ? 'bg-gray-200' : ''}`}
          onClick={() => setView('cards')}
        >
          Tarjetas
        </button>
      </div>
      {view === 'table' ? (
        <DataTable columns={columns} data={data} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <CardList data={data} render={cardRender} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}
