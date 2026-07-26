import React from 'react';
import { clsx } from 'clsx';
import { OrderStatus } from '../../types';
import { getStatusConfig } from '../../utils/formatters';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  status?: OrderStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  size = 'md',
  className,
  ...props
}) => {
  if (status) {
    const config = getStatusConfig(status);
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border px-2.5 py-0.5 text-xs',
          config.badgeBg,
          className
        )}
        {...props}
      >
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dotBg)} />
        <span>{children || config.label}</span>
      </span>
    );
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-orange-50 text-orange-700 border-orange-200',
    secondary: 'bg-slate-700 text-white border-transparent',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
