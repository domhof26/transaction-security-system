'use client';

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { apiClient } from '@/lib/api-client';
import { Organization } from '@/types';
import { OrganizationIcon, CopyIcon, CheckIcon } from '@/components/icons/Icons';

export default function OrganizationsPage() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState<'AT' | 'DE'>('AT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<Organization | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (name.trim().length < 2) {
      setError('Organization name must contain at least 2 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createOrganization({
        name: name.trim(),
        country,
      });

      if (!response.success && response.status !== 201) {
        setError(response.message || response.error || 'Failed to create organization.');
      } else {
        // WF-01 responds with 201 and the inserted organization record
        const createdOrg = (response.data || response) as unknown as Organization;
        setSuccessResult(createdOrg);
        setName('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrgId = () => {
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
          eyebrow="Modules / Organizations"
          title="Organizations"
          description="Create merchant organizations representing business entities subject to fiscalization."
          icon={<OrganizationIcon />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creation Form */}
          <div className="lg:col-span-5">
            <Card
              title="Create Organization"
              description="Register a new legal entity for the simulator"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Organization Name"
                  placeholder="e.g. Demo Merchant Vienna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  helperText="Minimum 2 characters required."
                />

                <Select
                  label="Country of Operation"
                  value={country}
                  onChange={(e) => setCountry(e.target.value as 'AT' | 'DE')}
                  options={[
                    { label: 'Austria (AT) - RKSV Mode', value: 'AT' },
                    { label: 'Germany (DE) - KassenSichV Mode', value: 'DE' },
                  ]}
                  helperText="Supported country codes in current schema: AT, DE."
                />

                {error && (
                  <Alert type="error" title="Submission Error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading || name.trim().length < 2}
                >
                  Create Organization
                </Button>
              </form>
            </Card>
          </div>

          {/* Result View */}
          <div className="lg:col-span-7">
            {successResult ? (
              <Card
                title="Organization Created Successfully"
                description="Save the organization ID to configure signing units and registers"
                badge={<StatusBadge status={successResult.country} size="sm" />}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Organization ID (UUID)
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-blue-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 flex-1 break-all select-all">
                          {successResult.id}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyOrgId}
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
                        <span className="text-slate-400 block text-[11px]">Country:</span>
                        <span className="text-slate-100 font-medium">{successResult.country}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Created At:</span>
                        <span className="text-slate-300 font-mono text-[11px]">
                          {successResult.created_at || new Date().toISOString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <JsonViewer data={successResult} title="Backend Organization Response" />
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-300">No Organization Selected</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Submit the form on the left to create an organization. The returned record and ID
                    will appear here.
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
