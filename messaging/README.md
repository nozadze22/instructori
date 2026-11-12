# @instructor/messaging

Shared RabbitMQ topology, publisher, and consumer for backend → notification / chat / **email** events.

## Local

```bash
docker compose up -d rabbitmq
cd messaging && pnpm install && pnpm build
```

Management UI: http://localhost:15672 (user `instructor` / pass `instructor`)

## Env (all three services)

| Variable | Where | Meaning |
|----------|--------|---------|
| `AMQP_URL` or `RABBITMQ_URL` | backend, notification, chat | Broker connection string |
| `EVENT_TRANSPORT` | backend only | `http` (default), `amqp`, or `dual` |
| `AMQP_CONSUMER_ENABLED` | notification, chat | set `0` to disable consumer |
| `RESEND_*` | **notification** service | Resend (`email-service` queue consumer) |

## Production Docker

Fly builds use each service folder as context. Before deploy, either build from repo root with a Dockerfile that copies `messaging/`, or run `pnpm build` in `messaging` and ensure `file:../messaging` resolves in CI.
