import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  view?: 'table' | 'cards';
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, count, view, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between flex-col sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--text)]">{title}</h1>
        {(subtitle || typeof count === 'number') && (
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            {subtitle}
            {typeof count === 'number' && view && (
              <>
                {subtitle ? ' • ' : ''}
                {count} registros • Vista {view === 'table' ? 'Tabla' : 'Tarjetas'}
              </>
            )}
          </p>
        )}
      </div>
      {actions && <div className="mt-2 sm:mt-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
