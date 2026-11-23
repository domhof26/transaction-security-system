'use client';

import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="utility-bar">
      <button
        type="button"
        className="mobile-menu-button"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="environment-toggle" aria-label="Current environment: local mock">
        <span className="environment-option">LOCAL</span>
        <span className="environment-option is-selected">MOCK</span>
      </div>

      <div className="utility-account">
        <span className="utility-profile-mark" aria-hidden="true">FS</span>
        <span className="utility-profile-name">Local Simulator</span>
      </div>
    </header>
  );
}
