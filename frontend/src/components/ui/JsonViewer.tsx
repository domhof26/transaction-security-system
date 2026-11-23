'use client';

import React, { useState } from 'react';
import { CopyIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon } from '../icons/Icons';

export interface JsonViewerProps {
  data: unknown;
  title?: string;
  initialExpanded?: boolean;
  className?: string;
}

export function JsonViewer({
  data,
  title = 'Raw Payload',
  initialExpanded = true,
  className = '',
}: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [copied, setCopied] = useState(false);

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`ui-json-viewer ${className}`}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="ui-json-viewer-header"
      >
        <div className="ui-json-viewer-heading">
          {isExpanded ? (
            <ChevronDownIcon className="ui-json-viewer-chevron" />
          ) : (
            <ChevronRightIcon className="ui-json-viewer-chevron" />
          )}
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="ui-json-copy"
          title="Copy JSON"
        >
          {copied ? (
            <>
              <CheckIcon />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="ui-json-viewer-content">
          <pre>
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
