# DASHBOARD_SPEC.md

## 1. Project Purpose

Build a local web dashboard for the educational fiscalization simulator.

The dashboard is the user interface for the existing n8n workflows. It allows a user to manage the demo environment, submit and sign receipts, verify receipts, inspect audit events, export receipt data, and run register integrity checks.

This is an educational simulator inspired by fiskaly SIGN AT.

**Important limitations:**
- This is not a certified fiscalization system.
- Signing is a deterministic mock implementation.
- There is no real RKSV compliance, FinanzOnline integration, or certified Secure Cryptographic Unit (SCU).
- The application is local-only and does not require authentication or user management.

## 2. Implementation Principles

1. Build the dashboard around the existing n8n API capabilities.
2. Do not expand the backend as part of the initial dashboard implementation.
3. Do not connect the frontend directly to Supabase.
4. Do not implement business logic, receipt signing, sequence allocation, or verification in Next.js.
5. All operations must use the existing n8n HTTP endpoints.
6. Do not invent API endpoints or assume unavailable data can be retrieved.
7. Clearly communicate unavailable functionality in the interface.
8. Keep the application simple and understandable for someone learning how a fiscalization system works.

## 3. Technology, Configuration, and API Access

Use:
- Next.js
- TypeScript
- The existing project design instructions in `design.md`
- `DATA_MODEL.md`
- `ARCHITECTURE.md`
- The existing n8n API workflows

Antigravity must inspect the repository before implementation and follow the existing project conventions.

### API access architecture

Use Next.js Route Handlers as a server-side proxy between the browser and n8n.

The browser should call internal Next.js API routes. Those routes forward requests to the existing n8n webhooks.

The n8n base URL and webhook configuration must remain server-side environment variables. Do not expose them through `NEXT_PUBLIC_` variables.

This approach avoids direct browser-to-n8n CORS dependencies and keeps backend configuration out of client-side code.

Suggested environment configuration:

```env
N8N_API_BASE_URL=http://localhost:5678/webhook

# Dynamic webhook node IDs used by WF-07 and WF-08
N8N_WF07_RECEIPT_WEBHOOK_ID=
N8N_WF07_REGISTER_RECEIPTS_WEBHOOK_ID=
N8N_WF08_AUDIT_EVENT_WEBHOOK_ID=
```

Static webhook endpoints use the base URL directly.

Dynamic webhook endpoints require the relevant webhook node ID in the production URL. Their URL patterns are:

```text
GET /webhook/{WF07_RECEIPT_WEBHOOK_ID}/api/receipts/{receipt_id}

GET /webhook/{WF07_REGISTER_RECEIPTS_WEBHOOK_ID}/api/registers/{register_id}/receipts

GET /webhook/{WF08_AUDIT_EVENT_WEBHOOK_ID}/api/audit/events/{audit_event_id}
```

The actual node IDs must be read from the existing n8n workflows and entered in the environment configuration. Do not invent or guess these IDs.

Static endpoints do not include the webhook node ID:

```text
POST /webhook/api/organizations
POST /webhook/api/signing-units
POST /webhook/api/registers
POST /webhook/api/receipts
POST /webhook/api/receipts/sign
POST /webhook/api/receipts/verify

GET /webhook/api/audit?organization_id={organization_id}
GET /webhook/api/registers/export?register_id={register_id}
GET /webhook/api/registers/integrity-check?register_id={register_id}
```

Do not expose Supabase credentials or service-role keys to the browser.

## 4. Application Navigation

Create a dashboard layout with a sidebar and a main content area.

Use these canonical navigation names:

1. Overview
2. Organizations
3. Signing Units
4. Cash Registers
5. Receipts
6. Audit Log
7. Exports
8. Integrity Checks
9. Error Monitoring

Keep navigation consistent across all pages.

## 5. Page Specifications

### 5.1 Overview

Purpose: Provide a starting point and quick access to the simulator's main operations.

