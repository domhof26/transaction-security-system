'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMonitorIcon, CopyIcon, CheckIcon } from '@/components/icons/Icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { Shell } from '@/components/layout/Shell';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { ApplicationErrorRecord } from '@/types';

type CategoryFilter = 'ALL' | 'VALIDATION' | 'TECHNICAL';

interface ErrorsApiResponse {
  success: boolean;
  count?: number;
  data?: ApplicationErrorRecord[];
  error?: string;
  message?: string;
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatLocalTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatRelativeTime(value: string) {
  const timestamp = getTimestamp(value);
  if (timestamp === null) return '—';

  const deltaSeconds = (timestamp - Date.now()) / 1000;
  const absoluteSeconds = Math.abs(deltaSeconds);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (absoluteSeconds < 60) {
    return formatter.format(Math.round(deltaSeconds), 'second');
  }
  if (absoluteSeconds < 60 * 60) {
    return formatter.format(Math.round(deltaSeconds / 60), 'minute');
  }
  if (absoluteSeconds < 60 * 60 * 24) {
    return formatter.format(Math.round(deltaSeconds / (60 * 60)), 'hour');
  }
  if (absoluteSeconds < 60 * 60 * 24 * 30) {
    return formatter.format(Math.round(deltaSeconds / (60 * 60 * 24)), 'day');
  }
  if (absoluteSeconds < 60 * 60 * 24 * 365) {
    return formatter.format(Math.round(deltaSeconds / (60 * 60 * 24 * 30)), 'month');
  }
  return formatter.format(Math.round(deltaSeconds / (60 * 60 * 24 * 365)), 'year');
}

function parseRequestData(value?: string | null): unknown {
  if (value == null) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function recordLabel(record: ApplicationErrorRecord) {
  return record.error_code || record.workflow_name || 'Recorded error';
}

function RefreshGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
    </svg>
  );
}

