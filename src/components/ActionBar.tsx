import { ReactNode } from 'react';
import SearchInput from './SearchInput';

interface ActionBarProps {
  search: string;
  onSearch: (value: string) => void;
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
  actions?: ReactNode;
}

export default function ActionBar({ search, onSearch, view, onViewChange, actions }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={onSearch} debounce={300} />
        <div className="flex border border-[color:var(--border)] rounded overflow-hidden">
          <button
            type="button"
            onClick={() => onViewChange('table')}
            aria-label="Vista tabla"
            className={`px-2 py-1 text-sm transition-all ${view === 'table' ? 'bg-[color:var(--primary)] text-white' : 'bg-white text-[color:var(--text)]'}`}
          >
            Tabla
          </button>
          <button
            type="button"
            onClick={() => onViewChange('cards')}
            aria-label="Vista tarjetas"
            className={`px-2 py-1 text-sm transition-all ${view === 'cards' ? 'bg-[color:var(--primary)] text-white' : 'bg-white text-[color:var(--text)]'}`}
          >
            Tarjetas
          </button>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