Show:
- Application name and educational-simulator context.
- Short explanation of the system.
- Quick links to create an organization, signing unit, or cash register.
- Quick links to submit a receipt, inspect audit events, and run an integrity check.
- A section explaining the available system capabilities.

Do not display invented counts for organizations, registers, receipts, or errors.

The existing backend does not currently provide all the list/count endpoints needed for dashboard statistics. Do not add backend endpoints to solve this in the initial implementation.

Use this page as an operational landing page with navigation and quick actions.

### 5.2 Organizations

Purpose: Create organizations.

Existing API:

`POST /api/organizations`

Request body:

```json
{
  "name": "Demo Merchant Vienna",
  "country": "AT"
}
```

Requirements:
- Provide a form to create an organization.
- Fields: organization name and country.
- Country options: AT and DE.
- Validate required fields.
- Display success or error feedback.
- Display the returned organization details after successful creation.

There is currently no organization listing endpoint.

Do not create a fake organization table or assume that organizations can be retrieved from the backend.

### 5.3 Signing Units

Purpose: Create mock signing units.

Existing API:

`POST /api/signing-units`

Request body:

```json
{
  "organization_id": "UUID",
  "name": "Demo Mock Signing Unit"
}
```

Requirements:
- Provide a form to create a signing unit.
- Fields: organization ID and signing unit name.
- Explain that the signing unit belongs to an organization.
- Display returned signing unit details after successful creation.
- Make clear that the current provider is MOCK.

There is currently no signing unit listing endpoint.

Do not assume the dashboard can retrieve existing organizations or signing units automatically. For the initial implementation, organization IDs can be entered manually or reused from details returned by successful creation operations.

### 5.4 Cash Registers

Purpose: Create cash registers associated with an organization and signing unit.

Existing API:

`POST /api/registers`

Request body:

```json
{
  "organization_id": "UUID",
  "signing_unit_id": "UUID",
  "name": "Register 001"
}
```

Requirements:
- Provide a creation form.
- Fields: organization ID, signing unit ID, register name.
- Explain that a register belongs to an organization and is associated with a signing unit.
- Explain that multiple registers may share the same signing unit.
- Display the returned register details after successful creation.

There is currently no register listing endpoint.

Do not implement a fake register list or assume that the frontend can retrieve existing registers.

### 5.5 Receipts

Purpose: Submit, sign, verify, and retrieve receipts.

#### Submit a receipt

Existing API:

`POST /api/receipts`

Request body:

```json
{
  "register_id": "UUID",
  "receipt_number": "INV-0003",
  "amount_cents": 1999,
  "vat_breakdown": [
    {
      "rate": 20,
      "net_cents": 1666,
      "vat_cents": 333
    }
  ]
}
```

Requirements:
- Provide a receipt submission form.
- Fields: register ID, receipt number, total amount in cents, VAT breakdown.
- Allow the user to add VAT breakdown entries.
- Clearly label amounts as cents.
- Display the returned receipt details after successful submission.
- Explain that the receipt is initially created with PENDING status.

#### Sign a receipt

Existing API:

`POST /api/receipts/sign`

Request body:

```json
{
  "receipt_id": "UUID"
}
```

Requirements:
- Allow the user to enter a receipt ID.
- Provide a Sign Receipt action.
- Display the signing result.
- Show receipt status, hash, signature, previous hash, and key ID when returned.
- Display whether the receipt was already signed.
- Explain that signing uses the mock signing implementation.

#### Verify a receipt

Existing API:

`POST /api/receipts/verify`

Request body:

```json
{
  "receipt_id": "UUID"
}
```

Requirements:
- Allow the user to enter a receipt ID.
- Provide a Verify Receipt action.
- Display whether the receipt is valid.
- Display individual verification checks when available:
  - Receipt hash
  - Signature
  - Hash-chain link
- Clearly distinguish an invalid receipt from an API request failure.

