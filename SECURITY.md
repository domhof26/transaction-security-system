# Security

This is a local educational simulator, not a certified fiscalization or production payment-security system.

## Credential handling

- Keep Supabase credentials in server-side environment variables.
- Never use `NEXT_PUBLIC_*` variables for the Supabase service-role key.
- Never commit `.env`, `.env.local`, or environment-specific secret files.
- Keep n8n webhook identifiers and URLs local unless deployment is explicitly designed.

## Reporting a concern

If a credential or private value is committed accidentally, rotate the exposed credential and remove it from the repository history before publication.
