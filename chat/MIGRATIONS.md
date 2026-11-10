# Chat database (dedicated Neon)

- **`chat/.env`** → chat-only branch (separate from main API + notification).
- **`backend/.env`** → main API DB only. Do **not** point backend `migrate deploy` here.

## Fresh chat branch

```powershell
cd chat
# Ensure no shell DATABASE_URL override (PowerShell: Remove-Item Env:DATABASE_URL)
npx prisma migrate deploy
```

Creates `ChatMessage`, `ChatThreadClear`, `SystemInboxMessage`.

## Copy existing data from main DB (one-off)

After tables exist on the chat branch, export from **main API** Neon and import into chat Neon **before** `backend` migration `20261110161000_drop_main_chat`:

```sql
-- Tables: ChatMessage, ChatThreadClear, SystemInboxMessage (no FKs in chat DB).
```

## Fly.io (`simdrive-pro-chat`)

Set secrets (mirror notification + API):

```powershell
fly secrets set -a simdrive-pro-chat `
  DATABASE_URL="postgresql://..." `
  JWT_SECRET="..." `
  JWT_CHAT_SECRET="..." `
  CHAT_INTERNAL_SECRET="..." `
  MAIN_API_URL="https://simdrive-pro-api.fly.dev" `
  CORS_ORIGIN="https://www.instructorebi.com,https://instructorebi.com,https://instructori.vercel.app"
```

On **simdrive-pro-api**:

```powershell
fly secrets set -a simdrive-pro-api `
  CHAT_SERVICE_URL="https://simdrive-pro-chat.fly.dev" `
  CHAT_INTERNAL_SECRET="same-as-chat-service"
```

Vercel: `CHAT_SERVICE_URL`, `NEXT_PUBLIC_CHAT_SOCKET_URL` (see `frontend/.env.example`).

## Wipe and recreate (dev)

```powershell
npx prisma db execute --file prisma/scripts/reset-public-schema.sql
npx prisma migrate deploy
```
