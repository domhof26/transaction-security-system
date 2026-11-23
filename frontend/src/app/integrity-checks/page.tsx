'use client';

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { apiClient } from '@/lib/api-client';
import { RegisterIntegrityData } from '@/types';
import {
  IntegrityIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@/components/icons/Icons';

export default function IntegrityChecksPage() {
  const [registerId, setRegisterId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrityData, setIntegrityData] = useState<RegisterIntegrityData | null>(null);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIntegrityData(null);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(registerId.trim())) {
      setError('A valid register_id UUID is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.checkRegisterIntegrity(registerId.trim());
      if (!response.success && response.status !== 200) {
        setError(response.message || response.error || 'Failed to execute integrity check.');
      } else {
        const data = (response.data || response) as RegisterIntegrityData;
        setIntegrityData(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modules / Compliance"
          title="Register Integrity Checks"
          description="Validate the entire cryptographic hash chain, mock signature validity, and sequential order for all receipts of a cash register."
          icon={<IntegrityIcon />}
        />

        {/* Wording distinction alert as required by Section 3 of Master Prompt */}
        <Alert type="info" title="Important Verification Terminology">
          The PostgreSQL function <code>public.check_register_integrity()</code> evaluates every receipt
          in sequence. An unsigned receipt (e.g. status <code>PENDING</code>) is classified as invalid
          by this check because it has not yet completed the signing process. <strong>This does not prove
          cryptographic corruption</strong>; it signifies that the receipt chain contains pending,
          unsigned transactions.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Query Form */}
          <div className="lg:col-span-5 space-y-4">
            <Card
              title="Run Integrity Check"
              description="Scans public.receipts ordered by sequence_number"
            >
              <form onSubmit={handleCheck} className="space-y-4">
                <Input
                  label="Cash Register ID (UUID)"
                  placeholder="e.g. e08d9510-9b48-4e44-8cb5-..."
                  value={registerId}
                  onChange={(e) => setRegisterId(e.target.value)}
                  required
                  helperText="The cash register whose hash chain will be verified."
                />

                {error && (
                  <Alert type="error" title="Integrity Check Error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading || !registerId.trim()}
                >
                  Run Register Integrity Check
                </Button>
              </form>
            </Card>
          </div>

          {/* Results Summary & Receipt Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {integrityData ? (
              <Card
                title="Integrity Verification Summary"
                description={`Register: ${integrityData.register_id || registerId}`}
                badge={
                  <StatusBadge
                    status={integrityData.valid ? 'VALID' : 'INVALID'}
                    size="sm"
                  />
                }
              >
                <div className="space-y-5">
                  {/* Result Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      integrityData.valid
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    }`}
                  >
                    {integrityData.valid ? (
                      <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">
                        {integrityData.valid
                          ? 'Cash Register Hash Chain is 100% Valid'
                          : 'Register Integrity Verification Found Issues'}
                      </div>
                      <div className="text-xs opacity-90 mt-0.5">
                        {integrityData.valid
                          ? 'All receipts in the register sequence have valid signatures, consistent hashes, and intact chain links.'
                          : integrityData.checked_count === 0
                          ? 'No receipts found for this register.'
                          : `${integrityData.invalid_count} receipt(s) failed verification (e.g. unsigned PENDING status or broken chain link).`}
                      </div>
                    </div>
                  </div>

                  {/* Count Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block">Total Checked</span>
                      <span className="text-lg font-bold font-mono text-slate-100">
                        {integrityData.checked_count}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block">Valid Receipts</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {integrityData.valid_count}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block">Invalid Receipts</span>
                      <span className="text-lg font-bold font-mono text-rose-400">
                        {integrityData.invalid_count}
                      </span>
                    </div>
                  </div>

                  {/* Individual Receipt Results */}
                  {integrityData.results && integrityData.results.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Individual Receipt Verification Details:
                      </h4>
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        {integrityData.results.map((r, idx) => {
                          const itemKey = r.receipt_id || `item-${idx}`;
                          const isExpanded = expandedReceipt === itemKey;
                          return (
                            <div
                              key={itemKey}
                              className="rounded-lg border border-slate-800 bg-slate-950/70 overflow-hidden text-xs"
                            >
                              <div
                                onClick={() =>
                                  setExpandedReceipt(isExpanded ? null : itemKey)
                                }
                                className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span className="font-mono font-semibold text-slate-200">
                                    Seq #{r.sequence_number ?? idx + 1}
                                  </span>
                                  <span className="text-slate-400">
                                    ({r.receipt_number || 'Receipt'})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {r.error && (
                                    <span className="text-[10.5px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40">
                                      {r.error}
                                    </span>
                                  )}
                                  <StatusBadge
                                    status={r.valid ? 'VALID' : 'INVALID'}
                                    size="sm"
                                  />
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2 text-[11px]">
                                  {r.receipt_id && (
                                    <div className="text-slate-400">
                                      <span>Receipt ID:</span>{' '}
                                      <code className="text-slate-200 font-mono">
                                        {r.receipt_id}
                                      </code>
                                    </div>
                                  )}
                                  {r.checks && (
                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Hash:</span>
                                        <span className={r.checks.receipt_hash ? 'text-emerald-400' : 'text-rose-400'}>
                                          {r.checks.receipt_hash ? 'Match' : 'Fail'}
                                        </span>
                                      </div>
                                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Signature:</span>
                                        <span className={r.checks.signature ? 'text-emerald-400' : 'text-rose-400'}>
                                          {r.checks.signature ? 'Valid' : 'Fail'}
                                        </span>
                                      </div>
                                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                        <span className="text-slate-400 block text-[10px]">Chain Link:</span>
                                        <span className={r.checks.hash_chain ? 'text-emerald-400' : 'text-rose-400'}>
                                          {r.checks.hash_chain ? 'Intact' : 'Broken'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <JsonViewer data={integrityData} title="Raw Integrity Report JSON" />
                </div>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-300">No Integrity Check Run</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter a Cash Register UUID to scan and verify its entire cryptographic receipt sequence.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
