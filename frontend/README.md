# Fiscalization Simulator Frontend

Next.js dashboard for the Fiscalization Simulator. The browser calls internal `/api/*` route handlers; those handlers communicate with n8n and Supabase from the server only.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configure the placeholders in `.env.local`. Do not commit that file or place the Supabase service-role key in browser-side code.

## Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

See the repository [README](../README.md) and [API integration notes](../docs/api.md) for system context.
