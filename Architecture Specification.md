### Complete Revised `ARCHITECTURE.md`

```markdown
# Architecture Specification — Fiscalization Simulator

## 1. Purpose

This document defines the architecture of the Fiscalization Simulator, including its components, responsibilities, communication patterns, API contracts and development rules.

It is the primary technical reference for the project owner and AI coding agents, including Antigravity.

The architecture must remain consistent with:

- `DATA_MODEL.md` — domain entities and database structure.
- `ARCHITECTURE.md` — system components and their interactions.
- `DASHBOARD_SPEC.md` — frontend pages, behaviour and API integration.
- `design.md` — visual design and styling requirements.

**Core principle: The dashboard must be built against the existing backend, not against imagined or planned functionality.**

## 2. Project Scope and Environment

The application is a local-only educational fiscalization simulator inspired by fiscalization platforms such as fiskaly SIGN AT.

It demonstrates:

- Organization management.
- Signing unit management.
- Cash register management.
- POS transaction submission.
- Sequential receipt numbering.
- Mock receipt signing.
- Receipt verification.
- Hash-chain integrity checking.
- Audit history.
- Receipt export.
- Application error monitoring.

### Development environment

- Windows 11.
- Docker Desktop.
- n8n self-hosted locally in Docker.
- Supabase Cloud PostgreSQL.
- Next.js dashboard running locally.
- Git and GitHub for version control.
- Antigravity as the frontend coding agent.

### Explicitly out of scope

- User authentication.
- User registration.
- Role-based access control.
- Production deployment.
- Real Austrian RKSV certification.
- Certified Secure Cryptographic Unit (SCU).
- Real FinanzOnline integration.
- Real asymmetric digital signatures.
- Production-grade key management.

The application must clearly identify itself as a simulator. It must not claim legal or regulatory compliance.

## 3. System Architecture

The application has three primary components.

| Component | Responsibility |
|---|---|
| Supabase Cloud | Persistent database and source of truth |
| n8n | Backend API, validation, business logic and orchestration |
| Next.js | Frontend dashboard and user interface |

### Architecture overview

```text
                 LOCAL DEVELOPMENT ENVIRONMENT

              ┌──────────────────────────┐
              │       Next.js            │
              │                          │
              │ Dashboard                │
              │ Organization Management  │
              │ Signing Unit Management  │
              │ Register Management      │
              │ Receipt Management       │
              │ Audit Log                │
              │ Integrity Checks         │
              └────────────┬─────────────┘
                           │
                       HTTP / REST
                           │
              ┌────────────▼─────────────┐
              │          n8n             │
              │                          │
              │ WF-01 to WF-10           │
              │ Validation               │
              │ Business Logic           │
              │ Signing and Verification │
              │ Export and Integrity     │
              │                          │
              │ WF-11 Global Error Handler│
              └────────────┬─────────────┘
                           │
                       PostgreSQL
                           │
              ┌────────────▼─────────────┐
              │      Supabase Cloud      │
              │                          │
              │ Organizations            │
              │ Signing Units             │
              │ Cash Registers            │
              │ Receipts                  │
              │ Audit Events              │
              │ Idempotency Keys          │
              └──────────────────────────┘
