# Data Model — Fiscalization Simulator

## 1. Purpose

This document defines the domain model of the Fiscalization Simulator.

It describes what the system represents, stores, tracks and reports. It serves as the reference for:

- Supabase database design.
- n8n workflow implementation.
- API contracts.
- Receipt lifecycle management.
- Audit history and reporting.
- Next.js dashboard development.
- Future country-specific fiscalization integrations.

**Core principle: The database and API contracts define the system. The dashboard must reflect them rather than inventing new business logic.**

## 2. Project Scope

The application is an educational fiscalization simulator inspired by fiscalization platforms such as fiskaly.

It demonstrates:

- Organizations and fiscalization resources.
- Cash register management.
- POS transaction submission.
- Transaction sequencing.
- Mock cryptographic signing and verification.
- Receipt lifecycle management.
- Audit events and integrity tracking.
- Receipt exports and reporting.
- Application error monitoring.

### Important limitations

This is an educational and technical simulator, not a certified fiscalization system.

It does not claim to produce legally valid Austrian RKSV receipts, replace a certified Secure Cryptographic Unit (SCU), or fulfil actual fiscal obligations.

Cryptographic operations currently use a deterministic mock signing mechanism. There is no real asymmetric digital signature, certified signing device or FinanzOnline integration.

The application is intended to run locally. It does not currently implement user authentication, user management or role-based access control.

## 3. Domain Model

The core domain model consists of six entities.

| Entity | Business meaning |
|---|---|
| Organization | A merchant or business using the system |
| Signing Unit | A simulated cryptographic signing resource |
| Cash Register | A POS register belonging to an organization |
| Receipt | A transaction submitted for fiscalization |
| Audit Event | A historical record of an important system event |
| Idempotency Key | A mechanism intended to identify repeated API requests |

Operational error monitoring is handled separately through an n8n Data Table and is described in Section 9.

### 3.1 Organization

Represents a merchant or business using the simulator.

| Attribute | Description |
|---|---|
| id | Unique organization identifier |
| name | Organization name |
| country | Country of operation |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Possible country values:

- AT — Austria
- DE — Germany

The current database does not contain an `owner_id` field. There is no user ownership or user access-control implementation.

### 3.2 Signing Unit

Represents a simulated cryptographic signing resource.

| Attribute | Description |
|---|---|
| id | Unique signing unit identifier |
| organization_id | Owning organization |
| name | Human-readable name |
| status | Current signing unit status |
| provider_type | Mock or external provider |
| public_key_id | Identifier of the associated public key |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Possible statuses:

- INITIALIZED
- ACTIVE
- SUSPENDED
- DISABLED

Possible provider types:

- MOCK
- EXTERNAL

The currently implemented signing provider is MOCK.

The signing unit is an abstraction for this simulator. It must not be presented as a certified Austrian SCU.

### 3.3 Cash Register

Represents an individual POS cash register.

| Attribute | Description |
|---|---|
| id | Unique register identifier |
| organization_id | Owning organization |
| signing_unit_id | Associated signing unit, nullable in the database |
| name | Register name |
| status | Current register status |
| last_sequence | Last allocated transaction sequence |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Possible statuses:

- CREATED
- ACTIVE
- SUSPENDED
- DISABLED

Each register belongs to one organization and can be associated with a signing unit.

One signing unit can be shared by multiple registers.

The database permits a register without an assigned signing unit. However, the current Create Cash Register API workflow requires a signing unit.

A register must use a signing unit belonging to the same organization.

### 3.4 Receipt

Represents a POS transaction submitted for fiscalization.

This is the central business entity of the application.