#### Retrieve a receipt

Existing API:

`GET /api/receipts/:id`

Requirements:
- Allow the user to enter a receipt ID.
- Retrieve and display the receipt.
- Present receipt fields in a readable detail view.
- Use the dynamic webhook URL configuration described in section 3.

#### Retrieve receipts for a register

Existing API:

`GET /api/registers/:id/receipts`

Requirements:
- Allow the user to enter a register ID.
- Display the returned receipts in a table.
- Show receipt number, sequence number, amount, currency, status, and creation time where available.
- Allow the user to open individual receipt details.
- Explain that the endpoint returns the latest 50 receipts.
- Use the dynamic webhook URL configuration described in section 3.

### 5.6 Audit Log

Purpose: Inspect recorded system events.

Existing APIs:

`GET /api/audit?organization_id=UUID`

`GET /api/audit/events/:id`

Requirements:
- Provide a field to enter an organization ID.
- Retrieve and display the latest audit events.
- Show event type, creation time, receipt ID, register ID, and other available event details.
- Allow the user to inspect an individual audit event by ID.
- Display event payloads in a readable JSON viewer or expandable detail section.
- Use the dynamic webhook URL configuration described in section 3 for individual event retrieval.

The audit endpoint currently returns the latest 100 events.

Do not assume filtering by event type, register, or date is supported by the backend.

### 5.7 Exports

Purpose: Retrieve a register's receipt data in JSON format.

Existing API:

`GET /api/registers/export?register_id=UUID`

Requirements:
- Provide a field for register ID.
- Provide an Export action.
- Display the returned export metadata and receipt count.
- Display the exported receipt data in a readable JSON view.
- Allow the user to download the returned JSON as a `.json` file.
- Clearly communicate that the backend currently limits the export to 1,000 receipts.

The existing endpoint returns JSON. The frontend is responsible for offering a browser download.

### 5.8 Integrity Checks

Purpose: Check the integrity of all receipts associated with a register.

Existing API:

`GET /api/registers/integrity-check?register_id=UUID`

Requirements:
- Provide a field for register ID.
- Provide a Run Integrity Check action.
- Display the overall result clearly.
- Display:
  - Number of receipts checked
  - Number of valid receipts
  - Number of invalid receipts
  - Individual receipt results
- Allow the user to expand individual receipt checks.
- Explain that receipts which are not SIGNED, including PENDING receipts, are reported as invalid by the current integrity-check implementation.
- Explain that this operation checks the register's receipt chain.

Do not perform verification calculations in the frontend. Display the results returned by the backend.

### 5.9 Error Monitoring

Purpose: Explain the simulator's error-monitoring capabilities.

Current implementation:
- Validation errors are recorded in the n8n Data Table `fiscal_application_errors` for selected workflow validation branches.
- Unexpected technical errors are recorded by the global n8n Error Workflow.

There is currently no HTTP endpoint for retrieving these error records.

Requirements:
- Explain the difference between validation errors and technical errors.
- Explain that errors are stored in n8n.
- Do not invent or simulate an error list.
- Do not access the n8n Data Table directly from the frontend.
- Show a clear message that viewing stored error records in the dashboard is not yet supported.

This page is informational only in the initial implementation.

## 6. API Integration

Use Next.js Route Handlers as the server-side API proxy.

Suggested structure:

```text
src/
  app/
    api/
      organizations/
        route.ts
      signing-units/
        route.ts
      registers/
        route.ts
      receipts/
        route.ts
      audit/
        route.ts
      exports/
        route.ts
      integrity/
        route.ts
  lib/
    api/
      client.ts
      organizations.ts
      signing-units.ts
      registers.ts
      receipts.ts
      audit.ts
      exports.ts
      integrity.ts
```

The exact internal route structure may be adjusted to fit the existing Next.js project.

