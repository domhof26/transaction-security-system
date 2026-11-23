import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, icon }: PageHeaderProps) {
  return (
    <header className="page-heading route-page-heading">
      <span className="page-eyebrow">{eyebrow}</span>
      <h1 className="route-page-title">
        {icon}
        {title}
      </h1>
      <p className="route-page-description">{description}</p>
    </header>
  );
}
