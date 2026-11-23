/**
 * Server-side n8n API Client
 * 
 * Proxies calls from Next.js Route Handlers to the local n8n webhooks.
 * Never import this file into Client Components.
 */

const N8N_API_BASE_URL = process.env.N8N_API_BASE_URL || 'http://localhost:5678/webhook';
const N8N_WF07_RECEIPT_URL = process.env.N8N_WF07_RECEIPT_URL || `${N8N_API_BASE_URL}/api/receipts/:id`;
const N8N_WF07_REGISTER_RECEIPTS_URL = process.env.N8N_WF07_REGISTER_RECEIPTS_URL || `${N8N_API_BASE_URL}/api/registers/:id/receipts`;
const N8N_WF08_AUDIT_LIST_URL = process.env.N8N_WF08_AUDIT_LIST_URL || `${N8N_API_BASE_URL}/api/audit`;
const N8N_WF08_AUDIT_EVENT_URL = process.env.N8N_WF08_AUDIT_EVENT_URL || `${N8N_API_BASE_URL}/api/audit/events/:id`;
const N8N_WF11_ERRORS_URL = process.env.N8N_WF11_ERRORS_URL || `${N8N_API_BASE_URL}/api/errors`;

export class N8nClientError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number = 500, data: unknown = null) {
    super(message);
    this.name = 'N8nClientError';
    this.status = status;
    this.data = data;
  }
}

async function requestN8n<T>(url: string, options: RequestInit = {}): Promise<{ status: number; body: T }> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new N8nClientError(
      `Unable to reach n8n service at ${url}. Ensure n8n is running in Docker. Details: ${errorMsg}`,
      503
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let body: unknown = null;
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    const text = await response.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body: body as T };
}

export const n8nClient = {
  // 1. Create Organization (WF-01)
  async createOrganization(payload: { name: string; country: 'AT' | 'DE' }) {
    const url = `${N8N_API_BASE_URL}/api/organizations`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 2. Create Signing Unit (WF-02)
  async createSigningUnit(payload: { organization_id: string; name: string }) {
    const url = `${N8N_API_BASE_URL}/api/signing-units`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. Create Cash Register (WF-03)
  async createRegister(payload: { organization_id: string; signing_unit_id: string; name: string }) {
    const url = `${N8N_API_BASE_URL}/api/registers`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 4. Submit Receipt (WF-04)
  async submitReceipt(payload: {
    register_id: string;
    receipt_number: string;
    amount_cents: number;
    vat_breakdown: Array<{ rate: number; net_cents: number; vat_cents: number }>;
  }) {
    const url = `${N8N_API_BASE_URL}/api/receipts`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 5. Sign Receipt (WF-05)
  async signReceipt(receiptId: string) {
    const url = `${N8N_API_BASE_URL}/api/receipts/sign`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify({ receipt_id: receiptId }),
    });
  },

  // 6. Verify Receipt (WF-06)
  async verifyReceipt(receiptId: string) {
    const url = `${N8N_API_BASE_URL}/api/receipts/verify`;
    return requestN8n(url, {
      method: 'POST',
      body: JSON.stringify({ receipt_id: receiptId }),
    });
  },

  // 7. Retrieve Receipt by ID (WF-07 Dynamic)
  async getReceipt(receiptId: string) {
    const url = N8N_WF07_RECEIPT_URL.replace(':id', encodeURIComponent(receiptId));
    return requestN8n(url, { method: 'GET' });
  },

  // 8. Retrieve Receipts for Register (WF-07 Dynamic)
  async getRegisterReceipts(registerId: string) {
    const url = N8N_WF07_REGISTER_RECEIPTS_URL.replace(':id', encodeURIComponent(registerId));
    return requestN8n(url, { method: 'GET' });
  },

  // 9. Retrieve Audit Events for Organization (WF-08 Static/Configured)
  async getAuditEvents(organizationId: string) {
    const separator = N8N_WF08_AUDIT_LIST_URL.includes('?') ? '&' : '?';
    const url = `${N8N_WF08_AUDIT_LIST_URL}${separator}organization_id=${encodeURIComponent(organizationId)}`;
    return requestN8n(url, { method: 'GET' });
  },

  // 10. Retrieve Individual Audit Event (WF-08 Dynamic)
  async getAuditEvent(auditEventId: string) {
    const url = N8N_WF08_AUDIT_EVENT_URL.replace(':id', encodeURIComponent(auditEventId));
    return requestN8n(url, { method: 'GET' });
  },

  // 11. Retrieve captured application errors (WF-11)
  async getErrors() {
    return requestN8n(N8N_WF11_ERRORS_URL, { method: 'GET' });
  },

  // 11. Export Register Receipts (WF-09)
  async exportRegister(registerId: string) {
    const url = `${N8N_API_BASE_URL}/api/registers/export?register_id=${encodeURIComponent(registerId)}`;
    return requestN8n(url, { method: 'GET' });
  },

  // 12. Check Register Integrity (WF-10)
  async checkRegisterIntegrity(registerId: string) {
    const url = `${N8N_API_BASE_URL}/api/registers/integrity-check?register_id=${encodeURIComponent(registerId)}`;
    return requestN8n(url, { method: 'GET' });
  },
};
