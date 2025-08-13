import React from 'react';

interface Props<T> {
  data: T[];
  render: (item: T) => React.ReactNode;
  onEdit?: (item: T, idx: number) => void;
  onDelete?: (item: T, idx: number) => void;
}

export default function CardList<T>({ data, render, onEdit, onDelete }: Props<T>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item, idx) => (
        <div key={idx} className="p-4 bg-white rounded shadow relative">
          {(onEdit || onDelete) && (
            <div className="absolute top-2 right-2 space-x-2 text-sm">
              {onEdit && (
                <button
                  type="button"
                  className="text-blue-500"
                  onClick={() => onEdit(item, idx)}
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => onDelete(item, idx)}
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
          {render(item)}
        </div>
      ))}
    </div>
  );
}
