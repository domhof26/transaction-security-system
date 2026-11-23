import React from 'react';

export type StatusVariant =
  | 'INITIALIZED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DISABLED'
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SIGNED'
  | 'FAILED'
  | 'VALID'
  | 'INVALID'
  | 'MOCK'
  | 'EXTERNAL'
  | 'AT'
  | 'DE'
  | string;

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const statusClasses: Record<string, string> = {
  ACTIVE: 'ui-status-badge--success',
  SIGNED: 'ui-status-badge--success',
  VALID: 'ui-status-badge--success',
  PENDING: 'ui-status-badge--warning',
  SUSPENDED: 'ui-status-badge--warning',
  FAILED: 'ui-status-badge--error',
  INVALID: 'ui-status-badge--error',
  DISABLED: 'ui-status-badge--muted',
  PROCESSING: 'ui-status-badge--accent is-processing',
  CREATED: 'ui-status-badge--accent',
  INITIALIZED: 'ui-status-badge--accent',
  MOCK: 'ui-status-badge--accent',
  EXTERNAL: 'ui-status-badge--accent',
  AT: 'ui-status-badge--accent',
  DE: 'ui-status-badge--accent',
};

export function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();
  return (
    <span
      className={`ui-status-badge ui-status-badge--${size} ${statusClasses[normalized] || 'ui-status-badge--muted'} ${className}`}
    >
      <span className="ui-status-dot" />
      <span>{status}</span>
    </span>
  );
}
