import React from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} className="px-2 py-1 border">
              {c.header}
            </th>
          ))}
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