| Attribute | Description |
|---|---|
| id | Unique receipt identifier |
| register_id | Associated cash register |
| receipt_number | POS receipt number |
| sequence_number | Internal transaction sequence |
| amount_cents | Total amount in minor currency units |
| currency | Transaction currency |
| vat_breakdown | VAT amounts grouped by tax rate, stored as a JSON array |
| receipt_payload | Transaction payload, stored as a JSON object |
| status | Current transaction status |
| signature | Generated mock signature |
| hash | Hash of the canonical receipt payload |
| previous_hash | Hash of the preceding receipt, if applicable |
| key_id | Identifier of the signing key |
| created_at | Submission timestamp |
| updated_at | Last update timestamp |
| signed_at | Signing timestamp |

Possible statuses:

- PENDING
- PROCESSING
- SIGNED
- FAILED

Current implementation:

1. A receipt is submitted through the API.
2. The receipt receives a sequence number for its register.
3. The receipt is stored with PENDING status.
4. The signing workflow calculates a SHA-256 hash.
5. A deterministic mock signature is generated.
6. The receipt is updated to SIGNED and a signing audit event is created.

A receipt must not be silently modified or deleted after signing.

Corrections and cancellations are not currently implemented as complete workflows. They should be represented through separate traceable business events in a future implementation.

### 3.5 Audit Event

Represents an important event in the lifecycle of an organization, register or receipt.

| Attribute | Description |
|---|---|
| id | Unique event identifier |
| organization_id | Associated organization |
| register_id | Associated register, if applicable |
| receipt_id | Associated receipt, if applicable |
| event_type | Type of event |
| payload | Event details, stored as a JSON object |
| created_at | Event timestamp |

Examples of event types:

- ORGANIZATION_CREATED
- SIGNING_UNIT_CREATED
- REGISTER_CREATED
- REGISTER_ACTIVATED
- RECEIPT_SUBMITTED
- RECEIPT_SIGNED
- RECEIPT_VERIFICATION_PASSED
- RECEIPT_VERIFICATION_FAILED
- RECEIPT_FAILED
- RECEIPT_CANCELLED
- EXPORT_CREATED

These are possible domain event types; not all currently have corresponding implemented workflows.

Audit events are append-only from the application's perspective.

The audit trail preserves the history of what happened rather than simply showing the current state of an entity.

### 3.6 Idempotency Key

Represents a unique API request identifier intended to prevent duplicate transaction processing.

| Attribute | Description |
|---|---|
| id | Unique record identifier |
| organization_id | Associated organization |
| key | Client-provided idempotency key |
| request_hash | Hash of the original request |
| response | Stored original response |
| status | Processing status |
| created_at | Creation timestamp |
| expires_at | Optional expiration timestamp |

Possible statuses:

- PROCESSING
- COMPLETED
- FAILED

The database table and uniqueness constraint exist. However, complete idempotency handling is not currently implemented in the API workflows.

The intended behaviour is that an identical request submitted again with the same key returns the original result rather than creating another receipt.

Reusing the same key with a different request payload should be rejected.

## 4. Entity Relationships

The following relationships define ownership and data dependencies.

- One organization can have multiple signing units.
- One organization can have multiple cash registers.
- One signing unit can be associated with multiple cash registers.
- One cash register can have multiple receipts.
- One organization can have multiple audit events.
- One receipt can have multiple audit events.
- One organization can have multiple idempotency keys.

All organization-owned resources must be associated with the correct organization.

The database enforces that a register's assigned signing unit belongs to the same organization.

The current application is local-only and does not implement user-based access boundaries.

## 5. Receipt Lifecycle

A receipt has a defined lifecycle.

| State | Meaning |
|---|---|
| PENDING | Transaction received |
| PROCESSING | Validation and signing underway |
| SIGNED | Mock signature successfully generated and persisted |
| FAILED | Processing failed |

### Lifecycle principles

1. A receipt starts as PENDING.
2. Processing and signing are performed by the receipt signing workflow.
3. Successful signing and persistence move it to SIGNED.
4. Unrecoverable processing errors may move it to FAILED.
5. A signed receipt must not be overwritten or deleted.
6. Corrections and cancellations must create separate, traceable events.

The current signing implementation locks the register while signing to preserve receipt order.

