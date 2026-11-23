# Internal API and n8n Integration

The browser communicates with Next.js route handlers under `/api`. Route handlers forward supported operations to n8n webhooks on the server. Supabase-backed read routes are also handled server-side.

## Next.js route handlers

| Route | Methods | Backend |
|---|---|---|
| `/api/organizations` | GET, POST | Supabase read; n8n create |
| `/api/signing-units` | POST | n8n |
| `/api/registers` | POST | n8n |
| `/api/fiscalize` | POST | Orchestrates submit, sign, verify, and audit |
| `/api/receipts` | POST | n8n |
| `/api/receipts/sign` | POST | n8n |
| `/api/receipts/verify` | POST | n8n |
| `/api/receipts/[id]` | GET | n8n |
| `/api/registers/[id]/receipts` | GET | n8n |
| `/api/registers/export` | GET | n8n |
| `/api/registers/integrity-check` | GET | n8n |
| `/api/audit` | GET | n8n |
| `/api/audit/events/[id]` | GET | n8n |
| `/api/errors` | GET | n8n |

## Example fiscalization request

```json
{
  "organization_id": "00000000-0000-0000-0000-000000000000",
  "register_id": "00000000-0000-0000-0000-000000000000",
  "receipt_number": "INV-0001",
  "amount_cents": 1999,
  "vat_rate": 20
}
```

This endpoint computes gross/net/VAT fields, submits the receipt, signs it, verifies it, and writes orchestration audit events.

