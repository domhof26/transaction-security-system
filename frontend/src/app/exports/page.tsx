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
import { ReceiptExportData } from '@/types';
import { ExportIcon } from '@/components/icons/Icons';

export default function ExportsPage() {
  const [registerId, setRegisterId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<ReceiptExportData | null>(null);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExportData(null);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(registerId.trim())) {
      setError('A valid register_id UUID is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.exportRegister(registerId.trim());
      if (!response.success && response.status !== 200) {
        setError(response.message || response.error || 'Failed to export register receipt data.');
      } else {
        const data = (response.export || (response as unknown as { export: ReceiptExportData }).export) as ReceiptExportData;
        setExportData(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during export.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `register-${exportData.register?.id || registerId}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modules / Exports"
          title="Receipt Exports"
          description="Export sequential transaction records and cryptographic audit metadata for external tax compliance verification."
          icon={<ExportIcon />}
        />

        <Alert type="info" title="Export Specification">
          The export endpoint (<code>GET /api/registers/export?register_id=UUID</code>) returns up to{' '}
          <strong>1,000 receipts</strong> ordered by sequence number ascending in structured JSON format.
          The browser provides the capability to save this data as a <code>.json</code> file.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Export Query Form */}
          <div className="lg:col-span-5 space-y-4">
            <Card
              title="Generate Register Export"
              description="Queries receipts, signatures, and hash chains for a register"
            >
              <form onSubmit={handleExport} className="space-y-4">
                <Input
                  label="Cash Register ID (UUID)"
                  placeholder="e.g. e08d9510-9b48-4e44-8cb5-..."
                  value={registerId}
                  onChange={(e) => setRegisterId(e.target.value)}
                  required
                  helperText="The UUID of the cash register to export."
                />

                {error && (
                  <Alert type="error" title="Export Error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading || !registerId.trim()}
                >
                  Generate JSON Export
                </Button>
              </form>
            </Card>
          </div>

          {/* Export Result & Download */}
          <div className="lg:col-span-7">
            {exportData ? (
              <Card
                title="Export Generated Successfully"
                description={`Version ${exportData.version || 1} • Format: ${exportData.format || 'JSON'}`}
                actions={
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleDownload}
                    leftIcon={<ExportIcon className="w-4 h-4" />}
                  >
                    Download .JSON File
                  </Button>
                }
              >
                <div className="space-y-4">
                  {/* Metadata Summary */}
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Register Name:</span>
                      <span className="text-slate-100 font-semibold">
                        {exportData.register?.name || 'Unknown Register'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Receipts Exported:</span>
                      <span className="text-emerald-400 font-semibold font-mono text-sm">
                        {exportData.receipt_count ?? exportData.receipts?.length ?? 0}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Register UUID:</span>
                      <code className="text-slate-300 font-mono text-[11px] truncate block">
                        {exportData.register?.id}
                      </code>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Generated At:</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {exportData.generated_at}
                      </span>
                    </div>
                  </div>

                  <JsonViewer data={exportData} title="Export Payload Preview" />
                </div>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center">
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-sm font-semibold text-slate-300">Ready to Export</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Provide a cash register UUID to generate and download a compliant JSON export of its
                    transaction chain.
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
