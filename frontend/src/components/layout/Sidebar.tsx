'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  OverviewIcon,
  OrganizationIcon,
  SigningUnitIcon,
  CashRegisterIcon,
  ReceiptIcon,
  AuditIcon,
  ExportIcon,
  IntegrityIcon,
  ErrorMonitorIcon,
} from '../icons/Icons';

export const navigationItems = [
  { name: 'Overview', subtitle: 'Workspace home', href: '/', icon: OverviewIcon },
  { name: 'Organizations', subtitle: 'Merchant accounts', href: '/organizations', icon: OrganizationIcon },
  { name: 'Signing Units', subtitle: 'Signing resources', href: '/signing-units', icon: SigningUnitIcon },
  { name: 'Cash Registers', subtitle: 'Point of sale', href: '/cash-registers', icon: CashRegisterIcon },
  { name: 'Receipts', subtitle: 'Transactions', href: '/receipts', icon: ReceiptIcon },
  { name: 'Audit Log', subtitle: 'Event history', href: '/audit-log', icon: AuditIcon },
  { name: 'Exports', subtitle: 'Receipt data', href: '/exports', icon: ExportIcon },
  { name: 'Integrity Checks', subtitle: 'Chain verification', href: '/integrity-checks', icon: IntegrityIcon },
  { name: 'Error Monitoring', subtitle: 'Workflow errors', href: '/error-monitoring', icon: ErrorMonitorIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`}>
      <Link href="/" className="sidebar-brand" onClick={onClose}>
        <span className="brand-mark" aria-hidden="true">
          FS<span />
        </span>
        <span className="brand-copy">
          <span className="brand-name">Fiscalization Simulator</span>
        </span>
      </Link>

      <div className="workspace-switcher">
        <span className="workspace-avatar" aria-hidden="true">FS</span>
        <span className="workspace-copy">
          <span className="workspace-label">WORKSPACE</span>
          <span className="workspace-name">Local Simulator</span>
        </span>
        <span className="workspace-chevron" aria-hidden="true" />
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section-label">MODULES</div>
        {navigationItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`app-nav-link${isActive ? ' is-active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span className="nav-copy">
                <span className="nav-title">{item.name}</span>
                <span className="nav-subtitle">{item.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
