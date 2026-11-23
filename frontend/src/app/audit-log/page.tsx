'use client';

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { apiClient } from '@/lib/api-client';
import { AuditEvent } from '@/types';
import { AuditIcon, CopyIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/icons/Icons';

export default function AuditLogPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);

  // Single event inspection state
  const [inspectEventId, setInspectEventId] = useState('');
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [inspectedEvent, setInspectedEvent] = useState<AuditEvent | null>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFetchAuditList = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEvents(null);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(organizationId.trim())) {
      setError('A valid organization_id UUID is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.getAuditEvents(organizationId.trim());
      if (!response.success) {
        setError(response.message || response.error || 'Failed to retrieve audit events.');
      } else {
        const eventList = (response.data || []) as AuditEvent[];
        setEvents(eventList);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectSingleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspectError(null);
    setInspectedEvent(null);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(inspectEventId.trim())) {
      setInspectError('A valid audit_event_id UUID is required.');
      return;
    }

    setInspectLoading(true);
    try {
      const response = await apiClient.getAuditEvent(inspectEventId.trim());
      if (!response.success) {
        setInspectError(response.message || response.error || 'Audit event not found.');
      } else {
        const ev = (response.data || response) as AuditEvent;
        setInspectedEvent(ev);
      }
    } catch (err: unknown) {
      setInspectError(err instanceof Error ? err.message : 'Failed to retrieve event.');
    } finally {
      setInspectLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modules / Audit"
          title="Audit Log"
          description="Chronological audit trail of business and lifecycle events recorded in Supabase PostgreSQL."
          icon={<AuditIcon />}
        />

        <Alert type="info" title="Audit Query Scope">
          The audit log endpoint returns up to the <strong>latest 100 events</strong> for the specified
          organization ordered by creation time descending. Custom date or event type filters are not
          supported by the current backend.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Query Organization Audit Events */}
          <div className="lg:col-span-7 space-y-4">
            <Card
              title="Organization Audit Events"
              description="Retrieve the latest 100 events for a merchant organization"
            >
              <form onSubmit={handleFetchAuditList} className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Organization ID (UUID)"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" isLoading={loading} disabled={loading || !organizationId.trim()}>
                  Fetch Audit Log
                </Button>
              </form>

              {error && (
                <div className="mb-4">
                  <Alert type="error" title="Query Error">
                    {error}
                  </Alert>
                </div>
              )}

              {events && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span>Events Found: <strong className="text-slate-200">{events.length}</strong></span>
                    <span className="text-[11px]">Latest 100 limit</span>
                  </div>

                  {events.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No audit events found for this organization.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((ev) => {
                        const isExpanded = expandedRow === ev.id;
                        return (
                          <div
                            key={ev.id}
                            className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden text-xs"
                          >
                            <div
                              onClick={() => setExpandedRow(isExpanded ? null : ev.id)}
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {isExpanded ? (
                                  <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className="font-semibold text-slate-100 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  {ev.event_type}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-slate-400">
                                <span className="font-mono text-[11px]">
                                  {new Date(ev.created_at).toLocaleString([], {
                                    dateStyle: 'short',
                                    timeStyle: 'medium',
                                  })}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(ev.id);
                                  }}
                                  title="Copy Event ID"
                                >
                                  {copiedId === ev.id ? (
                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <CopyIcon className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3.5 border-t border-slate-800/80 bg-slate-950 space-y-2.5">
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                                  <div>
                                    <span>Event ID:</span>{' '}
                                    <code className="text-slate-300 font-mono">{ev.id}</code>
                                  </div>
                                  <div>
                                    <span>Register ID:</span>{' '}
                                    <code className="text-slate-300 font-mono">
                                      {ev.register_id || 'N/A'}
                                    </code>
                                  </div>
                                  {ev.receipt_id && (
                                    <div className="col-span-2">
                                      <span>Receipt ID:</span>{' '}
                                      <code className="text-slate-300 font-mono">{ev.receipt_id}</code>
                                    </div>
                                  )}
                                </div>
                                <JsonViewer data={ev.payload} title="Event Payload" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Inspect Single Audit Event */}
          <div className="lg:col-span-5 space-y-4">
            <Card
              title="Inspect Individual Audit Event"
              description="Queries GET /api/audit/events/:id via dynamic WF-08 webhook"
            >
              <form onSubmit={handleInspectSingleEvent} className="space-y-4">
                <Input
                  label="Audit Event ID (UUID)"
                  placeholder="e.g. 5e913a40-2fd3-4c91-91a0-..."
                  value={inspectEventId}
                  onChange={(e) => setInspectEventId(e.target.value)}
                  required
                />

                {inspectError && (
                  <Alert type="error" title="Inspection Error">
                    {inspectError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={inspectLoading}
                  disabled={inspectLoading || !inspectEventId.trim()}
                >
                  Inspect Event
                </Button>
              </form>
            </Card>

            {inspectedEvent ? (
              <Card
                title={inspectedEvent.event_type}
                description={`Recorded at ${inspectedEvent.created_at}`}
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Event ID:</span>
                      <code className="text-slate-300 font-mono text-[11px] break-all">
                        {inspectedEvent.id}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Organization ID:</span>
                      <code className="text-slate-300 font-mono text-[11px] break-all">
                        {inspectedEvent.organization_id}
                      </code>
                    </div>
                    {inspectedEvent.register_id && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Register ID:</span>
                        <code className="text-slate-300 font-mono text-[11px] break-all">
                          {inspectedEvent.register_id}
                        </code>
                      </div>
                    )}
                    {inspectedEvent.receipt_id && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Receipt ID:</span>
                        <code className="text-slate-300 font-mono text-[11px] break-all">
                          {inspectedEvent.receipt_id}
                        </code>
                      </div>
                    )}
                  </div>

                  <JsonViewer data={inspectedEvent.payload} title="Audit Event Payload" />
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}
