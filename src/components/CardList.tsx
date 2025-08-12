import React from 'react';

interface Props<T> {
  data: T[];
  render: (item: T) => React.ReactNode;
}

export default function CardList<T>({ data, render }: Props<T>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item, idx) => (
        <div key={idx} className="p-4 bg-white rounded shadow">
          {render(item)}
        </div>
      ))}
    </div>
  );
}