```

Operational error monitoring is handled separately through an n8n Data Table.

### Component responsibilities

**Supabase Cloud**

- Stores persistent fiscalization domain data.
- Maintains entity relationships and constraints.
- Stores receipt lifecycle states.
- Stores hashes, signatures and audit events.
- Provides PostgreSQL functions for sequence allocation, signing, verification and integrity checks.

**n8n**

- Exposes HTTP webhook endpoints.
- Validates incoming requests.
- Executes business operations.
- Coordinates database operations.
- Performs mock signing and receipt verification.
- Generates receipt exports.
- Handles application-level errors.
- Records validation and technical errors.

**Next.js**

- Displays data returned by the backend.
- Provides forms for creating organizations, signing units and registers.
- Provides receipt submission and management interfaces.
- Initiates signing, verification and integrity checks.
- Displays audit history, exports and error information where supported by the API.
- Presents loading, success and error states.

Next.js must not implement fiscalization business logic independently.

## 4. Backend Architecture — n8n

The backend consists of ten application workflows and one global error workflow.

### 4.1 Implemented workflows

| Workflow | Name | Responsibility |
|---|---|---|
| WF-01 | Create Organization | Creates an organization |
| WF-02 | Create Signing Unit | Creates a signing unit |
| WF-03 | Create Cash Register | Creates a cash register |
| WF-04 | Submit Receipt | Validates and stores a receipt |
| WF-05 | Receipt Signing | Signs a pending receipt using the mock provider |
| WF-06 | Receipt Verification | Verifies a signed receipt |
| WF-07 | Receipt Retrieval | Retrieves an individual receipt or register receipts |
| WF-08 | Audit Management | Retrieves organization audit events or one audit event |
| WF-09 | Receipt Export | Generates a JSON export for a register |
| WF-10 | Integrity Check | Checks all receipts belonging to a register |
| WF-11 | Global Error Handler | Records unexpected technical workflow failures |

### 4.2 Workflow design principles

Each workflow should:

1. Receive an HTTP request or an error trigger.
2. Validate the request where applicable.
3. Execute its defined business operation.
4. Read or write the database where required.
5. Record relevant audit events where implemented.
6. Return a structured HTTP response.

Each workflow must remain independently testable.

Avoid duplicating business logic between workflows or moving backend responsibilities into the dashboard.

Do not assume that separate n8n nodes automatically execute within one atomic database transaction.

### 4.3 Global error handling

WF-11 is configured as the global Error Workflow.

It uses an Error Trigger and records technical execution failures in the n8n Data Table:

`fiscal_application_errors`

The table currently contains:

- `id`
- `category`
- `workflow_name`
- `workflow_id`
- `execution_id`
- `error_code`
- `error_message`
- `request_data`

Current categories:

- `VALIDATION`
- `TECHNICAL`

Validation failures are explicitly logged in the false branches of application workflows.

Unexpected technical failures are captured by WF-11.

Business errors returned normally by database functions must be explicitly logged in the relevant application workflow if they are to appear in the error log.

The global Error Workflow is not a substitute for application-level error handling.

## 5. Implemented REST API Specification

The following endpoints are the actual implemented API contract.

The default local n8n base URL is:

`http://localhost:5678`

Standard production webhook URLs use:

`http://localhost:5678/webhook`

Test webhook URLs use:

`http://localhost:5678/webhook-test`

**Dynamic webhook URLs:** In n8n, workflows with parameterized URL paths (specifically **WF-07** and the parameterized path route in **WF-08**) use dynamic production webhook URLs that include the relevant n8n Webhook node ID before the route path. Do not assume these endpoints share the flat `<base>/api/...` URL structure. Complete production URLs or URL templates for these endpoints are provided separately and must be configured through server-side environment variables.

Test URLs are available while the relevant webhook is listening for a test event.

Test and production webhooks use the same connected database. Test requests therefore create real database records.

### 5.1 Organization management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/organizations` | Create an organization |

Input:

- `name`
- `country` — AT or DE

The organization name must contain at least two characters.

There is currently no `GET` endpoint for listing, counting, or retrieving organizations.

### 5.2 Signing unit management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/signing-units` | Create a signing unit |

Input:

- `organization_id`
- `name`

The current workflow creates an ACTIVE signing unit with provider type MOCK and a demo key identifier.

There is currently no `GET` endpoint for listing, counting, or retrieving signing units.

### 5.3 Cash register management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/registers` | Create a cash register |

Input:

- `organization_id`
- `signing_unit_id`
- `name`

The current workflow requires a signing unit.

A new register starts with `last_sequence = 0`.

There are currently no `GET` (list, count, or retrieve) or `PATCH` endpoints for cash registers.

### 5.4 Receipt submission

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/receipts` | Submit a receipt |

Input:

- `register_id`
- `receipt_number`
- `amount_cents`
- `vat_breakdown`

Currency is currently EUR.

The backend allocates a sequence number and stores the receipt with PENDING status.

### 5.5 Receipt signing

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/receipts/sign` | Sign a receipt |

Input:

- `receipt_id`

The backend calls the PostgreSQL function `public.sign_receipt()`.

