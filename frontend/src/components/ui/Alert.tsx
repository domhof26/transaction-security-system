import React from 'react';
import { InfoIcon, CheckCircleIcon, XCircleIcon, ErrorMonitorIcon } from '../icons/Icons';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertConfig = {
  info: {
    className: 'ui-alert--info',
    icon: <InfoIcon className="ui-alert-icon" />,
  },
  success: {
    className: 'ui-alert--success',
    icon: <CheckCircleIcon className="ui-alert-icon" />,
  },
  warning: {
    className: 'ui-alert--warning',
    icon: <ErrorMonitorIcon className="ui-alert-icon" />,
  },
  error: {
    className: 'ui-alert--error',
    icon: <XCircleIcon className="ui-alert-icon" />,
  },
};

export function Alert({
  type = 'info',
  title,
  children,
  className = '',
}: AlertProps) {
  const config = alertConfig[type];

  return (
    <div
      className={`ui-alert ${config.className} ${className}`}
    >
      <div className="ui-alert-mark">{config.icon}</div>
      <div className="ui-alert-content">
        {title && <div className="ui-alert-title">{title}</div>}
        <div className="ui-alert-message">{children}</div>
      </div>
    </div>
  );
}
