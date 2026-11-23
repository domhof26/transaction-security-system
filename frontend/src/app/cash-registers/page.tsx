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
import { CashRegister } from '@/types';
import { CashRegisterIcon, CopyIcon, CheckIcon } from '@/components/icons/Icons';

export default function CashRegistersPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [signingUnitId, setSigningUnitId] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<CashRegister | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (!uuidPattern.test(organizationId.trim())) {
      setError('A valid organization_id UUID is required.');
      return;
    }

    if (!uuidPattern.test(signingUnitId.trim())) {
      setError('A valid signing_unit_id UUID is required.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Cash register name must contain at least 2 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createRegister({
        organization_id: organizationId.trim(),
        signing_unit_id: signingUnitId.trim(),
        name: name.trim(),
      });

      if (!response.success && response.status !== 201) {
        setError(response.message || response.error || 'Failed to create cash register.');
      } else {
        const createdReg = (response.data || response) as unknown as CashRegister;
        setSuccessResult(createdReg);
        setName('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRegisterId = () => {
    if (successResult?.id) {
      navigator.clipboard.writeText(successResult.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modules / Registers"
          title="Cash Registers"
          description="Create and configure POS cash registers associated with an organization and signing unit."
          icon={<CashRegisterIcon />}
        />

        <Alert type="info" title="Signing Unit Sharing">
          Each register belongs to an organization and must reference a signing unit belonging to the
          same organization. <strong>Multiple cash registers may share the same signing unit</strong>.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-5">
            <Card
              title="Create Cash Register"
              description="Initializes a new register with sequence number 0"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Organization ID (UUID)"
                  placeholder="e.g. 1b8d2a65-3ef1-4b10-8b09-..."
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required
                  helperText="The owning merchant organization UUID."
                />

                <Input
                  label="Signing Unit ID (UUID)"
                  placeholder="e.g. 9f5b2c14-2ad8-4c31-9f12-..."
                  value={signingUnitId}
                  onChange={(e) => setSigningUnitId(e.target.value)}
                  required
                  helperText="Must be an ACTIVE signing unit belonging to the same organization."
                />

                <Input
                  label="Cash Register Name"
                  placeholder="e.g. Register 001 - Main Checkout"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  helperText="Minimum 2 characters required."
                />

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Initial Status:</span>
                    <StatusBadge status="ACTIVE" size="sm" />
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Initial Sequence:</span>
                    <code className="text-slate-200 font-mono">0</code>
                  </div>
                </div>

                {error && (
                  <Alert type="error" title="Creation Error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={
                    isLoading ||
                    !organizationId.trim() ||
                    !signingUnitId.trim() ||
                    name.trim().length < 2
                  }
                >
                  Create Cash Register
                </Button>
              </form>
            </Card>
          </div>

          {/* Result View */}
          <div className="lg:col-span-7">
            {successResult ? (
              <Card
                title="Cash Register Created Successfully"
                description="Save this Register ID to submit transactions and run integrity checks"
                badge={<StatusBadge status={successResult.status || 'ACTIVE'} size="sm" />}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Cash Register ID (UUID)
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-cyan-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 flex-1 break-all select-all">
                          {successResult.id}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyRegisterId}
                          title="Copy UUID"
                        >
                          {copiedId ? (
                            <>
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <CopyIcon className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Name:</span>
                        <span className="text-slate-100 font-medium">{successResult.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Last Sequence:</span>
                        <code className="text-slate-200 font-mono font-medium">
                          {successResult.last_sequence ?? 0}
                        </code>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Signing Unit ID:</span>
                        <code className="text-slate-300 font-mono text-[11px] truncate block">
                          {successResult.signing_unit_id}
                        </code>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Organization ID:</span>
                        <code className="text-slate-300 font-mono text-[11px] truncate block">
                          {successResult.organization_id}
                        </code>
                      </div>
                    </div>
                  </div>

                  <JsonViewer data={successResult} title="Backend Cash Register Response" />
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-300">No Cash Register Created</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter the Organization UUID, Signing Unit UUID, and register name to create a new POS register.
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