It also checks that earlier existing receipts have been signed before signing a later receipt.

The current implementation permits sequence gaps. Sequence allocation and receipt insertion are not guaranteed to form one atomic transaction, so a failed insertion may leave a gap.

## 6. Data Integrity Rules

### Uniqueness

- Organization IDs must be unique.
- Receipt numbers must be unique within a register.
- Sequence numbers must be unique within a register.
- Idempotency keys must be unique within an organization.

### Relationships

- Every cash register must belong to an organization.
- Every receipt must belong to a valid cash register.
- A signing unit must belong to the same organization as its associated register.
- Audit events must reference valid entities where applicable.

### Transaction integrity

- Monetary amounts use integer minor units, such as cents.
- VAT breakdown is stored as a JSON array.
- Receipt payload is stored as a JSON object.
- Receipt payloads must have a defined canonical representation before hashing.
- Signed receipt data must be treated as immutable.
- Sequence allocation must be safe against concurrent requests.

### Signing and verification

The current signing process:

- Uses SHA-256 to calculate a receipt hash.
- Uses the mock signing key identifier.
- Generates a deterministic mock signature.
- Stores the receipt hash, signature, previous hash and key identifier.

Verification checks:

- Receipt hash.
- Mock signature.
- Previous hash relationship.
- Earlier receipt signing status and hash availability.

The single-receipt verification workflow checks the receipt's chain link. The register integrity workflow scans all receipts in sequence order.

The implementation must distinguish between signature validity and hash-chain integrity.

### Audit integrity

- Important lifecycle transitions must generate audit events.
- Historical events must not be silently overwritten.
- Receipt signing creates an audit event.
- Verification results must be traceable where corresponding audit events are implemented.

## 7. Data Outputs

The domain model conceptually supports the following business outputs.

| Output | Required information | Current API / Dashboard Status |
|---|---|---|
| Organization overview | Organization, country and resource counts | Conceptual / planned output (creation returns single-record details; no list or count endpoint exists) |
| Signing unit overview | Name, provider type and status | Conceptual / planned output (creation returns single-record details; no list endpoint exists) |
| Register overview | Register status, signing unit and transaction sequence | Conceptual / planned output (creation returns single-record details; no list endpoint exists) |
| Receipt details | Transaction data, signature, hash and status | Supported via existing receipt endpoints |
| Verification result | Signature, hash and chain verification results | Supported via existing verification endpoint |
| Audit history | Chronological events and associated resources | Supported via existing audit endpoints |
| Receipt export | Receipt data in structured JSON | Supported via existing export endpoint |
| Integrity report | Receipt sequence and hash-chain consistency checks | Supported via existing integrity-check endpoint |
| Error log | Validation and technical errors | Conceptual / planned output (stored in n8n Data Table; no HTTP read endpoint exists) |

**Important availability note for the dashboard:**
- The **Organization overview** (including resource counts), **Signing unit overview**, and **Register overview** outputs listed above are conceptual or planned outputs derived from the domain model, not currently available dashboard capabilities.
- Displaying organization, signing-unit, and register lists or resource counts requires `GET` list and count endpoints that have not yet been implemented in the n8n backend.
- Similarly, displaying an **Error log** list in the dashboard requires an HTTP read endpoint that does not yet exist.
- The initial dashboard must only render outputs backed by existing n8n endpoints (such as creation results for newly created resources, receipt details, verification results, audit events, JSON exports, and integrity reports). It must not assume unimplemented endpoints exist or display fabricated lists or counts.

## 8. Database Implementation

Supabase PostgreSQL is the source of truth for domain data.

The current database contains these tables:

| Table | Purpose |
|---|---|
| organizations | Merchant organizations |
| signing_units | Signing resources |
| cash_registers | POS registers |
| receipts | Submitted and signed receipts |
| audit_events | Historical business events |
| idempotency_keys | Idempotency records |

Additional database implementation details:

- UUID primary keys.
- Foreign-key relationships.
- Unique constraints for receipt numbers and sequence numbers per register.
- JSONB for receipt payloads, VAT breakdown and audit payloads.
- Integer cents for monetary values.
- Timestamp fields and update triggers where configured.
- A database function for receipt sequence allocation.
- Database functions for receipt signing, verification and register integrity checks.

The database is intentionally configured without Row Level Security for this local prototype.

No direct database access from the dashboard is permitted. The dashboard communicates with the backend API.

## 9. Operational Error Monitoring

Operational errors are stored separately from the core fiscalization domain model.

The current monitoring table is an n8n Data Table named:

`fiscal_application_errors`

It records:

| Attribute | Description |
|---|---|
| id | Automatically generated row identifier |
| category | Error category |
| workflow_name | Name of the affected n8n workflow |
| workflow_id | n8n workflow identifier |
| execution_id | n8n execution identifier |
| error_code | Machine-readable error code |
| error_message | Human-readable error message |
| request_data | Relevant request or error context |

Current error categories:

- VALIDATION — Invalid input detected by a workflow (explicitly logged in selected workflow validation branches).
- TECHNICAL — Unexpected workflow execution failure captured by the global Error Workflow.

The global Error Workflow uses an Error Trigger and records unexpected technical errors, including the error message and stack trace.

Business errors returned by database functions should be logged explicitly by the relevant workflow when required.

There is currently no HTTP `GET` endpoint to retrieve records from `fiscal_application_errors`. Because of this limitation, the initial dashboard may explain the error-monitoring mechanism, but must not display a simulated error list or access the n8n Data Table directly (nor assume this monitoring table is part of Supabase or query it directly). A read-only dashboard error-log view is a possible future feature that depends on first implementing a dedicated read endpoint in n8n.

## 10. API and Dashboard Boundaries

The planned architecture is:

- **Supabase PostgreSQL:** Source of truth for domain data, relationships, transaction state and audit records.
- **n8n:** API orchestration, validation, transaction processing, signing and verification.
- **Next.js:** Dashboard and user interface.
- **Mock signing provider:** Demonstration of signing and verification without claiming legal compliance.

The dashboard consumes the defined n8n API endpoints.

It must not:

- Connect directly to Supabase.
- Implement receipt signing or hashing itself.
- Allocate receipt sequence numbers itself.
- Modify signed receipt records directly.
- Invent new backend endpoints or database fields.
- Claim that the simulator is legally compliant.

The dashboard may display data, submit API requests, initiate backend operations and present their results.

## 11. Development Status and Future Decisions

The core database schema and the ten application workflows have been implemented and tested.

The global error handler has also been implemented and tested.

The following capabilities are not yet fully implemented and must not be presented as completed functionality:

- Organization, signing-unit, and cash register `GET` list and resource-count endpoints (as well as global receipt listing).
- Reading stored error records from `fiscal_application_errors` through an HTTP API.
- Full API idempotency handling.
- Receipt cancellation and correction workflows.
- Real asymmetric digital signatures.
- Certified signing-unit integration.
- Real FinanzOnline integration.
- Complete audit event coverage for every possible business event.
- Automated error notifications.

The missing list, count, and error-log retrieval endpoints are potential future enhancements, not requirements for the initial dashboard. The initial dashboard must work within the currently implemented n8n endpoints without fabricating unavailable data.

The following decisions may be revisited if the simulator is expanded:

- Additional currencies and VAT categories.
- More detailed receipt payload structures.
- Export formats beyond JSON.
- Signing provider integration.
- Error retention, HTTP error-log retrieval, and notification policies.
- More comprehensive integrity and recovery behaviour.

## 12. Development Principle

The data model connects the database, backend workflows and dashboard.

Changes to the model must be deliberate and documented.

The Next.js dashboard must be built against the existing database model and working API contracts. It must not introduce undocumented business logic or silently assume that planned features are already implemented.