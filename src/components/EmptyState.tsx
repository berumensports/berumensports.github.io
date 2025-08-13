import { ReactNode } from 'react';
import { Box } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <Box className="w-12 h-12 text-[color:var(--text-muted)] mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-sm text-[color:var(--text-muted)] mb-4">{description}</p>}
      {action}
    </div>
  );
}
