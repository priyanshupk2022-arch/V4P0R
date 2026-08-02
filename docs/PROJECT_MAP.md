# VAPOR Project Map

## Product path

`request -> Senso evidence -> deterministic policy -> Linq approval -> Prava approval/one-time credential -> merchant checkout attempt -> audit result`

## Ownership map

| Workstream | Primary locations | Boundary |
|---|---|---|
| Prava checkout | `src/adapters/prava/`, checkout routes, checkout E2E | Owns one-time credential handoff and never stores it |
| Partner experience | Linq routes/adapters, Senso adapter, evidence models | Owns messages/evidence, not payment token handling |
| Product UI | `src/app/` UI routes/components | Displays safe persisted state only |
| Trust/data/release | auth, database, migrations, config, CI | Sole owner of auth/migrations/package lock |
| Verification | `tests/`, E2E, evidence manifests | Read-only until a failed oracle is assigned |

## High-risk existing files

- `src/infrastructure/auth/authMiddleware.ts`
- `src/infrastructure/database/supabaseClient.ts`
- `src/adapters/prava/createCard.ts`
- `src/adapters/prava/lockCard.ts`
- `src/adapters/prava/createSession.ts`
- `src/app/api/webhook/linq/route.ts`
- `services/vapor-ai-python/main.py`
- `migrations/001_initial_schema.sql`
- `migrations/002_sandbox_pilot_schema.sql`

Read current source and related tests before editing any listed file.
