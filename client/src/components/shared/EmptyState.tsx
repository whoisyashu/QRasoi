import React from 'react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-[#E5E7EB] rounded-2xl my-4">
      {icon && <div className="p-4 bg-orange-50 text-[#F97316] rounded-full mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-[#334155] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
