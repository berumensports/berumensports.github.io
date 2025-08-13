import React from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  onEdit,
  onDelete,
}: {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T, idx: number) => void;
  onDelete?: (row: T, idx: number) => void;
}) {
  return (
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} className="px-2 py-1 border">
              {c.header}
            </th>
          ))}
          {(onEdit || onDelete) && <th className="px-2 py-1 border">Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-t">
            {columns.map((c) => (
              <td key={String(c.key)} className="px-2 py-1 border">
                {c.render ? c.render(row) : (row as any)[c.key]}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-2 py-1 border space-x-2">
                {onEdit && (
                  <button
                    type="button"
                    className="text-blue-500"
                    onClick={() => onEdit(row, idx)}
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => onDelete(row, idx)}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
