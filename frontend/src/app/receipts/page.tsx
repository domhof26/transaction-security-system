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
import { parseEuroToCents } from '@/lib/money';
import { Receipt, ReceiptVerificationData } from '@/types';
import {
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopyIcon,
  CheckIcon,
} from '@/components/icons/Icons';

type ActiveTab = 'submit' | 'sign' | 'verify' | 'retrieve' | 'register_receipts';

export default function ReceiptsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('submit');

  // Submit form state
  const [submitRegisterId, setSubmitRegisterId] = useState('');
  const [submitReceiptNumber, setSubmitReceiptNumber] = useState('INV-0001');
  const [submitGrossEuros, setSubmitGrossEuros] = useState('19.99');
  const [vatRate, setVatRate] = useState<number>(20);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<Record<string, unknown> | null>(null);

  // Sign form state
  const [signReceiptId, setSignReceiptId] = useState('');
  const [signLoading, setSignLoading] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [signResult, setSignResult] = useState<Record<string, unknown> | null>(null);

  // Verify form state
  const [verifyReceiptId, setVerifyReceiptId] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<ReceiptVerificationData | null>(null);

  // Retrieve single receipt state
  const [retrieveReceiptId, setRetrieveReceiptId] = useState('');
  const [retrieveLoading, setRetrieveLoading] = useState(false);
  const [retrieveError, setRetrieveError] = useState<string | null>(null);
  const [retrievedReceipt, setRetrievedReceipt] = useState<Receipt | null>(null);

  // Retrieve register receipts state
  const [registerReceiptsId, setRegisterReceiptsId] = useState('');
  const [registerReceiptsLoading, setRegisterReceiptsLoading] = useState(false);
  const [registerReceiptsError, setRegisterReceiptsError] = useState<string | null>(null);
  const [registerReceiptsList, setRegisterReceiptsList] = useState<Receipt[] | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to format minor cents to EUR
  const formatEuro = (cents: number) => {
    return (cents / 100).toLocaleString('de-AT', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const submitAmountCents = parseEuroToCents(submitGrossEuros);
  const netAmountCents = submitAmountCents !== null && Number.isFinite(vatRate) && submitAmountCents >= 0
    ? Math.round((submitAmountCents * 100) / (100 + vatRate))
    : 0;
  const vatAmountCents = Math.max((submitAmountCents ?? 0) - netAmountCents, 0);
  const vatItems = [{ rate: vatRate, net_cents: netAmountCents, vat_cents: vatAmountCents }];

  // 1. Submit Receipt Handler
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!submitRegisterId.trim()) {
      setSubmitError('A valid register_id UUID is required.');
      return;
    }

    if (submitAmountCents === null) {
      setSubmitError('Enter a non-negative gross amount in euros with no more than two decimal places.');
      return;
    }

    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      setSubmitError('VAT rate must be between 0 and 100.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        register_id: submitRegisterId.trim(),
        receipt_number: submitReceiptNumber.trim(),
        amount_cents: submitAmountCents,
        vat_breakdown: vatItems,
      };

      const response = await apiClient.submitReceipt(payload);

      if (!response.success && response.status !== 201) {
        setSubmitError(response.message || response.error || 'Failed to submit receipt.');
      } else {
        const raw = response as unknown as Record<string, unknown>;
        const receiptData =
          (raw.data as Record<string, unknown> | undefined)
          || (raw.receipt as Record<string, unknown> | undefined)
          || raw;
        const receiptId =
          (typeof raw.receipt_id === 'string' && raw.receipt_id)
          || (typeof raw.id === 'string' && raw.id)
          || (typeof receiptData.id === 'string' && receiptData.id)
          || null;
        setSubmitSuccess({
          status: receiptData.status || 'PENDING',
          id: receiptId,
          receipt_id: receiptId,
          register_id: payload.register_id,
          receipt_number: receiptData.receipt_number || payload.receipt_number,
          sequence_number: receiptData.sequence_number,
          amount_cents: receiptData.amount_cents ?? payload.amount_cents,
          currency: 'EUR',
          vat_breakdown: payload.vat_breakdown,
          acknowledged_at: new Date().toISOString(),
          note: 'Receipt successfully allocated sequence and stored as PENDING in Supabase.',
        });
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 2. Sign Receipt Handler
  const handleSignReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignError(null);
    setSignResult(null);

    if (!signReceiptId.trim()) {
      setSignError('Receipt ID UUID is required.');
      return;
    }

    setSignLoading(true);
    try {
      const response = await apiClient.signReceipt(signReceiptId.trim());
      if (!response.success && response.status !== 200) {
        setSignError(response.message || response.error || 'Failed to sign receipt.');
      } else {
        setSignResult(response as unknown as Record<string, unknown>);
      }
    } catch (err: unknown) {
      setSignError(err instanceof Error ? err.message : 'An error occurred during signing.');
    } finally {
      setSignLoading(false);
    }
  };

  // 3. Verify Receipt Handler
  const handleVerifyReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyResult(null);

    if (!verifyReceiptId.trim()) {
      setVerifyError('Receipt ID UUID is required.');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await apiClient.verifyReceipt(verifyReceiptId.trim());
      if (!response.success && response.status !== 200) {
        setVerifyError(response.message || response.error || 'Failed to execute verification.');
      } else {
        const verifyData = (response.data || response) as ReceiptVerificationData;
        setVerifyResult(verifyData);
      }
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'An error occurred during verification.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // 4. Retrieve Single Receipt Handler
  const handleRetrieveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setRetrieveError(null);
    setRetrievedReceipt(null);

    if (!retrieveReceiptId.trim()) {
      setRetrieveError('Receipt ID UUID is required.');
      return;
    }

    setRetrieveLoading(true);
    try {
      const response = await apiClient.getReceipt(retrieveReceiptId.trim());
      if (!response.success) {
        setRetrieveError(response.message || response.error || 'Receipt not found.');
      } else {
        const receiptData = (response.data || response) as Receipt;
        setRetrievedReceipt(receiptData);
      }
    } catch (err: unknown) {
      setRetrieveError(err instanceof Error ? err.message : 'Failed to retrieve receipt.');
    } finally {
      setRetrieveLoading(false);
    }
  };

  // 5. Retrieve Register Receipts Handler
  const handleGetRegisterReceipts = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterReceiptsError(null);
    setRegisterReceiptsList(null);

    if (!registerReceiptsId.trim()) {
      setRegisterReceiptsError('Register ID UUID is required.');
      return;
    }

    setRegisterReceiptsLoading(true);
    try {
      const response = await apiClient.getRegisterReceipts(registerReceiptsId.trim());
      if (!response.success) {
        setRegisterReceiptsError(response.message || response.error || 'Cash register not found.');
      } else {
        const receipts = (response.data || []) as Receipt[];
        setRegisterReceiptsList(receipts);
      }
    } catch (err: unknown) {
      setRegisterReceiptsError(err instanceof Error ? err.message : 'Failed to retrieve register receipts.');
    } finally {
      setRegisterReceiptsLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modules / Receipts"
          title="Receipt Management"
          description="Submit, sign, verify, and inspect POS receipts across the complete fiscal transaction lifecycle."
          icon={<ReceiptIcon />}
        />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto">
          {[
            { id: 'submit', label: 'Submit Receipt' },
            { id: 'sign', label: 'Sign Receipt' },
            { id: 'verify', label: 'Verify Receipt' },
            { id: 'retrieve', label: 'Retrieve by ID' },
            { id: 'register_receipts', label: 'Register Receipts (Latest 50)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SUBMIT RECEIPT */}
        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <Card
                title="Submit POS Receipt"
                description="Generates an entry with PENDING status and allocates the next sequence number"
              >
                <form onSubmit={handleSubmitReceipt} className="space-y-4">
                  <Input
                    label="Cash Register ID (UUID)"
                    placeholder="e.g. e08d9510-9b48-4e44-8cb5-..."
                    value={submitRegisterId}
                    onChange={(e) => setSubmitRegisterId(e.target.value)}
                    required
                    helperText="The register to which this receipt sequence belongs."
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Receipt Number"
                      placeholder="e.g. INV-0001"
                      value={submitReceiptNumber}
                      onChange={(e) => setSubmitReceiptNumber(e.target.value)}
                      required
                    />

                    <Input
                      label="Gross Amount (EUR)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 19.99"
                      value={submitGrossEuros}
                      onChange={(e) => setSubmitGrossEuros(e.target.value)}
                      required
                      helperText="Enter the total amount including VAT in euros."
                    />
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <Input
                      label="VAT Rate (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      required
                    />
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
                        <span className="text-slate-400 block">Gross</span>
                        <strong className="text-slate-100">{submitAmountCents === null ? '—' : formatEuro(submitAmountCents)}</strong>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
                        <span className="text-slate-400 block">Net</span>
                        <strong className="text-slate-100">{formatEuro(netAmountCents)}</strong>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950">
                        <span className="text-slate-400 block">VAT</span>
                        <strong className="text-slate-100">{formatEuro(vatAmountCents)}</strong>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <Alert type="error" title="Submission Failed">
                      {submitError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={submitLoading}
                    disabled={submitLoading || !submitRegisterId.trim()}
                  >
                    Submit Receipt
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <Alert type="info" title="VAT Calculation">
                Gross is entered in euros. Net and VAT are recalculated from the editable VAT rate,
                then converted to cents and rounded to the nearest cent for storage.
              </Alert>

              {submitSuccess ? (
                <Card
                  title="Receipt Submitted Successfully"
                  description="Initial state: PENDING • Monotonic sequence allocated"
                  badge={<StatusBadge status="PENDING" size="sm" />}
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Receipt Number:</span>
                          <span className="text-slate-100 font-semibold font-mono">
                            {String(submitSuccess.receipt_number)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Total Amount:</span>
                          <span className="text-emerald-400 font-semibold">
                            {formatEuro(Number(submitSuccess.amount_cents))}
                          </span>
                        </div>
                        {Boolean(submitSuccess.receipt_id) && (
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[11px]">Receipt UUID:</span>
                            <code className="text-slate-300 font-mono text-[11px] truncate block">
                              {String(submitSuccess.receipt_id)}
                            </code>
                          </div>
                        )}
                        {submitSuccess.sequence_number !== undefined && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Sequence:</span>
                            <span className="text-slate-100 font-semibold">
                              {String(submitSuccess.sequence_number)}
                            </span>
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[11px]">Cash Register ID:</span>
                          <code className="text-slate-300 font-mono text-[11px] truncate block">
                            {String(submitSuccess.register_id)}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRegisterReceiptsId(String(submitSuccess.register_id));
                          setActiveTab('register_receipts');
                        }}
                      >
                        View in Register Receipts List →
                      </Button>
                    </div>

                    <JsonViewer data={submitSuccess} title="Submitted Receipt Payload" />
                  </div>
                </Card>
              ) : (
                <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-semibold text-slate-300">Ready to Submit</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enter the Register UUID and transaction details to allocate a sequence number
                      and create a PENDING receipt.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SIGN RECEIPT */}
        {activeTab === 'sign' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card
                title="Sign Receipt"
                description="Executes deterministic mock signing and locks the register"
              >
                <form onSubmit={handleSignReceipt} className="space-y-4">
                  <Input
                    label="Receipt ID (UUID)"
                    placeholder="e.g. a78c4321-72f1-4b11-a010-..."
                    value={signReceiptId}
                    onChange={(e) => setSignReceiptId(e.target.value)}
                    required
                    helperText="Enter the UUID of a PENDING receipt."
                  />

                  {signError && (
                    <Alert type="error" title="Signing Error">
                      {signError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={signLoading}
                    disabled={signLoading || !signReceiptId.trim()}
                  >
                    Execute Mock Sign
                  </Button>
                </form>
              </Card>

              <Alert type="info" title="Signing Rule Guarantees">
                The PostgreSQL function <code>public.sign_receipt()</code> locks the register to ensure
                sequential ordering. It requires that:
                <ul className="list-disc list-inside mt-1 text-slate-400 space-y-0.5">
                  <li>Receipt status is PENDING</li>
                  <li>Register & Signing Unit are ACTIVE</li>
                  <li>All previous receipts in the register are already SIGNED</li>
                </ul>
              </Alert>
            </div>

            <div className="lg:col-span-7">
              {signResult ? (
                <Card
                  title="Signing Operation Result"
                  description="Result returned from public.sign_receipt()"
                  badge={
                    <div className="flex gap-2">
                      <StatusBadge status="SIGNED" size="sm" />
                      {Boolean(signResult.already_signed) && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          Already Signed (Idempotent)
                        </span>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {/* Cryptographic properties */}
                    {signResult.data ? (
                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                            SHA-256 Receipt Hash
                          </span>
                          <code className="text-xs font-mono text-blue-400 bg-slate-900 px-2 py-1 rounded block break-all select-all border border-slate-800">
                            {String((signResult.data as Record<string, unknown>).hash || 'N/A')}
                          </code>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                            Mock Signature
                          </span>
                          <code className="text-xs font-mono text-purple-400 bg-slate-900 px-2 py-1 rounded block break-all select-all border border-slate-800">
                            {String((signResult.data as Record<string, unknown>).signature || 'N/A')}
                          </code>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Previous Hash:</span>
                            <span className="font-mono text-slate-300 truncate block">
                              {String((signResult.data as Record<string, unknown>).previous_hash || 'None (Genesis receipt)')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Key ID:</span>
                            <span className="font-mono text-slate-300">
                              {String((signResult.data as Record<string, unknown>).key_id || 'demo-public-key-001')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <JsonViewer data={signResult} title="Backend Signing Response" />
                  </div>
                </Card>
              ) : (
                <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-semibold text-slate-300">No Receipt Signed Yet</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Provide a receipt UUID on the left to trigger cryptographic mock signing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VERIFY RECEIPT */}
        {activeTab === 'verify' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card
                title="Verify Receipt"
                description="Re-evaluates hash, mock signature, and hash-chain link"
              >
                <form onSubmit={handleVerifyReceipt} className="space-y-4">
                  <Input
                    label="Receipt ID (UUID)"
                    placeholder="e.g. a78c4321-72f1-4b11-a010-..."
                    value={verifyReceiptId}
                    onChange={(e) => setVerifyReceiptId(e.target.value)}
                    required
                    helperText="Enter the UUID of a SIGNED receipt."
                  />

                  {verifyError && (
                    <Alert type="error" title="Verification API Error">
                      {verifyError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={verifyLoading}
                    disabled={verifyLoading || !verifyReceiptId.trim()}
                  >
                    Verify Receipt
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-7">
              {verifyResult ? (
                <Card
                  title="Verification Result"
                  description="Calculated live by public.verify_receipt()"
                  badge={
                    <StatusBadge
                      status={verifyResult.valid ? 'VALID' : 'INVALID'}
                      size="sm"
                    />
                  }
                >
                  <div className="space-y-4">
                    {/* Overall Check Banner */}
                    <div
                      className={`p-4 rounded-xl border flex items-center gap-3 ${
                        verifyResult.valid
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                      }`}
                    >
                      {verifyResult.valid ? (
                        <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">
                          {verifyResult.valid
                            ? 'Receipt is Mathematically & Sequentially Valid'
                            : 'Receipt Failed Verification'}
                        </div>
                        <div className="text-xs opacity-90 mt-0.5">
                          {verifyResult.valid
                            ? 'All three cryptographic and hash-chain checks passed successfully.'
                            : verifyResult.error === 'RECEIPT_NOT_SIGNED'
                            ? 'Receipt is not signed (status is PENDING, PROCESSING, or FAILED). Unsigned receipts are classified as invalid by the verification function.'
                            : `Check failure: ${verifyResult.error || 'Signature or chain integrity violation.'}`}
                        </div>
                      </div>
                    </div>

                    {/* Check item list */}
                    {verifyResult.checks && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <span className="text-slate-400 block mb-1">Receipt Hash:</span>
                          <div className="flex items-center gap-1.5 font-semibold">
                            {verifyResult.checks.receipt_hash ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Match</span>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-400">Mismatch</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <span className="text-slate-400 block mb-1">Mock Signature:</span>
                          <div className="flex items-center gap-1.5 font-semibold">
                            {verifyResult.checks.signature ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Valid</span>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-400">Invalid</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <span className="text-slate-400 block mb-1">Hash-Chain Link:</span>
                          <div className="flex items-center gap-1.5 font-semibold">
                            {verifyResult.checks.hash_chain ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Intact</span>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-400">Broken</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <JsonViewer data={verifyResult} title="Backend Verification Response" />
                  </div>
                </Card>
              ) : (
                <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-semibold text-slate-300">Ready to Verify</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enter a Receipt UUID to recalculate and verify the receipt hash, mock signature,
                      and predecessor link.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RETRIEVE BY ID */}
        {activeTab === 'retrieve' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card
                title="Retrieve Individual Receipt"
                description="Queries GET /api/receipts/:id via the dynamic WF-07 webhook"
              >
                <form onSubmit={handleRetrieveReceipt} className="space-y-4">
                  <Input
                    label="Receipt ID (UUID)"
                    placeholder="e.g. a78c4321-72f1-4b11-a010-..."
                    value={retrieveReceiptId}
                    onChange={(e) => setRetrieveReceiptId(e.target.value)}
                    required
                  />

                  {retrieveError && (
                    <Alert type="error" title="Retrieval Error">
                      {retrieveError}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={retrieveLoading}
                    disabled={retrieveLoading || !retrieveReceiptId.trim()}
                  >
                    Retrieve Receipt
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-7">
              {retrievedReceipt ? (
                <Card
                  title={`Receipt ${retrievedReceipt.receipt_number || 'Details'}`}
                  description={`Sequence #${retrievedReceipt.sequence_number ?? 'N/A'}`}
                  badge={<StatusBadge status={retrievedReceipt.status || 'PENDING'} size="sm" />}
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Amount:</span>
                        <span className="text-emerald-400 font-semibold text-sm">
                          {formatEuro(retrievedReceipt.amount_cents)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Currency:</span>
                        <span className="text-slate-200 font-medium">
                          {retrievedReceipt.currency || 'EUR'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Register ID:</span>
                        <code className="text-slate-300 font-mono text-[11px] truncate block">
                          {retrievedReceipt.register_id}
                        </code>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Created At:</span>
                        <span className="text-slate-300 font-mono text-[11px]">
                          {retrievedReceipt.created_at}
                        </span>
                      </div>
                      {retrievedReceipt.signed_at && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[11px]">Signed At:</span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {retrievedReceipt.signed_at}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSignReceiptId(retrievedReceipt.id);
                          setActiveTab('sign');
                        }}
                      >
                        Sign this Receipt →
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setVerifyReceiptId(retrievedReceipt.id);
                          setActiveTab('verify');
                        }}
                      >
                        Verify this Receipt →
                      </Button>
                    </div>

                    <JsonViewer data={retrievedReceipt} title="Complete Receipt Record" />
                  </div>
                </Card>
              ) : (
                <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-semibold text-slate-300">No Receipt Loaded</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enter a Receipt UUID to fetch the record from the database.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REGISTER RECEIPTS (LATEST 50) */}
        {activeTab === 'register_receipts' && (
          <div className="space-y-4">
            <Card
              title="Retrieve Register Receipts"
              description="Queries GET /api/registers/:id/receipts (returns latest 50 receipts ordered by sequence DESC)"
            >
              <form onSubmit={handleGetRegisterReceipts} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Cash Register ID (UUID)"
                    value={registerReceiptsId}
                    onChange={(e) => setRegisterReceiptsId(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={registerReceiptsLoading}
                  disabled={registerReceiptsLoading || !registerReceiptsId.trim()}
                >
                  Retrieve Receipts
                </Button>
              </form>

              {registerReceiptsError && (
                <div className="mt-4">
                  <Alert type="error" title="Error Loading Register Receipts">
                    {registerReceiptsError}
                  </Alert>
                </div>
              )}
            </Card>

            {registerReceiptsList && (
              <Card
                title={`Receipts (${registerReceiptsList.length})`}
                description={`Showing newest transactions for register ${registerReceiptsId}`}
              >
                {registerReceiptsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No receipts found for this register. Submit a receipt to populate this register.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                          <th className="py-2.5 px-3">Seq #</th>
                          <th className="py-2.5 px-3">Receipt Number</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Receipt ID (UUID)</th>
                          <th className="py-2.5 px-3">Created</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11.5px]">
                        {registerReceiptsList.map((rcpt) => (
                          <tr key={rcpt.id} className="hover:bg-slate-850/50 transition-colors">
                            <td className="py-2.5 px-3 text-slate-300 font-semibold">
                              #{rcpt.sequence_number}
                            </td>
                            <td className="py-2.5 px-3 text-slate-100 font-sans font-medium">
                              {rcpt.receipt_number}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-400 font-semibold font-sans">
                              {formatEuro(rcpt.amount_cents)}
                            </td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={rcpt.status} size="sm" />
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10.5px]">
                              <span className="truncate block max-w-[150px]">{rcpt.id}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                              {new Date(rcpt.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(rcpt.id)}
                                  title="Copy Receipt UUID"
                                >
                                  {copiedId === rcpt.id ? (
                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <CopyIcon className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                                {rcpt.status === 'PENDING' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSignReceiptId(rcpt.id);
                                      setActiveTab('sign');
                                    }}
                                  >
                                    Sign
                                  </Button>
                                )}
                                {rcpt.status === 'SIGNED' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setVerifyReceiptId(rcpt.id);
                                      setActiveTab('verify');
                                    }}
                                  >
                                    Verify
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
