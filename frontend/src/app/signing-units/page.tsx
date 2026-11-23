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
import { SigningUnit } from '@/types';
import { SigningUnitIcon, CopyIcon, CheckIcon } from '@/components/icons/Icons';

export default function SigningUnitsPage() {
  const [organizationId, setOrganizationId] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<SigningUnit | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(organizationId.trim())) {
      setError('A valid organization_id UUID is required.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Signing unit name must contain at least 2 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createSigningUnit({
        organization_id: organizationId.trim(),
        name: name.trim(),
      });

      if (!response.success && response.status !== 201) {
        setError(response.message || response.error || 'Failed to create signing unit.');
      } else {
        const createdUnit = (response.data || response) as unknown as SigningUnit;
        setSuccessResult(createdUnit);
        setName('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyUnitId = () => {
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
          eyebrow="Modules / Signing"
          title="Signing Units"
          description="Create simulated cryptographic signing resources (Secure Cryptographic Units) for an organization."
          icon={<SigningUnitIcon />}
        />

        <Alert type="info" title="Mock Provider Architecture">
          Signing units in this simulator use the <strong>MOCK</strong> provider with key ID{' '}
          <code className="text-blue-300 font-mono">demo-public-key-001</code>. They simulate RKSV
          signing without requiring physical smartcards or hardware security modules (HSMs).
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-5">
            <Card
              title="Create Signing Unit"
              description="Provisions an ACTIVE mock signing unit for an organization"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Organization ID (UUID)"
                  placeholder="e.g. 1b8d2a65-3ef1-4b10-8b09-..."
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required
                  helperText="Enter the UUID of an existing organization."
                />

                <Input
                  label="Signing Unit Name"
                  placeholder="e.g. Vienna HQ Mock SCU"
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
                    <span>Provider Type:</span>
                    <StatusBadge status="MOCK" size="sm" />
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
                  disabled={isLoading || !organizationId.trim() || name.trim().length < 2}
                >
                  Create Signing Unit
                </Button>
              </form>
            </Card>
          </div>

          {/* Result View */}
          <div className="lg:col-span-7">
            {successResult ? (
              <Card
                title="Signing Unit Created Successfully"
                description="Use this signing unit ID when creating cash registers"
                badge={<StatusBadge status={successResult.status || 'ACTIVE'} size="sm" />}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Signing Unit ID (UUID)
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-purple-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 flex-1 break-all select-all">
                          {successResult.id}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyUnitId}
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
                        <span className="text-slate-400 block text-[11px]">Provider:</span>
                        <span className="text-slate-100 font-medium">
                          {successResult.provider_type || 'MOCK'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Public Key ID:</span>
                        <code className="text-slate-300 font-mono text-[11px]">
                          {successResult.public_key_id || 'demo-public-key-001'}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Organization ID:</span>
                        <span className="text-slate-300 font-mono text-[11px] truncate block">
                          {successResult.organization_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <JsonViewer data={successResult} title="Backend Signing Unit Response" />
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-300">No Signing Unit Created</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter an Organization UUID and unit name on the left to initialize a signing unit.
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
