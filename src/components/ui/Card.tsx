import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  bodyClassName = 'p-6',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (typeof title === 'string' ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : title)}
            {subtitle && (typeof subtitle === 'string' ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : subtitle)}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-600">{footer}</div>
      )}
    </div>
  );
};