Requirements:
- Browser components call internal Next.js API routes.
- Route Handlers forward requests to the configured n8n endpoints.
- Keep n8n configuration server-side.
- Centralize HTTP requests and response handling.
- Handle JSON request and response bodies.
- Handle HTTP error responses.
- Display meaningful error messages to the user.
- Handle network failures and unavailable n8n services.
- Avoid duplicating request logic in page components.
- Keep API response handling consistent.
- Preserve relevant HTTP status codes and error information from n8n.
- Do not assume every endpoint returns the same response structure. Inspect the actual workflow response structures and handle them appropriately.

Do not implement business logic or duplicate database operations in the Next.js proxy.

The proxy should only forward requests and responses.

## 7. UI and UX Requirements

Follow `design.md` for colors, visual style, and design direction.

General requirements:
- Clean, professional administrative dashboard.
- Responsive layout.
- Consistent spacing and typography.
- Clear page titles and section descriptions.
- Readable data tables.
- Forms with labels and validation feedback.
- Confirmation and success messages after actions.
- Loading indicators during API requests.
- Useful empty states.
- Useful error states.
- Expandable JSON details for technical data.
- Avoid unnecessary visual complexity.

Provide status indicators for all relevant states defined in the data model:

- INITIALIZED
- ACTIVE
- SUSPENDED
- DISABLED
- CREATED
- PENDING
- PROCESSING
- SIGNED
- FAILED
- VALID
- INVALID

Only display a status when the corresponding value is actually returned by the backend. Do not assume every entity supports every status.

## 8. Important Domain Concepts

The interface should communicate the following relationships:

- An organization represents a merchant or business.
- An organization can have multiple cash registers.
- An organization can have multiple signing units.
- Each cash register is associated with a signing unit.
- One signing unit can be shared by multiple cash registers.
- A receipt belongs to one cash register.
- Receipts are assigned sequence numbers and signed in order.
- Each signed receipt contains a hash and a mock signature.
- The previous receipt hash is used to form a hash chain.

Use these concepts consistently in labels, help text, and page descriptions.

## 9. Out of Scope for Initial Dashboard

Do not implement:
- Authentication or user management.
- Role-based access control.
- Direct Supabase access.
- New backend endpoints.
- Real cryptographic signing.
- Real RKSV compliance.
- FinanzOnline integration.
- Certified SCU integration.
- Receipt cancellation or correction.
- Idempotency management.
- Dashboard error-log retrieval.
- Organization, signing-unit, or register listing functionality that requires new APIs.
- Dashboard statistics that require unavailable backend data.

These capabilities can be reconsidered after the initial dashboard is implemented and tested.

## 10. Implementation Order

Build in this order:

1. Inspect the repository and existing documentation.
2. Review `design.md`.
3. Verify the existing n8n webhook paths and dynamic webhook node IDs.
4. Set up the dashboard layout and navigation.
5. Implement the server-side API proxy using Next.js Route Handlers.
6. Implement the centralized API client.
7. Implement Organizations.
8. Implement Signing Units.
9. Implement Cash Registers.
10. Implement Receipts.
11. Implement Audit Log.
12. Implement Exports.
13. Implement Integrity Checks.
14. Implement the Overview landing page.
15. Add the Error Monitoring explanation page.
16. Test all available operations against the existing n8n endpoints.
17. Check responsive behavior and error handling.

## 11. Definition of Done

The initial dashboard is complete when:

- The application starts locally.
- Navigation works.
- The UI follows `design.md`.
- All existing API operations listed in this document are integrated.
- Users can create organizations, signing units, and cash registers.
- Users can submit, sign, verify, and retrieve receipts.
- Users can inspect audit events.
- Users can retrieve and download JSON exports.
- Users can run register integrity checks.
- API failures and validation errors are displayed clearly.
- No data is fabricated to fill missing functionality.
- n8n configuration remains server-side.
- No new backend endpoints are required for the initial implementation.

After the dashboard is working, review the actual user experience and decide which additional backend endpoints would provide the greatest value.