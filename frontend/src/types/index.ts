/**
 * Domain & API Types for Fiscalization Simulator
 */

export type CountryCode = 'AT' | 'DE';

export type SigningUnitStatus = 'INITIALIZED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type CashRegisterStatus = 'CREATED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type ReceiptStatus = 'PENDING' | 'PROCESSING' | 'SIGNED' | 'FAILED';
export type VerificationStatus = 'VALID' | 'INVALID';

export type DomainStatus =
  | SigningUnitStatus
  | CashRegisterStatus
  | ReceiptStatus
  | VerificationStatus;

export interface Organization {
  id: string;
  name: string;
  country: CountryCode;
  created_at: string;
  updated_at: string;
}

export interface SigningUnit {
  id: string;
  organization_id: string;
  name: string;
  status: SigningUnitStatus;
  provider_type: 'MOCK' | 'EXTERNAL';
  public_key_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashRegister {
  id: string;
  organization_id: string;
  signing_unit_id: string | null;
  name: string;
  status: CashRegisterStatus;
  last_sequence: number;
  created_at: string;
  updated_at: string;
}

export interface VatBreakdownItem {
  rate: number;
  net_cents: number;
  vat_cents: number;
}

export interface Receipt {
  id: string;
  register_id: string;
  receipt_number: string;
  sequence_number: number;
  amount_cents: number;
  currency: string;
  vat_breakdown: VatBreakdownItem[];
  receipt_payload: Record<string, unknown>;
  status: ReceiptStatus;
  signature?: string | null;
  hash?: string | null;
  previous_hash?: string | null;
  key_id?: string | null;
  created_at: string;
  signed_at?: string | null;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  organization_id: string;
  register_id?: string | null;
  receipt_id?: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ApplicationErrorRecord {
  id?: number | string;
  category: string;
  workflow_name?: string | null;
  workflow_id?: string | null;
  execution_id?: string | number | null;
  error_code?: string | null;
  error_message?: string | null;
  request_data?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface VerificationChecks {
  receipt_hash: boolean;
  signature: boolean;
  hash_chain: boolean;
}

export interface ReceiptVerificationData {
  found: boolean;
  valid: boolean;
  error?: string;
  status?: string;
  checks?: VerificationChecks;
  receipt_id?: string;
  receipt_number?: string;
  sequence_number?: number;
}

export interface RegisterIntegrityData {
  found: boolean;
  valid: boolean;
  error?: string;
  register_id?: string;
  checked_count: number;
  valid_count: number;
  invalid_count: number;
  results: ReceiptVerificationData[];
}

export interface ReceiptExportData {
  format: string;
  version: number;
  generated_at: string;
  register: {
    id: string;
    name: string;
    organization_id: string;
  };
  receipt_count: number;
  receipts: Receipt[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  count?: number;
  export?: ReceiptExportData;
  already_signed?: boolean;
}
