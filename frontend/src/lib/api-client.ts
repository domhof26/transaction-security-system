/**
 * Client-Side API Client
 * 
 * Used by browser components to talk to Next.js Route Handlers.
 */

import {
  Organization,
  SigningUnit,
  CashRegister,
  Receipt,
  AuditEvent,
  ReceiptVerificationData,
  RegisterIntegrityData,
  ReceiptExportData,
  ApiResponse,
} from '@/types';

async function fetchInternal<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      if (typeof data === 'object' && data !== null) {
        return {
          success: false,
          status: res.status,
          ...(data as Record<string, unknown>),
        } as ApiResponse<T>;
      }
      return {
        success: false,
        status: res.status,
        error: `HTTP_${res.status}`,
        message: String(data) || `Request failed with HTTP status ${res.status}`,
      };
    }

    if (typeof data === 'object' && data !== null) {
      return {
        success: true,
        status: res.status,
        ...(data as Record<string, unknown>),
      } as ApiResponse<T>;
    }

    return {
      success: true,
      status: res.status,
      data: data as T,
    };
  } catch (err: unknown) {
    return {
      success: false,
      status: 0,
      error: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Network communication error',
    };
  }
}

export const apiClient = {
  async getOrganizations() {
    return fetchInternal<Organization[]>('/api/organizations', { method: 'GET' });
  },

  async getOrganizationSigningUnits(organizationId: string) {
    return fetchInternal<SigningUnit[]>(`/api/organizations/${encodeURIComponent(organizationId)}/signing-units`, { method: 'GET' });
  },

  async getOrganizationRegisters(organizationId: string) {
    return fetchInternal<CashRegister[]>(`/api/organizations/${encodeURIComponent(organizationId)}/registers`, { method: 'GET' });
  },

  async getOrganizationReceipts(organizationId: string, registerId?: string) {
    const query = registerId ? `?register_id=${encodeURIComponent(registerId)}&limit=50` : '?limit=50';
    return fetchInternal<Receipt[]>(`/api/organizations/${encodeURIComponent(organizationId)}/receipts${query}`, { method: 'GET' });
  },

  async getOrganizationAuditEvents(organizationId: string) {
    return fetchInternal<AuditEvent[]>(`/api/organizations/${encodeURIComponent(organizationId)}/audit?limit=50`, { method: 'GET' });
  },

  async fiscalize(payload: {
    organization_id: string;
    register_id: string;
    receipt_number: string;
    amount_cents: number;
    vat_rate: number;
  }) {
    return fetchInternal<Record<string, unknown>>('/api/fiscalize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  // Organizations
  async createOrganization(payload: { name: string; country: 'AT' | 'DE' }) {
    return fetchInternal<Organization>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Signing Units
  async createSigningUnit(payload: { organization_id: string; name: string }) {
    return fetchInternal<SigningUnit>('/api/signing-units', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Cash Registers
  async createRegister(payload: { organization_id: string; signing_unit_id: string; name: string }) {
    return fetchInternal<CashRegister>('/api/registers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRegisterReceipts(registerId: string) {
    return fetchInternal<Receipt[]>(`/api/registers/${encodeURIComponent(registerId)}/receipts`, {
      method: 'GET',
    });
  },

  async exportRegister(registerId: string) {
    return fetchInternal<ReceiptExportData>(`/api/registers/export?register_id=${encodeURIComponent(registerId)}`, {
      method: 'GET',
    });
  },

  async checkRegisterIntegrity(registerId: string) {
    return fetchInternal<RegisterIntegrityData>(`/api/registers/integrity-check?register_id=${encodeURIComponent(registerId)}`, {
      method: 'GET',
    });
  },

  // Receipts
  async submitReceipt(payload: {
    register_id: string;
    receipt_number: string;
    amount_cents: number;
    vat_breakdown: Array<{ rate: number; net_cents: number; vat_cents: number }>;
  }) {
    return fetchInternal<Receipt>('/api/receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async signReceipt(receiptId: string) {
    return fetchInternal<Receipt>('/api/receipts/sign', {
      method: 'POST',
      body: JSON.stringify({ receipt_id: receiptId }),
    });
  },

  async verifyReceipt(receiptId: string) {
    return fetchInternal<ReceiptVerificationData>('/api/receipts/verify', {
      method: 'POST',
      body: JSON.stringify({ receipt_id: receiptId }),
    });
  },

  async getReceipt(receiptId: string) {
    return fetchInternal<Receipt>(`/api/receipts/${encodeURIComponent(receiptId)}`, {
      method: 'GET',
    });
  },

  // Audit
  async getAuditEvents(organizationId: string) {
    return fetchInternal<AuditEvent[]>(`/api/audit?organization_id=${encodeURIComponent(organizationId)}`, {
      method: 'GET',
    });
  },

  async getAuditEvent(auditEventId: string) {
    return fetchInternal<AuditEvent>(`/api/audit/events/${encodeURIComponent(auditEventId)}`, {
      method: 'GET',
    });
  },
};