The signing operation checks register and signing unit status, receipt status and sequence order.

Successful signing stores the hash, mock signature, key identifier and predecessor hash, and creates a signing audit event.

Repeated signing of an already signed receipt is handled idempotently by the signing function.

### 5.6 Receipt verification

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/receipts/verify` | Verify a receipt |

Input:

- `receipt_id`

The backend calls `public.verify_receipt()`.

The result includes:

- Overall validity.
- Receipt hash verification.
- Mock signature verification.
- Hash-chain link verification.

This operation does not modify the receipt.

### 5.7 Receipt retrieval

| Logical Method & Path | Production Webhook Pattern | Purpose |
|---|---|---|
| `GET /api/receipts/:id` | `<N8N_HOST>/webhook/<webhook-node-id>/api/receipts/:id` | Retrieve one receipt |
| `GET /api/registers/:id/receipts` | `<N8N_HOST>/webhook/<webhook-node-id>/api/registers/:id/receipts` | Retrieve up to 50 newest receipts for a register |

The `:id` path parameter is the relevant receipt or register UUID.

Both WF-07 endpoints use dynamic production webhook URLs containing their respective n8n Webhook node IDs. The exact production URLs/templates must be supplied via server-side environment configuration rather than hardcoded or guessed.

### 5.8 Audit management

| Logical Method & Path | Production Webhook Pattern | Purpose |
|---|---|---|
| `GET /api/audit?organization_id=...` | `<N8N_API_BASE_URL>/api/audit?organization_id=...` | Retrieve up to 100 latest audit events for an organization |
| `GET /api/audit/events/:id` | `<N8N_HOST>/webhook/<webhook-node-id>/api/audit/events/:id` | Retrieve one audit event |

The organization ID is supplied as a query parameter.

The audit event ID is supplied as a path parameter. The parameterized WF-08 route (`GET /api/audit/events/:id`) uses a dynamic production webhook URL containing the relevant n8n Webhook node ID, which must be configured via server-side environment variables.

### 5.9 Receipt export

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/registers/export?register_id=...` | Generate a JSON receipt export |

The export contains up to 1,000 receipts ordered by sequence number.

The current implementation returns structured JSON in the HTTP response. It does not generate a downloadable CSV or PDF file.

