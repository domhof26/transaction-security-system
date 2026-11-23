'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiClient } from '@/lib/api-client';
import { parseEuroToCents } from '@/lib/money';
import {
  AuditEvent,
  CashRegister,
  Organization,
  Receipt,
  SigningUnit,
} from '@/types';
import {
  OrganizationIcon,
  SigningUnitIcon,
  CashRegisterIcon,
  ReceiptIcon,
  AuditIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpinnerIcon,
} from '@/components/icons/Icons';

function formatEuro(cents: number) {
  return (cents / 100).toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function OrganizationDashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [signingUnits, setSigningUnits] = useState<SigningUnit[]>([]);
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [registerId, setRegisterId] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [grossAmountEuros, setGrossAmountEuros] = useState('19.99');
  const [vatRate, setVatRate] = useState(20);
  const [receiptNumber, setReceiptNumber] = useState('INV-0001');
  const [fiscalLoading, setFiscalLoading] = useState(false);
  const [fiscalResult, setFiscalResult] = useState<Record<string, unknown> | null>(null);
  const fiscalSubmissionRef = useRef(false);

  const grossCents = parseEuroToCents(grossAmountEuros);
  const netCents = grossCents !== null && Number.isFinite(vatRate) && grossCents >= 0
    ? Math.round((grossCents * 100) / (100 + vatRate))
    : 0;
  const vatCents = Math.max((grossCents ?? 0) - netCents, 0);
  const organization = organizations.find((item) => item.id === organizationId) || null;

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);
    let disposed = false;

    const loadOrganizations = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const response = await fetch('/api/organizations', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });
        const body = await response.json() as {
          success?: boolean;
          data?: Organization[];
          message?: string;
          error?: string;
        };

        if (!response.ok || body.success === false) {
          setOrganizations([]);
          setDataError(body.message || body.error || 'Failed to load organizations.');
        } else {
          const data = body.data || [];
          setOrganizations(data);
          setOrganizationId((current) => current || data[0]?.id || '');
        }
      } catch (error) {
        if (disposed) return;
        setOrganizations([]);
        setDataError(
          error instanceof DOMException && error.name === 'AbortError'
            ? 'Loading organizations timed out.'
            : error instanceof Error
              ? error.message
              : 'Failed to load organizations.'
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (!disposed) setLoading(false);
      }
    };

    loadOrganizations();
    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let active = true;
    Promise.all([
      apiClient.getOrganizationSigningUnits(organizationId),
      apiClient.getOrganizationRegisters(organizationId),
      apiClient.getOrganizationReceipts(organizationId),
      apiClient.getOrganizationAuditEvents(organizationId),
    ]).then(([unitsResponse, registersResponse, receiptsResponse, auditResponse]) => {
      if (!active) return;
      if (!unitsResponse.success || !registersResponse.success || !receiptsResponse.success || !auditResponse.success) {
        setDataError(
          unitsResponse.message || registersResponse.message || receiptsResponse.message ||
          auditResponse.message || 'Failed to load organization data.'
        );
        return;
      }
      setSigningUnits((unitsResponse.data || []) as SigningUnit[]);
      const registerData = (registersResponse.data || []) as CashRegister[];
      setRegisters(registerData);
      setReceipts((receiptsResponse.data || []) as Receipt[]);
      setAuditEvents((auditResponse.data || []) as AuditEvent[]);
    });

    return () => { active = false; };
  }, [organizationId, organizations]);

  useEffect(() => {
    if (!organizationId || !registerId) {
      return;
    }
    let active = true;
    apiClient.getOrganizationReceipts(organizationId, registerId).then((response) => {
      if (!active) return;
      setReceipts(response.success ? ((response.data || []) as Receipt[]) : []);
      if (!response.success) {
        setDataError(response.message || response.error || 'Failed to load receipts.');
      }
    });
    return () => { active = false; };
  }, [organizationId, registerId]);

  const handleFiscalize = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fiscalSubmissionRef.current) return;
    setFiscalResult(null);
    if (!organizationId || !registerId) {
      setFiscalResult({ success: false, status: 'FAILED', error: 'Select an organization and active cash register.' });
      return;
    }
    if (!receiptNumber.trim()) {
      setFiscalResult({ success: false, status: 'FAILED', error: 'Receipt number is required.' });
      return;
    }
    if (grossCents === null) {
      setFiscalResult({ success: false, status: 'FAILED', error: 'Enter a non-negative gross amount in euros with no more than two decimal places.' });
      return;
    }
    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      setFiscalResult({ success: false, status: 'FAILED', error: 'VAT rate must be between 0 and 100.' });
      return;
    }

    fiscalSubmissionRef.current = true;
    setFiscalLoading(true);
    try {
      const response = await apiClient.fiscalize({
        organization_id: organizationId,
        register_id: registerId,
        receipt_number: receiptNumber.trim(),
        amount_cents: grossCents,
        vat_rate: vatRate,
      });
      setFiscalResult(response as unknown as Record<string, unknown>);
    } catch (error) {
      setFiscalResult({
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Fiscalization request failed.',
      });
    } finally {
      fiscalSubmissionRef.current = false;
      setFiscalLoading(false);
    }
  };

  const resultCreated = fiscalResult?.receipt_created === true;
  const resultSigned = fiscalResult?.receipt_signed === true;
  const resultVerified = fiscalResult?.receipt_verified === true;

  return (
    <Shell>
      <div className="dashboard-page">
        <header className="page-heading">
          <span className="page-eyebrow">Workspace / Organization Dashboard</span>
          <h1 className="page-greeting">Organization Dashboard</h1>
        </header>

        {loading ? (
          <Card title="Loading organizations">
            <div className="dashboard-loading"><SpinnerIcon /> Loading organization data...</div>
          </Card>
        ) : organizations.length === 0 ? (
          <Card title="No organizations found" description="Create an organization to start the fiscalization lifecycle.">
            <div className="dashboard-empty">
              <OrganizationIcon />
              <p>No organizations exist in Supabase yet.</p>
              <Link className="primary-action" href="/organizations">
                Create organization <ArrowRightIcon />
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="dashboard-toolbar">
              <Select
                label="Organization"
                value={organizationId}
                onChange={(event) => {
                  setOrganizationId(event.target.value);
                  setSigningUnits([]);
                  setRegisters([]);
                  setRegisterId('');
                  setReceipts([]);
                  setAuditEvents([]);
                  setFiscalResult(null);
                  setDataError(null);
                }}
                options={[
                  { label: 'Select an organization', value: '' },
                  ...organizations.map((item) => ({ label: item.name, value: item.id })),
                ]}
              />
            </div>

            {dataError && <Alert type="error" title="Dashboard data error">{dataError}</Alert>}

            {organization && (
              <Card
                title="Organization"
                badge={<StatusBadge status={organization.country} size="sm" />}
                description="Selected organization information"
              >
                <div className="dashboard-info-grid">
                  <div><span>Name</span><strong>{organization.name}</strong></div>
                  <div><span>Organization ID</span><code>{organization.id}</code></div>
                  <div><span>Created</span><strong>{formatDate(organization.created_at)}</strong></div>
                </div>
              </Card>
            )}

            <div className="dashboard-grid dashboard-grid--half">
              <Card
                title="Signing Units"
                badge={<SigningUnitIcon />}
                description="Signing resources assigned to this organization"
              >
                {signingUnits.length === 0 ? (
                  <p className="dashboard-empty-inline">No signing units found.</p>
                ) : (
                  <div className="dashboard-list">
                    {signingUnits.map((unit) => (
                      <div className="dashboard-list-item" key={unit.id}>
                        <div>
                          <strong>{unit.name}</strong>
                          <span>{unit.provider_type}</span>
                          <code className="dashboard-list-id">{unit.id}</code>
                        </div>
                        <StatusBadge status={unit.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Cash Registers"
                badge={<CashRegisterIcon />}
                description="Registers associated with the selected organization"
              >
                {registers.length === 0 ? (
                  <p className="dashboard-empty-inline">No cash registers found.</p>
                ) : (
                  <div className="dashboard-list">
                    {registers.map((register) => {
                      const signingUnit = signingUnits.find((unit) => unit.id === register.signing_unit_id);
                      return (
                        <div className="dashboard-list-item" key={register.id}>
                          <div>
                            <strong>{register.name}</strong>
                            <span>{signingUnit?.name || 'No signing unit assigned'}</span>
                            <code className="dashboard-list-id">{register.id}</code>
                          </div>
                          <StatusBadge status={register.status} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            <div className="dashboard-grid dashboard-grid--half">
              <Card
                title="Recent Receipts"
                badge={<ReceiptIcon />}
                description="Latest receipts for the organization or selected register"
              >
                <div className="dashboard-filter">
                  <Select
                    label="Cash Register"
                    value={registerId}
                    onChange={(event) => setRegisterId(event.target.value)}
                    options={[
                      { label: 'All organization registers', value: '' },
                      ...registers.map((register) => ({ label: register.name, value: register.id })),
                    ]}
                  />
                </div>
                {receipts.length === 0 ? (
                  <p className="dashboard-empty-inline">No receipts found.</p>
                ) : (
                  <div className="dashboard-table-wrap dashboard-scroll--receipts">
                    <table className="dashboard-table">
                      <thead><tr><th>Receipt</th><th>Receipt UUID</th><th>Amount</th><th>Status</th><th>Sequence</th></tr></thead>
                      <tbody>
                        {receipts.map((receipt) => (
                          <tr key={receipt.id}>
                            <td>{receipt.receipt_number}</td>
                            <td><code className="dashboard-receipt-id">{receipt.id}</code></td>
                            <td>{formatEuro(receipt.amount_cents)}</td>
                            <td><StatusBadge status={receipt.status} size="sm" /></td>
                            <td>{receipt.sequence_number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card
                title="Recent Audit Events"
                badge={<AuditIcon />}
                description="Newest organization audit events"
              >
                {auditEvents.length === 0 ? (
                  <p className="dashboard-empty-inline">No audit events found.</p>
                ) : (
                  <div className="dashboard-list dashboard-scroll--audit">
                    {auditEvents.map((event) => (
                      <div className="dashboard-list-item" key={event.id}>
                        <div>
                          <strong>{event.event_type}</strong>
                          <span>{formatDate(event.created_at)}</span>
                        </div>
                        <StatusBadge status={event.event_type.includes('SIGNED') ? 'SIGNED' : 'CREATED'} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card
              title="End-to-End Fiscalization"
              badge={<ReceiptIcon />}
              description="Create, sign, and verify one receipt through the existing n8n workflows"
            >
              <form onSubmit={handleFiscalize} className="dashboard-fiscal-form">
                <div className="dashboard-fiscal-fields">
                  <Select
                    label="Cash Register"
                    value={registerId}
                    onChange={(event) => setRegisterId(event.target.value)}
                    required
                    options={[
                      { label: 'Select a cash register', value: '' },
                      ...registers.map((register) => ({ label: register.name, value: register.id })),
                    ]}
                  />
                  <Input
                    label="Receipt Number"
                    value={receiptNumber}
                    onChange={(event) => setReceiptNumber(event.target.value)}
                    required
                  />
                  <Input
                    label="Gross Amount (EUR)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={grossAmountEuros}
                    onChange={(event) => setGrossAmountEuros(event.target.value)}
                    helperText="Enter the total amount including VAT in euros."
                    required
                  />
                  <Input
                    label="VAT Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={vatRate}
                    onChange={(event) => setVatRate(Number(event.target.value))}
                    required
                  />
                </div>

                <div className="dashboard-vat-summary">
                  <div><span>Gross</span><strong>{grossCents === null ? '—' : formatEuro(grossCents)}</strong></div>
                  <div><span>VAT {vatRate}%</span><strong>{formatEuro(vatCents)}</strong></div>
                  <div><span>Net</span><strong>{formatEuro(netCents)}</strong></div>
                </div>

                {fiscalResult && (
                  <div className="dashboard-fiscal-result">
                    {fiscalResult.status === 'SUCCESS'
                      ? <Alert type="success" title="Fiscalization completed successfully">All required steps succeeded.</Alert>
                      : <Alert type="error" title="Fiscalization did not complete">{String(fiscalResult.message || fiscalResult.error || 'The fiscalization process failed.')}</Alert>}

                    <div className="dashboard-process-grid">
                      <div className={resultCreated ? 'is-success' : 'is-pending'}>
                        {resultCreated ? <CheckCircleIcon /> : <XCircleIcon />}
                        <div><strong>Receipt created</strong><span>{resultCreated ? 'Succeeded' : 'Not completed'}</span></div>
                      </div>
                      <div className={resultSigned ? 'is-success' : 'is-pending'}>
                        {resultSigned ? <CheckCircleIcon /> : <XCircleIcon />}
                        <div><strong>Receipt signed</strong><span>{resultSigned ? 'Succeeded' : 'Not completed'}</span></div>
                      </div>
                      <div className={resultVerified ? 'is-success' : 'is-pending'}>
                        {resultVerified ? <CheckCircleIcon /> : <XCircleIcon />}
                        <div><strong>Receipt verified</strong><span>{resultVerified ? 'Succeeded' : 'Not completed'}</span></div>
                      </div>
                    </div>

                    {(Boolean(fiscalResult.receipt_id) || Boolean(fiscalResult.receipt_number) || fiscalResult.sequence_number !== undefined) && (
                      <div className="dashboard-result-details">
                        {Boolean(fiscalResult.receipt_id) && <div><span>Receipt UUID</span><code>{String(fiscalResult.receipt_id)}</code></div>}
                        {Boolean(fiscalResult.receipt_number) && <div><span>Receipt number</span><strong>{String(fiscalResult.receipt_number)}</strong></div>}
                        {fiscalResult.sequence_number !== undefined && <div><span>Sequence</span><strong>{String(fiscalResult.sequence_number)}</strong></div>}
                        {Boolean(fiscalResult.hash) && <div><span>Hash</span><code>{String(fiscalResult.hash)}</code></div>}
                        {Boolean(fiscalResult.signature) && <div><span>Signature</span><code>{String(fiscalResult.signature)}</code></div>}
                        {Boolean(fiscalResult.signing_error) && (
                          <div>
                            <span>Signing error</span>
                            <strong>{String(fiscalResult.signing_error)}</strong>
                          </div>
                        )}
                        {Boolean(fiscalResult.verification_error) && (
                          <div>
                            <span>Verification error</span>
                            <strong>{String(fiscalResult.verification_error)}</strong>
                          </div>
                        )}
                        {Boolean(fiscalResult.checks) && <div><span>Verification checks</span><code>{JSON.stringify(fiscalResult.checks)}</code></div>}
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" isLoading={fiscalLoading} disabled={fiscalLoading || !organizationId || !registerId} leftIcon={fiscalLoading ? undefined : <ReceiptIcon />}>
                  {fiscalLoading ? 'Fiscalizing...' : 'Create, Sign & Verify'}
                </Button>
              </form>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}
