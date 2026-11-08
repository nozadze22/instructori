# Notification database (dedicated Neon)

- **`notification/.env`** → notification-only branch (e.g. instructor / `shy-dev`, `ep-gentle-math-…`).
- **`backend/.env`** → main API DB (`ep-mute-feather-…`). Do **not** point backend here.

## Fresh notification branch

```powershell
cd notification
# Ensure no shell DATABASE_URL override (PowerShell: Remove-Item Env:DATABASE_URL)
npx prisma migrate deploy
```

Creates only `Notification` + `NotificationType` (including `SYSTEM_MESSAGE`).

## Wipe and recreate (dev)

```powershell
npx prisma db execute --file prisma/scripts/reset-public-schema.sql
npx prisma migrate deploy
```

Never run `backend` `migrate deploy` against the notification Neon.
