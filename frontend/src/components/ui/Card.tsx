import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({
  children,
  className = '',
  title,
  description,
  badge,
  actions,
  footer,
}: CardProps) {
  const hasHeader = title || description || badge || actions;

  return (
    <div
      className={`ui-card ${className}`}
    >
      {hasHeader && (
        <div className="ui-card-header">
          <div>
            <div className="flex items-center gap-2.5">
              {typeof title === 'string' ? (
                <h3 className="ui-card-title">{title}</h3>
              ) : (
                title
              )}
              {badge}
            </div>
            {description && (
              <p className="ui-card-description">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="ui-card-body">{children}</div>
      {footer && (
        <div className="ui-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}
