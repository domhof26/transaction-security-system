import React from 'react';
import { InfoIcon } from '../icons/Icons';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`ui-empty-state ${className}`}
    >
      <div className="ui-empty-state-icon">
        {icon || <InfoIcon />}
      </div>
      <h4 className="ui-empty-state-title">{title}</h4>
      <p className="ui-empty-state-description">{description}</p>
      {action && <div className="ui-empty-state-action">{action}</div>}
    </div>
  );
}
