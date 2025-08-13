import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export default function SearchInput({ value, onChange, debounce = 300 }: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => setInternal(value), [value]);

  useEffect(() => {
    const handler = setTimeout(() => onChange(internal), debounce);
    return () => clearTimeout(handler);
  }, [internal, debounce, onChange]);

  return (
    <input
      type="text"
      value={internal}
      onChange={(e) => setInternal(e.target.value)}
      placeholder="Buscar..."
      aria-label="Buscar"
      className="border border-[color:var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
    />
  );
}