### 5.10 Register integrity check

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/registers/integrity-check?register_id=...` | Check register receipt integrity |

The backend calls `public.check_register_integrity()`.

It scans the register's receipts and returns:

- Overall validity.
- Checked receipt count.
- Valid receipt count.
- Invalid receipt count.
- Individual verification results.

**Verification note:** `DASHBOARD_SPEC.md` (§5.8) specifies explaining to users that unsigned receipts are reported as invalid. Because the SQL source of `public.check_register_integrity()` is not included in these specification documents, verify in Supabase whether non-`SIGNED` receipts (including `PENDING` receipts) are explicitly returned as invalid before treating that behavior as guaranteed at the database level.

### 5.11 Error monitoring

Validation errors (for selected workflow validation branches) and unexpected technical errors (captured by WF-11) are stored in the n8n Data Table `fiscal_application_errors`.

There is currently no HTTP read endpoint for retrieving application errors.

The `fiscal_application_errors` table is an n8n Data Table, not a Supabase PostgreSQL table.

The initial dashboard can explain the error-monitoring mechanism, but cannot display stored error records. If the dashboard is to display error records in the future, a dedicated read endpoint must be implemented in n8n first. The frontend must not access the Data Table or n8n internal storage directly.

## 6. API Response and Error Handling

The current workflows use structured JSON responses, generally with a `success` property and either `data` or `error` information.

Some workflows use slightly different response structures.

Antigravity must inspect the actual workflow response structures and handle them as implemented.

It must not assume that every response has exactly the same shape.

Common HTTP status codes include:

| Status | Meaning |
|---|---|
| 200 | Successful retrieval or operation |
| 201 | Resource created |
| 400 | Invalid request |
| 404 | Resource not found |
| 409 | Conflict or invalid operation state |
| 422 | Invalid signing configuration or business validation |
| 500 | Unexpected processing failure |

### Frontend error handling

The frontend must distinguish between:

- Network errors.
- Backend HTTP errors.
- Validation errors.
- Business errors.
- Technical server errors.

Display the backend's useful error message to the user.

Do not display raw stack traces in normal application screens.

For unexpected technical errors, provide a clear message that the operation failed.

The dashboard must never display a successful result when the backend returned an unsuccessful response.

## 7. Database Architecture

Supabase Cloud PostgreSQL is the source of truth for fiscalization domain data.

The current database tables are:

1. `organizations`
2. `signing_units`
3. `cash_registers`
4. `receipts`
5. `audit_events`
6. `idempotency_keys`

The exact schema is defined in `DATA_MODEL.md` and the database schema file.

### Database rules

- UUID primary keys.
- Foreign-key relationships.
- Unique receipt numbers per register.
- Unique sequence numbers per register.
- Integer cents for monetary values.
- JSONB for structured payloads and VAT breakdown.
- UTC timestamps.
- Database constraints for valid statuses and data types.

The database contains functions for:

- Register sequence allocation.
- Receipt signing.
- Receipt verification.
- Register integrity checking.

The project does not currently implement complete API idempotency handling.

### Access boundaries

Next.js must not connect directly to Supabase.

The frontend must use the n8n backend API for all business data operations.

Do not place Supabase service-role keys or database credentials in frontend code or client-side environment variables.

No authentication or RLS-based user access system is required for this local prototype.

## 8. Cryptographic Architecture

The simulator currently implements a deterministic mock signing mechanism.

It is not a real asymmetric digital signature.

### Current signing process

1. Retrieve the pending receipt.
2. Lock the relevant register and receipt.
3. Check register and signing unit status.
4. Check receipt sequence order.
5. Construct the canonical JSON payload.
6. Calculate its SHA-256 hash.
7. Generate a deterministic mock signature using the key identifier and receipt hash.
8. Store the hash, signature, previous hash and key identifier.
9. Set the receipt status to SIGNED.
10. Create a RECEIPT_SIGNED audit event.

### Current verification process

1. Retrieve the receipt.
2. Reconstruct the canonical payload.
3. Recalculate its SHA-256 hash.
4. Recalculate the expected mock signature.
5. Check the previous hash relationship.
6. Check earlier receipt signing status and hash availability.
7. Return structured verification results.

The individual verification workflow checks the current receipt's chain link. It does not recursively recalculate every preceding receipt.

The full register integrity workflow scans all receipts and performs the relevant checks.

The dashboard must present these operations as mock signing and simulated integrity verification.

It must not describe the generated mock signature as a legally valid digital signature.

## 9. Frontend Architecture — Next.js

Next.js is the presentation layer.

It must use the existing n8n API contracts.

### Core responsibilities

- Display organizations, signing units, registers and receipts where the API provides the required data.
- Provide forms for creating organizations, signing units and registers.
- Provide a POS-style receipt submission interface.
- Initiate receipt signing and verification.
- Display receipt details and cryptographic metadata.
- Display register receipt history.
- Display audit events.
- Initiate receipt exports.
- Initiate register integrity checks.
- Explain error monitoring in the initial dashboard, and display stored error records only once an appropriate backend read endpoint exists.

### Frontend restrictions

Next.js must not:

- Connect directly to Supabase.
- Execute SQL.
- Generate receipt hashes or signatures.
- Allocate receipt sequence numbers.
- Change receipt statuses directly.
- Implement its own fiscalization rules.
- Invent API endpoints.
- Simulate backend data as if it were real.
- Claim legal compliance.

All state-changing operations must be performed by the backend.

### API integration

Next.js communicates with n8n through **server-side Next.js Route Handlers** acting as a simple API proxy.

- The Next.js Route Handler proxy must only forward requests to and return responses from the corresponding n8n webhook endpoints.
- The proxy must not implement business logic, change the meaning of the API, or access Supabase directly.
- Keep the n8n base URL (`N8N_API_BASE_URL`) and any dynamic webhook URL templates strictly server-side in environment configuration. Do not expose n8n endpoint URLs, credentials, or secrets to browser-side code, and do not hardcode different n8n URLs throughout UI components.

### Missing API capabilities

The current backend does not yet expose all the read operations a fully populated dashboard would normally need.

In particular:

- No organization list or count endpoint.
- No signing unit list or count endpoint.
- No register list or count endpoint.
- No global receipt list endpoint.
- No error-log retrieval endpoint.

Antigravity must not invent these endpoints.

The initial dashboard must not display fabricated organization, signing-unit, or register lists or invented counts. Where data is unavailable, it must clearly communicate the limitation rather than simulating data.

If the dashboard requires these capabilities later, document the additional endpoints as backend work to be implemented separately.

## 10. Frontend Page Structure

The proposed dashboard sections are:

### Overview

A landing page with a summary of available system information and quick-action navigation.

Do not invent counts (such as organization, register, receipt, or error counts) or use hardcoded sample data as real metrics.

### Organizations

- Create organization.
- Display creation result.
- Show organization country and identifier.

An organization listing page does not exist yet and requires a future `GET` endpoint. Do not display a fabricated organization list.

### Signing Units

- Create signing unit.
- Display provider type, key identifier and status where returned.

A signing unit listing page does not exist yet and requires a future `GET` endpoint. Do not display a fabricated signing unit list.

### Cash Registers

- Create cash register.
- Display register identifier and initial sequence.
- Display register details where available through related endpoints.

A register listing page does not exist yet and requires a future `GET` endpoint. Do not display a fabricated register list.

### Receipts

- Submit receipt.
- Retrieve a receipt by ID.
- List receipts for a register.
- Sign a pending receipt.
- Verify a signed receipt.
- Display receipt details, status, sequence, hash and signature.

### Audit Log

- Retrieve the latest audit events for an organization.
- Retrieve an individual audit event.
- Display event details and timestamps.

### Exports

- Select a register.
- Request a JSON export.
- Display the returned export.
- Allow the user to save the JSON result as a local file if appropriate.

The backend currently returns JSON, not CSV or PDF.

### Integrity Checks

- Select a register.
- Run the integrity check.
- Display the overall result.
- Display checked, valid and invalid counts.
- Display individual receipt results.

### Error Monitoring

Errors are stored in the n8n Data Table `fiscal_application_errors`, and there is currently no HTTP read endpoint for retrieving them.

The initial dashboard page explains the error-monitoring mechanism (the difference between validation errors and unexpected technical errors captured by WF-11) and clearly states that viewing stored error records in the dashboard is not yet supported.

The dashboard can display stored validation and technical error records only after a dedicated read endpoint for `fiscal_application_errors` has been implemented in n8n. Until then, error monitoring records remain viewable directly inside n8n Data Tables.

## 11. Design System

The frontend must follow the visual guidelines in `design.md`.

The coding agent must read that document before implementing visual components.

The visual design must not change the underlying API contracts or business logic.

Use consistent representations for:

- Organization country.
- Resource status.
- Receipt status.
- Verification results.
- Integrity results.
- Validation errors.
- Technical errors.

Clearly distinguish simulated signing from real-world certified fiscalization.

## 12. Development Roles

| Role | Responsibility |
|---|---|
| Project owner | Defines requirements and validates behaviour |
| ChatGPT | Supports architecture, workflow design and troubleshooting |
| Antigravity | Implements the Next.js dashboard |
| n8n | Executes backend workflows |
| Supabase | Stores persistent domain data |

The project owner makes final architectural decisions.

Antigravity must not independently change the backend architecture or database schema.

## 13. AI Coding Agent Instructions

Before implementing the dashboard, Antigravity must read:

1. `DATA_MODEL.md`
2. `ARCHITECTURE.md`
3. `DASHBOARD_SPEC.md`
4. `design.md`

It must also inspect the existing repository and relevant n8n workflow exports.

### Implementation rules

- Use the existing API endpoints exactly as documented.
- Do not invent endpoints.
- Do not connect directly to Supabase.
- Do not implement backend business logic in Next.js.
- Do not add authentication or user management.
- Do not introduce unnecessary dependencies.
- Do not change the database schema.
- Do not change n8n workflows without explicit approval.
- Do not claim functionality that the backend does not support.
- Do not use mock data as real application data.
- Clearly distinguish incomplete functionality from implemented functionality.

### Before implementing a feature

Antigravity must:

1. Identify the relevant API endpoint.
2. Identify the expected request structure.
3. Identify the actual response structure.
4. Identify loading, success and error states.
5. Identify whether all required backend capabilities exist.
6. Explain any missing API capability before implementing around it.

### Testing requirements

For each implemented feature:

- Test the frontend interaction.
- Test the actual n8n endpoint.
- Verify the backend response.
- Verify the displayed result.
- Test an invalid request.
- Test the relevant error state.

The dashboard must not be considered complete merely because the UI renders.

## 14. Implementation Status

### Implemented and tested

- Supabase database schema.
- Organization creation.
- Signing unit creation.
- Cash register creation.
- Receipt submission and sequence allocation.
- Mock receipt signing.
- Receipt verification.
- Receipt retrieval.
- Register receipt listing.
- Audit event retrieval.
- JSON receipt export.
- Register integrity check.
- Validation error monitoring.
- Global technical error handling.

### Not yet implemented

- Organization listing and counting.
- Signing unit listing and counting.
- Register listing and counting.
- Register updating.
- Global receipt listing.
- Error-log retrieval API.
- Complete API idempotency handling.
- CSV and PDF exports.
- Real digital signatures.
- Certified signing-unit integration.
- Real FinanzOnline integration.
- Complete audit event coverage for every possible business event.
- Automated external notifications.

These capabilities must not be represented as existing functionality.

## 15. Definition of Done

The dashboard is considered complete when it can demonstrate the implemented backend capabilities through a coherent user interface.

The end-to-end demonstration should include:

1. Create an organization.
2. Create a signing unit.
3. Create a cash register.
4. Submit a receipt.
5. Sign the receipt.
6. Retrieve the receipt.
7. Verify the receipt.
8. Retrieve audit events.
9. Generate a JSON receipt export.
10. Run a register integrity check.
11. Explain error monitoring on the Error Monitoring page (and display stored backend validation and technical errors only in a future iteration once the required read endpoint is available).

All operations must use the actual backend and database.

## 16. Final Architecture Principle

The data model defines what the system represents.

The architecture defines how the components communicate.

The n8n workflows implement backend business operations.

Supabase stores persistent domain data.

The Next.js dashboard provides the user interface.

Antigravity implements the dashboard against the documented, existing backend capabilities.

**The frontend must adapt to the backend contract. The backend must not be silently reinvented to accommodate frontend assumptions.**
```