export default function ErrorMonitoringPage() {
  const [records, setRecords] = useState<ApplicationErrorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ApplicationErrorRecord | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const requestInProgress = useRef(false);

  const loadErrors = useCallback(async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/errors', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const body = await response.json() as ErrorsApiResponse;

      if (!response.ok || body.success !== true || !Array.isArray(body.data)) {
        throw new Error(body.message || body.error || 'Unable to load error records.');
      }

      const sorted = [...body.data].sort((a, b) => {
        const timeA = getTimestamp(a.createdAt) ?? 0;
        const timeB = getTimestamp(b.createdAt) ?? 0;
        return timeB - timeA;
      });
      setRecords(sorted);
      setLastRefreshed(new Date());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load error records.');
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => void loadErrors(), 0);
    return () => window.clearTimeout(timerId);
  }, [loadErrors]);

  useEffect(() => {
    if (!selectedRecord) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRecord(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecord]);

  const validationCount = records.filter((record) => record.category === 'VALIDATION').length;
  const technicalCount = records.filter((record) => record.category === 'TECHNICAL').length;
  const latestError = records[0] || null;

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return records.filter((record) => {
      if (category !== 'ALL' && record.category !== category) return false;
      if (!query) return true;
      return [
        record.error_code,
        record.error_message,
        record.workflow_name,
        record.execution_id,
      ].some((value) => String(value ?? '').toLocaleLowerCase().includes(query));
    });
  }, [records, category, search]);

  const copyText = async (label: string, value: string) => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedAction(label);
      window.setTimeout(() => setCopiedAction(null), 1800);
    } catch {
      setCopyError('Clipboard access is unavailable. Select and copy the text manually.');
      setCopiedAction(null);
    }
  };

  const copyRecordDetails = (record: ApplicationErrorRecord) => {
    const details = {
      category: record.category,
      error_code: record.error_code ?? null,
      error_message: record.error_message ?? null,
      workflow_name: record.workflow_name ?? null,
      workflow_id: record.workflow_id ?? null,
      execution_id: record.execution_id ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? null,
      request_data: record.request_data ?? null,
    };
    return copyText('details', JSON.stringify(details, null, 2));
  };

  const stats = [
    { label: 'Total Errors', value: records.length, detail: 'Records currently loaded' },
    { label: 'Validation Errors', value: validationCount, detail: 'Category: VALIDATION' },
    { label: 'Technical Errors', value: technicalCount, detail: 'Category: TECHNICAL' },
    {
      label: 'Latest Error',
      value: latestError ? formatRelativeTime(latestError.createdAt) : '—',
      detail: latestError ? formatLocalTime(latestError.createdAt) : 'No errors recorded',
    },
  ];

  return (
    <Shell>
      <div className="monitoring-page">
        <div className="monitoring-heading">
          <PageHeader
            eyebrow="Monitoring"
            title="Error Monitoring"
            description="Monitor validation errors and technical failures across your fiscalization workflows. Inspect execution details and identify operational issues."
            icon={<ErrorMonitorIcon />}
          />
          <div className="monitoring-refresh">
            <Button
              type="button"
              variant="outline"
              isLoading={isRefreshing}
              disabled={isRefreshing}
              leftIcon={!isRefreshing ? <RefreshGlyph /> : undefined}
              onClick={() => void loadErrors()}
            >
              Refresh
            </Button>
            <span>
              Last successful refresh:{' '}
              {lastRefreshed ? (
                <time dateTime={lastRefreshed.toISOString()}>{lastRefreshed.toLocaleString()}</time>
              ) : '—'}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="monitoring-error">
            <Alert type="error" title="Unable to load error records">
              {errorMessage}
            </Alert>
            <Button type="button" variant="secondary" disabled={isRefreshing} onClick={() => void loadErrors()}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="monitoring-stat-grid" aria-label="Loading error statistics">
            {stats.map((stat) => (
              <Card key={stat.label} className="monitoring-stat-card">
                <div className="monitoring-skeleton monitoring-skeleton--label" />
                <div className="monitoring-skeleton monitoring-skeleton--value" />
                <div className="monitoring-skeleton monitoring-skeleton--detail" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="monitoring-stat-grid">
            {stats.map((stat, index) => (
              <Card key={stat.label} className={`monitoring-stat-card${index === 3 ? ' monitoring-stat-card--latest' : ''}`}>
                <span className="monitoring-stat-label">{stat.label}</span>
                <strong className="monitoring-stat-value">{stat.value}</strong>
                <span className="monitoring-stat-detail" title={index === 3 ? stat.detail : undefined}>{stat.detail}</span>
              </Card>
            ))}
          </div>
        )}

        <Card
          title="Error Records"
          description="Latest error records returned by the monitoring service"
        >
          <div className="monitoring-controls">
            <div className="monitoring-filters" role="group" aria-label="Filter errors by category">
              {([
                ['ALL', 'All Errors'],
                ['VALIDATION', 'Validation'],
                ['TECHNICAL', 'Technical'],
              ] as const).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`monitoring-filter${category === value ? ' is-active' : ''}`}
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="monitoring-search">
              <span>Search errors</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Code, message, workflow, execution ID"
              />
            </label>
          </div>

          <div className="monitoring-results-count" aria-live="polite">
            {isLoading ? 'Loading matching records…' : `${visibleRecords.length} matching ${visibleRecords.length === 1 ? 'record' : 'records'}`}
          </div>

          {isLoading ? (
            <div className="monitoring-table-skeleton" aria-label="Loading error records">
              <div className="monitoring-skeleton monitoring-skeleton--table-heading" />
              {Array.from({ length: 5 }, (_, index) => (
                <div className="monitoring-skeleton monitoring-skeleton--row" key={index} />
              ))}
            </div>
          ) : records.length === 0 && !errorMessage ? (
            <div className="monitoring-empty">
              <ErrorMonitorIcon />
              <strong>No error records found.</strong>
              <span>Errors will appear here when they are captured by the fiscalization workflows.</span>
            </div>
          ) : records.length === 0 && errorMessage ? (
            <div className="monitoring-empty monitoring-empty--compact">
              <strong>Error records are unavailable.</strong>
              <span>Retry to request the latest records from the monitoring service.</span>
            </div>
          ) : visibleRecords.length === 0 && !errorMessage ? (
            <div className="monitoring-empty monitoring-empty--compact">
              <strong>No records match these filters.</strong>
              <span>Try another category or search term.</span>
            </div>
          ) : (
            <div className="monitoring-table-wrap">
              <table className="monitoring-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Error</th>
                    <th>Workflow</th>
                    <th>Message</th>
                    <th>Execution ID</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record, index) => (
                    <tr
                      key={record.id ?? `${record.workflow_id ?? 'workflow'}-${record.execution_id ?? index}-${record.createdAt}`}
                      tabIndex={0}
                      aria-label={`View error: ${recordLabel(record)}`}
                      onClick={() => {
                        setCopyError(null);
                        setCopiedAction(null);
                        setSelectedRecord(record);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setCopyError(null);
                          setCopiedAction(null);
                          setSelectedRecord(record);
                        }
                      }}
                    >
                      <td><span className={`monitoring-category monitoring-category--${record.category.toLowerCase()}`}>{record.category || 'Unknown'}</span></td>
                      <td><code className="monitoring-error-code">{record.error_code || '—'}</code></td>
                      <td>{record.workflow_name || '—'}</td>
                      <td><span className="monitoring-message" title={record.error_message || undefined}>{record.error_message || '—'}</span></td>
                      <td><code className="monitoring-execution-id">{record.execution_id ?? '—'}</code></td>
                      <td className="monitoring-timestamp">{formatLocalTime(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedRecord && (
        <div
          className="monitoring-modal-backdrop"
          onClick={() => setSelectedRecord(null)}
        >
          <section
            className="monitoring-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monitoring-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="monitoring-detail-header">
              <div>
                <span className="page-eyebrow">Error details</span>
                <h2 id="monitoring-detail-title">{recordLabel(selectedRecord)}</h2>
              </div>
              <button type="button" className="monitoring-close" onClick={() => setSelectedRecord(null)} aria-label="Close error details">×</button>
            </header>

            <div className="monitoring-detail-actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={selectedRecord.execution_id == null}
                leftIcon={copiedAction === 'execution' ? <CheckIcon /> : <CopyIcon />}
                onClick={() => selectedRecord.execution_id != null && void copyText('execution', String(selectedRecord.execution_id))}
              >
                {copiedAction === 'execution' ? 'Execution ID copied' : 'Copy execution ID'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={copiedAction === 'details' ? <CheckIcon /> : <CopyIcon />}
                onClick={() => void copyRecordDetails(selectedRecord)}
              >
                {copiedAction === 'details' ? 'Details copied' : 'Copy error details'}
              </Button>
            </div>

            {copyError && <p className="monitoring-copy-error" role="alert">{copyError}</p>}

            <dl className="monitoring-detail-grid">
              <div><dt>Category</dt><dd><span className={`monitoring-category monitoring-category--${selectedRecord.category.toLowerCase()}`}>{selectedRecord.category || 'Unknown'}</span></dd></div>
              <div><dt>Error code</dt><dd><code>{selectedRecord.error_code || '—'}</code></dd></div>
              <div><dt>Workflow name</dt><dd>{selectedRecord.workflow_name || '—'}</dd></div>
              <div><dt>Workflow ID</dt><dd><code>{selectedRecord.workflow_id || '—'}</code></dd></div>
              <div><dt>Execution ID</dt><dd><code>{selectedRecord.execution_id ?? '—'}</code></dd></div>
              <div><dt>Timestamp</dt><dd>{formatLocalTime(selectedRecord.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatLocalTime(selectedRecord.updatedAt)}</dd></div>
              <div className="monitoring-detail-message"><dt>Full error message</dt><dd>{selectedRecord.error_message || '—'}</dd></div>
            </dl>

            <div className="monitoring-request-data">
              {selectedRecord.request_data == null ? (
                <>
                  <h3>Request data</h3>
                  <p>Not provided.</p>
                </>
              ) : (
                <JsonViewer
                  title="Request data"
                  data={parseRequestData(selectedRecord.request_data)}
                  initialExpanded
                />
              )}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