---

### Remaining Contradictions / Ambiguities Across the Three Documents
1. **Status Indicators (`DASHBOARD_SPEC.md` §7 vs. `DATA_MODEL.md` §3.2–3.4):** `DASHBOARD_SPEC.md` §7 omits `INITIALIZED`, `CREATED`, and `PROCESSING` from its status badge list, even though `DATA_MODEL.md` defines them.
2. **Next.js Proxy Explicitness (`DASHBOARD_SPEC.md` §3 & §6 vs. `ARCHITECTURE.md` §9):** `ARCHITECTURE.md` §9 now explicitly requires server-side Next.js Route Handlers as the API proxy so `N8N_API_BASE_URL` remains server-side. `DASHBOARD_SPEC.md` §6 should ideally mention that `src/lib/api/*` calls the Next.js Route Handler proxy (or runs inside those server routes) rather than calling `N8N_API_BASE_URL` directly from client components.
3. **Integrity Check Behavior for Unsigned/`PENDING` Receipts (`DASHBOARD_SPEC.md` §5.8 vs. `ARCHITECTURE.md` §5.10 & `DATA_MODEL.md`):** `DASHBOARD_SPEC.md` §5.8 states *"Explain that unsigned receipts are reported as invalid"*, which is not yet confirmed by the SQL definition of `public.check_register_integrity()` in the provided docs (flagged in `ARCHITECTURE.md` §5.10).
4. **Referenced Filenames:** The documents reference `ARCHITECTURE.md` and `DATA_MODEL.md`, whereas the provided filenames are `# Architecture Specification.md` and `# Data Model — Fiscalization Simulator.md`. Ensure the actual repo filenames match before Antigravity starts.